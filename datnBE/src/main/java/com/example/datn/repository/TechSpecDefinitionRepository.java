package com.example.datn.repository;

import com.example.datn.entity.TechSpecDefinition;
import com.example.datn.infrastructure.constant.EntityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TechSpecDefinitionRepository extends JpaRepository<TechSpecDefinition, String> {

    @Query("""
        SELECT d FROM TechSpecDefinition d
        WHERE (:keyword IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (:groupId IS NULL OR d.techSpecGroup.id = :groupId)
        AND (:status IS NULL OR d.status = :status)
        AND (:dataType IS NULL OR d.dataType = :dataType)
        ORDER BY d.techSpecGroup.displayOrder ASC NULLS LAST, d.displayOrder ASC NULLS LAST, d.createdDate DESC
    """)
    Page<TechSpecDefinition> search(
            @Param("keyword") String keyword,
            @Param("groupId") String groupId,
            @Param("status") EntityStatus status,
            @Param("dataType") TechSpecDefinition.DataType dataType,
            Pageable pageable
    );

    @Query("""
        SELECT d FROM TechSpecDefinition d
        WHERE d.status = :status
        ORDER BY d.techSpecGroup.displayOrder ASC NULLS LAST, d.displayOrder ASC NULLS LAST
    """)
    List<TechSpecDefinition> findAllActiveOrderByGroupAndOrder(
            @Param("status") EntityStatus status
    );

    @Query("""
        SELECT d FROM TechSpecDefinition d
        WHERE d.techSpecGroup.id = :groupId
        AND d.status = :status
        ORDER BY d.displayOrder ASC NULLS LAST
    """)
    List<TechSpecDefinition> findByGroupIdAndStatusOrderByOrder(
            @Param("groupId") String groupId,
            @Param("status") EntityStatus status
    );

    List<TechSpecDefinition> findByTechSpecGroupIdOrderByDisplayOrderAsc(String groupId);

    boolean existsByCode(String code);

    Optional<TechSpecDefinition> findByCode(String code);
}
