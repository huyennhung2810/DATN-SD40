package com.example.datn.core.admin.color.repository;

import com.example.datn.entity.Color;
import com.example.datn.repository.ColorRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ADColorRepository extends ColorRepository {

    Optional<Color> findByCode(String code);

    @Query("SELECT c FROM Color c ORDER BY c.createdDate DESC")
    List<Color> getAllSorted();
}
