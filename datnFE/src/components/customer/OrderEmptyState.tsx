import React from "react";
import { Button } from "antd";

interface OrderEmptyStateProps {
  onBrowse?: () => void;
}

const OrderEmptyState: React.FC<OrderEmptyStateProps> = ({ onBrowse }) => {
  return (
    <div style={{
      textAlign: "center",
      padding: "64px 32px",
    }}>
      {/* Illustration */}
      <div style={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        backgroundColor: "#FEF2F2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 24px",
        fontSize: 48,
      }}>
        📦
      </div>

      <h3 style={{
        fontSize: 18,
        fontWeight: 700,
        color: "#111827",
        marginBottom: 8,
      }}>
        Bạn chưa có đơn hàng nào
      </h3>

      <p style={{
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 32,
        maxWidth: 320,
        margin: "0 auto 32px",
        lineHeight: 1.6,
      }}>
        Hãy khám phá các sản phẩm máy ảnh chất lượng của Hikari Camera và đặt hàng ngay hôm nay!
      </p>

      {onBrowse && (
        <Button
          type="primary"
          size="large"
          onClick={onBrowse}
          style={{
            backgroundColor: "#D32F2F",
            borderColor: "#D32F2F",
            fontWeight: 600,
            height: 44,
            paddingInline: 32,
            borderRadius: 8,
          }}
        >
          Khám phá sản phẩm
        </Button>
      )}
    </div>
  );
};

export default OrderEmptyState;
