package com.example.datn.core.admin.voucherDetail.service;




import com.example.datn.entity.VoucherDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ADVoucherDetailService {

    /**
     * Lưu danh sách khách hàng được áp dụng cho một Voucher cá nhân (lần đầu)
     * @param voucherId ID của voucher
     * @param customerIds Danh sách ID khách hàng được chọn
     */
    void saveVoucherDetails(String voucherId, List<String> customerIds);

    /**
     * Cập nhật danh sách khách hàng: Thêm người mới, giữ nguyên người cũ đã nhận mail
     * và xử lý các trường hợp thay đổi đối tượng áp dụng.
     */
    void updateVoucherDetails(String voucherId, List<String> customerIds);

    /**
     * Vô hiệu hóa quyền sử dụng voucher của một khách hàng cụ thể
     * @param voucherId ID của voucher
     * @param customerId ID khách hàng vi phạm hoặc cần khóa
     * @param reason Lý do vô hiệu hóa (lưu vào cột reason)
     */
    void disableCustomerVoucher(String voucherId, String customerId, String reason);

    /**
     * Lấy danh sách chi tiết voucher để hiển thị trên bảng (bao gồm thông tin khách hàng)
     */
    Page<VoucherDetail> findAllByVoucherId(String voucherId, Pageable pageable);

    /**
     * Lấy danh sách Email của những khách hàng chưa được gửi thông báo (is_notified = 0)
     */
    List<String> getEmailsToNotify(String voucherId);

    /**
     * Cập nhật trạng thái đã gửi Email thành công cho danh sách khách hàng
     */
    void updateNotificationStatus(String voucherId, List<String> customerIds);

    /**
     * Xóa một khách hàng khỏi danh sách áp dụng (Chỉ áp dụng khi chưa gửi Email/Voucher chưa bắt đầu)
     */
    void removeCustomerFromVoucher(String voucherId, String customerId);
    int countActiveVoucherDetails(String voucherId);

    void updateStatus(String detailId, Integer status, String reason);


}
