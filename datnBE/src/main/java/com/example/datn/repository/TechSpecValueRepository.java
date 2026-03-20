package com.example.datn.repository;

import com.example.datn.entity.TechSpecValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechSpecValueRepository extends JpaRepository<TechSpecValue, String> {

    List<TechSpecValue> findByProductId(String productId);

    @Modifying
    @Query("DELETE FROM TechSpecValue v WHERE v.product.id = :productId")
    void deleteByProductId(@Param("productId") String productId);

    @Modifying
    @Query("DELETE FROM TechSpecValue v WHERE v.product.id = :productId AND v.techSpecDefinition.id = :definitionId")
    void deleteByProductIdAndDefinitionId(
            @Param("productId") String productId,
            @Param("definitionId") String definitionId
    );

    @Query("""
        SELECT v FROM TechSpecValue v
        JOIN FETCH v.techSpecDefinition d
        JOIN FETCH d.techSpecGroup
        WHERE v.product.id = :productId
        ORDER BY d.techSpecGroup.displayOrder ASC NULLS LAST, d.displayOrder ASC NULLS LAST
    """)
    List<TechSpecValue> findByProductIdWithDefinition(@Param("productId") String productId);
}
