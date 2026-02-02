package com.example.datn.core.admin.statitics.repository;

import com.example.datn.core.admin.statitics.model.projection.*;
import com.example.datn.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ADStatisticsRepository extends JpaRepository<Order, String> {

    //Chỉ số cho 4 thẻ màu dashboard
    @Query("""
    SELECT
        COALESCE(SUM(CASE WHEN o.orderStatus = com.example.datn.infrastructure.constant.OrderStatus.COMPLETED 
            THEN o.totalAfterDiscount ELSE 0 END), 0) AS totalRevenue,
        COUNT(o.id) AS totalOrders,
        (SELECT COALESCE(SUM(od.quantity), 0) FROM OrderDetail od JOIN od.order o2 
         WHERE o2.orderStatus = com.example.datn.infrastructure.constant.OrderStatus.COMPLETED 
         AND o2.createdDate BETWEEN :start AND :end) AS totalItemsSold,
        SUM(CASE WHEN o.orderStatus = com.example.datn.infrastructure.constant.OrderStatus.COMPLETED THEN 1 ELSE 0 END) AS successCount,
        SUM(CASE WHEN o.orderStatus = com.example.datn.infrastructure.constant.OrderStatus.CANCELED THEN 1 ELSE 0 END) AS canceledCount,
        SUM(CASE WHEN o.orderStatus = com.example.datn.infrastructure.constant.OrderStatus.RETURNED THEN 1 ELSE 0 END) AS returnedCount
    FROM Order o
    WHERE o.createdDate BETWEEN :start AND :end
    """)
    DashboardSummaryProjection getDashboardSummary(@Param("start") Long start, @Param("end") Long end);

    //Dữ liệu cho biểu đồ tròn (Pie Chart)
    @Query("""
        SELECT o.orderStatus AS status, COUNT(o.id) AS total
        FROM Order o
        WHERE o.createdDate BETWEEN :start AND :end
        GROUP BY o.orderStatus
    """)
    List<OrderStatusCountProjection> countOrderByStatus(@Param("start") Long start, @Param("end") Long end);

    //Thống kê đơn hàng hằng ngày
    @Query(value = """
        SELECT 
            DATE_FORMAT(FROM_UNIXTIME(o.created_date / 1000), '%d/%m/%Y') AS date,
            COUNT(o.id) AS total
        FROM `order` o
        WHERE o.created_date BETWEEN :start AND :end
        GROUP BY date
        ORDER BY MIN(o.created_date) ASC
    """, nativeQuery = true)
    List<OrderDailyProjection> countOrdersByDate(
            @Param("start") Long start,
            @Param("end") Long end
    );


    //Top sản phầm bán chạy
    @Query("""
        SELECT 
            pd.id AS productId,
            CONCAT(p.name, ' ', pd.version) AS productName, 
            pd.version AS productVersion,
            pc.name AS categoryName,
            SUM(od.quantity) AS quantitySold,
            SUM(od.totalPrice) AS revenue,
            pd.salePrice AS sellingPrice,
            pi.url AS imageUrl
        FROM OrderDetail od
        JOIN od.order o
        JOIN od.productDetail pd
        JOIN pd.product p
        LEFT JOIN p.productCategory pc
        LEFT JOIN ProductImage pi ON pi.product.id = p.id AND pi.displayOrder = 1
        WHERE o.orderStatus = com.example.datn.infrastructure.constant.OrderStatus.COMPLETED
          AND o.createdDate BETWEEN :start AND :end
        GROUP BY pd.id, p.name, pd.version, pc.name, pd.salePrice, pi.url
        ORDER BY quantitySold DESC
    """)
    List<TopSellingProductProjection> findTopSellingProducts(@Param("start") Long start, @Param("end") Long end);

    // Đếm tổng số lượng biến thể sản phẩm
    @Query("SELECT COUNT(pd) FROM ProductDetail pd")
    Long countTotalProductDetails();

    // Đếm sản phẩm sắp hết hàng (Dựa trên field quantity của ProductDetail)
    @Query("SELECT COUNT(pd) FROM ProductDetail pd WHERE pd.quantity < 10")
    Long countLowStockProducts();

    // Đếm tổng khách hàng (Dựa trên entity Customer)
    @Query("SELECT COUNT(c) FROM Customer c")
    Long countTotalCustomers();

    //Đếm khách hàng mới trong khoảng thời gian
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.createdDate BETWEEN :start AND :end")
    Long countNewCustomers(@Param("start") Long start, @Param("end") Long end);
}
