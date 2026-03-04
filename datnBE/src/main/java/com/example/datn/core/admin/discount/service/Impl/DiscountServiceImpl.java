package com.example.datn.core.admin.discount.service.Impl;

import com.example.datn.core.admin.discount.model.DiscountRequest;
import com.example.datn.core.admin.discount.model.DiscountResponse;
import com.example.datn.core.admin.discount.repository.ADDiscountRepository;
import com.example.datn.core.admin.discount.service.DiscountService;
import com.example.datn.core.admin.discountDetail.model.DiscountDetailResponse;
import com.example.datn.core.admin.discountDetail.repository.ADDiscountDetailRepository;
import com.example.datn.core.admin.discountDetail.service.DiscountDetailService; // Service con chúng ta đã tạo
import com.example.datn.core.admin.discountDetail.repository.ADProductDetailForDiscountRepository;
import com.example.datn.core.admin.vouchers.model.request.ADVoucherSearchRequest;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Discount;
import com.example.datn.entity.ProductDetail;
import com.example.datn.utils.Helper; // Giả sử bạn dùng chung Helper
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscountServiceImpl implements DiscountService {

    private final ADDiscountRepository adDiscountRepository;
    private final ADDiscountDetailRepository adDiscountDetailRepository;
    private final DiscountDetailService discountDetailService; // Gọi service con để xử lý bảng chi tiết
    private final ADProductDetailForDiscountRepository adProductDetailRepository;
    @Override
    public ResponseObject<?> getAll(ADVoucherSearchRequest request) {
        // 1. Tạo Pageable từ Helper
        Pageable pageable = Helper.createPageable(request);

        // 2. Gọi Repository (Bạn cần đảm bảo Repo có hàm tìm kiếm tương tự Voucher)
        Page<Discount> page = adDiscountRepository.findAllDiscount(request, pageable);

        // 3. Logic cập nhật trạng thái hiển thị tức thì (Giống Voucher)
        long now = System.currentTimeMillis();
        List<Discount> discounts = page.getContent(); // Lấy list từ page hiện tại để xử lý nhanh
        boolean isChanged = false;

        for (Discount d : discounts) {
            // Chỉ cập nhật nếu không bị "Buộc dừng" (status != 0)
            if (d.getStatus() != 0) {
                int newStatus = d.getStatus();
                if (d.getStartDate() > now) {
                    newStatus = 1; // Sắp diễn ra (Hoặc 1 tùy quy ước của bạn)
                } else if (d.getStartDate() <= now && d.getEndDate() >= now) {
                    newStatus = 2; // Đang diễn ra
                } else {
                    newStatus = 3; // Đã kết thúc
                }

                if (newStatus != d.getStatus()) {
                    d.setStatus(newStatus);
                    isChanged = true;
                }
            }
        }

        // Nếu có thay đổi trạng thái thì lưu lại ngay
        if (isChanged) {
            adDiscountRepository.saveAll(discounts);
        }

        return ResponseObject.success(PageableObject.of(page), "Lấy danh sách đợt giảm giá thành công");
    }

    @Override
    public ResponseObject<?> getOne(String id) {
        return adDiscountRepository.findById(id)
                .map(discount -> {
                    DiscountResponse response = new DiscountResponse(discount);

                    // Kiểm tra kỹ phần map này
                    List<DiscountDetailResponse> details = adDiscountDetailRepository.findAllByDiscountId(id)
                            .stream()
                            .map(detail -> {
                                // Đảm bảo không bị Null khi khởi tạo Response
                                return new DiscountDetailResponse(detail);
                            })
                            .collect(Collectors.toList());
                    response.setDiscountDetails(details);

                    return ResponseObject.success(response, "Lấy chi tiết thành công");
                })
                .orElse(ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy ID: " + id));
    }

    @Override
    @Transactional
    public Discount add(DiscountRequest req) {
        return createOrUpdateLogic(null, req);
    }

    @Override
    @Transactional
    public Discount update(String id, DiscountRequest req) {
        return createOrUpdateLogic(id, req);
    }

    // --- LOGIC CHUNG CHO THÊM VÀ SỬA (Giống cấu trúc Voucher) ---
    private Discount createOrUpdateLogic(String id, DiscountRequest req) {
        // 1. Kiểm tra trùng mã
        boolean isExisted;
        if (id == null) {
            isExisted = adDiscountRepository.existsByCode(req.getCode());
        } else {
            isExisted = adDiscountRepository.existsByCodeAndIdNot(req.getCode(), id);
        }
        if (isExisted) {
            throw new RuntimeException("Mã giảm giá '" + req.getCode() + "' đã tồn tại!");
        }

        Discount discount;
        long now = System.currentTimeMillis();

        if (id != null) {
            // Update
            discount = adDiscountRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Đợt giảm giá không tồn tại"));
        } else {
            // Create
            discount = new Discount();
            discount.setId(UUID.randomUUID().toString());
            discount.setCreatedAt(now);
        }

        // 2. Logic Trạng thái thông minh (Copy từ Voucher)
        // Nếu FE gửi status = 0 (Buộc dừng) thì giữ nguyên, ngược lại tính theo thời gian
        if (req.getStatus() != null && req.getStatus() == 0) { // Giả sử 2 là buộc dừng trong Voucher, bạn chỉnh lại theo enum của bạn
            discount.setStatus(0);
        } else {
            if (req.getStartDate() > now) {
                discount.setStatus(1); // Sắp diễn ra
            } else if (req.getStartDate() <= now && req.getEndDate() >= now) {
                discount.setStatus(2); // Đang diễn ra
            } else {
                discount.setStatus(3); // Đã kết thúc
            }
        }

        // 3. Mapping dữ liệu
        discount.setCode(req.getCode());
        discount.setName(req.getName());
        discount.setDiscountPercent(req.getDiscountPercent());
        discount.setStartDate(req.getStartDate());
        discount.setEndDate(req.getEndDate());
        discount.setQuantity(req.getQuantity());
        discount.setNote(req.getNote());
        discount.setUpdatedAt(now);
        if (req.getProductDetailIds() != null) {
            for (String pdId : req.getProductDetailIds()) {
                // Truyền ID hiện tại vào (nếu thêm mới thì truyền chuỗi rỗng hoặc UUID giả để không bị lỗi SQL)
                String currentId = (id == null) ? "" : id;

                Long conflictCount = adDiscountDetailRepository.countConflictingDiscounts(
                        pdId,
                        currentId,
                        req.getStartDate(),
                        req.getEndDate()
                );

                if (conflictCount > 0) {
                    // Lấy tên sản phẩm để báo lỗi cho chi tiết
                    ProductDetail pd = adProductDetailRepository.findById(pdId).orElse(null);
                    String prodName = (pd != null) ? pd.getProduct().getName() : pdId;

                    throw new RuntimeException("Sản phẩm '" + prodName + "' đang nằm trong một đợt giảm giá khác cùng thời gian!");
                }
            }
        }
        // BƯỚC QUAN TRỌNG: Lưu Discount (Cha) trước để có ID
        Discount savedDiscount = adDiscountRepository.save(discount);

        // 4. Xử lý danh sách sản phẩm (Tương tự xử lý danh sách Khách hàng bên Voucher)
        // Gọi sang Service con để xử lý logic: Xóa cũ -> Thêm mới -> Tính giá PriceAfter
        if (req.getProductDetailIds() != null) {
            discountDetailService.saveAll(savedDiscount, req.getProductDetailIds());
        }

        return savedDiscount;
    }

    @Override
    public void changeStatus(String id) {
        Discount discount = adDiscountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt giảm giá"));
            discount.setStatus(0);
        adDiscountRepository.save(discount);
    }

    // --- SCHEDULER: TỰ ĐỘNG QUÉT TRẠNG THÁI (Giống Voucher) ---

    @Override
    @Scheduled(cron = "0 * * * * *") // Chạy mỗi phút
    @Transactional
    public void autoUpdateStatus() {
        long now = System.currentTimeMillis();

        // 1. Kích hoạt: Sắp diễn ra (1) -> Đang diễn ra (2)
        // Tìm các đợt đang là '1' mà đã đến giờ bắt đầu
        List<Discount> startDiscounts = adDiscountRepository.findAllByStatusAndStartDateBefore(1, now);
        for (Discount d : startDiscounts) {
            if (d.getEndDate() > now) {
                d.setStatus(2); // Đến giờ thì chạy
            } else {
                d.setStatus(3); // Nếu vừa đến giờ bắt đầu mà đã quá giờ kết thúc luôn thì cho kết thúc
            }
        }
        adDiscountRepository.saveAll(startDiscounts);

        // 2. Kết thúc: Đang diễn ra (2) -> Đã kết thúc (3)
        // Tìm các đợt đang là '2' mà đã quá giờ kết thúc
        List<Discount> endDiscounts = adDiscountRepository.findAllByStatusAndEndDateBefore(2, now);
        endDiscounts.forEach(d -> d.setStatus(3)); // Quá hạn thì dừng
        adDiscountRepository.saveAll(endDiscounts);
    }


}