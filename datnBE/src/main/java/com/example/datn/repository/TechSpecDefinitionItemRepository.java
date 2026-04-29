package com.example.datn.repository;

import com.example.datn.entity.TechSpecDefinitionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechSpecDefinitionItemRepository extends JpaRepository<TechSpecDefinitionItem, String> {

    List<TechSpecDefinitionItem> findByTechSpecDefinitionIdOrderByDisplayOrderAsc(String definitionId);

    List<TechSpecDefinitionItem> findByTechSpecDefinitionIdAndStatusOrderByDisplayOrderAsc(
            String definitionId, com.example.datn.infrastructure.constant.EntityStatus status);

    boolean existsByTechSpecDefinitionIdAndName(String definitionId, String name);

    boolean existsByTechSpecDefinitionIdAndCode(String definitionId, String code);

    void deleteByTechSpecDefinitionId(String definitionId);
}
