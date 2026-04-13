package com.example.datn.core.admin.voucherDetail.service.Impl;

import com.example.datn.core.admin.voucherDetail.model.request.VoucherDetailRequest;
import com.example.datn.core.admin.voucherDetail.repository.ADVoucherDetailRepository;
import com.example.datn.core.admin.voucherDetail.service.ADVoucherDetailService;
import com.example.datn.core.admin.vouchers.repository.ADVouchersRepository;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.PageableRequest;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Customer;
import com.example.datn.entity.Voucher;
import com.example.datn.entity.VoucherDetail;
import com.example.datn.repository.CustomerRepository;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ADVoucherDetailServiceImpl implements ADVoucherDetailService {
    private final ADVoucherDetailRepository adVoucherDetailRepository;
    private final ADVouchersRepository adVouchersRepository;
    private final CustomerRepository customerRepository;


    @Override
    @Transactional
    public void saveVoucherDetails(String voucherId, List<String> customerIds) {
        if (customerIds == null || customerIds.isEmpty()) return;

        List<VoucherDetail> details = customerIds.stream().map(customerId -> {
            VoucherDetail detail = new VoucherDetail();
            detail.setId(UUID.randomUUID().toString());

            // Giả định bạn đã có cách mapping Voucher và Customer đơn giản
            Voucher v = new Voucher(); v.setId(voucherId);
            Customer c = new Customer(); c.setId(customerId);

            detail.setVoucher(v);
            detail.setCustomer(c);
            detail.setUsageStatus(0); // 0: Chưa dùng
            detail.setCreated_date(System.currentTimeMillis());
             detail.setIsNotified(0); // Trường mới thêm vào DB
            return detail;
        }).collect(Collectors.toList());

        adVoucherDetailRepository.saveAll(details);
    }

    @Override
    @Transactional
    public void updateVoucherDetails(String voucherId, List<String> newCustomerIds) {
        // 1. Lấy tất cả chi tiết hiện có của voucher
        List<VoucherDetail> currentDetails = adVoucherDetailRepository.findByVoucherId(voucherId);

        // 2. Xử lý những người bị BỎ CHỌN hoặc CẦN KÍCH HOẠT LẠI
        for (VoucherDetail detail : currentDetails) {
            String customerIdInDb = detail.getCustomer().getId();

            if (!newCustomerIds.contains(customerIdInDb)) {
                // Nếu khách hàng có trong DB nhưng không có trong list mới (bị bỏ chọn)
                // Chỉ vô hiệu hóa (status = 2) những người chưa dùng (status = 0)
                if (detail.getUsageStatus() == 0) {
                    detail.setUsageStatus(2);
                    detail.setReason("Admin bỏ chọn khỏi danh sách");
                    adVoucherDetailRepository.save(detail);
                }
            }
        }

        // 3. Thêm mới những người chưa từng có trong DB cho Voucher này
        List<String> oldCustomerIdsInDb = currentDetails.stream()
                .map(d -> d.getCustomer().getId())
                .toList();

        for (String cid : newCustomerIds) {
            if (!oldCustomerIdsInDb.contains(cid)) {
                VoucherDetail newDetail = new VoucherDetail();
                newDetail.setId(UUID.randomUUID().toString()); // Tạo ID thủ công vì bạn không dùng Auto Increment

                // Set quan hệ Object thay vì ID thuần
                Voucher voucher = new Voucher();
                voucher.setId(voucherId);
                newDetail.setVoucher(voucher);

                Customer customer = new Customer();
                customer.setId(cid);
                newDetail.setCustomer(customer);

                newDetail.setUsageStatus(0); // Mới thì luôn là 0
                newDetail.setIsNotified(0);  // Chưa gửi mail
                newDetail.setCreated_date(System.currentTimeMillis());

                adVoucherDetailRepository.save(newDetail);
            }
        }
    }
    @Override
    @Transactional
    public void disableCustomerVoucher(String voucherId, String customerId, String reason) {
        VoucherDetail detail = adVoucherDetailRepository.findByVoucherIdAndCustomerId(voucherId, customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu áp dụng cho khách hàng này!"));

        if (detail.getUsageStatus() == 1) {
            throw new RuntimeException("Voucher này đã được khách hàng sử dụng, không thể vô hiệu hóa!");
        }

        detail.setUsageStatus(2); // 2: Vô hiệu hóa
        detail.setReason(reason);
        adVoucherDetailRepository.saveAndFlush(detail);
    }
    @Override
    public Page<VoucherDetail> findAllByVoucherId(String voucherId, Pageable pageable) {
        // Truyền cả voucherId và đối tượng pageable xuống Repository
        return adVoucherDetailRepository.findAllByVoucherId(voucherId, pageable);
    }

    @Override
    public List<String> getEmailsToNotify(String voucherId) {
        // Logic này cần Join với bảng Customer để lấy Email
        return adVoucherDetailRepository.findEmailsByVoucherIdAndNotNotified(voucherId);
    }

    @Override
    @Transactional
    public void updateNotificationStatus(String voucherId, List<String> customerIds) {
        List<VoucherDetail> details = adVoucherDetailRepository.findAllByVoucherIdAndCustomerIds(voucherId, customerIds);
        details.forEach(d -> {
             d.setIsNotified(1);
        });
        adVoucherDetailRepository.saveAll(details);
    }

    @Override
    @Transactional
    public void removeCustomerFromVoucher(String voucherId, String customerId) {
        VoucherDetail detail = adVoucherDetailRepository.findByVoucherIdAndCustomerId(voucherId, customerId)
                .orElseThrow(() -> new RuntimeException("Dữ liệu không tồn tại!"));

        // Chỉ cho xóa nếu chưa gửi mail hoặc chưa dùng
        if (detail.getUsageStatus() == 0) {
            adVoucherDetailRepository.delete(detail);
        } else {
            throw new RuntimeException("Không thể xóa khách hàng đã sử dụng hoặc đã được thông báo!");
        }
    }
    @Override
    public int countActiveVoucherDetails(String voucherId) {
        // Đếm số lượng VoucherDetail có usageStatus = 0
        return adVoucherDetailRepository.countByVoucherIdAndUsageStatus(voucherId, 0);
    }

    @Override
    @Transactional
    public void updateStatus(String detailId, Integer status, String reason) {
        // 1. Tìm bản ghi VoucherDetail
        VoucherDetail detail = adVoucherDetailRepository.findById(detailId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết voucher"));
        Voucher voucher = detail.getVoucher();
        // THÊM ĐOẠN BẮT LỖI Ở ĐÂY: Nếu đang muốn Vô hiệu hóa (status = 2) một người đang Active (usageStatus = 0)
        if (status == 2 && detail.getUsageStatus() == 0) {
            int currentActiveCount = adVoucherDetailRepository.countByVoucherIdAndUsageStatus(voucher.getId(), 0);
            if (currentActiveCount <= 1) {
                throw new RuntimeException("Không thể vô hiệu hóa! Voucher cá nhân phải có ít nhất 1 khách hàng được áp dụng.");
            }
        }
        // 2. Cập nhật trạng thái và lý do (usageStatus = 2 là vô hiệu hóa)
        detail.setUsageStatus(status);
        detail.setReason(reason);
        adVoucherDetailRepository.save(detail);

        // 3. ĐỒNG BỘ: Tính toán lại quantity của Voucher cha
        // Số lượng = số bản ghi có usageStatus = 0

        int activeCount = adVoucherDetailRepository.countByVoucherIdAndUsageStatus(voucher.getId(), 0);

        voucher.setQuantity(activeCount);
        adVouchersRepository.save(voucher);
    }

}
