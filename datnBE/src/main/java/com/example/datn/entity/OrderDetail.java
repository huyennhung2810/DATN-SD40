package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "order_detail")
public class OrderDetail extends PrimaryEntity implements Serializable {

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    /**
     * Giá gốc niêm yết tại thời điểm mua (snapshot).
     * Dùng để hiển thị "giá gạch đi" trên hóa đơn.
     * Lấy từ ProductDetail.salePrice tại thời điểm tạo OrderDetail.
     */
    @Column(name = "original_price", precision = 20, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "discount_amount")
    private BigDecimal discountAmount;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @Column(name = "serial_sold_number")
    private Integer serialSoldNumber;

    @Column(name = "note")
    private String note;

    @Column(name = "applied_promotion_name")
    private String appliedPromotionName;

    @ManyToOne
    @JoinColumn(name = "id_order", referencedColumnName = "id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Order order;

    @ManyToOne
    @JoinColumn(name = "id_product_detail", referencedColumnName = "id")
    private ProductDetail productDetail;

    @OneToMany(mappedBy = "orderDetail", cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @ToString.Exclude
    private List<Serial> serials = new ArrayList<>();
}
