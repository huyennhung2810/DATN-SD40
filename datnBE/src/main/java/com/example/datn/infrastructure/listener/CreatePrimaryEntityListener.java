package com.example.datn.infrastructure.listener;

import com.example.datn.entity.base.PrimaryEntity;
import com.example.datn.infrastructure.constant.EntityStatus;
import jakarta.persistence.PrePersist;

import java.security.SecureRandom;
import java.util.UUID;

public class CreatePrimaryEntityListener {
    @PrePersist
    public void onCreate(PrimaryEntity entity) {
        //Tự động tạo UUID
        entity.setId(UUID.randomUUID().toString());

        //Mọi bản ghi mới mặc định là hoạt động
        if (entity.getStatus() == null) {
            entity.setStatus(EntityStatus.ACTIVE);
        }

        //hàm logic để sinh mã riêng biệt cho từng thực thể
        entity.setCode(setCodePrimaryEntity(entity));
    }


    private String setCodePrimaryEntity(PrimaryEntity entity) {
        // Nếu đã có mã rồi thì trả về luôn, không sinh mã mới
        if (entity.getCode() != null && !entity.getCode().isEmpty()) {
            return entity.getCode();
        }

        String prefix = switch (entity.getClass().getSimpleName()) {
            case "Customer" -> "KH_";      // Khách hàng
            case "Employee" -> "NV_";      // Nhân viên
            case "Account" -> "ACC_";      // Tài khoản
            case "Address" -> "ADR_";      // Địa chỉ

            // Nhóm Sản phẩm & Thuộc tính (Máy ảnh)
            case "Product" -> "PD_";       // Sản phẩm
            case "ProductCategory" -> "CAT_"; // Danh mục
            case "ProductDetail" -> "PDT_"; // Chi tiết sản phẩm
            case "ProductImage" -> "IMG_"; // Ảnh sản phẩm
            case "Color" -> "COL";        // Màu sắc
            case "Version" -> "VER";      // Phiên bản
            case "StorageCapacity" -> "CAP"; // Dung lượng bộ nhớ
            case "TechSpec" -> "TS";      // Thông số kỹ thuật
            case "Serial" -> "SR";        // Số Serial (rất quan trọng cho máy ảnh)
            case "SerialSold" -> "SRS";   // Serial đã bán

            // Nhóm Giao dịch & Đơn hàng
            case "Order" -> "HD_";          // Hóa đơn
            case "OrderDetail" -> "HDCT_";  // Hóa đơn chi tiết
            case "Cart" -> "GH_";         // Giỏ hàng
            case "CartDetail" -> "GHCT_";   // Giỏ hàng chi tiết
            case "OrderInformation" -> "OI_"; // Thông tin đặt hàng
            case "OrderStatus" -> "TTDH_";   // Trạng thái đơn hàng
            case "ShippingMethods" -> "SHP_"; // Phương thức vận chuyển

            // Nhóm Khuyến mãi & Bảo hành
            case "Voucher" -> "PGG_";      // Phiên bản giảm giá
            case "VoucherDetail" -> "PGGCT_"; // Chi tiết voucher
            case "Discount" -> "DGG_";      // Đợt giảm giá
            case "DiscountDetail" -> "DGGCT_"; // Chi tiết giảm giá
            case "Warranty" -> "BH_";      // Bảo hành
            case "WarrantyHistory" -> "BHH_"; // Lịch sử bảo hành

            // Khác
            case "RefreshToken" -> "RT_";
            default -> "OTH";             // Others
        };

        return prefix + generateCode();
    }


    private String generateCode() {
        String chars = "0123456789";

        // Tạo chuỗi ngẫu nhiên 8 ký tự số
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));

        }
        return sb.toString();

    }
}