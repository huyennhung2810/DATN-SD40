package com.example.datn.core.admin.order.service;

import com.example.datn.core.admin.order.model.request.*;
import com.example.datn.core.common.base.ResponseObject;

public interface ADOrderService {

    ResponseObject<?> getAllHoaDon(ADOrderSearchRequest request);

    /** Danh sách hóa đơn toàn cục (online + tại quầy + giao hàng quầy), có lọc loại */
    ResponseObject<?> getAllInvoices(ADOrderSearchRequest request);

    ResponseObject<?> getAllHoaDonCT(ADOrderDetailRequest request);

    /** Chi tiết hóa đơn cho module Quản lý hóa đơn (mọi loại TypeInvoice) */
    ResponseObject<?> getInvoiceDetail(ADOrderDetailRequest request);

    ResponseObject<?> capNhatTrangThaiHoaDon(ADChangeStatusRequest adChangeStatusRequest);

    ResponseObject<?> doiImei(ADAssignSerialRequest request);

    ResponseObject<?> capNhatThongTinKhachHang(ADUpdateCustomerRequest request);
}
