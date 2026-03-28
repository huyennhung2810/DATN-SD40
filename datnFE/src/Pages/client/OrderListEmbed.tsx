import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Pagination, Empty, message } from "antd";
import dayjs from "dayjs";
import { getOrderList } from "../../models/customerOrder";
import type { CustomerOrderListResponse } from "../../models/customerOrder";

const PAGE_SIZE = 8;

const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "CHO_XAC_NHAN", label: "Chờ xác nhận" },
  { key: "DA_XAC_NHAN", label: "Đã xác nhận" },
  { key: "CHO_GIAO", label: "Chờ giao hàng" },
  { key: "DANG_GIAO", label: "Đang giao hàng" },
  { key: "GIAO_HANG_KHONG_THANH_CONG", label: "Giao hàng không thành công" },
  { key: "HOAN_THANH", label: "Hoàn thành" },
  { key: "DA_HUY", label: "Đã hủy" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  CHO_XAC_NHAN: { bg: "#FEF3C7", text: "#D97706" },
  DA_XAC_NHAN: { bg: "#DBEAFE", text: "#2563EB" },
  CHO_GIAO: { bg: "#EDE9FE", text: "#6D28D9" },
  DANG_GIAO: { bg: "#E0F2FE", text: "#0284C7" },
  GIAO_HANG_KHONG_THANH_CONG: { bg: "#FFF1F0", text: "#D4380D" },
  HOAN_THANH: { bg: "#DCFCE7", text: "#15803D" },
  DA_HUY: { bg: "#FEE2E2", text: "#DC2626" },
};

const formatPrice = (p: number | null | undefined) =>
  p == null
    ? "—"
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(p);

interface Props {
  onViewDetail?: (id: string) => void;
}

const OrderListEmbed: React.FC<Props> = ({ onViewDetail }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<CustomerOrderListResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("all");

  const load = async (status: string, p: number) => {
    setLoading(true);
    try {
      const res = await getOrderList(
        status === "all" ? undefined : status,
        p,
        PAGE_SIZE,
      );
      setOrders(res.data.content ?? []);
      setTotal(res.data.totalElements ?? 0);
    } catch {
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(activeStatus, page);
  }, [activeStatus, page]);

  const handleTabChange = (key: string) => {
    setActiveStatus(key);
    setPage(0);
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #f0f0f0",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid #f3f4f6",
          background: "linear-gradient(90deg,#fff 70%,#fff8f8 100%)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 4,
            height: 22,
            borderRadius: 4,
            background: "#D32F2F",
            flexShrink: 0,
          }}
        />
        <h2
          style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}
        >
          Đơn hàng của bạn
        </h2>
        {total > 0 && (
          <span
            style={{
              background: "#D32F2F",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "1px 8px",
              borderRadius: 10,
            }}
          >
            {total}
          </span>
        )}
      </div>

      {/* Status tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid #f3f4f6",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            style={{
              padding: "11px 16px",
              fontSize: 13,
              fontWeight: activeStatus === tab.key ? 600 : 400,
              color: activeStatus === tab.key ? "#D32F2F" : "#6b7280",
              background: "none",
              border: "none",
              borderBottom:
                activeStatus === tab.key
                  ? "2px solid #D32F2F"
                  : "2px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "60px 0",
          }}
        >
          <Spin size="large" />
        </div>
      ) : orders.length === 0 ? (
        <div style={{ padding: "48px 0" }}>
          <Empty description="Không có đơn hàng nào" />
        </div>
      ) : (
        <>
          <div>
            {orders.map((order, idx) => {
              const first = order.itemPreviews[0];
              const color = STATUS_COLORS[order.orderStatus] ?? {
                bg: "#f3f4f6",
                text: "#6b7280",
              };
              return (
                <div
                  key={order.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 24px",
                    borderBottom:
                      idx < orders.length - 1 ? "1px solid #f3f4f6" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fafafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 10,
                      overflow: "hidden",
                      border: "1px solid #e5e7eb",
                      flexShrink: 0,
                      background: "#f9fafb",
                    }}
                  >
                    {first?.productImage ? (
                      <img
                        src={first.productImage}
                        alt={first.productName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 24,
                          color: "#d1d5db",
                        }}
                      >
                        📷
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: "#111827",
                          fontFamily: "monospace",
                          fontSize: 13,
                        }}
                      >
                        {order.code}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: color.bg,
                          color: color.text,
                        }}
                      >
                        {order.orderStatusLabel}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#374151",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: 3,
                      }}
                    >
                      {first
                        ? `${first.productName}${first.variantLabel ? ` • ${first.variantLabel}` : ""}`
                        : "—"}
                      {order.itemCount > 1 && (
                        <span style={{ color: "#9ca3af" }}>
                          {" "}
                          +{order.itemCount - 1} sản phẩm khác
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>
                      {dayjs(order.createdDate).format("DD/MM/YYYY")}
                    </div>
                  </div>

                  {/* Price + Action */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        color: "#D32F2F",
                        fontSize: 15,
                      }}
                    >
                      {formatPrice(order.totalAfterDiscount)}
                    </span>
                    <button
                      onClick={() =>
                        onViewDetail
                          ? onViewDetail(String(order.id))
                          : navigate(`/client/orders/${order.id}`)
                      }
                      style={{
                        background: "#D32F2F",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "5px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        ((
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "#B71C1C")
                      }
                      onMouseLeave={(e) =>
                        ((
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "#D32F2F")
                      }
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "16px 24px",
                borderTop: "1px solid #f3f4f6",
              }}
            >
              <Pagination
                current={page + 1}
                pageSize={PAGE_SIZE}
                total={total}
                onChange={(p) => setPage(p - 1)}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderListEmbed;
