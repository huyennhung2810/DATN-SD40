package com.example.datn.core.admin.voucherDetail.model.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoucherDetailRequest {

    @NotBlank(message = "ID Voucher không được để trống")
    private String idVoucher;

    @NotBlank(message = "ID Khách hàng không được để trống")
    private String idCustomer;

    private String usageStatus; // VD: UNUSED, USED
    private String note;
}
