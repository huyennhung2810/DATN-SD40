package com.example.datn.core.client.cart.service.Impl;



import com.example.datn.core.client.cart.repository.CnCartRepository;
import com.example.datn.core.client.cart.service.CartService;
import com.example.datn.entity.Cart;
import com.example.datn.entity.Customer;
import com.example.datn.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CnCartRepository cartRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public Cart getOrCreateCart(String customerId) {
        // Cố gắng tìm giỏ hàng hiện tại của khách
        return cartRepository.findByCustomer_Id(customerId)
                .orElseGet(() -> {
                    // Nếu chưa có (orElseGet), thì tạo mới 1 giỏ hàng
                    Customer customer = customerRepository.findById(customerId)
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin khách hàng!"));

                    Cart newCart = new Cart();
                    newCart.setId(UUID.randomUUID().toString()); // Tự sinh ID
                    newCart.setCustomer(customer);

                    return cartRepository.save(newCart);
                });
    }
}
