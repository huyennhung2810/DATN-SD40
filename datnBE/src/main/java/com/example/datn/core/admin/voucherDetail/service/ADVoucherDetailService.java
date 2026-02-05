package com.example.datn.core.admin.voucherDetail.service;


import com.example.datn.core.admin.voucherDetail.model.request.VoucherDetailRequest;

import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.core.common.base.ResponseObject;
import org.springframework.stereotype.Service;

@Service
public interface ADVoucherDetailService {
    ResponseObject<?> getAllByVoucher(String voucherId, PageableRequest request);

    ResponseObject<?> assignVoucherToCustomer(VoucherDetailRequest request);

    ResponseObject<?> updateUsageStatus(String id, String newStatus);
}
