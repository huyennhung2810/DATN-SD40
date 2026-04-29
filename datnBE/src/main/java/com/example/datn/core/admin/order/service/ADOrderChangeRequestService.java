package com.example.datn.core.admin.order.service;

import com.example.datn.core.admin.order.model.request.ADChangeRequestSearchRequest;
import com.example.datn.core.admin.order.model.request.ChangeRequestActionRequest;
import com.example.datn.core.admin.order.model.response.ADChangeRequestResponse;
import com.example.datn.core.common.base.ResponseObject;
import org.springframework.data.domain.Page;

public interface ADOrderChangeRequestService {

    ResponseObject<?> getAllChangeRequests(ADChangeRequestSearchRequest request);

    ResponseObject<?> getChangeRequestDetail(String id);

    ResponseObject<?> approveChangeRequest(String id, ChangeRequestActionRequest request);

    ResponseObject<?> rejectChangeRequest(String id, ChangeRequestActionRequest request);

    ResponseObject<?> cancelAndRecreateShipment(String orderId, String reason);
}
