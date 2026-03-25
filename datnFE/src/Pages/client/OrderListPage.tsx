import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Pagination, Tabs, message } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getOrderList } from "../../models/customerOrder";
import type { CustomerOrderListResponse } from "../../models/customerOrder";
import { OrderStatusBadge } from "../../components/customer/OrderStatusBadge";
import OrderEmptyState from "../../components/customer/OrderEmptyState";

dayjs.extend(relativeTime);

const PAGE_SIZE = 8;

const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "CHO_XAC_NHAN", label: "Chờ xác nhận" },
  { key: "DA_XAC_NHAN", label: "Đã xác nhận" },
  { key: "CHO_GIAO", label: "Chờ giao" },
  { key: "DANG_GIAO", label: "Đang giao" },
  { key: "HOAN_THANH", label: "Hoàn thành" },
  { key: "DA_HUY", label: "Đã hủy" },
];

const formatPrice = (price: number | null | undefined): string => {
  if (price == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
};

const OrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<CustomerOrderListResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("all");
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async (status: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrderList(status === "all" ? undefined : status, pageNum, PAGE_SIZE);
      const data = res.data;
      setOrders(data.content ?? []);
      setTotal(data.totalElements ?? 0);
    } catch (err: any) {
      const msg = err?.message ?? err?.data?.message ?? "Không thể tải danh sách đơn hàng";
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(activeStatus, page);
  }, [activeStatus, page]);

  const handleTabChange = (key: string) => {
    setActiveStatus(key);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      paddingTop: 32,
      paddingBottom: 48,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Breadcrumb */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          color: "#9ca3af",
          marginBottom: 24,
        }}>
          <span style={{ cursor: "pointer" }} onClick={() => navigate("/client")}>Trang chủ</span>
          <span>/</span>
          <span style={{ color: "#374151", fontWeight: 500 }}>Đơn mua</span>
        </div>

        {/* Page header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}>
          <ShoppingOutlined style={{ fontSize: 24, color: "#D32F2F" }} />
          <h1 style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#111827",
            margin: 0,
          }}>
            Đơn mua
          </h1>
          {total > 0 && (
            <span style={{
              backgroundColor: "#D32F2F",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              padding: "2px 10px",
              borderRadius: 12,
            }}>
              {total}
            </span>
          )}
        </div>

        {/* Status tabs */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          border: "1px solid #f3f4f6",
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          marginBottom: 24,
        }}>
          <Tabs
            activeKey={activeStatus}
            onChange={handleTabChange}
            tabBarStyle={{
              padding: "0 24px",
              marginBottom: 0,
              borderBottom: "1px solid #f3f4f6",
            }}
            tabBarGutter={0}
            items={STATUS_TABS.map(tab => ({
              key: tab.key,
              label: tab.label,
            }))}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
          }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: 48, color: "#EF4444" }}>
            <p>{error}</p>
            <a onClick={() => loadOrders(activeStatus, page)} style={{ color: "#D32F2F", cursor: "pointer" }}>
              Thử lại
            </a>
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            border: "1px solid #f3f4f6",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}>
            <OrderEmptyState onBrowse={() => navigate("/client/catalog")} />
          </div>
        ) : (
          <>
            {/* Order cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {orders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetail={() => navigate(`/client/orders/${order.id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {total > PAGE_SIZE && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 32,
              }}>
                <Pagination
                  current={page + 1}
                  pageSize={PAGE_SIZE}
                  total={total}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  size="default"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ===== Order Card =====

interface OrderCardProps {
  order: CustomerOrderListResponse;
  onViewDetail: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onViewDetail }) => {
  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: 16,
      border: "1px solid #f3f4f6",
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      transition: "box-shadow 0.2s",
    }}>
      {/* Card Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: "1px solid #f3f4f6",
        backgroundColor: "#fafafa",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 700, color: "#111827", fontSize: 14, fontFamily: "monospace" }}>
            #{order.code}
          </span>
          <span style={{ color: "#d1d5db" }}>|</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            {dayjs(order.createdDate).format("DD/MM/YYYY HH:mm")}
          </span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            ({dayjs(order.createdDate).fromNow()})
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <OrderStatusBadge status={order.orderStatus} type="order" />
          <OrderStatusBadge status={order.paymentStatus} type="payment" />
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: "16px 20px" }}>
        {/* Product previews */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          {order.itemPreviews.map((item, idx) => (
            <div
              key={idx}
              style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                flexShrink: 0,
              }}
            >
              {item.productImage ? (
                <img
                  src={item.productImage}
                  alt={item.productName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}>
                  📷
                </div>
              )}
            </div>
          ))}
          {order.itemCount > order.itemPreviews.length && (
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 8,
              border: "2px dashed #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "#9ca3af",
              fontWeight: 600,
            }}>
              +{order.itemCount - order.itemPreviews.length}
            </div>
          )}
        </div>

        {/* Product names */}
        <div style={{ marginBottom: 12 }}>
          {order.itemPreviews.slice(0, 3).map((item, idx) => (
            <div key={idx} style={{
              fontSize: 13,
              color: "#374151",
              marginBottom: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {item.quantity > 1 && (
                <span style={{ fontWeight: 600, color: "#6b7280", marginRight: 4 }}>
                  {item.quantity}×
                </span>
              )}
              {item.productName}
              {item.variantLabel && (
                <span style={{ color: "#9ca3af" }}> — {item.variantLabel}</span>
              )}
            </div>
          ))}
          {order.itemCount > order.itemPreviews.length && (
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              và {order.itemCount - order.itemPreviews.length} sản phẩm khác
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12,
          paddingTop: 12,
          borderTop: "1px solid #f3f4f6",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {order.voucherCode && (
              <span style={{
                fontSize: 12,
                color: "#DC2626",
                backgroundColor: "#FEF2F2",
                padding: "2px 8px",
                borderRadius: 4,
                fontWeight: 500,
              }}>
                Mã: {order.voucherCode}
              </span>
            )}
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              {order.paymentMethodLabel}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>
                Tổng cộng
              </div>
              <div style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#D32F2F",
              }}>
                {formatPrice(order.totalAfterDiscount)}
              </div>
            </div>
            <button
              onClick={onViewDetail}
              style={{
                backgroundColor: "#D32F2F",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#B71C1C"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#D32F2F"; }}
            >
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderListPage;
