package com.example.datn.core.admin.discountDetail.service.Impl;

<<<<<<<< HEAD:datnBE/src/main/java/com/example/datn/core/admin/discountDetail/service/Impl/ProductDetailServiceImpl.java
import com.example.datn.core.admin.discountDetail.service.ProductDetailService;
import com.example.datn.core.admin.productdetail.repository.ADProductDetailRepository;
========
import com.example.datn.core.admin.discountDetail.repository.ADProductDetailForDiscountRepository;
import com.example.datn.core.admin.discountDetail.service.ProductDetailForDiscountService;
>>>>>>>> tuananh:datnBE/src/main/java/com/example/datn/core/admin/discountDetail/service/Impl/ProductDetailForDiscountServiceImpl.java
import com.example.datn.entity.ProductDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductDetailForDiscountServiceImpl implements ProductDetailForDiscountService {

    @Autowired
<<<<<<<< HEAD:datnBE/src/main/java/com/example/datn/core/admin/discountDetail/service/Impl/ProductDetailServiceImpl.java
    private ADProductDetailRepository adProductDetailRepository;
========
    private ProductDetailRepository productDetailRepository;
    @Autowired
    private ADProductDetailForDiscountRepository adProductDetailRepository;
>>>>>>>> tuananh:datnBE/src/main/java/com/example/datn/core/admin/discountDetail/service/Impl/ProductDetailForDiscountServiceImpl.java
    @Override
    public Page<ProductDetail> getAll(String keyword, Pageable pageable) {
        // Gọi hàm search vừa viết ở Repository
        return adProductDetailRepository.searchByKeyword(keyword, pageable);
    }
}
