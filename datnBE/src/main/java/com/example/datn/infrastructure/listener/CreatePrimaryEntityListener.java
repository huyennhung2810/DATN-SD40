package com.example.datn.infrastructure.listener;

import com.example.datn.entity.base.PrimaryEntity;
import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.persistence.PrePersist;

import java.security.SecureRandom;
import java.util.UUID;

public class CreatePrimaryEntityListener {
    @PrePersist
    private void onCreate(PrimaryEntity entity) {
        //Tự động tạo UUID
        entity.setId(UUID.randomUUID().toString());

        //Mọi bản ghi mới mặc định là hoạt động
        entity.setStatus(EntityStatus.ACTIVE);

        //hàm logic để sinh mã riêng biệt cho từng thực thể
        entity.setCode(setCodePrimaryEntity(entity));
    }


    private String setCodePrimaryEntity(PrimaryEntity entity) {
        // Nếu đã có mã rồi thì trả về luôn, không sinh mã mới
        if (entity.getCode() != null && !entity.getCode().isEmpty()) {
            return entity.getCode();
        }

        String prefix = switch (entity.getClass().getSimpleName()) {
            case "Customer" -> "KH";      // Khách hàng
            case "Employee" -> "NV";      // Nhân viên
            case "Account" -> "ACC";      // Tài khoản
            case "Address" -> "ADR";      // Địa chỉ

            // Nhóm Sản phẩm & Thuộc tính (Máy ảnh)
            case "Product" -> "PD";       // Sản phẩm
            case "ProductCategory" -> "CAT"; // Danh mục
            case "ProductDetail" -> "PDT"; // Chi tiết sản phẩm
            case "ProductImage" -> "IMG"; // Ảnh sản phẩm
            case "Color" -> "COL";        // Màu sắc
            case "Version" -> "VER";      // Phiên bản
            case "StorageCapacity" -> "CAP"; // Dung lượng bộ nhớ
            case "TechSpec" -> "TS";      // Thông số kỹ thuật
            case "Serial" -> "SR";        // Số Serial (rất quan trọng cho máy ảnh)
            case "SerialSold" -> "SRS";   // Serial đã bán

            // Nhóm Giao dịch & Đơn hàng
            case "Bill" -> "HD";          // Hóa đơn
            case "BillDetail" -> "HDCT";  // Hóa đơn chi tiết
            case "Cart" -> "CRT";         // Giỏ hàng
            case "CartDetail" -> "CRD";   // Giỏ hàng chi tiết
            case "OrderInformation" -> "ORD"; // Thông tin đặt hàng
            case "OrderStatus" -> "OS";   // Trạng thái đơn hàng
            case "ShippingMethods" -> "SHP"; // Phương thức vận chuyển

            // Nhóm Khuyến mãi & Bảo hành
            case "Voucher" -> "VOU";      // Phiên bản giảm giá
            case "VoucherDetail" -> "VOD"; // Chi tiết voucher
            case "Discount" -> "DC";      // Đợt giảm giá
            case "DiscountDetail" -> "DCD"; // Chi tiết giảm giá
            case "Warranty" -> "BH";      // Bảo hành
            case "WarrantyHistory" -> "BHH"; // Lịch sử bảo hành

            // Khác
            case "RefreshToken" -> "RT";
            default -> "OTH";             // Others
        };

        return prefix + generateCode();
    }


    private String generateCode() {
        String chars = "0123456789";

        //Tạo ra 1 chuỗi ngẫu nhiên gồm 6 ký tự
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < 5; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
