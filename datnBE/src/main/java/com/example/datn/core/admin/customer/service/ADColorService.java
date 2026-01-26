package com.example.datn.core.admin.customer.service;

import com.example.datn.core.admin.customer.model.request.ADColorRequest;
import com.example.datn.core.admin.customer.model.response.ADColorResponse;
import com.example.datn.core.common.base.ResponseObject;

import java.util.Optional;

public interface ADColorService {

    ResponseObject<?> getAllColors();

    ResponseObject<?> getColorByCode(String code);

    ResponseObject<?> createColor(ADColorRequest request);

    ResponseObject<?> updateColor(String colorId, ADColorRequest request);

    ResponseObject<?> deleteColor(String colorId);
}
