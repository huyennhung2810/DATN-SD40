package com.example.datn.core.client.cartDetail.service.Impl;

import com.example.datn.core.client.cart.model.AddToCartRequest;
import com.example.datn.core.client.cart.model.response.CartItemResponse;
import com.example.datn.core.client.cart.service.CartService;
import com.example.datn.core.client.cartDetail.repository.CnCartDetailRepository;
import com.example.datn.core.client.cartDetail.service.CnCartDetailService;
import com.example.datn.entity.Cart;
import com.example.datn.entity.CartDetail;
import com.example.datn.entity.DiscountDetail;
import com.example.datn.entity.ProductDetail;
import com.example.datn.repository.DiscountDetailRepository;
import com.example.datn.repository.ProductDetailRepository;
import com.example.datn.repository.ProductImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CnCartDetailServiceImpl implements CnCartDetailService {

    private final CnCartDetailRepository cnCartDetailRepository;
    private final CartService CartService;
    private final ProductDetailRepository productDetailRepository;
    private final ProductImageRepository productImageRepository;
    private final DiscountDetailRepository discountDetailRepository;
    @Override
    @Transactional
    public CartDetail addToCart(String customerId, AddToCartRequest request) {
        // 1. Lấy giỏ hàng của khách
        Cart cart = CartService.getOrCreateCart(customerId);

        // 2. Kiểm tra xem sản phẩm có tồn tại dưới DB không
        ProductDetail productDetail = productDetailRepository.findById(request.getProductDetailId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));

        // KIỂM TRA KHO 1: Kho đã cạn sạch
        if (productDetail.getQuantity() <= 0) {
            throw new RuntimeException("Sản phẩm này đã hết hàng!");
        }

        // 3. Tìm sản phẩm trong giỏ hàng
        Optional<CartDetail> existingDetail = cnCartDetailRepository
                .findByCart_IdAndProductDetail_Id(cart.getId(), productDetail.getId());

        if (existingDetail.isPresent()) {
            // NẾU ĐÃ CÓ TRONG GIỎ
            CartDetail detail = existingDetail.get();
            int newQuantity = detail.getQuantity() + request.getQuantity();

            // KIỂM TRA KHO 2: Số lượng cộng dồn vượt quá tồn kho
            if (newQuantity > productDetail.getQuantity()) {
                throw new RuntimeException("Số lượng trong giỏ vượt quá số lượng tồn kho (" + productDetail.getQuantity() + " sản phẩm)!");
            }

            // XỬ LÝ NÚT TRỪ (-): Nếu số lượng tụt xuống 0 hoặc âm thì xóa khỏi giỏ
            if (newQuantity <= 0) {
                cnCartDetailRepository.delete(detail);
                return null; // Trả về null báo hiệu đã xóa
            }

            detail.setQuantity(newQuantity);
            detail.setCreatedDate(System.currentTimeMillis());
            return cnCartDetailRepository.save(detail);

        } else {
            // NẾU CHƯA CÓ TRONG GIỎ (Thêm mới)

            // Chặn trường hợp truyền số âm hoặc = 0 khi thêm mới
            if (request.getQuantity() <= 0) {
                throw new RuntimeException("Số lượng thêm vào phải lớn hơn 0!");
            }

            // KIỂM TRA KHO 3: Số lượng mua mới vượt tồn kho
            if (request.getQuantity() > productDetail.getQuantity()) {
                throw new RuntimeException("Số lượng yêu cầu vượt quá số lượng tồn kho!");
            }

            CartDetail newDetail = new CartDetail();
            newDetail.setId(UUID.randomUUID().toString());
            newDetail.setCart(cart);
            newDetail.setProductDetail(productDetail);
            newDetail.setQuantity(request.getQuantity());
            newDetail.setCreatedDate(System.currentTimeMillis());

            return cnCartDetailRepository.save(newDetail);
        }
    }
    @Override
    @Transactional
    public List<CartItemResponse> getCartDetails (String customerId){
        // 1. Tìm giỏ hàng của khách này
        Cart cart = CartService.getOrCreateCart(customerId);

        // 2. Tìm tất cả chi tiết giỏ hàng
        List<CartDetail> cartDetails = cnCartDetailRepository.findByCart_Id(cart.getId());

        List<CartItemResponse> responseList = new ArrayList<>();

        for (CartDetail cd : cartDetails) {
            CartItemResponse dto = new CartItemResponse();

            dto.setId(cd.getId());
            dto.setProductDetailId(cd.getProductDetail().getId());
            dto.setProductId(cd.getProductDetail().getProduct().getId());
            dto.setProductName(cd.getProductDetail().getProduct().getName());
            dto.setVersion(cd.getProductDetail().getVersion());
            String Image = productImageRepository.findUrlById(cd.getProductDetail().getSelectedImageId());
            dto.setImageUrl(Image);

            // Gán giá gốc
            BigDecimal originalPrice = cd.getProductDetail().getSalePrice();
            dto.setPrice(originalPrice);

            dto.setQuantity(cd.getQuantity());
            dto.setStock(cd.getProductDetail().getQuantity());
            String productDetailId = cd.getProductDetail().getId();

            DiscountDetail activeDiscount = discountDetailRepository.findFirstByProductDetail_IdAndStatus(productDetailId, 1);
            if (activeDiscount != null && activeDiscount.getPriceAfter() != null) {
                dto.setDiscountedPrice(activeDiscount.getPriceAfter());
            } else {
                dto.setDiscountedPrice(originalPrice);
            }

            responseList.add(dto);
        }

        return responseList;
    }
    @Override
    @Transactional
    public void updateQuantity(String cartDetailId, Integer quantity) {
        // Tìm chi tiết giỏ hàng theo ID
        CartDetail cartDetail = cnCartDetailRepository.findById(cartDetailId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại trong giỏ hàng!"));

        // Cập nhật số lượng mới và lưu lại
        cartDetail.setQuantity(quantity);
        cnCartDetailRepository.save(cartDetail);
    }

    @Override
    @Transactional
    public void deleteCartDetail(String cartDetailId) {
        // Kiểm tra xem có tồn tại không rồi xóa
        if (!cnCartDetailRepository.existsById(cartDetailId)) {
            throw new RuntimeException("Sản phẩm không tồn tại trong giỏ hàng!");
        }
        cnCartDetailRepository.deleteById(cartDetailId);
    }
    }
