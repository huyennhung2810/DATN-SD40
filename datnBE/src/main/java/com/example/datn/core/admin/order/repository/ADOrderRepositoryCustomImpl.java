package com.example.datn.core.admin.order.repository;

import com.example.datn.core.admin.order.model.request.ADOrderSearchRequest;
import com.example.datn.core.admin.order.model.response.ADOrderResponse;
import com.example.datn.core.admin.order.model.response.OrderPageResponse;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.TypeInvoice;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class ADOrderRepositoryCustomImpl implements ADOrderRepositoryCustom {
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public OrderPageResponse getAllHoaDonResponse(ADOrderSearchRequest request, Pageable pageable,
            boolean onlineOrdersOnly) {

        String typeClause;
        if (onlineOrdersOnly) {
            typeClause = " AND hd.orderType = :onlineOnlyType ";
        } else {
            typeClause = " AND (:orderType IS NULL OR hd.orderType = :orderType) ";
        }

        // Join với OrderDetail và Product để lọc theo tên sản phẩm
        String joinProductClause = "";
        String productNameFilter = "";
        if (request.getProductName() != null && !request.getProductName().trim().isEmpty()) {
            joinProductClause = " LEFT JOIN hd.orderDetails od LEFT JOIN od.productDetail pd LEFT JOIN pd.product p ";
            productNameFilter = " AND LOWER(p.name) LIKE LOWER(CONCAT('%', :productName, '%')) ";
        }

        // Lọc paymentMethod
        String paymentFilter = "";
        if (request.getPaymentMethod() != null && !request.getPaymentMethod().trim().isEmpty()) {
            paymentFilter = " AND hd.paymentMethod = :paymentMethod ";
        }

        String hql = """
                SELECT new com.example.datn.core.admin.order.model.response.ADOrderResponse(
                                hd.id,
                                hd.code,
                                kh.name,
                                kh.phoneNumber,
                                nv.code,
                                nv.name,
                                hd.totalAmount,
                                hd.totalAfterDiscount,
                                hd.orderType,
                                hd.createdDate,
                                hd.orderStatus,
                                hd.paymentMethod
                            )
                            FROM Order hd
                            LEFT JOIN hd.customer kh
                            LEFT JOIN hd.employee nv
                """
                + joinProductClause
                + """
                            WHERE (:q IS NULL OR :q = ''
                                OR LOWER(kh.name) LIKE LOWER(CONCAT('%', :q, '%'))
                                OR LOWER(hd.code) LIKE LOWER(CONCAT('%', :q, '%'))
                                OR LOWER(hd.recipientName) LIKE LOWER(CONCAT('%', :q, '%'))
                                OR LOWER(kh.phoneNumber) LIKE LOWER(CONCAT('%', :q, '%'))
                                OR LOWER(nv.code) LIKE LOWER(CONCAT('%', :q, '%')))
                            AND (:trangThai IS NULL OR hd.orderStatus = :trangThai)
                """
                + typeClause
                + """
                            AND (:startDate IS NULL OR hd.createdDate >= :startDate)
                            AND (:endDate IS NULL OR hd.createdDate <= :endDate)
                """
                + productNameFilter
                + paymentFilter
                + """
                            AND hd.orderStatus <> :luuTam
                            AND hd.totalAmount > 0
                            ORDER BY hd.createdDate DESC
                """;

        String countByStatusHql = """
                    SELECT hd.orderStatus, COUNT(hd)
                    FROM Order hd
                    LEFT JOIN hd.customer kh
                    LEFT JOIN hd.employee nv
                """
                + joinProductClause
                + """
                    WHERE (:q IS NULL OR :q = ''
                        OR LOWER(kh.name) LIKE LOWER(CONCAT('%', :q, '%'))
                        OR LOWER(kh.phoneNumber) LIKE LOWER(CONCAT('%', :q, '%'))
                        OR LOWER(nv.name) LIKE LOWER(CONCAT('%', :q, '%')))
                      AND (:startDate IS NULL OR hd.createdDate >= :startDate)
                      AND (:endDate IS NULL OR hd.createdDate <= :endDate)
                """
                + productNameFilter
                + paymentFilter
                + """
                      AND hd.orderStatus <> :luuTam
                      AND hd.totalAmount > 0
                """
                + typeClause
                + """
                    GROUP BY hd.orderStatus
                """;

        String totalCountHql = """
                    SELECT COUNT(hd)
                    FROM Order hd
                    LEFT JOIN hd.customer kh
                    LEFT JOIN hd.employee nv
                """
                + joinProductClause
                + """
                    WHERE (:q IS NULL OR :q = ''
                        OR LOWER(kh.name) LIKE LOWER(CONCAT('%', :q, '%'))
                        OR LOWER(kh.phoneNumber) LIKE LOWER(CONCAT('%', :q, '%'))
                        OR LOWER(nv.name) LIKE LOWER(CONCAT('%', :q, '%')))
                      AND (:trangThai IS NULL OR hd.orderStatus = :trangThai)
                """
                + typeClause
                + """
                      AND (:startDate IS NULL OR hd.createdDate >= :startDate)
                      AND (:endDate IS NULL OR hd.createdDate <= :endDate)
                """
                + productNameFilter
                + paymentFilter
                + """
                      AND hd.orderStatus <> :luuTam
                      AND hd.totalAmount > 0
                """;

        // --- Count by status ---
        var countQuery = entityManager.createQuery(countByStatusHql)
                .setParameter("q", request.getQ() == null ? "" : request.getQ().trim())
                .setParameter("startDate", request.getStartDate())
                .setParameter("endDate", request.getEndDate())
                .setParameter("luuTam", OrderStatus.LUU_TAM);
        bindTypeParams(countQuery, request, onlineOrdersOnly);
        bindExtraParams(countQuery, request);

        @SuppressWarnings("unchecked")
        List<Object[]> countByStatusList = countQuery.getResultList();

        Map<OrderStatus, Long> countByStatusMap = new HashMap<>();
        for (Object[] row : countByStatusList) {
            OrderStatus status = (OrderStatus) row[0];
            Long count = (Long) row[1];
            if (status == OrderStatus.LUU_TAM)
                continue;
            countByStatusMap.put(status, count);
        }

        // --- Total count ---
        var totalQuery = entityManager.createQuery(totalCountHql)
                .setParameter("q", request.getQ() == null ? "" : request.getQ().trim())
                .setParameter("trangThai", request.getStatus())
                .setParameter("startDate", request.getStartDate())
                .setParameter("endDate", request.getEndDate())
                .setParameter("luuTam", OrderStatus.LUU_TAM);
        bindTypeParams(totalQuery, request, onlineOrdersOnly);
        bindExtraParams(totalQuery, request);

        Long totalRecords = (Long) totalQuery.getSingleResult();

        // --- Data ---
        TypedQuery<ADOrderResponse> dataQuery = entityManager.createQuery(hql, ADOrderResponse.class)
                .setParameter("q", request.getQ() == null ? "" : request.getQ().trim())
                .setParameter("trangThai", request.getStatus())
                .setParameter("startDate", request.getStartDate())
                .setParameter("endDate", request.getEndDate())
                .setParameter("luuTam", OrderStatus.LUU_TAM)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize());
        bindTypeParams(dataQuery, request, onlineOrdersOnly);
        bindExtraParams(dataQuery, request);

        List<ADOrderResponse> data = dataQuery.getResultList();

        Page<ADOrderResponse> page = new PageImpl<>(data, pageable, totalRecords);

        return new OrderPageResponse(page, countByStatusMap);
    }

    private void bindTypeParams(jakarta.persistence.Query query, ADOrderSearchRequest request,
            boolean onlineOrdersOnly) {
        if (onlineOrdersOnly) {
            query.setParameter("onlineOnlyType", TypeInvoice.ONLINE);
        } else {
            query.setParameter("orderType",
                    request.getOrderType() == null || request.getOrderType().isBlank() ? null
                            : TypeInvoice.valueOf(request.getOrderType()));
        }
    }

    private void bindExtraParams(jakarta.persistence.Query query, ADOrderSearchRequest request) {
        if (request.getProductName() != null && !request.getProductName().trim().isEmpty()) {
            query.setParameter("productName", request.getProductName().trim());
        }
        if (request.getPaymentMethod() != null && !request.getPaymentMethod().trim().isEmpty()) {
            query.setParameter("paymentMethod", request.getPaymentMethod().trim());
        }
    }
}
