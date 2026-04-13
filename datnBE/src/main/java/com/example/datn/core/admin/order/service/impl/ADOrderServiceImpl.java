package com.example.datn.core.admin.order.service.impl;

import com.example.datn.core.admin.order.model.request.*;
import com.example.datn.core.admin.order.model.response.ADOrderDetailResponse;
import com.example.datn.core.admin.order.model.response.OrderPageResponse;
import com.example.datn.core.admin.order.repository.ADOrderDetailRepository;
import com.example.datn.core.admin.order.repository.ADOrderRepository;
import com.example.datn.core.admin.order.repository.ADOrderRepositoryCustom;
import com.example.datn.core.admin.order.service.ADOrderService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.*;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.SerialStatus;
import com.example.datn.infrastructure.email.EmailService;
import com.example.datn.repository.*;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ADOrderServiceImpl implements ADOrderService {

    private final ADOrderRepository adOrderRepository;
    private final ADOrderDetailRepository adOrderDetailRepository;
    private final EmployeeRepository employeeRepository;
    private final SerialRepository serialRepository;
    private final VoucherRepository voucherRepository;
    private final VoucherDetailRepository voucherDetailRepository;
    private final ShiftHandoverRepository shiftHandoverRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;
    private final ADOrderRepositoryCustom adOrderRepositoryCustom;
    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;
    private final OrderDetailRepository orderDetailRepository;
    private final ProductDetailRepository productDetailRepository;

    @Override
    @Transactional
    public ResponseObject<?> capNhatTrangThaiHoaDon(ADChangeStatusRequest request) {

        try {
            log.info("Bắt đầu cập nhật trạng thái hóa đơn: {}", request.getMaHoaDon());

            // Lấy hóa đơn theo mã
            Order hoaDon = adOrderRepository.findByMa(request.getMaHoaDon())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn: " + request.getMaHoaDon()));

            OrderStatus trangThaiCu = hoaDon.getOrderStatus();
            OrderStatus trangThaiMoi = request.getStatusTrangThaiHoaDon();

            log.info("Trạng thái cũ: {}, Trạng thái mới: {}", trangThaiCu, trangThaiMoi);

            // Nếu hoàn thành đơn hàng ONLINE/GIAO_HANG và payment_method là COD thì chuyển
            if (trangThaiMoi == OrderStatus.HOAN_THANH
                    && (hoaDon.getOrderType() == com.example.datn.infrastructure.constant.TypeInvoice.ONLINE
                            || hoaDon.getOrderType() == com.example.datn.infrastructure.constant.TypeInvoice.GIAO_HANG)
                    && "COD".equalsIgnoreCase(hoaDon.getPaymentMethod())) {
                hoaDon.setPaymentMethod("TIEN_MAT");
                log.info("[ONLINE] Đã tự động chuyển payment_method COD -> TIEN_MAT cho hóa đơn {}", hoaDon.getCode());
            }

            // Nếu hoàn thành đơn hàng ONLINE/GIAO_HANG và payment_method là VNPAY thì
            // chuyển thành CHUYEN_KHOAN để tính doanh thu ca
            if (trangThaiMoi == OrderStatus.HOAN_THANH
                    && (hoaDon.getOrderType() == com.example.datn.infrastructure.constant.TypeInvoice.ONLINE
                            || hoaDon.getOrderType() == com.example.datn.infrastructure.constant.TypeInvoice.GIAO_HANG)
                    && "VNPAY".equalsIgnoreCase(hoaDon.getPaymentMethod())) {
                hoaDon.setPaymentMethod("CHUYEN_KHOAN");
                log.info("[ONLINE] Đã tự động chuyển payment_method VNPAY -> CHUYEN_KHOAN cho hóa đơn {}",
                        hoaDon.getCode());
            }

            // Kiểm tra luồng trạng thái hợp lệ
            kiemTraChuyenTrangThai(trangThaiCu, trangThaiMoi);

            Employee nhanVien;
            // Nếu request có gửi id nhân viên → lấy theo ID
            if (request.getIdNhanVien() != null) {
                nhanVien = employeeRepository.findById(request.getIdNhanVien())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên ID = "
                                + request.getIdNhanVien()));
            } else {
                // Nếu không gửi → lấy nhân viên đang đăng nhập
                nhanVien = getCurrentEmployee();
            }

            if (hoaDon.getShiftHandover() == null && nhanVien != null && nhanVien.getAccount() != null) {
                try {
                    String accountId = nhanVien.getAccount().getId();
                    // Tìm ca đang mở (ACTIVE) của nhân viên này
                    Optional<ShiftHandover> caDangMo = shiftHandoverRepository.findOpenShiftByAccountId(accountId);

                    if (caDangMo.isPresent()) {
                        hoaDon.setShiftHandover(caDangMo.get());
                        log.info("Đã tự động gán hóa đơn {} vào ca làm việc {}", hoaDon.getCode(),
                                caDangMo.get().getId());
                    }
                } catch (Exception e) {
                    log.warn("Không thể gán ca làm việc cho hóa đơn: {}", e.getMessage());
                }
            }

            // Cập nhật trạng thái hóa đơn
            hoaDon.setOrderStatus(trangThaiMoi);
            hoaDon.setLastModifiedDate(System.currentTimeMillis());

            // Cập nhật paymentDate nếu chuyển sang trạng thái HOÀN THÀNH
            if (trangThaiMoi == OrderStatus.HOAN_THANH && hoaDon.getPaymentDate() == null) {
                hoaDon.setPaymentDate(System.currentTimeMillis());
            }

            // Reset paymentDate nếu hủy đơn hàng đã thanh toán
            if (trangThaiMoi == OrderStatus.DA_HUY && hoaDon.getPaymentDate() != null) {
                hoaDon.setPaymentDate(null);
            }

            Order hoaDonDaCapNhat = adOrderRepository.save(hoaDon);

            // Lưu lịch sử trạng thái vào bảng lịch sử
            OrderHistory lichSu = luuOrderHistory(
                    hoaDonDaCapNhat,
                    trangThaiMoi,
                    request.getNote(),
                    nhanVien);

            List<OrderDetail> orderDetail = new ArrayList<>();
            // XỬ LÝ NGHIỆP VỤ THEO TRẠNG THÁI
            switch (trangThaiMoi) {
                case CHO_XAC_NHAN:
                case DA_XAC_NHAN:
                    khoaIMEIKhiChoXacNhan(hoaDonDaCapNhat);
                    orderDetail = orderDetailRepository.findByOrderId(hoaDon.getId());
                    for (OrderDetail item : orderDetail) {
                        ProductDetail product = item.getProductDetail();
                        int soLuongMua = item.getQuantity();

                        // Kiểm tra tồn kho trước khi trừ
                        if (product.getQuantity() < soLuongMua) {
                            throw new RuntimeException(
                                    "Sản phẩm " + product.getProduct().getName() + " không đủ hàng trong kho!");
                        }

                        // Trừ số lượng tồn kho
                        product.setQuantity(product.getQuantity() - soLuongMua);
                        productDetailRepository.save(product);
                    }
                    break;

                case CHO_GIAO:
                    luuLichSuThanhToan(hoaDonDaCapNhat, nhanVien);
                    danhDauVoucherDaSuDung(hoaDonDaCapNhat);
                    break;

                case DANG_GIAO:
                    khoaThongTinGiaoHang(hoaDonDaCapNhat);
                    break;

                case GIAO_HANG_KHONG_THANH_CONG:
                    // Bắt buộc phải có lý do khi chuyển sang trạng thái này
                    if (request.getNote() == null || request.getNote().trim().isEmpty()) {
                        throw new RuntimeException("Vui lòng nhập lý do giao hàng không thành công!");
                    }
                    capNhatTrangThaiSerialBiHuy(hoaDon);

                    orderDetail = orderDetailRepository.findByOrderId(hoaDon.getId());
                    for (OrderDetail item : orderDetail) {
                        ProductDetail product = item.getProductDetail();
                        int soLuongMua = item.getQuantity();
                        product.setQuantity(product.getQuantity() + soLuongMua);
                        productDetailRepository.save(product);
                    }
                    break;

                case HOAN_THANH:
                    danhDauIMEIDaBan(hoaDonDaCapNhat);
                    break;

                case DA_HUY:
                    capNhatTrangThaiSerialBiHuy(hoaDon);
                    orderDetail = orderDetailRepository.findByOrderId(hoaDon.getId());
                    for (OrderDetail item : orderDetail) {
                        ProductDetail product = item.getProductDetail();
                        int soLuongMua = item.getQuantity();
                        product.setQuantity(product.getQuantity() + soLuongMua);
                        productDetailRepository.save(product);
                    }

                    hoanTraVoucher(hoaDonDaCapNhat);
                    hoanTienNeuCan(hoaDonDaCapNhat, nhanVien);
                    break;

                default:
                    break;
            }
            // Gửi email thông báo (bất đồng bộ)
            sendStatusUpdateEmailAsync(hoaDonDaCapNhat, trangThaiMoi);

            // Gửi WebSocket thông báo đến khách hàng
            try {
                if (hoaDonDaCapNhat.getCustomer() != null) {
                    String customerId = hoaDonDaCapNhat.getCustomer().getId();
                    Map<String, Object> clientNotif = new HashMap<>();
                    clientNotif.put("type", "ORDER_STATUS");
                    clientNotif.put("title", "Đơn hàng được cập nhật");
                    clientNotif.put("message", "Đơn hàng " + hoaDonDaCapNhat.getCode() + " đã chuyển sang: "
                            + getStatusText(trangThaiMoi));
                    clientNotif.put("refId", hoaDonDaCapNhat.getId());
                    clientNotif.put("refCode", hoaDonDaCapNhat.getCode());
                    clientNotif.put("timestamp", System.currentTimeMillis());
                    messagingTemplate.convertAndSend("/topic/client/notifications/" + customerId, clientNotif);
                }
            } catch (Exception e) {
                log.warn("Không thể gửi thông báo WebSocket đến khách hàng: {}", e.getMessage());
            }

            log.info("Cập nhật trạng thái thành công cho hóa đơn: {}", request.getMaHoaDon());

            // Trả về thông tin chi tiết bao gồm thời gian từ lịch sử
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("maHoaDon", hoaDonDaCapNhat.getCode());
            responseData.put("trangThaiCu", trangThaiCu);
            responseData.put("trangThaiMoi", trangThaiMoi);
            responseData.put("ngayCapNhat", System.currentTimeMillis());
            responseData.put("thoiGianCapNhat", lichSu.getThoiGian());
            responseData.put("nhanVien", nhanVien.getName());
            responseData.put("paymentDate", hoaDonDaCapNhat.getPaymentDate());
            responseData.put("ghiChu", lichSu.getNote());

            return ResponseObject.success(responseData, "Cập nhật trạng thái thành công");

        } catch (RuntimeException e) {
            log.error("Lỗi cập nhật trạng thái hóa đơn: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không xác định khi cập nhật trạng thái: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi hệ thống: " + e.getMessage(), e);
        }
    }

    private void doiTrangThaiImel(Order hoaDonDaCapNhat) {
    }

    // luu ls thay doi trạng thía hóa đơn
    private OrderHistory luuOrderHistory(
            Order hoaDon,
            OrderStatus trangThai,
            String ghiChu,
            Employee nhanVien) {

        OrderHistory lichSu = new OrderHistory();
        lichSu.setOrder(hoaDon);
        lichSu.setTrangThai(trangThai);
        lichSu.setThoiGian(LocalDateTime.now());
        lichSu.setNote(ghiChu != null ? ghiChu : "Cập nhật từ hệ thống quản trị");
        lichSu.setNhanVien(nhanVien);

        OrderHistory saved = orderHistoryRepository.save(lichSu);
        log.info("Đã lưu lịch sử trạng thái: {} cho hóa đơn {}", trangThai, hoaDon.getCode());

        return saved;
    }

    // Lấy danh sách lịch sử trạng thái của hóa đơn
    public List<OrderHistory> getOrderHistory(String maHoaDon) {
        Order hoaDon = adOrderRepository.findByMa(maHoaDon)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn: " + maHoaDon));

        return orderHistoryRepository.findByOrderOrderByThoiGianDesc(hoaDon);
    }

    // Lấy thời gian của một trạng thái cụ thể từ lịch sử
    public LocalDateTime getThoiGianTrangThai(String maHoaDon, OrderStatus trangThai) {
        Order hoaDon = adOrderRepository.findByMa(maHoaDon)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn: " + maHoaDon));

        return orderHistoryRepository
                .findFirstByOrderAndTrangThaiOrderByThoiGianDesc(hoaDon, trangThai)
                .map(OrderHistory::getThoiGian)
                .orElse(null);
    }

    // Lấy thông tin timeline của hóa đơn
    public Map<String, Object> getTimelineHoaDon(String maHoaDon) {
        Order hoaDon = adOrderRepository.findByMa(maHoaDon)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn: " + maHoaDon));

        List<OrderHistory> lichSu = orderHistoryRepository
                .findByOrderOrderByThoiGianAsc(hoaDon);

        Map<String, Object> timeline = new LinkedHashMap<>();
        for (OrderHistory item : lichSu) {
            Map<String, Object> step = new HashMap<>();
            step.put("trangThai", item.getTrangThai());
            step.put("tenTrangThai", getStatusText(item.getTrangThai()));
            step.put("thoiGian", item.getThoiGian());
            step.put("ghiChu", item.getNote());
            step.put("nhanVien", item.getNhanVien() != null ? item.getNhanVien().getName() : "Hệ thống");

            timeline.put(item.getTrangThai().name(), step);
        }

        return timeline;
    }

    // Kiểm tra hóa đơn có được phép chuyển sang trạng thái mới hay không
    private void kiemTraChuyenTrangThai(
            OrderStatus trangThaiCu,
            OrderStatus trangThaiMoi) {

        if (trangThaiCu == trangThaiMoi) {
            throw new RuntimeException("Hóa đơn đã ở trạng thái này");
        }

        if (trangThaiCu == OrderStatus.DA_HUY) {
            throw new RuntimeException("Hóa đơn đã bị hủy");
        }

        if (trangThaiCu == OrderStatus.HOAN_THANH) {
            throw new RuntimeException("Hóa đơn đã hoàn thành");
        }

        Map<OrderStatus, List<OrderStatus>> validTransitions = new HashMap<>();
        validTransitions.put(OrderStatus.CHO_XAC_NHAN,
                Arrays.asList(OrderStatus.DA_XAC_NHAN, OrderStatus.DA_HUY));
        validTransitions.put(OrderStatus.DA_XAC_NHAN,
                Arrays.asList(OrderStatus.CHO_GIAO, OrderStatus.DA_HUY));
        validTransitions.put(OrderStatus.CHO_GIAO,
                Arrays.asList(OrderStatus.DANG_GIAO, OrderStatus.DA_HUY));
        validTransitions.put(OrderStatus.DANG_GIAO,
                Arrays.asList(OrderStatus.HOAN_THANH, OrderStatus.GIAO_HANG_KHONG_THANH_CONG));

        if (!validTransitions.getOrDefault(trangThaiCu, new ArrayList<>())
                .contains(trangThaiMoi)) {

            throw new RuntimeException(
                    "Không thể chuyển từ " + trangThaiCu + " → " + trangThaiMoi);
        }
    }

    // Lấy nhân viên hiện tại từ Security Context
    private Employee getCurrentEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Không xác định được nhân viên thực hiện");
        }

        String username = authentication.getName();
        return employeeRepository.findByAccount_Username(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin nhân viên: " + username));
    }

    // Khóa IMEI khi hóa đơn chờ xác nhận / đã xác nhận
    // Đồng thời tự động gán serial AVAILABLE cho sản phẩm chưa có serial
    private void khoaIMEIKhiChoXacNhan(Order hoaDon) {
        List<OrderDetail> danhSachChiTiet = adOrderDetailRepository.findByOrderId(hoaDon.getId());

        int imeiKhoaCount = 0;
        int imeiAutoAssignedCount = 0;

        for (OrderDetail chiTiet : danhSachChiTiet) {
            if (chiTiet.getSerials() == null) {
                chiTiet.setSerials(new java.util.ArrayList<>());
            }

            int soLuongMua = chiTiet.getQuantity() != null ? chiTiet.getQuantity() : 1;
            int soSerialDaGan = chiTiet.getSerials().size();

            // Bước 1: Khóa những serial đã gán
            if (!chiTiet.getSerials().isEmpty()) {
                for (Serial imei : chiTiet.getSerials()) {
                    imei.setSerialStatus(SerialStatus.IN_ORDER);
                    imei.setLockedAt(System.currentTimeMillis());
                }
                serialRepository.saveAll(chiTiet.getSerials());
                imeiKhoaCount += chiTiet.getSerials().size();
            }

            // Bước 2: Tự động gán serial cho sản phẩm còn thiếu
            if (soSerialDaGan < soLuongMua) {
                int soSerialCanThem = soLuongMua - soSerialDaGan;
                ProductDetail productDetail = chiTiet.getProductDetail();

                List<Serial> availableSerials = serialRepository
                        .findByProductDetailIdAndSerialStatus(productDetail.getId(), SerialStatus.AVAILABLE);

                if (availableSerials.isEmpty()) {
                    log.warn("Không có serial AVAILABLE cho sản phẩm '{}' (ProductDetail: {}), cần gán thủ công",
                            productDetail.getProduct().getName(), productDetail.getId());
                    continue;
                }

                int soSerialDuKien = Math.min(soSerialCanThem, availableSerials.size());

                for (int i = 0; i < soSerialDuKien; i++) {
                    Serial serial = availableSerials.get(i);
                    serial.setSerialStatus(SerialStatus.IN_ORDER);
                    serial.setOrderDetail(chiTiet);
                    serial.setOrderHolding(hoaDon);
                    serial.setLockedAt(System.currentTimeMillis());

                    chiTiet.getSerials().add(serial);
                }

                serialRepository.saveAll(availableSerials.subList(0, soSerialDuKien));
                adOrderDetailRepository.save(chiTiet);

                imeiAutoAssignedCount += soSerialDuKien;
                log.info("Đã tự động gán {} serial cho sản phẩm '{}' trong hóa đơn {}",
                        soSerialDuKien, productDetail.getProduct().getName(), hoaDon.getCode());
            }
        }

        log.info("Đã khóa {} IMEI, tự động gán {} IMEI cho hóa đơn {}",
                imeiKhoaCount, imeiAutoAssignedCount, hoaDon.getCode());
    }

    // Đánh dấu IMEI đã bán khi chuyển sang chờ giao
    private void danhDauIMEIDaBan(Order hoaDon) {
        List<OrderDetail> danhSachChiTiet = adOrderDetailRepository.findByOrderId(hoaDon.getId());

        int imeiCount = 0;
        for (OrderDetail chiTiet : danhSachChiTiet) {
            if (chiTiet.getSerials() != null && !chiTiet.getSerials().isEmpty()) {
                for (Serial imei : chiTiet.getSerials()) {
                    imei.setSerialStatus(SerialStatus.SOLD);
                    imei.setSoldAt(System.currentTimeMillis());
                }
                serialRepository.saveAll(chiTiet.getSerials());
                imeiCount += chiTiet.getSerials().size();
            }
        }
        log.info("Đã đánh dấu {} IMEI là đã bán cho hóa đơn {}", imeiCount, hoaDon.getCode());
    }

    // Khóa thông tin giao hàng khi bàn giao cho đơn vị vận chuyển
    private void khoaThongTinGiaoHang(Order hoaDon) {
        if (!Boolean.TRUE.equals(hoaDon.getIsShippingLocked())) {
            hoaDon.setIsShippingLocked(true);
            adOrderRepository.save(hoaDon);
            log.info("Đã khóa thông tin giao hàng cho đơn hàng {} khi chuyển sang DANG_GIAO",
                    hoaDon.getCode());
        }
    }

    // Trả toàn bộ IMEI về trạng thái AVAILABLE khi hủy hóa đơn
    private void traIMEIVeKho(Order hoaDon) {
        List<OrderDetail> danhSachChiTiet = adOrderDetailRepository.findByOrderId(hoaDon.getId());

        int imeiCount = 0;
        for (OrderDetail chiTiet : danhSachChiTiet) {
            if (chiTiet.getSerials() != null && !chiTiet.getSerials().isEmpty()) {
                for (Serial imei : chiTiet.getSerials()) {
                    imei.setSerialStatus(SerialStatus.AVAILABLE);
                    imei.setOrderDetail(null);
                    imei.setOrderHolding(null);
                    imei.setLockedAt(null);
                }
                serialRepository.saveAll(chiTiet.getSerials());
                imeiCount += chiTiet.getSerials().size();
            }
        }
        log.info("Đã trả {} IMEI về kho cho hóa đơn {}", imeiCount, hoaDon.getCode());
    }

    // Đánh dấu voucher đã được sử dụng khi chuyển sang CHỜ GIAO
    private void danhDauVoucherDaSuDung(Order hoaDon) {
        Voucher voucher = hoaDon.getVoucher();
        if (voucher == null) {
            return;
        }
        VoucherDetail voucherDetail = voucherDetailRepository.findByOrder_Id(hoaDon.getId());

        if (voucherDetail != null && (voucherDetail.getUsageStatus() == null || voucherDetail.getUsageStatus() == 0)) {

            // Đánh dấu đã sử dụng
            voucherDetail.setUsageStatus(1);
            voucherDetail.setUsedDate(System.currentTimeMillis());

            voucherDetailRepository.save(voucherDetail);

            // Giảm số lượng quantity của voucher
            if (voucher.getQuantity() != null && voucher.getQuantity() > 0) {
                voucher.setQuantity(voucher.getQuantity() - 1);
                voucherRepository.save(voucher);
            }

            log.info("Đã đánh dấu voucher {} đã sử dụng cho hóa đơn {}", voucher.getCode(), hoaDon.getCode());
        }
    }

    // Hoàn trả voucher khi hủy hóa đơn
    private void hoanTraVoucher(Order hoaDon) {
        Voucher voucher = hoaDon.getVoucher();
        if (voucher == null) {
            return;
        }

        VoucherDetail voucherDetail = voucherDetailRepository.findByOrder_Id(hoaDon.getId());

        // Nếu voucher đã được đánh dấu là sử dụng (1) thì mới cần hoàn trả
        if (voucherDetail != null && voucherDetail.getUsageStatus() != null && voucherDetail.getUsageStatus() == 1) {

            // Reset trạng thái voucher detail về chưa sử dụng (0)
            voucherDetail.setUsageStatus(0);
            voucherDetail.setUsedDate(null);
            voucherDetail.setOrder(null); // Xóa liên kết với hóa đơn đã hủy

            voucherDetailRepository.save(voucherDetail);

            // Tăng lại số lượng quantity của voucher
            if (voucher.getQuantity() != null) {
                voucher.setQuantity(voucher.getQuantity() + 1);
                voucherRepository.save(voucher);
            }

            log.info("Đã hoàn trả voucher {} cho hóa đơn {}", voucher.getCode(), hoaDon.getCode());
        }
    }

    // Lưu lịch sử thanh toán khi chuyển sang chờ giao
    private void luuLichSuThanhToan(Order hoaDon, Employee nhanVien) {
        if (hoaDon.getPaymentDate() != null) {
            return; // Đã thanh toán rồi
        }

        PaymentHistory payment = new PaymentHistory();
        payment.setOrder(hoaDon);
        payment.setAmount(
                hoaDon.getTotalAfterDiscount() != null ? hoaDon.getTotalAfterDiscount() : hoaDon.getTotalAmount());
        payment.setTransactionType("THANH_TOAN");
        payment.setTransactionCode("PAY-" + hoaDon.getCode() + "-" + System.currentTimeMillis());
        payment.setEmployee(nhanVien);
        payment.setNote("Thanh toán khi xác nhận đơn hàng");

        paymentHistoryRepository.save(payment);

        hoaDon.setPaymentDate(System.currentTimeMillis());
        adOrderRepository.save(hoaDon);

        log.info("Đã lưu lịch sử thanh toán cho hóa đơn {}", hoaDon.getCode());
    }

    // Hoàn tiền khi hủy hóa đơn đã thanh toán
    private void hoanTienNeuCan(Order hoaDon, Employee nhanVien) {
        if (hoaDon.getPaymentDate() == null) {
            return; // Chưa thanh toán thì không hoàn
        }

        PaymentHistory refund = new PaymentHistory();
        refund.setOrder(hoaDon);
        // Lưu số âm để thể hiện dòng tiền đi ra
        refund.setAmount(hoaDon.getTotalAfterDiscount() != null ? hoaDon.getTotalAfterDiscount().negate()
                : hoaDon.getTotalAmount().negate());
        refund.setTransactionType("HOAN_TIEN");
        refund.setTransactionCode("REFUND-" + hoaDon.getCode() + "-" + System.currentTimeMillis());
        refund.setEmployee(nhanVien);
        refund.setNote("Hoàn tiền do hủy hóa đơn");

        paymentHistoryRepository.save(refund);
        hoaDon.setPaymentDate(null); // Reset payment date
        adOrderRepository.save(hoaDon);

        log.info("Đã hoàn tiền cho hóa đơn {}", hoaDon.getCode());
    }

    // Gửi email thông báo thay đổi trạng thái (bất đồng bộ)
    @Async
    public void sendStatusUpdateEmailAsync(Order Order, OrderStatus newStatus) {
        try {
            Customer customer = Order.getCustomer();
            if (customer == null || customer.getEmail() == null) {
                log.warn("Không có email khách hàng, bỏ qua gửi email cho hóa đơn {}", Order.getCode());
                return;
            }

            String email = customer.getEmail();
            String subject = getEmailSubject(newStatus);
            String content = buildEmailContent(Order, newStatus);

            emailService.sendEmail(email, subject, content);
            log.info("Đã gửi email thông báo đến: {} cho hóa đơn {}", email, Order.getCode());

        } catch (Exception e) {
            log.error("Lỗi khi gửi email cho hóa đơn {}: {}", Order.getCode(), e.getMessage(), e);
        }
    }

    private String getEmailSubject(OrderStatus status) {
        switch (status) {
            case DA_XAC_NHAN:
                return "Xác nhận đơn hàng tại Hikari Store";
            case DANG_GIAO:
                return "Đơn hàng của bạn đang được giao";
            case HOAN_THANH:
                return "Đơn hàng đã giao thành công";
            case DA_HUY:
                return "Thông báo hủy đơn hàng";
            case CHO_GIAO:
                return "Đơn hàng đã sẵn sàng để giao";
            default:
                return "Cập nhật trạng thái đơn hàng tại Hikari Store";
        }
    }

    private String buildEmailContent(Order Order, OrderStatus newStatus) {
        String trackingUrl = "http://localhost:5173/client/profile?tab=orders";
        String statusText = getStatusText(newStatus);
        String customerName = Order.getCustomer() != null ? Order.getCustomer().getName() : Order.getRecipientName();

        return """
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; background: #f9f9f9;">
                    <div style="background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%); padding: 30px 20px; text-align: center; color: white;">
                        <h2 style="margin: 0; font-size: 28px; letter-spacing: 1px;">📷 Canon Hikari Store</h2>
                        <p style="margin: 8px 0 0; font-size: 15px; opacity: 0.9;">Chuyên máy ảnh, ống kính &amp; phụ kiện nhiếp ảnh</p>
                    </div>

                    <div style="padding: 30px; background: white;">
                        <h3 style="color: #B71C1C; margin-top: 0; font-size: 20px;">${statusText}</h3>
                        <p style="color: #555; font-size: 16px; line-height: 1.6;">
                            Xin chào <b>${customerName}</b>,<br>
                            Đơn hàng <b style="color: #D32F2F;">${OrderCode}</b> của bạn đã được cập nhật trạng thái.
                        </p>

                        <div style="background: #fff5f5; border-left: 4px solid #D32F2F; padding: 15px; margin: 20px 0; border-radius: 4px;">
                            <p style="margin: 0; color: #333;">
                                <strong>Mã đơn hàng:</strong> ${OrderCode}<br>
                                <strong>Trạng thái mới:</strong> ${statusText}<br>
                                <strong>Ngày cập nhật:</strong> ${currentDate}
                            </p>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${trackingUrl}" style="background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%);
                               color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px;
                               font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(211, 47, 47, 0.35);">
                                🔍 Xem đơn hàng của bạn
                            </a>
                        </div>

                        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                            <p style="color: #777; font-size: 14px; text-align: center;">
                                Cảm ơn bạn đã tin tưởng Canon Hikari Store!<br>
                                Mọi thắc mắc vui lòng liên hệ hotline hỗ trợ của chúng tôi.
                            </p>
                        </div>
                    </div>

                    <div style="background: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0; color: #666; font-size: 12px;">
                            © 2026 Canon Hikari Store. All rights reserved.<br>
                            Địa chỉ: Trường Cao đẳng FPT Polytechnic, Trịnh Văn Bô, Nam Từ Liêm, Hà Nội
                        </p>
                    </div>
                </div>
                """
                .replace("${statusText}", statusText)
                .replace("${customerName}", customerName != null ? customerName : "Quý khách")
                .replace("${OrderCode}", Order.getCode())
                .replace("${currentDate}", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                .replace("${trackingUrl}", trackingUrl);
    }

    private String getStatusText(OrderStatus status) {
        switch (status) {
            case CHO_XAC_NHAN:
                return "Chờ xác nhận";
            case DA_XAC_NHAN:
                return "Đã xác nhận";
            case CHO_GIAO:
                return "Chờ giao hàng";
            case DANG_GIAO:
                return "Đang giao hàng";
            case HOAN_THANH:
                return "Hoàn thành";
            case DA_HUY:
                return "Đã hủy";
            default:
                return "Đang xử lý";
        }
    }

    @Override
    public ResponseObject<?> getAllHoaDon(ADOrderSearchRequest request) {
        try {
            Pageable pageable = Helper.createPageable(request, "createdDate");
            OrderPageResponse result = adOrderRepositoryCustom.getAllHoaDonResponse(request, pageable);

            return ResponseObject.success(result, "Lấy danh sách hóa đơn thành công");

        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách hóa đơn: {}", e.getMessage(), e);

            return ResponseObject.error(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Lỗi khi lấy danh sách hóa đơn: " + e.getMessage());
        }
    }

    @Override
    public ResponseObject<?> getAllHoaDonCT(ADOrderDetailRequest request) {
        try {
            Pageable pageable = Helper.createPageable(request, "created_date");

            Page<ADOrderDetailResponse> page = adOrderDetailRepository.getHoaDonChiTiet(request.getMaHoaDon(),
                    pageable);
            return ResponseObject.success(
                    page,
                    "Lấy danh sách chi tiết hóa đơn thành công");
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết hóa đơn: {}", e.getMessage(), e);
            return ResponseObject.error(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Lỗi khi lấy chi tiết hóa đơn: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseObject<?> doiImei(ADAssignSerialRequest request) {
        try {
            boolean hasOldSerial = request.getOldImeiId() != null && !request.getOldImeiId().isBlank();
            log.info("Bắt đầu {} IMEI: oldImeiId={}, newImeiId={}, hoaDonChiTietId={}",
                    hasOldSerial ? "đổi" : "gán",
                    request.getOldImeiId(), request.getNewImeiId(), request.getHoaDonChiTietId());

            // Tìm OrderDetail
            OrderDetail chiTiet = adOrderDetailRepository.findById(request.getHoaDonChiTietId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết hóa đơn: "
                            + request.getHoaDonChiTietId()));

            // Kiểm tra hóa đơn còn ở trạng thái CHỜ XÁC NHẬN hoặc ĐÃ XÁC NHẬN hoặc CHỜ GIAO
            // mới cho đổi/gán
            Order hoaDon = chiTiet.getOrder();
            if (hoaDon.getOrderStatus() != OrderStatus.CHO_XAC_NHAN
                    && hoaDon.getOrderStatus() != OrderStatus.DA_XAC_NHAN
                    && hoaDon.getOrderStatus() != OrderStatus.CHO_GIAO) {
                throw new RuntimeException(
                        "Chỉ có thể gán/đổi Serial khi đơn hàng ở trạng thái 'Chờ xác nhận'");
            }

            // Kiểm tra số lượng serial đã gán cho OrderDetail
            int soLuongSanPham = chiTiet.getQuantity() != null ? chiTiet.getQuantity() : 1;
            int soSerialDaGan = chiTiet.getSerials() != null ? chiTiet.getSerials().size() : 0;
            if (!hasOldSerial && soSerialDaGan >= soLuongSanPham) {
                throw new RuntimeException("Đã đủ số lượng serial cho sản phẩm này. Không thể gán thêm!");
            }

            // Xử lý IMEI cũ (nếu có)
            Serial imeiCu = null;
            if (hasOldSerial) {
                imeiCu = serialRepository.findById(request.getOldImeiId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy Serial cũ: "
                                + request.getOldImeiId()));

                boolean imeiCuThuocChiTiet = chiTiet.getSerials().stream()
                        .anyMatch(imei -> imei.getId().equals(request.getOldImeiId()));
                if (!imeiCuThuocChiTiet) {
                    throw new RuntimeException("Serial cũ không thuộc dòng hóa đơn này");
                }
            }

            // Tìm IMEI mới và kiểm tra còn AVAILABLE
            Serial imeiMoi = serialRepository.findById(request.getNewImeiId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Serial mới: "
                            + request.getNewImeiId()));

            if (imeiMoi.getSerialStatus() != SerialStatus.AVAILABLE) {
                throw new RuntimeException(
                        "Serial không ở trạng thái khả dụng (hiện tại: "
                                + imeiMoi.getSerialStatus() + ")");
            }

            // Nếu đổi serial: kiểm tra 2 IMEI cùng ProductDetail
            if (hasOldSerial && !imeiCu.getProductDetail().getId().equals(imeiMoi.getProductDetail().getId())) {
                throw new RuntimeException("Serial mới không thuộc cùng sản phẩm với Serial cũ");
            }

            // Giải phóng IMEI cũ → trả về AVAILABLE (chỉ khi đổi)
            if (hasOldSerial) {
                imeiCu.setSerialStatus(SerialStatus.AVAILABLE);
                imeiCu.setOrderDetail(null);
                imeiCu.setOrderHolding(null);
                imeiCu.setLockedAt(null);
                serialRepository.save(imeiCu);
                log.info("Đã giải phóng Serial cũ: {}", imeiCu.getCode());
            }

            // Gán IMEI mới → IN_ORDER (đang trong đơn hàng)
            imeiMoi.setSerialStatus(SerialStatus.IN_ORDER);
            imeiMoi.setOrderDetail(chiTiet);
            imeiMoi.setLockedAt(System.currentTimeMillis());
            serialRepository.save(imeiMoi);
            log.info("Đã gán Serial mới: {}", imeiMoi.getCode());

            // Cập nhật danh sách IMEI trong OrderDetail
            if (hasOldSerial) {
                chiTiet.getSerials().removeIf(imei -> imei.getId().equals(request.getOldImeiId()));
            }
            chiTiet.getSerials().add(imeiMoi);
            adOrderDetailRepository.save(chiTiet);

            // Trả về kết quả
            String action = hasOldSerial ? "Đổi" : "Gán";
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("hoaDonChiTietId", chiTiet.getId());
            if (hasOldSerial)
                responseData.put("oldImeiCode", imeiCu.getCode());
            responseData.put("newImeiCode", imeiMoi.getCode());
            responseData.put("message", action + " Serial thành công");

            log.info("{} Serial thành công: {}", action, imeiMoi.getCode());
            return ResponseObject.success(responseData, action + " Serial thành công");

        } catch (RuntimeException e) {
            log.error("Lỗi đổi Serial: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Lỗi hệ thống khi đổi Serial: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi hệ thống: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public ResponseObject<?> capNhatThongTinKhachHang(ADUpdateCustomerRequest request) {
        try {
            Order hoaDon = adOrderRepository.findByMa(request.getMaHoaDon())
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy hóa đơn: " + request.getMaHoaDon()));

            // Chỉ cho phép cập nhật khi đơn ở trạng thái CHỜ XÁC NHẬN
            if (hoaDon.getOrderStatus() != OrderStatus.CHO_XAC_NHAN) {
                throw new RuntimeException(
                        "Chỉ được cập nhật thông tin khi đơn hàng ở trạng thái Chờ xác nhận");
            }

            if (request.getTenKhachHang() != null && !request.getTenKhachHang().isBlank())
                hoaDon.setRecipientName(request.getTenKhachHang());

            if (request.getSdtKH() != null && !request.getSdtKH().isBlank())
                hoaDon.setRecipientPhone(request.getSdtKH());

            if (request.getEmail() != null)
                hoaDon.setRecipientEmail(request.getEmail());

            if (request.getDiaChi() != null)
                hoaDon.setRecipientAddress(request.getDiaChi());

            adOrderRepository.save(hoaDon);

            log.info("Đã cập nhật thông tin khách hàng cho hóa đơn: {}", request.getMaHoaDon());

            return ResponseObject.success(HttpStatus.OK,
                    "Cập nhật thông tin khách hàng thành công");

        } catch (RuntimeException e) {
            log.error("Lỗi cập nhật thông tin khách hàng: {}", e.getMessage(), e);
            throw e;
        }
    }

    private void capNhatTrangThaiSerialBiHuy(Order hoaDon) {
        List<OrderDetail> details = orderDetailRepository.findByOrderId(hoaDon.getId());

        for (OrderDetail item : details) {
            // Lấy danh sách serial gắn với chi tiết hóa đơn này
            List<Serial> serials = serialRepository.findByOrderDetailId(item.getId());

            for (Serial s : serials) {
                // 1. Quan trọng: Đưa về trạng thái CÓ SẴN trong kho
                s.setSerialStatus(SerialStatus.AVAILABLE);

                // 2. Xóa các thông tin giữ chỗ
                s.setOrderDetail(null);
                s.setOrderHolding(null);
                s.setLockedAt(null);

                // 3. Set status hiển thị (nếu cần)
                s.setStatus(EntityStatus.ACTIVE);
            }
            serialRepository.saveAll(serials);
        }
        log.info("Đã giải phóng Serial cho hóa đơn {} về trạng thái AVAILABLE", hoaDon.getCode());
    }
}
