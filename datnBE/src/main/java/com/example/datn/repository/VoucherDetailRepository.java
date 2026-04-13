package com.example.datn.repository;

import com.example.datn.entity.Customer;
import com.example.datn.entity.Voucher;
import com.example.datn.entity.VoucherDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherDetailRepository extends JpaRepository<VoucherDetail, String> {

    // Tìm bằng String order id
    VoucherDetail findByOrder_Id(String orderId);

    // HOẶC tìm bằng nguyên Object Order
    // VoucherDetail findByOrder(Order order);

    // Tìm các voucher INDIVIDUAL còn hiệu lực được gán cho khách hàng (chưa dùng và chưa bị vô hiệu hóa)
    @Query("SELECT vd.voucher FROM VoucherDetail vd " +
            "WHERE vd.customer.id = :customerId " +
            "AND vd.usageStatus = 0 " +
            "AND vd.voucher.status != 0 " +
            "AND vd.voucher.startDate <= :now " +
            "AND vd.voucher.endDate >= :now")
    List<Voucher> findActiveIndividualVouchersByCustomerId(@Param("customerId") String customerId,
            @Param("now") long now);

    // Tìm VoucherDetail theo voucher + customer (dùng khi đặt hàng để đánh dấu đã sử dụng)
    @Query("SELECT vd FROM VoucherDetail vd " +
            "WHERE vd.voucher.id = :voucherId " +
            "AND vd.customer.id = :customerId " +
            "AND vd.usageStatus = 0")
    java.util.Optional<VoucherDetail> findUnusedByVoucherAndCustomer(
            @Param("voucherId") String voucherId,
            @Param("customerId") String customerId);
}
