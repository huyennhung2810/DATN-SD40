import React from "react";

type StatusType = "order" | "payment";

interface OrderStatusBadgeProps {
  status: string;
  type?: StatusType;
}

const ORDER_STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  CHO_XAC_NHAN: { bg: "#FEF3C7", color: "#92400E", label: "Chờ xác nhận" },
  DA_XAC_NHAN: { bg: "#DBEAFE", color: "#1E40AF", label: "Đã xác nhận" },
  CHO_GIAO: { bg: "#CFFAFE", color: "#155E75", label: "Chờ giao hàng" },
  DANG_GIAO: { bg: "#EDE9FE", color: "#5B21B6", label: "Đang giao hàng" },
  HOAN_THANH: { bg: "#D1FAE5", color: "#065F46", label: "Hoàn thành" },
  DA_HOAN_HANG: { bg: "#F3E8FF", color: "#6D28D9", label: "Hoàn hàng thành công" },
  DA_HUY: { bg: "#FEE2E2", color: "#991B1B", label: "Đã hủy" },
  LUU_TAM: { bg: "#F3F4F6", color: "#374151", label: "Lưu tạm" },
};

const PAYMENT_STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  CHUA_THANH_TOAN: { bg: "#FEF3C7", color: "#92400E", label: "Chưa thanh toán" },
  CHO_THANH_TOAN_VNPAY: { bg: "#DBEAFE", color: "#1E40AF", label: "Chờ thanh toán VNPay" },
  DA_THANH_TOAN: { bg: "#D1FAE5", color: "#065F46", label: "Đã thanh toán" },
  THANH_TOAN_MOT_PHAN: { bg: "#FDE68A", color: "#78350F", label: "Thanh toán một phần" },
  THANH_TOAN_THAT_BAI: { bg: "#FEE2E2", color: "#991B1B", label: "Thanh toán thất bại" },
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, type = "order" }) => {
  const styles = type === "payment"
    ? PAYMENT_STATUS_STYLES[status]
    : ORDER_STATUS_STYLES[status];

  if (!styles) {
    return (
      <span style={{
        backgroundColor: "#F3F4F6",
        color: "#374151",
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        display: "inline-block",
      }}>
        {status}
      </span>
    );
  }

  return (
    <span style={{
      backgroundColor: styles.bg,
      color: styles.color,
      padding: "2px 10px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500,
      display: "inline-block",
    }}>
      {styles.label}
    </span>
  );
};

export default OrderStatusBadge;
