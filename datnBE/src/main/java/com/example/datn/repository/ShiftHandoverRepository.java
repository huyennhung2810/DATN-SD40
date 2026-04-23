package com.example.datn.repository;

import com.example.datn.entity.ShiftHandover;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShiftHandoverRepository extends JpaRepository<ShiftHandover, String> {

    @Query("""
        SELECT s FROM ShiftHandover s 
        WHERE s.workSchedule.employee.account.id = :accountId 
        AND s.handoverStatus = 'OPEN'
    """)
    Optional<ShiftHandover> findOpenShiftByAccountId(@Param("accountId") String accountId);
}
