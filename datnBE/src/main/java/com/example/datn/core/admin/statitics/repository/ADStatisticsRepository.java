package com.example.datn.core.admin.statitics.repository;

import com.example.datn.core.admin.statitics.model.projection.*;
import com.example.datn.core.admin.statitics.model.response.ADOrderStatusStatResponse;
import com.example.datn.core.admin.statitics.model.response.ADRevenueStatResponse;
import com.example.datn.core.admin.statitics.model.response.ADLowstockProductResponse;
import com.example.datn.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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


    //Top sản phầm bán chạy
    @Query(value = """
        SELECT 
            pd.id AS productId,
            CONCAT(p.name, ' ', COALESCE(pd.version, '')) AS productName,
            pd.version AS productVersion,
            pc.name AS categoryName,     -- Lấy tên từ bảng product_category
            SUM(od.quantity) AS quantitySold,
            SUM(od.total_price) AS revenue,
            pd.sale_price AS sellingPrice,
            (
                SELECT pi.url 
                FROM product_image pi 
                WHERE pi.id_product = p.id 
                ORDER BY pi.display_order ASC 
                LIMIT 1
            ) AS imageUrl
        FROM order_detail od
        JOIN `order` o ON od.id_order = o.id
        JOIN product_detail pd ON od.id_product_detail = pd.id
        JOIN product p ON pd.id_product = p.id
        LEFT JOIN product_category pc ON p.id_product_category = pc.id 
        WHERE o.order_status = 'COMPLETED' 
          AND o.created_date BETWEEN :start AND :end
        GROUP BY pd.id, p.name, pd.version, pc.name, pd.sale_price
        ORDER BY quantitySold DESC
        LIMIT 5
    """, nativeQuery = true)
    List<TopSellingProductProjection> findTopSellingProducts(@Param("start") Long start, @Param("end") Long end);
    // Đếm tổng số lượng biến thể sản phẩm
    @Query("SELECT COUNT(pd) FROM ProductDetail pd")
    Long countTotalProductDetails();


    // Đếm tổng khách hàng (Dựa trên entity Customer)
    @Query("SELECT COUNT(c) FROM Customer c")
    Long countTotalCustomers();

    //Đếm khách hàng mới trong khoảng thời gian
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.createdDate BETWEEN :start AND :end")
    Long countNewCustomers(@Param("start") Long start, @Param("end") Long end);


    @Query("""
        SELECT 
            o.orderStatus AS status, 
            COUNT(o.id) AS count 
        FROM Order o  
        WHERE o.createdDate BETWEEN :start AND :end
        GROUP BY o.orderStatus
    """)
    List<ADOrderStatusStatResponse> getOrderStatusStats(@Param("start") Long start, @Param("end") Long end);


    @Query(value = """
        SELECT 
            DATE_FORMAT(FROM_UNIXTIME(o.created_date/1000), '%d/%m') AS date, 
            SUM(o.total_after_discount) AS revenue
        FROM `order` o
        WHERE o.order_status = 'COMPLETED' 
          AND o.created_date BETWEEN :start AND :end
        GROUP BY DATE_FORMAT(FROM_UNIXTIME(o.created_date/1000), '%d/%m'), DATE(FROM_UNIXTIME(o.created_date/1000))
        ORDER BY DATE(FROM_UNIXTIME(o.created_date/1000)) ASC
    """, nativeQuery = true)
    List<ADRevenueStatResponse> getRevenueStats(@Param("start") Long start, @Param("end") Long end);



    @Query(value = """
        SELECT 
            pd.id AS id,
            CONCAT(p.name, ' ', COALESCE(pd.version, '')) AS name,
            pd.version AS version,
            pd.sale_price AS price,
            pd.quantity AS quantity,
            (SELECT pi.url FROM product_image pi WHERE pi.id_product = p.id LIMIT 1) AS imageUrl
        FROM product_detail pd
        JOIN product p ON pd.id_product = p.id
        WHERE pd.quantity <= 10
        ORDER BY pd.quantity ASC
        LIMIT 10
    """, nativeQuery = true)
    List<ADLowstockProductResponse> getLowStockProducts();

    // Tính tổng doanh thu trong khoảng
    @Query(value = "SELECT COALESCE(SUM(total_after_discount), 0) FROM `order` WHERE order_status = 'COMPLETED' AND created_date BETWEEN :start AND :end", nativeQuery = true)
    BigDecimal sumRevenue(@Param("start") Long start, @Param("end") Long end);

    // Đếm số đơn hàng
    @Query(value = "SELECT COUNT(*) FROM `order` WHERE order_status != 'CANCELED' AND created_date BETWEEN :start AND :end", nativeQuery = true)
    Long countOrders(@Param("start") Long start, @Param("end") Long end);

    //Đếm số sản phẩm đã bán (Dựa vào bảng order_detail hoặc product_detail)
    @Query(value = """
        SELECT COALESCE(SUM(od.quantity), 0) 
        FROM order_detail od 
        JOIN `order` o ON od.id_order = o.id 
        WHERE o.order_status = 'COMPLETED' 
        AND o.created_date BETWEEN :start AND :end
    """, nativeQuery = true)
    Long sumSoldProducts(@Param("start") Long start, @Param("end") Long end);
}
