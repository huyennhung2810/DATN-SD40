package com.example.datn.core.client.order.service;

import com.example.datn.core.client.order.model.response.CheckoutResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface CnOrderService {

    CheckoutResponse checkout(
            com.example.datn.core.client.order.model.request.CheckoutRequest request,
            String customerId,
            HttpServletRequest httpRequest);

    void handleVNPayReturn(Map<String, String> params);
}
