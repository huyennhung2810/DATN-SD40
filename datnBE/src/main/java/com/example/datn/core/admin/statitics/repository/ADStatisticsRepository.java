package com.example.datn.core.admin.statitics.repository;

import com.example.datn.core.admin.statitics.model.response.*;
import com.example.datn.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ADStatisticsRepository extends JpaRepository<Order, String> {

    //dashbroad
    @Query(value = """
        SELECT 
            COALESCE(SUM(CASE WHEN DATE(FROM_UNIXTIME(o.created_date/1000)) = CURRENT_DATE THEN od.total_price ELSE 0 END), 0) AS revenueToday,
            COUNT(DISTINCT CASE WHEN DATE(FROM_UNIXTIME(o.created_date/1000)) = CURRENT_DATE THEN o.id END) AS ordersToday,
            COALESCE(SUM(CASE WHEN DATE(FROM_UNIXTIME(o.created_date/1000)) = CURRENT_DATE THEN od.quantity ELSE 0 END), 0) AS productsSoldToday,

            COALESCE(SUM(CASE WHEN YEARWEEK(FROM_UNIXTIME(o.created_date/1000), 1) = YEARWEEK(CURRENT_DATE, 1) THEN od.total_price ELSE 0 END), 0) AS revenueThisWeek,
            COUNT(DISTINCT CASE WHEN YEARWEEK(FROM_UNIXTIME(o.created_date/1000), 1) = YEARWEEK(CURRENT_DATE, 1) THEN o.id END) AS ordersThisWeek,
            COALESCE(SUM(CASE WHEN YEARWEEK(FROM_UNIXTIME(o.created_date/1000), 1) = YEARWEEK(CURRENT_DATE, 1) THEN od.quantity ELSE 0 END), 0) AS productsSoldThisWeek,

            COALESCE(SUM(CASE WHEN DATE_FORMAT(FROM_UNIXTIME(o.created_date/1000), '%Y-%m') = DATE_FORMAT(CURRENT_DATE, '%Y-%m') THEN od.total_price ELSE 0 END), 0) AS revenueThisMonth,
            COUNT(DISTINCT CASE WHEN DATE_FORMAT(FROM_UNIXTIME(o.created_date/1000), '%Y-%m') = DATE_FORMAT(CURRENT_DATE, '%Y-%m') THEN o.id END) AS ordersThisMonth,
            COALESCE(SUM(CASE WHEN DATE_FORMAT(FROM_UNIXTIME(o.created_date/1000), '%Y-%m') = DATE_FORMAT(CURRENT_DATE, '%Y-%m') THEN od.quantity ELSE 0 END), 0) AS productsSoldThisMonth,

            COALESCE(SUM(CASE WHEN DATE_FORMAT(FROM_UNIXTIME(o.created_date/1000), '%Y-%m') = DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH), '%Y-%m') THEN od.total_price ELSE 0 END), 0) AS revenueLastMonth,

            COALESCE(SUM(CASE WHEN YEAR(FROM_UNIXTIME(o.created_date/1000)) = YEAR(CURRENT_DATE) THEN od.total_price ELSE 0 END), 0) AS revenueThisYear,
            COUNT(DISTINCT CASE WHEN YEAR(FROM_UNIXTIME(o.created_date/1000)) = YEAR(CURRENT_DATE) THEN o.id END) AS ordersThisYear,
            COALESCE(SUM(CASE WHEN YEAR(FROM_UNIXTIME(o.created_date/1000)) = YEAR(CURRENT_DATE) THEN od.quantity ELSE 0 END), 0) AS productsSoldThisYear

        FROM `order` o
        LEFT JOIN order_detail od ON o.id = od.id_order
        WHERE o.order_status != 'CANCELED' 
    """, nativeQuery = true)
    ADDashboardResponse getStatOverview();

    //Bộ lọc
    @Query(value = """
        SELECT 
           COALESCE(SUM(od.total_price), 0) AS totalRevenue,
           COUNT(DISTINCT o.id) AS totalOrders,
           COALESCE(SUM(od.quantity), 0) AS totalProductsSold
        FROM `order` o
        LEFT JOIN order_detail od ON o.id = od.id_order
        WHERE o.order_status != 'CANCELED' 
        AND o.created_date BETWEEN :startDate AND :endDate
    """, nativeQuery = true)
    ADFilterResponse getFilteredStats(@Param("startDate") Long startDate, @Param("endDate") Long endDate);



    //Biểu đồ doanh thu
    @Query(value = """
        SELECT 
            DATE_FORMAT(FROM_UNIXTIME(o.created_date/1000), :dateFormat) AS date, 
            COALESCE(SUM(od.total_price), 0) AS revenue
        FROM `order` o
        LEFT JOIN order_detail od ON o.id = od.id_order
        WHERE o.order_status = 'COMPLETED'
          AND o.created_date BETWEEN :startDate AND :endDate
        GROUP BY DATE_FORMAT(FROM_UNIXTIME(o.created_date/1000), :dateFormat)
        ORDER BY date ASC
    """, nativeQuery = true)
    List<ADRevenueStatResponse> getRevenueStats(
            @Param("startDate") Long startDate,
            @Param("endDate") Long endDate,
            @Param("dateFormat") String dateFormat
    );


    //Biểu đồ tròn, trạng thái đơn hàng
    @Query("""
        SELECT 
            o.orderStatus AS status, 
            COUNT(o.id) AS count 
        FROM Order o  
        WHERE o.createdDate BETWEEN :startDate AND :endDate
        GROUP BY o.orderStatus
    """)
    List<ADOrderStatusStatResponse> getOrderStatusStats(@Param("startDate") Long startDate, @Param("endDate") Long endDate);



    //Top sản phẩm bán chạy
    @Query(value = """
        SELECT
            pd.id AS id,
            CONCAT(p.name, ' ', COALESCE(pd.version, '')) AS name,
            (SELECT pi.url FROM product_image pi WHERE pi.id_product = p.id ORDER BY pi.display_order ASC LIMIT 1) AS imageUrl,
            pd.sale_price AS price,
            CAST(COALESCE(SUM(od.quantity), 0) AS SIGNED) AS soldCount
        FROM order_detail od
        JOIN `order` o ON od.id_order = o.id
        JOIN product_detail pd ON od.id_product_detail = pd.id
        JOIN product p ON pd.id_product = p.id
        WHERE o.order_status != 'CANCELED' 
          AND o.created_date BETWEEN :startDate AND :endDate
        GROUP BY pd.id, p.name, pd.version, pd.sale_price, p.id
        ORDER BY soldCount DESC
        LIMIT 5
    """, nativeQuery = true)
    List<ADTopSellingProductsResponse> getTopSellingProducts(@Param("startDate") Long startDate, @Param("endDate") Long endDate);


    //Sản phẩm sắp hết haàng
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

    //Đếm số sản phẩm đã bán
    @Query(value = """
        SELECT COALESCE(SUM(od.quantity), 0) 
        FROM order_detail od 
        JOIN `order` o ON od.id_order = o.id 
        WHERE o.order_status = 'COMPLETED' 
        AND o.created_date BETWEEN :start AND :end
    """, nativeQuery = true)
    Long sumSoldProducts(@Param("start") Long start, @Param("end") Long end);
}