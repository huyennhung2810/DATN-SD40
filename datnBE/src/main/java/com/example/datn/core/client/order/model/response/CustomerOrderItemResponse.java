package com.example.datn.core.client.order.model.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerOrderItemResponse {

    String id;                    // OrderDetail ID
    String productDetailId;

    // === PRODUCT INFO (captured at purchase time) ===
    String productName;
    String brandName;
    String productImage;          // Image URL from productDetail at purchase time
    String variantLabel;          // "Body Only / Đen / 128GB"
    String colorName;
    String storageLabel;

    // === PURCHASE INFO (historical, from OrderDetail) ===
    Integer quantity;
    /** Đơn giá niêm yết / trước KM dòng (suy ra từ unitPrice + discountAmount/qty) */
    BigDecimal listUnitPrice;
    /** Đơn giá sau KM (OrderDetail.unitPrice) */
    BigDecimal unitPrice;
    /** Giảm KM trên dòng (OrderDetail.discountAmount) */
    BigDecimal discountAmount;
    BigDecimal totalPrice;         // Historical total (unitPrice * quantity - discountAmount)

    // === SERIALS (if applicable) ===
    List<String> serialNumbers;   // List of IMEI/serial numbers purchased
    Integer serialCount;
}
