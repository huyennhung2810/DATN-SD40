package com.example.datn.core.admin.order.repository;

import com.example.datn.entity.OrderChangeRequest;
import com.example.datn.infrastructure.constant.ChangeRequestStatus;
import com.example.datn.infrastructure.constant.ChangeRequestType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ADOrderChangeRequestRepository extends JpaRepository<OrderChangeRequest, String> {

    List<OrderChangeRequest> findByOrderIdOrderByCreatedDateDesc(String orderId);

    @Query("SELECT r FROM OrderChangeRequest r WHERE " +
           "(:status IS NULL OR r.changeStatus = :status) AND " +
           "(:orderCode IS NULL OR LOWER(r.order.code) LIKE LOWER(CONCAT('%', :orderCode, '%'))) AND " +
           "(:type IS NULL OR r.type = :type) " +
           "ORDER BY r.createdDate DESC")
    Page<OrderChangeRequest> searchChangeRequests(
            @Param("status") ChangeRequestStatus status,
            @Param("orderCode") String orderCode,
            @Param("type") ChangeRequestType type,
            Pageable pageable);

    long countByChangeStatus(ChangeRequestStatus changeStatus);
}
