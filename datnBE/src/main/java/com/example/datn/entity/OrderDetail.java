package com.example.datn.entity;
import com.example.datn.entity.base.PrimaryEntity;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.math.BigDecimal;

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

    @Column(name = "discount_amount")
    private BigDecimal discountAmount;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @Column(name = "serial_sold_number")
    private Integer serialSoldNumber;

    @Column(name = "note")
    private String note;

    @ManyToOne
    @JoinColumn(name = "id_order", referencedColumnName = "id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "id_product_detail", referencedColumnName = "id")
    private ProductDetail productDetail;

    @OneToOne
    @JoinColumn(name = "id_warranty", referencedColumnName = "id")
    private Warranty warranty;
}
