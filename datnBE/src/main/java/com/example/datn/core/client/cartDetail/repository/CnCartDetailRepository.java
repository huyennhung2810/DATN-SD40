package com.example.datn.core.client.cartDetail.repository;

import com.example.datn.entity.CartDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CnCartDetailRepository extends JpaRepository<CartDetail, String> {

    // Tìm chi tiết giỏ hàng dựa vào ID Giỏ hàng và ID Sản phẩm
    Optional<CartDetail> findByCart_IdAndProductDetail_Id(String cartId, String productDetailId);
    List<CartDetail> findAllByCart_IdOrderByCreatedDateDesc(String cartId);
    List<CartDetail> findByCart_Id(String cartId);

    void deleteByCart_Id(String id);
}
