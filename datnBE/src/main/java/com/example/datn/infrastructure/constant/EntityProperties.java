package com.example.datn.infrastructure.constant;

public final class EntityProperties {

    private EntityProperties() {
    }

    //Sử dụng trong entity. VD: @Column(length = EntityProperties.LENGTH_NAME)

    // Độ dài cho các khóa chính dạng UUID
    public static final byte LENGTH_ID = 36;

    // Mã sản phẩm, Mã đơn hàng, Mã Voucher
    public static final byte LENGTH_CODE = 50;

    // Tên máy ảnh, Tên thương hiệu, Tên khách hàng
    public static final short LENGTH_NAME = 255;

    // URL ảnh từ Cloudinary
    public static final short LENGTH_PICTURE = 2000;

    // Đường dẫn URL chung
    public static final short LENGTH_URL = 2000;

    // Mô tả ngắn sản phẩm (Dùng cho SEO/Meta description)
    public static final short LENGTH_DESCRIPTION = 1000;

    // Nội dung chi tiết/Thông số kỹ thuật máy ảnh (Dùng kiểu dữ liệu lớn)
    public static final int LENGTH_CONTENT = 10000;

}
