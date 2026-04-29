package com.example.datn.core.client.order.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateShippingInfoRequest {

    @Size(max = 500, message = "Địa chỉ giao hàng không được vượt quá 500 ký tự")
    private String shippingAddress;

    @Size(max = 255, message = "Tên người nhận không được vượt quá 255 ký tự")
    private String receiverName;

    @Pattern(regexp = "^(0[0-9]{9,10})$", message = "Số điện thoại không hợp lệ. Phải bắt đầu bằng 0 và có 10-11 số")
    private String receiverPhone;

    public boolean hasShippingAddress() {
        return shippingAddress != null && !shippingAddress.isBlank();
    }

    public boolean hasReceiverName() {
        return receiverName != null && !receiverName.isBlank();
    }

    public boolean hasReceiverPhone() {
        return receiverPhone != null && !receiverPhone.isBlank();
    }

    public boolean hasAnyField() {
        return hasShippingAddress() || hasReceiverName() || hasReceiverPhone();
    }
}
