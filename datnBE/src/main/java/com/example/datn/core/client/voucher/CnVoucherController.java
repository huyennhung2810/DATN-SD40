package com.example.datn.core.client.voucher;

import com.example.datn.core.admin.vouchers.model.response.VoucherResponse;
import com.example.datn.core.client.voucher.model.response.AvailableCouponResponse;
import com.example.datn.core.client.voucher.model.response.AvailableCouponsResponse;
import com.example.datn.entity.Voucher;
import com.example.datn.infrastructure.security.user.UserPrincipal;
import com.example.datn.repository.VoucherDetailRepository;
import com.example.datn.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/client/vouchers")
@RequiredArgsConstructor
public class CnVoucherController {

    private final VoucherRepository voucherRepository;
    private final VoucherDetailRepository voucherDetailRepository;

    @GetMapping
    public ResponseEntity<List<VoucherResponse>> getActiveVouchers() {
        long now = System.currentTimeMillis();

        // Lấy ID khách hàng đang đăng nhập (nếu có)
        String customerId = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserPrincipal up) {
            customerId = up.getId();
        }

        // Luôn trả về voucher áp dụng cho tất cả (ALL)
        List<Voucher> vouchers = new ArrayList<>(
                voucherRepository.findByVoucherTypeAndStatusNotAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        "ALL", 0, now, now));

        // Nếu đã đăng nhập, thêm voucher cá nhân (INDIVIDUAL) được gán cho khách hàng
        // này
        if (customerId != null) {
            List<Voucher> individualVouchers = voucherDetailRepository
                    .findActiveIndividualVouchersByCustomerId(customerId, now);
            vouchers.addAll(individualVouchers);
        }

        List<VoucherResponse> responses = vouchers.stream()
                .map(v -> {
                    VoucherResponse r = new VoucherResponse();
                    r.setId(v.getId());
                    r.setCode(v.getCode());
                    r.setName(v.getName());
                    r.setVoucherType(v.getVoucherType());
                    r.setDiscountUnit(v.getDiscountUnit());
                    r.setMaxDiscountAmount(v.getMaxDiscountAmount());
                    r.setConditions(v.getConditions());
                    r.setStartDate(v.getStartDate());
                    r.setEndDate(v.getEndDate());
                    r.setNote(v.getNote());
                    r.setQuantity(v.getQuantity());
                    r.setDiscountValue(v.getDiscountValue());
                    r.setStatus(v.getStatus());
                    return r;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/available")
    public ResponseEntity<AvailableCouponsResponse> getAvailableCoupons(
            @RequestParam(required = false) BigDecimal cartTotal) {
        long now = System.currentTimeMillis();

        // Lấy ID khách hàng đang đăng nhập (nếu có)
        String customerId = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserPrincipal up) {
            customerId = up.getId();
        }

        // Luôn trả về voucher áp dụng cho tất cả (ALL)
        List<Voucher> vouchers = new ArrayList<>(
                voucherRepository.findByVoucherTypeAndStatusNotAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        "ALL", 0, now, now));

        // Nếu đã đăng nhập, thêm voucher cá nhân (INDIVIDUAL) được gán cho khách hàng
        if (customerId != null) {
            List<Voucher> individualVouchers = voucherDetailRepository
                    .findActiveIndividualVouchersByCustomerId(customerId, now);
            vouchers.addAll(individualVouchers);
        }

        // Lọc voucher còn hàng (quantity > 0)
        vouchers = vouchers.stream()
                .filter(v -> v.getQuantity() == null || v.getQuantity() > 0)
                .collect(Collectors.toList());

        // Chuyển đổi sang response và tính discount
        BigDecimal effectiveCartTotal = cartTotal != null ? cartTotal : BigDecimal.ZERO;
        List<AvailableCouponResponse> availableCoupons = vouchers.stream()
                .filter(v -> {
                    // Kiểm tra điều kiện đơn hàng tối thiểu
                    if (v.getConditions() == null || v.getConditions().compareTo(BigDecimal.ZERO) <= 0) {
                        return true;
                    }
                    return effectiveCartTotal.compareTo(v.getConditions()) >= 0;
                })
                .map(v -> {
                    BigDecimal calculatedDiscount = calculateDiscount(v, effectiveCartTotal);
                    return AvailableCouponResponse.builder()
                            .id(v.getId())
                            .code(v.getCode())
                            .name(v.getName())
                            .voucherType(v.getVoucherType())
                            .discountUnit(v.getDiscountUnit())
                            .discountValue(v.getDiscountValue())
                            .maxDiscountAmount(v.getMaxDiscountAmount())
                            .conditions(v.getConditions())
                            .startDate(v.getStartDate())
                            .endDate(v.getEndDate())
                            .note(v.getNote())
                            .quantity(v.getQuantity())
                            .status(v.getStatus())
                            .calculatedDiscount(calculatedDiscount)
                            .build();
                })
                .collect(Collectors.toList());

        // Sắp xếp theo discount giảm dần
        availableCoupons.sort((a, b) -> b.getCalculatedDiscount().compareTo(a.getCalculatedDiscount()));

        // Tìm best coupon (coupon có discount cao nhất)
        AvailableCouponResponse bestCoupon = availableCoupons.isEmpty() ? null : availableCoupons.get(0);

        AvailableCouponsResponse response = AvailableCouponsResponse.builder()
                .bestCoupon(bestCoupon)
                .availableCoupons(availableCoupons)
                .build();

        return ResponseEntity.ok(response);
    }

    private BigDecimal calculateDiscount(Voucher voucher, BigDecimal cartTotal) {
        if (voucher.getDiscountValue() == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount = BigDecimal.ZERO;

        if ("PERCENT".equals(voucher.getDiscountUnit())) {
            // Tính theo phần trăm
            discount = cartTotal.multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            // Áp dụng max discount nếu có
            if (voucher.getMaxDiscountAmount() != null && voucher.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                discount = discount.min(voucher.getMaxDiscountAmount());
            }
        } else {
            // Tính theo số tiền cố định
            discount = voucher.getDiscountValue();
        }

        // Discount không thể lớn hơn cartTotal
        return discount.min(cartTotal);
    }
}
