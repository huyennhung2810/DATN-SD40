package com.example.datn.entity;

import com.example.datn.entity.base.PrimaryEntity;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "product_detail")
public class ProductDetail extends PrimaryEntity implements Serializable {

    // Tên phiên bản hiển thị (format: "{VariantVersion} / {Color} / {Storage}")
    // Ví dụ: "Body Only / Đen / 128GB" hoặc "Kit 18-45 / Đen / 128GB"
    @Column(name = "version")
    private String version;

    // Phiên bản máy ảnh Canon - dimension bắt buộc cấp 1
    // Giá trị: BODY_ONLY, KIT_18_45, KIT_18_150
    // Mặc định: BODY_ONLY cho dữ liệu cũ chưa có giá trị
    @Column(name = "variant_version")
    private String variantVersion;

    @Column(name = "sale_price")
    private BigDecimal salePrice;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "note")
    private String note;

    @ManyToOne
    @JoinColumn(name = "id_product", referencedColumnName = "id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "id_color", referencedColumnName = "id")
    private Color color;

    @ManyToOne
    @JoinColumn(name = "id_storage_capacity", referencedColumnName = "id")
    private StorageCapacity storageCapacity;

    @OneToMany(mappedBy = "productDetail", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<Serial> serials;

    // Ảnh cũ của biến thể (url trực tiếp)
    @Column(name = "image_url")
    private String imageUrl;

    // Liên kết tới ảnh của sản phẩm mẹ - dùng cho client hiển thị ảnh theo màu/biến
    // thể
    @Column(name = "selected_image_id")
    private String selectedImageId;
}
