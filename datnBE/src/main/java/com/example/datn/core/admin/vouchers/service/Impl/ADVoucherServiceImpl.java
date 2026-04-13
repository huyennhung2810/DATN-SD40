package com.example.datn.core.admin.vouchers.service.Impl;

import com.example.datn.core.admin.voucherDetail.repository.ADVoucherDetailRepository;
import com.example.datn.core.admin.voucherDetail.service.ADVoucherDetailService;
import com.example.datn.core.admin.vouchers.model.PostOrPutVoucherDto;
import com.example.datn.core.admin.vouchers.model.request.ADVoucherSearchRequest;
import com.example.datn.core.admin.vouchers.model.response.VoucherResponse;
import com.example.datn.core.admin.vouchers.repository.ADVouchersRepository;
import com.example.datn.core.admin.vouchers.service.ADVoucherService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Voucher;
import com.example.datn.infrastructure.email.EmailService;
import com.example.datn.utils.DataGeneratorUtils;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ADVoucherServiceImpl implements ADVoucherService {
    private final ADVouchersRepository  adVouchersRepository;
    private final ADVoucherDetailService adVoucherDetailService;
    private final EmailService emailService;


    @Override
    public ResponseObject<?> getAllVoucher(ADVoucherSearchRequest request) {
        // 1. Tạo đối tượng phân trang từ Helper (lấy page và size từ request)
        Pageable pageable = Helper.createPageable(request);

        // 2. Cập nhật trạng thái theo thời gian cho toàn bộ voucher (before query)
        long now = System.currentTimeMillis();
        List<Voucher> allVouchers = adVouchersRepository.findAll();
        allVouchers.forEach(v -> {
            // Chỉ cập nhật nếu không bị "Buộc dừng" (status != 0)
            if (v.getStatus() != null && v.getStatus() != 0
                    && v.getStartDate() != null && v.getEndDate() != null) {
                if (v.getStartDate() > now) {
                    v.setStatus(1); // Sắp diễn ra
                } else if (v.getStartDate() <= now && v.getEndDate() >= now) {
                    v.setStatus(2); // Đang diễn ra
                } else {
                    v.setStatus(3); // Đã kết thúc
                }
            }
        });
        try {
            adVouchersRepository.saveAll(allVouchers);
        } catch (Exception e) {
            log.warn("Không thể cập nhật trạng thái voucher: {}", e.getMessage());
        }

        // 3. Query trang dữ liệu SAU khi đã cập nhật trạng thái
        Page<Voucher> page = adVouchersRepository.getAllVouchers(
                pageable,
                request.getKeyword(),
                request.getStatus(),
                request.getVoucherType(),
                request.getStartDate(),
                request.getEndDate()
        );

        // 4. Map sang DTO để tránh lazy loading / circular reference khi serialize
        Page<VoucherResponse> responsePage = page.map(VoucherResponse::new);

        return ResponseObject.success(PageableObject.of(responsePage), "Lấy danh sách voucher thành công");
    }



    @Override
    public ResponseObject<?> getByVoucher(String voucherId) {
        return adVouchersRepository.findDetailById(voucherId)
                .map(v -> {
                    // Kiểm tra nếu là voucher cá nhân thì mới tính toán lại quantity
                    if ("INDIVIDUAL".equalsIgnoreCase(v.getVoucherType())) {
                        if (v.getDetails() != null) {
                            long availableCount = v.getDetails().stream()
                                    .filter(detail -> detail.getUsageStatus() == 0)
                                    .count();

                            // Cập nhật lại số lượng hiển thị trước khi trả về FE
                            v.setQuantity((int) availableCount);
                        }
                    }


                    VoucherResponse response = new VoucherResponse(v);
                    return ResponseObject.success(response, "Lấy chi tiết voucher thành công");
                })
                .orElse(ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy Voucher với ID: " + voucherId));
    }

    @Override
    @Transactional
    public ResponseObject<?> createOrUpdate(String id, PostOrPutVoucherDto dto) {

        Voucher voucher;
        long currentTime = System.currentTimeMillis();

        if (id != null && !id.isEmpty()) {
            voucher = adVouchersRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

            // CHỈ kiểm tra đổi loại khi là cập nhật
            if (!voucher.getVoucherType().equalsIgnoreCase(dto.getVoucherType())) {
                return ResponseObject.error(HttpStatus.BAD_REQUEST,
                        "Không được phép thay đổi đối tượng áp dụng sau khi đã tạo voucher!");
            }
        } else {

            voucher = new Voucher();
            voucher.setId(UUID.randomUUID().toString());
            voucher.setCreatedBy(dto.getCreatedBy());
            voucher.setCreatedDate(currentTime);
            voucher.setVoucherType(dto.getVoucherType());
        }

        if (dto.getStatus() != null && dto.getStatus() == 0) {
            voucher.setStatus(0); // Buộc dừng
        } else {
            long now = System.currentTimeMillis();
            if (dto.getStartDate() > now) {
                voucher.setStatus(1); // Sắp diễn ra
            } else if (dto.getStartDate() <= now && dto.getEndDate() >= now) {
                voucher.setStatus(2); // Đang diễn ra
            } else {
                voucher.setStatus(3); // Đã kết thúc
            }
        }

        String autoGeneratedCode = DataGeneratorUtils.generateRandomCode("VOUCHER-");
        voucher.setCode(autoGeneratedCode);
        voucher.setName(dto.getName());
        voucher.setVoucherType(dto.getVoucherType());
        voucher.setDiscountUnit(dto.getDiscountUnit());
        voucher.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        voucher.setConditions(dto.getConditions());
        voucher.setStartDate(dto.getStartDate());
        voucher.setEndDate(dto.getEndDate());
        voucher.setNote(dto.getNote());
        voucher.setDiscountValue(dto.getDiscountValue());
        voucher.setQuantity(dto.getQuantity());
        voucher.setLastModifiedDate(currentTime);
        voucher.setLastModifiedBy(dto.getLastModifiedBy());
        Voucher savedVoucher;


        // --- PHẦN 3 & 4: XỬ LÝ VOUCHER CÁ NHÂN & GỬI MAIL ---
        if ("INDIVIDUAL".equalsIgnoreCase(dto.getVoucherType())) {
            List<String> customerIds = dto.getCustomerIds();

            if (customerIds == null || customerIds.isEmpty()) {
                throw new RuntimeException("Vui lòng chọn ít nhất một khách hàng cho voucher cá nhân");
            }
            // Bước A: Lưu Voucher tạm thời để đảm bảo thực thể được managed
            savedVoucher = adVouchersRepository.save(voucher);

            // Bước B: Gọi hàm cập nhật chi tiết (Logic đổi trạng thái thay vì xóa cứng)
            // Hàm này sẽ xử lý: Thêm mới ID chưa có, và set usage_status = 2 cho ID bị bỏ chọn
            adVoucherDetailService.updateVoucherDetails(savedVoucher.getId(), customerIds);

            // Bước C: Tính toán lại số lượng voucher dựa trên các bản ghi có trạng thái 0 (Chưa dùng)
            int validQuantity = adVoucherDetailService.countActiveVoucherDetails(savedVoucher.getId());
            savedVoucher.setQuantity(validQuantity);


            // Lưu Voucher trước để có ID

            savedVoucher = adVouchersRepository.save(savedVoucher);
            // Cập nhật danh sách khách hàng được nhận voucher
            adVoucherDetailService.updateVoucherDetails(savedVoucher.getId(), customerIds);

            // Lấy danh sách email cần thông báo (những người có isNotified = 0)
            List<String> emails = adVoucherDetailService.getEmailsToNotify(savedVoucher.getId());

            if (emails != null && !emails.isEmpty()) {
                try {
                    // Gửi mail thông báo
                    emailService.sendVoucherNotification(emails, savedVoucher);

                    // Cập nhật trạng thái đã gửi mail thành công (isNotified = 1)
                    adVoucherDetailService.updateNotificationStatus(savedVoucher.getId(), customerIds);
                } catch (Exception e) {
                    // Log lỗi gửi mail nhưng không làm stop tiến trình chính nếu bạn muốn
                    System.err.println("Lỗi gửi email: " + e.getMessage());
                }
            }
        } else {
            // Trường hợp voucher chung (PUBLIC/GLOBAL), chỉ cần save voucher
            savedVoucher = adVouchersRepository.save(voucher);
        }

        String action = (id == null) ? "Thêm mới" : "Cập nhật";
        return ResponseObject.success(savedVoucher, action + " thành công");
    }

    @Override
    //@Scheduled(cron = "0 * * * * *")
    @Transactional
    public ResponseObject<?> autoUpdateStatus() {
        long now = System.currentTimeMillis();

        // LOGIC 1: Sắp diễn ra (1) -> Đang diễn ra (2)
        // Nếu hiện tại đã vượt qua ngày bắt đầu
        List<Voucher> startVouchers = adVouchersRepository.findAllByStatusAndStartDateBefore(1, now);
        startVouchers.forEach(v -> v.setStatus(2));
        adVouchersRepository.saveAll(startVouchers);

        // LOGIC 2: Đang diễn ra (2) -> Đã kết thúc (3)
        // Nếu hiện tại đã vượt qua ngày kết thúc
        List<Voucher> endVouchers = adVouchersRepository.findAllByStatusAndEndDateBefore(2, now);
        endVouchers.forEach(v -> v.setStatus(3));
        adVouchersRepository.saveAll(endVouchers);

        // Lưu ý: Những Voucher có status = 0 (Buộc dừng) sẽ KHÔNG bị quét trúng
        // nên nó sẽ đứng yên ở trạng thái đó cho đến khi bạn bật lại.
        return null;
    }

    @Override
    public boolean isCodeExists(String code) {
        return adVouchersRepository.existsByCode(code);
    }

    @Override
    public ResponseObject<?> stopVoucher(String id) {
        Voucher voucher = adVouchersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Voucher"));
        voucher.setStatus(0); // Thiết lập trạng thái Buộc dừng
        adVouchersRepository.save(voucher);
        return null;
    }

//    @Scheduled(fixedRate = 60000) // chạy mỗi 1 phút
//    @Transactional
//    public void updateVoucherStatus() {
//        log.info("=== [JOB] Bắt đầu cập nhật trạng thái Voucher ===");
//        long now = System.currentTimeMillis();
//        adVouchersRepository.updateSapDienRa(1, now);
//        adVouchersRepository.updateDangDienRa(2, now);
//        adVouchersRepository.updateDaKetThuc(3, now);
//        log.info("=== [JOB] Kết thúc cập nhật trạng thái Voucher - time: {} ===", now);
//    }

}
