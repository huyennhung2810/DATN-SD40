package com.example.datn.core.admin.order.service;

import com.example.datn.core.admin.order.model.request.*;
import com.example.datn.core.common.base.ResponseObject;

public interface ADOrderService {

    ResponseObject<?> getAllHoaDon(ADOrderSearchRequest request);

    ResponseObject<?> getAllHoaDonCT(ADOrderDetailRequest request);

    ResponseObject<?> capNhatTrangThaiHoaDon(ADChangeStatusRequest adChangeStatusRequest);

    ResponseObject<?> doiImei(ADAssignSerialRequest request);

    ResponseObject<?> capNhatThongTinKhachHang(ADUpdateCustomerRequest request);
}
