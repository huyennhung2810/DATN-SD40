package com.example.datn.repository;

import com.example.datn.entity.TechSpecGroup;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechSpecGroupRepository extends JpaRepository<TechSpecGroup, String> {

    @Query("""
        SELECT g FROM TechSpecGroup g
        WHERE (:keyword IS NULL OR LOWER(g.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (:status IS NULL OR g.status = :status)
        ORDER BY g.displayOrder ASC NULLS LAST, g.createdDate DESC
    """)
    Page<TechSpecGroup> search(
            @Param("keyword") String keyword,
            @Param("status") EntityStatus status,
            Pageable pageable
    );

    List<TechSpecGroup> findByStatusOrderByDisplayOrderAsc(EntityStatus status);

    boolean existsByCode(String code);
}
