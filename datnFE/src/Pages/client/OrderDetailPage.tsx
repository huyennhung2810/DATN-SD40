import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Button, Modal, Input, Popconfirm, message, Divider } from "antd";
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ShoppingCartOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getOrderDetail, cancelOrder, confirmReceived, buyAgain } from "../../models/customerOrder";
import type { CustomerOrderDetailResponse } from "../../models/customerOrder";
import { OrderStatusBadge } from "../../components/customer/OrderStatusBadge";
import OrderItemCard from "../../components/customer/OrderItemCard";
import OrderTimeline from "../../components/customer/OrderTimeline";

const formatPrice = (price: number | null | undefined): string => {
  if (price == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<CustomerOrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [buyAgainModal, setBuyAgainModal] = useState<{
    open: boolean;
    added: string[];
    unavailable: string[];
    cartCount: number;
  }>({ open: false, added: [], unavailable: [], cartCount: 0 });

  const loadOrder = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getOrderDetail(id);
      setOrder(res.data);
    } catch (err: any) {
      const msg = err?.message ?? err?.data?.message ?? "Không thể tải chi tiết đơn hàng";
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrder(); }, [id]);

  const handleCancel = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await cancelOrder(id, cancelReason || undefined);
      message.success("Đơn hàng đã được hủy thành công");
      setCancelModalOpen(false);
      setCancelReason("");
      loadOrder();
    } catch (err: any) {
      message.error(err?.data?.message ?? err?.message ?? "Hủy đơn hàng thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReceived = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await confirmReceived(id);
      message.success("Xác nhận đã nhận hàng thành công! Cảm ơn bạn đã mua sắm.");
      loadOrder();
    } catch (err: any) {
      message.error(err?.data?.message ?? err?.message ?? "Xác nhận thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyAgain = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await buyAgain(id);
      const data = res.data;
      setBuyAgainModal({
        open: true,
        added: data.addedProducts ?? [],
        unavailable: data.unavailableProducts ?? [],
        cartCount: data.cartItemCount ?? 0,
      });
      if ((data.addedProducts ?? []).length > 0) {
        message.success(`Đã thêm ${data.addedProducts.length} sản phẩm vào giỏ hàng`);
      }
      loadOrder();
    } catch (err: any) {
      message.error(err?.data?.message ?? err?.message ?? "Mua lại thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <p style={{ color: "#EF4444", marginBottom: 16 }}>{error ?? "Không tìm thấy đơn hàng"}</p>
        <Button onClick={loadOrder}>Thử lại</Button>
        <Button type="link" onClick={() => navigate("/client/orders")} style={{ marginTop: 8 }}>
          ← Quay lại danh sách
        </Button>
      </div>
    );
  }

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
          <span style={{ cursor: "pointer" }} onClick={() => navigate("/client/orders")}>Đơn mua</span>
          <span>/</span>
          <span style={{ color: "#374151", fontWeight: 500 }}>#{order.code}</span>
        </div>

        {/* Page header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/client/orders")}
            style={{ border: "none", boxShadow: "none", fontSize: 16 }}
          />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>
            Chi tiết đơn hàng #{order.code}
          </h1>
          <OrderStatusBadge status={order.orderStatus} type="order" />
          <OrderStatusBadge status={order.paymentStatus} type="payment" />
        </div>

        {/* Meta row */}
        <div style={{
          display: "flex",
          gap: 24,
          marginBottom: 24,
          fontSize: 13,
          color: "#6b7280",
        }}>
          <span>Ngày đặt: <strong style={{ color: "#374151" }}>{dayjs(order.createdDate).format("DD/MM/YYYY HH:mm")}</strong></span>
          {order.paymentDate && (
            <span>Thanh toán: <strong style={{ color: "#065F46" }}>{dayjs(order.paymentDate).format("DD/MM/YYYY HH:mm")}</strong></span>
          )}
          <span>Phương thức: <strong style={{ color: "#374151" }}>{order.paymentMethodLabel}</strong></span>
        </div>

        {/* Main layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 24,
          alignItems: "flex-start",
        }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Items card */}
            <div style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              border: "1px solid #f3f4f6",
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f3f4f6",
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>
                  Sản phẩm đã đặt
                  <span style={{ fontWeight: 400, fontSize: 13, color: "#9ca3af", marginLeft: 8 }}>
                    ({order.items?.length ?? 0} sản phẩm)
                  </span>
                </h2>
              </div>
              <div style={{ padding: "0 24px" }}>
                {(order.items ?? []).length === 0 ? (
                  <p style={{ textAlign: "center", color: "#9ca3af", padding: "24px 0" }}>Không có sản phẩm</p>
                ) : (
                  order.items?.map(item => (
                    <OrderItemCard key={item.id} item={item} />
                  ))
                )}
              </div>
            </div>

            {/* Timeline card */}
            <div style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              border: "1px solid #f3f4f6",
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f3f4f6",
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>
                  Theo dõi đơn hàng
                </h2>
              </div>
              <div style={{ padding: "20px 24px" }}>
                <OrderTimeline timeline={order.timeline ?? []} />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Recipient & Address */}
            <div style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              border: "1px solid #f3f4f6",
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f3f4f6",
              }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>
                  Thông tin giao hàng
                </h2>
              </div>
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 2 }}>Người nhận</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                    {order.recipientName ?? "—"}
                  </div>
                </div>
                {order.recipientPhone && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
                    <PhoneOutlined style={{ color: "#9ca3af", fontSize: 12 }} />
                    {order.recipientPhone}
                  </div>
                )}
                {order.recipientEmail && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
                    <MailOutlined style={{ color: "#9ca3af", fontSize: 12 }} />
                    {order.recipientEmail}
                  </div>
                )}
                {order.recipientAddress && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 13, color: "#374151" }}>
                    <EnvironmentOutlined style={{ color: "#9ca3af", fontSize: 12, marginTop: 2 }} />
                    <span>{order.recipientAddress}</span>
                  </div>
                )}
                {order.note && (
                  <div style={{
                    marginTop: 4,
                    padding: "8px 12px",
                    backgroundColor: "#FEF9C3",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#713F12",
                  }}>
                    <strong>Ghi chú:</strong> {order.note}
                  </div>
                )}
              </div>
            </div>

            {/* Payment summary */}
            <div style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              border: "1px solid #f3f4f6",
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f3f4f6",
              }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>
                  Thanh toán
                </h2>
              </div>
              <div style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#6b7280" }}>Tạm tính</span>
                    <span style={{ color: "#374151", fontWeight: 500 }}>{formatPrice(order.totalAmount)}</span>
                  </div>
                  {order.voucherDiscount != null && order.voucherDiscount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#6b7280" }}>Giảm giá{order.voucherCode ? ` (${order.voucherCode})` : ""}</span>
                      <span style={{ color: "#DC2626", fontWeight: 600 }}>
                        -{formatPrice(order.voucherDiscount)}
                      </span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#6b7280" }}>Phí vận chuyển</span>
                    <span style={{ color: "#374151", fontWeight: 500 }}>{formatPrice(order.shippingFee)}</span>
                  </div>
                  {order.customerPaid != null && order.customerPaid > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#6b7280" }}>Đã thanh toán</span>
                      <span style={{ color: "#065F46", fontWeight: 600 }}>{formatPrice(order.customerPaid)}</span>
                    </div>
                  )}
                  <Divider style={{ margin: "4px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>Thành tiền</span>
                    <span style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#D32F2F",
                    }}>
                      {formatPrice(order.totalAfterDiscount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {(order.canCancel || order.canConfirmReceived || order.canBuyAgain) && (
              <div style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                border: "1px solid #f3f4f6",
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}>
                <div style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #f3f4f6",
                }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>
                    Thao tác
                  </h2>
                </div>
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {order.canConfirmReceived && (
                    <Popconfirm
                      title="Xác nhận đã nhận hàng?"
                      description="Bạn đã nhận được đầy đủ sản phẩm trong đơn hàng này chứ?"
                      onConfirm={handleConfirmReceived}
                      okText="Đã nhận hàng"
                      cancelText="Chưa"
                      okButtonProps={{ danger: false, style: { backgroundColor: "#059669", borderColor: "#059669" } }}
                    >
                      <Button
                        block
                        size="large"
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        loading={actionLoading}
                        style={{
                          backgroundColor: "#059669",
                          borderColor: "#059669",
                          fontWeight: 600,
                          height: 44,
                          borderRadius: 10,
                        }}
                      >
                        Xác nhận đã nhận hàng
                      </Button>
                    </Popconfirm>
                  )}
                  {order.canCancel && (
                    <Button
                      block
                      size="large"
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() => setCancelModalOpen(true)}
                      style={{
                        fontWeight: 600,
                        height: 44,
                        borderRadius: 10,
                      }}
                    >
                      Hủy đơn hàng
                    </Button>
                  )}
                  {order.canBuyAgain && (
                    <Button
                      block
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      onClick={handleBuyAgain}
                      loading={actionLoading}
                      style={{
                        borderColor: "#D32F2F",
                        color: "#D32F2F",
                        fontWeight: 600,
                        height: 44,
                        borderRadius: 10,
                      }}
                    >
                      Mua lại
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        title={<span style={{ fontWeight: 700 }}>Hủy đơn hàng</span>}
        open={cancelModalOpen}
        onCancel={() => { setCancelModalOpen(false); setCancelReason(""); }}
        footer={null}
        width={480}
      >
        <div style={{ marginTop: 16 }}>
          <p style={{ color: "#374151", marginBottom: 12, fontSize: 14 }}>
            Bạn có chắc chắn muốn hủy đơn hàng <strong>#{order.code}</strong> không?
          </p>
          <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 16 }}>
            <WarningOutlined style={{ marginRight: 6 }} />
            Đơn hàng đã thanh toán sẽ được hoàn tiền trong thời gian sớm nhất.
          </p>
          <Input.TextArea
            rows={3}
            placeholder="Lý do hủy đơn (không bắt buộc)"
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            maxLength={300}
            showCount
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <Button onClick={() => { setCancelModalOpen(false); setCancelReason(""); }}>
              Không hủy
            </Button>
            <Button
              danger
              type="primary"
              loading={actionLoading}
              onClick={handleCancel}
              style={{ minWidth: 100 }}
            >
              Xác nhận hủy
            </Button>
          </div>
        </div>
      </Modal>

      {/* Buy Again Result Modal */}
      <Modal
        title={<span style={{ fontWeight: 700 }}>Kết quả mua lại</span>}
        open={buyAgainModal.open}
        onCancel={() => setBuyAgainModal(prev => ({ ...prev, open: false }))}
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button onClick={() => setBuyAgainModal(prev => ({ ...prev, open: false }))}>
              Đóng
            </Button>
            <Button
              type="primary"
              style={{ backgroundColor: "#D32F2F", borderColor: "#D32F2F" }}
              onClick={() => {
                setBuyAgainModal(prev => ({ ...prev, open: false }));
                navigate("/client/cart");
              }}
            >
              Xem giỏ hàng ({buyAgainModal.cartCount})
            </Button>
          </div>
        }
        width={500}
      >
        <div style={{ marginTop: 12 }}>
          {buyAgainModal.added.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 600,
                color: "#065F46",
                marginBottom: 8,
              }}>
                <CheckCircleOutlined style={{ color: "#059669" }} />
                Đã thêm vào giỏ ({buyAgainModal.added.length}):
              </div>
              {buyAgainModal.added.map((p, i) => (
                <div key={i} style={{ fontSize: 13, color: "#374151", paddingLeft: 22 }}>
                  • {p}
                </div>
              ))}
            </div>
          )}
          {buyAgainModal.unavailable.length > 0 && (
            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 600,
                color: "#92400E",
                marginBottom: 8,
              }}>
                <WarningOutlined style={{ color: "#D97706" }} />
                Không thể thêm ({buyAgainModal.unavailable.length}):
              </div>
              {buyAgainModal.unavailable.map((p, i) => (
                <div key={i} style={{ fontSize: 13, color: "#6B7280", paddingLeft: 22 }}>
                  • {p}
                </div>
              ))}
            </div>
          )}
          {buyAgainModal.added.length === 0 && buyAgainModal.unavailable.length === 0 && (
            <p style={{ color: "#6B7280", textAlign: "center" }}>Không có sản phẩm nào có thể thêm.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetailPage;
