package com.example.datn.core.admin.order.service;

import com.example.datn.core.admin.order.model.request.*;
import com.example.datn.core.common.base.ResponseObject;

public interface ADOrderService {

    ResponseObject<?> getAllHoaDon(ADOrderSearchRequest request);

    ResponseObject<?> getAllHoaDonCT(ADOrderDetailRequest request);

    ResponseObject<?> capNhatTrangThaiHoaDon(ADChangeStatusRequest adChangeStatusRequest);

    ResponseObject<?> failDelivery(String maHoaDon, String reason);

    ResponseObject<?> redeliverOrder(String maHoaDon);

    ResponseObject<?> returnOrder(String maHoaDon);

    ResponseObject<?> cancelAfterReturn(String maHoaDon, String reason);

    ResponseObject<?> doiImei(ADAssignSerialRequest request);

    ResponseObject<?> capNhatThongTinKhachHang(ADUpdateCustomerRequest request);
}
