package com.example.datn.core.client.order.service;

import com.example.datn.core.client.order.model.request.CheckoutRequest;
import com.example.datn.core.client.order.model.response.CheckoutResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface CnOrderService {

    CheckoutResponse checkout(CheckoutRequest request, HttpServletRequest httpRequest);

    void handleVNPayReturn(Map<String, String> params);
}
