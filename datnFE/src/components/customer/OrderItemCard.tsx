import React from "react";
import { Tag, Tooltip } from "antd";
import type { CustomerOrderItemResponse } from "../../models/customerOrder";

interface OrderItemCardProps {
  item: CustomerOrderItemResponse;
  showQuantityPrice?: boolean;
}

const formatPrice = (price: number | null | undefined): string => {
  if (price == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
};

const OrderItemCard: React.FC<OrderItemCardProps> = ({ item, showQuantityPrice = true }) => {
  return (
    <div style={{
      display: "flex",
      gap: 16,
      padding: "16px 0",
      borderBottom: "1px solid #F3F4F6",
    }}>
      {/* Product Image */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid #E5E7EB",
        flexShrink: 0,
        backgroundColor: "#F9FAFB",
      }}>
        {item.productImage ? (
          <img
            src={item.productImage}
            alt={item.productName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}>
            📷
          </div>
        )}
      </div>

      {/* Product Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {item.brandName && (
          <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {item.brandName}
          </div>
        )}
        <div style={{
          fontWeight: 600,
          color: "#111827",
          fontSize: 14,
          marginBottom: 4,
          lineHeight: 1.4,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}>
          {item.productName}
        </div>

        {item.variantLabel && (
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
            {item.variantLabel}
          </div>
        )}

        {showQuantityPrice && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: "#6B7280" }}>
              × {item.quantity}
            </span>
            <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
              {formatPrice(item.unitPrice)}
            </span>
            {item.discountAmount != null && item.discountAmount > 0 && (
              <span style={{ fontSize: 12, color: "#DC2626" }}>
                -{formatPrice(item.discountAmount)}
              </span>
            )}
          </div>
        )}

        {/* Serial numbers (for camera equipment) */}
        {item.serialNumbers && item.serialNumbers.length > 0 && (
          <div style={{ marginTop: 6 }}>
            {item.serialNumbers.map((sn, idx) => (
              <Tooltip key={idx} title={`IMEI/Serial: ${sn}`}>
                <Tag
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    backgroundColor: "#F3F4F6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 4,
                  }}
                >
                  {sn.length > 16 ? sn.slice(0, 16) + "…" : sn}
                </Tag>
              </Tooltip>
            ))}
          </div>
        )}
      </div>

      {/* Line total */}
      {showQuantityPrice && (
        <div style={{
          fontWeight: 700,
          color: "#D32F2F",
          fontSize: 14,
          flexShrink: 0,
          alignSelf: "flex-start",
          marginTop: 2,
        }}>
          {formatPrice(item.totalPrice)}
        </div>
      )}
    </div>
  );
};

export default OrderItemCard;
