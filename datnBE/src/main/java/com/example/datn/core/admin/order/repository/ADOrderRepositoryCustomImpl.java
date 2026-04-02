package com.example.datn.core.admin.order.repository;

import com.example.datn.core.admin.order.model.request.ADOrderSearchRequest;
import com.example.datn.core.admin.order.model.response.ADOrderResponse;
import com.example.datn.core.admin.order.model.response.OrderPageResponse;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.TypeInvoice;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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

    public OrderPageResponse getAllHoaDonResponse(ADOrderSearchRequest request, Pageable pageable) {
        String hql = """
                SELECT new com.example.datn.core.admin.order.model.response.ADOrderResponse(
                                hd.id,
                                hd.code,
                                kh.name,
                                kh.phoneNumber,
                                nv.code,
                                nv.name,
                                hd.totalAmount,
                                hd.orderType,
                                hd.createdDate,
                                hd.orderStatus
                            )
                            FROM Order hd
                            LEFT JOIN hd.customer kh
                            LEFT JOIN hd.employee nv
                            WHERE (:q IS NULL OR :q = ''
                                OR LOWER(kh.name) LIKE LOWER(CONCAT('%', :q, '%'))
                                OR LOWER(hd.code) LIKE LOWER(CONCAT('%', :q, '%'))
                                OR LOWER(hd.recipientName) LIKE LOWER(CONCAT('%', :q, '%'))
                                OR LOWER(kh.phoneNumber) LIKE LOWER(CONCAT('%', :q, '%'))
                                OR LOWER(nv.code) LIKE LOWER(CONCAT('%', :q, '%')))
                            AND (:trangThai IS NULL OR hd.orderStatus = :trangThai)
                            AND (:orderType IS NULL OR hd.orderType = :orderType)
                            AND (:startDate IS NULL OR hd.createdDate >= :startDate)
                            AND (:endDate IS NULL OR hd.createdDate <= :endDate)
                            AND hd.orderStatus <> :luuTam
                            AND hd.totalAmount > 0
                            ORDER BY hd.createdDate DESC
                """;

        String countByStatusHql = """
                    SELECT hd.orderStatus, COUNT(hd)
                    FROM Order hd
                    LEFT JOIN hd.customer kh
                    LEFT JOIN hd.employee nv
                    WHERE (:q IS NULL OR :q = ''
                        OR LOWER(kh.name) LIKE LOWER(CONCAT('%', :q, '%'))
                        OR LOWER(kh.phoneNumber) LIKE LOWER(CONCAT('%', :q, '%'))
                        OR LOWER(nv.name) LIKE LOWER(CONCAT('%', :q, '%')))
                      AND (:startDate IS NULL OR hd.createdDate >= :startDate)
                      AND (:endDate IS NULL OR hd.createdDate <= :endDate)
                      AND hd.orderStatus <> :luuTam
                      AND hd.totalAmount > 0
                    GROUP BY hd.orderStatus
                """;

        String totalCountHql = """
                    SELECT COUNT(hd)
                    FROM Order hd
                    LEFT JOIN hd.customer kh
                    LEFT JOIN hd.employee nv
                    WHERE (:q IS NULL OR :q = ''
                        OR LOWER(kh.name) LIKE LOWER(CONCAT('%', :q, '%'))
                        OR LOWER(kh.phoneNumber) LIKE LOWER(CONCAT('%', :q, '%'))
                        OR LOWER(nv.name) LIKE LOWER(CONCAT('%', :q, '%')))
                      AND (:trangThai IS NULL OR hd.orderStatus = :trangThai)
                      AND (:startDate IS NULL OR hd.createdDate >= :startDate)
                      AND (:endDate IS NULL OR hd.createdDate <= :endDate)
                      AND hd.orderStatus <> :luuTam
                      AND hd.totalAmount > 0
                """;

        List<Object[]> countByStatusList = entityManager.createQuery(countByStatusHql)
                .setParameter("q", request.getQ() == null ? "" : request.getQ().trim())
                .setParameter("startDate", request.getStartDate())
                .setParameter("endDate", request.getEndDate())
                .setParameter("luuTam", OrderStatus.LUU_TAM)
                .getResultList();

        Map<OrderStatus, Long> countByStatusMap = new HashMap<>();
        for (Object[] row : countByStatusList) {
            OrderStatus status = (OrderStatus) row[0];
            Long count = (Long) row[1];

            if (status == OrderStatus.LUU_TAM)
                continue;

            countByStatusMap.put(status, count);
        }

        Long totalRecords = (Long) entityManager.createQuery(totalCountHql)
                .setParameter("q", request.getQ() == null ? "" : request.getQ().trim())
                .setParameter("trangThai", request.getStatus())
                .setParameter("startDate", request.getStartDate())
                .setParameter("endDate", request.getEndDate())
                .setParameter("luuTam", OrderStatus.LUU_TAM)
                .getSingleResult();

        List<ADOrderResponse> data = entityManager.createQuery(hql, ADOrderResponse.class)
                .setParameter("q", request.getQ() == null ? "" : request.getQ().trim())
                .setParameter("trangThai", request.getStatus())
                .setParameter("orderType",
                        request.getOrderType() == null ? null
                                : TypeInvoice.valueOf(request.getOrderType()))
                .setParameter("startDate", request.getStartDate())
                .setParameter("endDate", request.getEndDate())
                .setParameter("luuTam", OrderStatus.LUU_TAM)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        Page<ADOrderResponse> page = new PageImpl<>(data, pageable, totalRecords);

        return new OrderPageResponse(page, countByStatusMap);
    }

}