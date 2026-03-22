package com.example.datn.core.admin.order.model.request;


import com.example.datn.core.common.base.PageableRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ADOrderDetailRequest extends PageableRequest {

    private String maHoaDon;  // ID của đơn hàng
}
