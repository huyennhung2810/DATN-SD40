package com.example.datn.infrastructure.shipping;

import com.example.datn.entity.Order;

/**
 * Interface cho việc tích hợp với các đơn vị vận chuyển (GHN, GHTK, VNPost, ...).
 * Implement interface này để tạo adapter cho từng shipping provider cụ thể.
 */
public interface ShippingProviderAdapter {

    /**
     * Tên provider (ví dụ: "GHN", "GHTK", "VNPOST").
     */
    String getProviderName();

    /**
     * Tạo vận đơn mới với đơn vị vận chuyển.
     *
     * @param order Đơn hàng cần tạo vận đơn
     * @return Mã vận đơn (tracking number)
     */
    ShippingResult createShipment(Order order);

    /**
     * Cập nhật thông tin giao hàng (địa chỉ, số điện thoại, tên người nhận)
     * cho vận đơn đang có.
     *
     * @param order Đơn hàng đã có vận đơn
     * @return Kết quả cập nhật
     */
    ShippingResult updateShipmentInfo(Order order);

    /**
     * Hủy vận đơn hiện tại.
     *
     * @param order Đơn hàng cần hủy vận đơn
     * @return Kết quả hủy
     */
    ShippingResult cancelShipment(Order order);

    /**
     * Lấy trạng thái vận đơn từ đơn vị vận chuyển.
     *
     * @param trackingNumber Mã vận đơn
     * @return Trạng thái vận đơn
     */
    ShipmentStatus getShipmentStatus(String trackingNumber);

    /**
     * Kiểm tra provider có đang hoạt động không.
     */
    boolean isAvailable();

    /**
     * Kết quả trả về từ các thao tác với shipping provider.
     */
    record ShippingResult(
            boolean success,
            String trackingNumber,
            String message,
            String providerReference
    ) {
        public static ShippingResult success(String trackingNumber, String message) {
            return new ShippingResult(true, trackingNumber, message, null);
        }

        public static ShippingResult success(String trackingNumber, String message, String providerRef) {
            return new ShippingResult(true, trackingNumber, message, providerRef);
        }

        public static ShippingResult failure(String message) {
            return new ShippingResult(false, null, message, null);
        }
    }

    /**
     * Trạng thái vận đơn.
     */
    record ShipmentStatus(
            String trackingNumber,
            String status,
            String description,
            String estimatedDelivery,
            String currentLocation
    ) {}
}
