package com.example.datn.core.client.product.service.Ipml;

import com.example.datn.core.client.product.model.response.CnProductResponse;
import com.example.datn.core.client.product.model.response.CnVariantResponse;
import com.example.datn.core.client.product.service.CnProductService;
import com.example.datn.entity.Product;
import com.example.datn.entity.ProductDetail;
import com.example.datn.entity.ProductImage;
import com.example.datn.repository.ProductDetailRepository;
import com.example.datn.repository.ProductImageRepository;
import com.example.datn.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CnProductServiceImpl implements CnProductService {

    private final ProductRepository productRepository;
    private final ProductDetailRepository productDetailRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    public CnProductResponse getProductDetailById(String productId) {
        // 1. Tìm thông tin Sản phẩm cha
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm!"));

        // 2. Lấy danh sách ảnh của sản phẩm này
        // (Giả sử bạn có hàm findByProductId trong ProductImageRepository)
        List<ProductImage> images = productImageRepository.findByProduct_Id(productId);
        List<String> imageUrls = images.stream()
                .map(ProductImage::getUrl) // Sửa lại tên hàm lấy link ảnh cho đúng
                .collect(Collectors.toList());

        // 3. Lấy danh sách các biến thể (ProductDetail)
        // (Giả sử bạn có hàm findByProductId trong ProductDetailRepository)
        List<ProductDetail> details = productDetailRepository.findByProduct_Id(productId);

        List<CnVariantResponse> variants = new ArrayList<>();
        for (ProductDetail detail : details) {
            CnVariantResponse variant = new CnVariantResponse();
            variant.setId(detail.getId()); // ID thật từ DB!

            // Tự động ghép tên biến thể (Ví dụ ghép Màu sắc và Bộ nhớ)
            // Sửa lại đoạn này theo đúng quan hệ Entity của bạn (VD: detail.getColor().getName())
            String variantName = detail.getVersion();
            variant.setName(variantName);

            variant.setPrice(detail.getSalePrice()); // Giá của biến thể
            variant.setStock(detail.getQuantity()); // Số lượng tồn kho

            variants.add(variant);
        }

        // 4. Gộp tất cả vào Response và trả về cho Frontend
        CnProductResponse response = new CnProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice()); // Hoặc lấy giá của biến thể đầu tiên làm mặc định
        response.setImages(imageUrls);
        response.setVariants(variants);

        return response;
    }
}