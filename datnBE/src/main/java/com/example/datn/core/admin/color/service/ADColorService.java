package com.example.datn.core.admin.color.service;

import com.example.datn.core.admin.color.model.request.ADColorRequest;
import com.example.datn.core.common.base.ResponseObject;

public interface ADColorService {

    ResponseObject<?> getAllColors();

    ResponseObject<?> getColorByCode(String code);

    ResponseObject<?> createColor(ADColorRequest request);

    ResponseObject<?> updateColor(String colorId, ADColorRequest request);

    ResponseObject<?> deleteColor(String colorId);
}
