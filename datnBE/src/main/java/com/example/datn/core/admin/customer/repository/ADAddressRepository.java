package com.example.datn.core.admin.customer.repository;
import com.example.datn.entity.Address;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.AddressRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ADAddressRepository extends AddressRepository {

    List<Address> findByCustomerIdAndStatus(String customerId, EntityStatus status);

    Optional<Address> findByIdAndCustomerId(String id, String customerId);

    @Modifying
    @Transactional
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.customer.id = :customerId")
    void unsetDefaultByCustomer(@Param("customerId") String customerId);

    // Thêm hàm này để dùng trong luồng Update Khách hàng (Bulk Update)
    void deleteAllByCustomerId(String customerId);



}
