package com.example.datn.repository;

import com.example.datn.entity.Serial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Set;

@Repository
public interface SerialRepository extends JpaRepository<Serial, String> {
    Set<String> findByCodeIn(Collection<String> codes);
}
