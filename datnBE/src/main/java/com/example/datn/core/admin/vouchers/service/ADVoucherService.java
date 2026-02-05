package com.example.datn.core.admin.vouchers.service;

import com.example.datn.core.admin.customer.model.request.ADAddressRequest;
import com.example.datn.core.admin.vouchers.model.PostOrPutVoucherDto;
import com.example.datn.core.admin.vouchers.model.request.ADVoucherSearchRequest;
import com.example.datn.core.common.base.ResponseObject;

public interface ADVoucherService {
    ResponseObject<?> getAllVoucher(ADVoucherSearchRequest request);

    ResponseObject<?> getByVoucher(String voucherId);

   ResponseObject<?> createOrUpdate(String Id, PostOrPutVoucherDto Dto);

    ResponseObject<?> delete(String id);


}
