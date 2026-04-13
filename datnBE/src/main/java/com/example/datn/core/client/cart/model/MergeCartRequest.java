package com.example.datn.core.client.cart.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class MergeCartRequest {
    private List<MergeItem> items;

    @Getter
    @Setter
    public static class MergeItem {
        private String productDetailId;
        private Integer quantity;
    }
}
