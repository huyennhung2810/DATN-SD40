package com.example.datn.repository;

import com.example.datn.entity.Serial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Set;

@Repository
public interface SerialRepository extends JpaRepository<Serial, String> {

    @Query("SELECT s.code FROM Serial s WHERE s.code IN :codes")
    Set<String> findByCodeIn(Collection<String> codes);

    boolean existsBySerialNumber(String serialNumber);
}
