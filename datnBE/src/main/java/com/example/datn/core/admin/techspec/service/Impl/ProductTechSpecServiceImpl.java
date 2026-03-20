package com.example.datn.core.admin.techspec.service.Impl;

import com.example.datn.core.admin.techspec.model.response.ProductTechSpecValueResponse;
import com.example.datn.core.admin.techspec.service.ProductTechSpecService;
import com.example.datn.entity.Product;
import com.example.datn.entity.TechSpecDefinition;
import com.example.datn.entity.TechSpecValue;
import com.example.datn.repository.ProductRepository;
import com.example.datn.repository.TechSpecDefinitionRepository;
import com.example.datn.repository.TechSpecValueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductTechSpecServiceImpl implements ProductTechSpecService {

    private final TechSpecValueRepository valueRepository;
    private final TechSpecDefinitionRepository definitionRepository;
    private final ProductRepository productRepository;

    @Override
    public List<ProductTechSpecValueResponse> getByProductId(String productId) {
        return valueRepository.findByProductIdWithDefinition(productId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, String> getProductSpecValues(String productId) {
        List<TechSpecValue> values = valueRepository.findByProductIdWithDefinition(productId);
        Map<String, String> result = new HashMap<>();
        for (TechSpecValue v : values) {
            if (v.getTechSpecDefinition() != null && v.getTechSpecDefinition().getCode() != null) {
                String displayValue = v.getDisplayValue();
                if (displayValue != null && !displayValue.isBlank()) {
                    result.put("spec_" + v.getTechSpecDefinition().getCode(), displayValue);
                }
            }
        }
        return result;
    }

    @Override
    public Map<String, Object> getProductSpecFormValues(String productId) {
        List<TechSpecValue> values = valueRepository.findByProductIdWithDefinition(productId);
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        for (TechSpecValue v : values) {
            TechSpecDefinition def = v.getTechSpecDefinition();
            if (def == null || def.getCode() == null || def.getCode().isBlank()) {
                continue;
            }
            String key = "spec_" + def.getCode();
            Object formValue = switch (def.getDataType()) {
                case NUMBER -> resolveNumberForForm(v);
                case ENUM, TEXT, BOOLEAN, RANGE -> firstNonBlank(v.getDisplayValue(), v.getValueText());
            };
            if (formValue == null) {
                continue;
            }
            if (formValue instanceof String s && s.isBlank()) {
                continue;
            }
            result.put(key, formValue);
        }
        return result;
    }

    private static Object resolveNumberForForm(TechSpecValue v) {
        if (v.getValueNumber() != null) {
            return v.getValueNumber();
        }
        String disp = firstNonBlank(v.getDisplayValue(), v.getValueText());
        if (disp == null) {
            return null;
        }
        try {
            return Double.parseDouble(disp.trim());
        } catch (NumberFormatException e) {
            String digits = disp.replaceAll("[^0-9.]", "");
            if (digits.isEmpty()) {
                return null;
            }
            try {
                return Double.parseDouble(digits);
            } catch (NumberFormatException e2) {
                return null;
            }
        }
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) {
            return a;
        }
        if (b != null && !b.isBlank()) {
            return b;
        }
        return null;
    }

    @Override
    @Transactional
    public void saveProductSpecValues(String productId, Map<String, String> values) {
        // Xóa toàn bộ spec values cũ của sản phẩm
        valueRepository.deleteByProductId(productId);

        if (values == null || values.isEmpty()) return;

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm: " + productId));

        for (Map.Entry<String, String> entry : values.entrySet()) {
            String fieldName = entry.getKey();
            String fieldValue = entry.getValue();

            if (fieldValue == null || fieldValue.trim().isEmpty() || !fieldName.startsWith("spec_")) {
                continue;
            }

            String defCode = fieldName.substring(5); // bỏ "spec_"
            TechSpecDefinition definition = definitionRepository.findByCode(defCode).orElse(null);
            if (definition == null) continue;

            TechSpecValue specValue = new TechSpecValue();
            specValue.setProduct(product);
            specValue.setTechSpecDefinition(definition);
            specValue.setDisplayValue(fieldValue.trim());

            // Phân loại theo dataType
            switch (definition.getDataType()) {
                case TEXT, ENUM -> specValue.setValueText(fieldValue.trim());
                case NUMBER -> {
                    try {
                        specValue.setValueNumber(Double.parseDouble(fieldValue.trim()));
                    } catch (NumberFormatException ignored) {
                        specValue.setValueText(fieldValue.trim());
                    }
                }
                case BOOLEAN -> specValue.setValueBoolean(Boolean.parseBoolean(fieldValue.trim()));
                case RANGE -> specValue.setValueText(fieldValue.trim());
            }

            valueRepository.save(specValue);
        }
    }

    private ProductTechSpecValueResponse toResponse(TechSpecValue v) {
        ProductTechSpecValueResponse r = new ProductTechSpecValueResponse();
        r.setId(v.getId());
        r.setProductId(v.getProduct() != null ? v.getProduct().getId() : null);
        r.setDefinitionId(v.getTechSpecDefinition() != null ? v.getTechSpecDefinition().getId() : null);
        r.setDefinitionCode(v.getTechSpecDefinition() != null ? v.getTechSpecDefinition().getCode() : null);
        r.setDefinitionName(v.getTechSpecDefinition() != null ? v.getTechSpecDefinition().getName() : null);
        r.setDefinitionDataType(v.getTechSpecDefinition() != null ? v.getTechSpecDefinition().getDataType().name() : null);
        r.setGroupName(v.getTechSpecDefinition() != null && v.getTechSpecDefinition().getTechSpecGroup() != null
                ? v.getTechSpecDefinition().getTechSpecGroup().getName() : null);
        r.setDisplayValue(v.getDisplayValue());
        r.setValueText(v.getValueText());
        r.setValueNumber(v.getValueNumber());
        r.setValueBoolean(v.getValueBoolean());
        return r;
    }
}
