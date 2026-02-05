package com.example.datn.core.admin.voucherDetail.service.Impl;

import com.example.datn.core.admin.voucherDetail.model.request.VoucherDetailRequest;
import com.example.datn.core.admin.voucherDetail.repository.ADVoucherDetailRepository;
import com.example.datn.core.admin.voucherDetail.service.ADVoucherDetailService;
import com.example.datn.core.admin.vouchers.repository.ADVouchersRepository;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Voucher;
import com.example.datn.entity.VoucherDetail;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ADVoucherDetailServiceImpl implements ADVoucherDetailService {
    private final ADVoucherDetailRepository adVoucherDetailRepository;
    private final ADVouchersRepository adVouchersRepository;


    @Override
    public ResponseObject<?> getAllByVoucher(String voucherId, PageableRequest request) {
        Pageable pageable = Helper.createPageable(request);
        Page<VoucherDetail> page = adVoucherDetailRepository.findAllByVoucherId(voucherId, pageable);
        return ResponseObject.success(PageableObject.of(page), "Lấy danh sách chi tiết voucher thành công");
    }


    @Override
    @Transactional
    public ResponseObject<?> assignVoucherToCustomer(VoucherDetailRequest request) {
        // 1. Kiểm tra số lượng voucher gốc còn không
        Voucher voucher = adVouchersRepository.findById(request.getIdVoucher())
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        if (voucher.getQuantity() <= 0) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Voucher này đã hết lượt phát hành");
        }

        // 2. Tạo bản ghi chi tiết
        VoucherDetail detail = new VoucherDetail();
        detail.setId(UUID.randomUUID().toString());
        detail.setVoucher(voucher);
        // detail.setCustomer(customerRepository.findById(request.getIdCustomer()).get());
        detail.setUsageStatus("UNUSED");
        detail.setCreatedDate(System.currentTimeMillis());

        // 3. Giảm số lượng của voucher gốc
        voucher.setQuantity(voucher.getQuantity() - 1);
        adVouchersRepository.save(voucher);

        return ResponseObject.success(adVoucherDetailRepository.save(detail), "Gán voucher thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> updateUsageStatus(String id, String newStatus) {
        // 1. Tìm bản ghi VoucherDetail theo ID
        VoucherDetail detail = adVoucherDetailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết voucher với ID: " + id));

        // 2. Cập nhật trạng thái sử dụng (ví dụ: USED, EXPIRED, CANCELLED)
        if ("CANCELLED".equals(newStatus)) {
            Voucher v = detail.getVoucher();
            v.setQuantity(v.getQuantity() + 1);
            adVouchersRepository.save(v);
        }
        detail.setUsageStatus(newStatus);

        // Cập nhật thời gian sửa đổi cuối cùng (nếu có trường này)
        detail.setLastModifiedDate(System.currentTimeMillis());

        // 3. Lưu lại vào Database
        VoucherDetail updatedDetail = adVoucherDetailRepository.save(detail);

        return ResponseObject.success(updatedDetail, "Cập nhật trạng thái sử dụng thành công");
    }
}
