package com.example.datn.core.admin.order.model.response;

import com.example.datn.infrastructure.constant.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;

import java.util.Map;


@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class OrderPageResponse {
    private Page<ADOrderResponse> page;

    private Map<OrderStatus, Long> countByStatus;

}
