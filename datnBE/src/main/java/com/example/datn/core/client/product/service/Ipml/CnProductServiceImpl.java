package com.example.datn.core.client.product.service.Ipml;

import com.example.datn.core.admin.discountDetail.repository.ADDiscountDetailRepository;
import com.example.datn.core.client.product.model.response.CnProductResponse;
import com.example.datn.core.client.product.model.response.CnVariantResponse;
import com.example.datn.core.client.product.service.CnProductService;
import com.example.datn.core.client.product.service.ActiveDiscountInfo;
import com.example.datn.core.client.product.service.ProductPricingResult;
import com.example.datn.core.client.product.service.ProductPricingRules;
import com.example.datn.core.client.product.service.ProductPricingService;
import com.example.datn.entity.Product;
import com.example.datn.entity.ProductDetail;
import com.example.datn.entity.ProductImage;
import com.example.datn.repository.ProductDetailRepository;
import com.example.datn.repository.ProductImageRepository;
import com.example.datn.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CnProductServiceImpl implements CnProductService {

    private final ProductRepository productRepository;
    private final ProductDetailRepository productDetailRepository;
    private final ProductImageRepository productImageRepository;
    private final ADDiscountDetailRepository discountDetailRepository;
    private final ProductPricingService pricingService;

    @Override
    public CnProductResponse getProductDetailById(String productId) {
        // 1. Tìm thông tin Sản phẩm cha
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm!"));

        // 2. Lấy danh sách ảnh của sản phẩm
        List<ProductImage> images = productImageRepository.findByProduct_Id(productId);
        List<String> imageUrls = images.stream()
                .map(ProductImage::getUrl)
                .collect(Collectors.toList());

        // 3. Lấy danh sách các biến thể (ProductDetail)
        List<ProductDetail> details = productDetailRepository.findByProduct_Id(productId);

        if (details == null || details.isEmpty()) {
            CnProductResponse response = new CnProductResponse();
            response.setId(product.getId());
            response.setName(product.getName());
            response.setDescription(product.getDescription());
            response.setDisplayPrice(null);
            response.setOriginalPrice(null);
            response.setHasActiveSaleCampaign(false);
            response.setDiscountAmount(BigDecimal.ZERO);
            response.setDiscountPercent(null);
            response.setImages(imageUrls);
            response.setVariants(Collections.emptyList());
            return response;
        }

        // 4. Batch fetch active discounts cho tất cả variants
        long now = System.currentTimeMillis();
        List<String> detailIds = details.stream()
                .map(ProductDetail::getId)
                .collect(Collectors.toList());

        Map<String, ActiveDiscountInfo> activeDiscounts = parseActiveDiscountRows(
                discountDetailRepository.findActiveDiscountsByProductDetailIds(detailIds, now));

        // 5. Tính giá hiển thị cho sản phẩm (dùng shared service)
        ProductPricingResult productPricing = pricingService.calculateDisplayPrice(details, activeDiscounts);

        // 6. Map variants kèm discount
        List<CnVariantResponse> variants = details.stream()
                .map(detail -> mapToVariantResponse(detail, activeDiscounts))
                .collect(Collectors.toList());

        // 7. Build Response
        CnProductResponse response = new CnProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setDisplayPrice(productPricing.getDisplayPrice());
        response.setOriginalPrice(productPricing.getOriginalPrice());
        response.setCheapestVariantId(productPricing.getVariantId());
        response.setHasActiveSaleCampaign(productPricing.isHasActiveSaleCampaign());
        response.setDiscountAmount(productPricing.getDiscountAmount());
        response.setDiscountPercent(productPricing.getDiscountPercent());
        response.setImages(imageUrls);
        response.setVariants(variants);

        return response;
    }

    @Override
    public List<CnVariantResponse> getVariantsByProductId(String productId) {
        List<ProductDetail> details = productDetailRepository.findByProduct_Id(productId);
        if (details == null || details.isEmpty()) {
            return Collections.emptyList();
        }

        long now = System.currentTimeMillis();
        List<String> detailIds = details.stream()
                .map(ProductDetail::getId)
                .collect(Collectors.toList());

        Map<String, ActiveDiscountInfo> activeDiscounts = parseActiveDiscountRows(
                discountDetailRepository.findActiveDiscountsByProductDetailIds(detailIds, now));

        return details.stream()
                .map(detail -> mapToVariantResponse(detail, activeDiscounts))
                .collect(Collectors.toList());
    }

    private Map<String, ActiveDiscountInfo> parseActiveDiscountRows(List<Object[]> rows) {
        Map<String, ActiveDiscountInfo> map = new HashMap<>();
        if (rows == null) {
            return map;
        }
        for (Object[] row : rows) {
            if (row == null || row.length < 4) {
                continue;
            }
            String id = (String) row[0];
            map.putIfAbsent(id, ActiveDiscountInfo.fromQueryRow(row));
        }
        return map;
    }

    private CnVariantResponse mapToVariantResponse(
            ProductDetail detail,
            Map<String, ActiveDiscountInfo> activeDiscounts) {

        CnVariantResponse variant = new CnVariantResponse();
        variant.setId(detail.getId());
        variant.setName(detail.getVersion());

        BigDecimal salePrice = detail.getSalePrice() != null ? detail.getSalePrice() : BigDecimal.ZERO;
        variant.setSalePrice(salePrice);
        variant.setOriginalPrice(salePrice);

        ActiveDiscountInfo info = activeDiscounts != null ? activeDiscounts.get(detail.getId()) : null;
        BigDecimal displayPrice = ProductPricingRules.resolveFinalPrice(salePrice, info);
        if (displayPrice == null) {
            displayPrice = salePrice;
        }
        boolean hasCampaign = ProductPricingRules.hasActiveDiscount(salePrice, info);

        if (hasCampaign) {
            variant.setDiscountedPrice(displayPrice);
            variant.setDisplayPrice(displayPrice);
            variant.setHasActiveSaleCampaign(true);
        } else {
            variant.setDiscountedPrice(null);
            variant.setDisplayPrice(salePrice);
            variant.setHasActiveSaleCampaign(false);
        }

        variant.setStock(detail.getQuantity() != null ? detail.getQuantity() : 0);
        return variant;
    }
}
