package com.example.datn.core.client.voucher;

import com.example.datn.core.admin.vouchers.model.response.VoucherResponse;
import com.example.datn.entity.Voucher;
import com.example.datn.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/client/vouchers")
@RequiredArgsConstructor
public class CnVoucherController {

    private final VoucherRepository voucherRepository;

    @GetMapping
    public ResponseEntity<List<VoucherResponse>> getActiveVouchers() {
        long now = System.currentTimeMillis();
        List<Voucher> vouchers = voucherRepository
                .findByStatusNotAndStartDateLessThanEqualAndEndDateGreaterThanEqual(0, now, now);
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
