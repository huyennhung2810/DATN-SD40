package com.example.datn.infrastructure.shipping;

import com.example.datn.entity.Order;
import com.example.datn.entity.ShippingMethods;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Factory để lấy adapter phù hợp với đơn vị vận chuyển được gán với đơn hàng.
 * Đăng ký các ShippingProviderAdapter bằng Spring.
 */
@Component
@Slf4j
public class ShippingProviderFactory {

    private final ShippingProviderAdapter defaultAdapter;

    public ShippingProviderFactory(java.util.List<ShippingProviderAdapter> adapters) {
        this.defaultAdapter = adapters.stream()
                .filter(ShippingProviderAdapter::isAvailable)
                .findFirst()
                .orElse(new FallbackShippingAdapter());
        log.info("Shipping provider mặc định: {}", defaultAdapter.getProviderName());
    }

    /**
     * Lấy adapter phù hợp dựa trên phương thức vận chuyển của đơn hàng.
     * Nếu không tìm thấy adapter cho provider cụ thể, trả về adapter mặc định.
     */
    public ShippingProviderAdapter getAdapter(Order order) {
        if (order == null || order.getShippingMethod() == null) {
            return defaultAdapter;
        }
        return getAdapterByMethod(order.getShippingMethod());
    }

    /**
     * Lấy adapter dựa trên đối tượng ShippingMethods.
     * Thẻm triển khai logic map provider code với adapter cụ thể.
     */
    public ShippingProviderAdapter getAdapterByMethod(ShippingMethods method) {
        String providerCode = method.getCode();
        String providerName = method.getName();

        // Map provider code/name với adapter tương ứng
        // GHN (Giao hàng nhanh)
        if (providerCode != null && providerCode.equalsIgnoreCase("GHN")
                || providerName != null && providerName.toUpperCase().contains("GHN")) {
            return findAdapter("GHN");
        }
        // GHTK (Giao hàng tiết kiệm)
        if (providerCode != null && providerCode.equalsIgnoreCase("GHTK")
                || providerName != null && providerName.toUpperCase().contains("GHTK")) {
            return findAdapter("GHTK");
        }
        // VNPost
        if (providerCode != null && providerCode.equalsIgnoreCase("VNPOST")
                || providerName != null && providerName.toUpperCase().contains("VNPOST")) {
            return findAdapter("VNPOST");
        }

        return defaultAdapter;
    }

    private ShippingProviderAdapter findAdapter(String providerName) {
        return defaultAdapter; // Placeholder - implement injection strategy
    }

    /**
     * Fallback adapter khi không tìm thấy provider cụ thể.
     * Ghi log và trả về kết quả mock để không ảnh hưởng luồng nghiệp vụ.
     */
    private static class FallbackShippingAdapter implements ShippingProviderAdapter {
        @Override
        public String getProviderName() {
            return "FALLBACK";
        }

        @Override
        public ShippingResult createShipment(Order order) {
            log.warn("Không tìm thấy adapter cho shipping provider. Đơn hàng: {}",
                    order != null ? order.getCode() : "null");
            return ShippingResult.failure("Chưa hỗ trợ đơn vị vận chuyển này");
        }

        @Override
        public ShippingResult updateShipmentInfo(Order order) {
            log.warn("Không tìm thấy adapter cho shipping provider update. Đơn hàng: {}",
                    order != null ? order.getCode() : "null");
            return ShippingResult.failure("Chưa hỗ trợ đơn vị vận chuyển này");
        }

        @Override
        public ShippingResult cancelShipment(Order order) {
            log.warn("Không tìm thấy adapter cho shipping provider cancel. Đơn hàng: {}",
                    order != null ? order.getCode() : "null");
            return ShippingResult.failure("Chưa hỗ trợ đơn vị vận chuyển này");
        }

        @Override
        public ShipmentStatus getShipmentStatus(String trackingNumber) {
            return new ShipmentStatus(trackingNumber, "UNKNOWN", "Không xác định được trạng thái", null, null);
        }

        @Override
        public boolean isAvailable() {
            return false;
        }
    }
}
