package com.example.datn.core.client.voucher;

import com.example.datn.core.admin.vouchers.model.response.VoucherResponse;
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
import org.springframework.web.bind.annotation.RestController;

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
}
