import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Spin,
  Button,
  Modal,
  Input,
  Popconfirm,
  message,
  Steps,
  Tag,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ShoppingCartOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CheckOutlined,
  ShopOutlined,
  GlobalOutlined,
  CarOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getOrderDetail,
  cancelOrder,
  confirmReceived,
  buyAgain,
  updateShippingInfo,
  type UpdateShippingInfoRequest,
} from "../../models/customerOrder";
import type { CustomerOrderDetailResponse } from "../../models/customerOrder";

interface Props {
  orderId: string;
  onBack: () => void;
}

const { Text } = Typography;

const toNum = (v: unknown): number => {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const formatPrice = (price: number | null | undefined): string => {
  if (price == null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const STEPS_DEF = [
  { status: "CHO_XAC_NHAN", label: "Chờ xác nhận" },
  { status: "DA_XAC_NHAN", label: "Đã xác nhận" },
  { status: "CHO_GIAO", label: "Chờ giao hàng" },
  { status: "DANG_GIAO", label: "Đang giao hàng" },
  { status: "GIAO_HANG_KHONG_THANH_CONG", label: "Giao hàng không thành công" },
  { status: "HOAN_THANH", label: "Hoàn thành" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  CHO_XAC_NHAN: { bg: "#FEF3C7", text: "#D97706" },
  DA_XAC_NHAN: { bg: "#DBEAFE", text: "#2563EB" },
  CHO_GIAO: { bg: "#EDE9FE", text: "#6D28D9" },
  DANG_GIAO: { bg: "#E0F2FE", text: "#0284C7" },
  HOAN_THANH: { bg: "#DCFCE7", text: "#15803D" },
  DA_HUY: { bg: "#FEE2E2", text: "#DC2626" },
};

const OrderDetailEmbed: React.FC<Props> = ({ orderId, onBack }) => {
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

  const [shippingEditOpen, setShippingEditOpen] = useState(false);
  const [shippingEditForm, setShippingEditForm] = useState<UpdateShippingInfoRequest>({});
  const [shippingEditLoading, setShippingEditLoading] = useState(false);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrderDetail(orderId);
      setOrder(res.data);
    } catch (err: any) {
      const msg =
        err?.message ?? err?.data?.message ?? "Không thể tải chi tiết đơn hàng";
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      message.warning("Vui lòng nhập lý do hủy đơn hàng.");
      return;
    }
    setActionLoading(true);
    try {
      await cancelOrder(orderId, cancelReason);
      message.success("Đơn hàng đã được hủy thành công");
      setCancelModalOpen(false);
      setCancelReason("");
      loadOrder();
    } catch (err: any) {
      message.error(
        err?.data?.message ?? err?.message ?? "Hủy đơn hàng thất bại",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReceived = async () => {
    setActionLoading(true);
    try {
      await confirmReceived(orderId);
      message.success(
        "Xác nhận đã nhận hàng thành công! Cảm ơn bạn đã mua sắm.",
      );
      loadOrder();
    } catch (err: any) {
      message.error(err?.data?.message ?? err?.message ?? "Xác nhận thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyAgain = async () => {
    setActionLoading(true);
    try {
      const res = await buyAgain(orderId);
      const data = res.data;
      setBuyAgainModal({
        open: true,
        added: data.addedProducts ?? [],
        unavailable: data.unavailableProducts ?? [],
        cartCount: data.cartItemCount ?? 0,
      });
      if ((data.addedProducts ?? []).length > 0) {
        message.success(
          `Đã thêm ${data.addedProducts.length} sản phẩm vào giỏ hàng`,
        );
      }
      loadOrder();
    } catch (err: any) {
      message.error(err?.data?.message ?? err?.message ?? "Mua lại thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenShippingEdit = () => {
    setShippingEditForm({
      receiverName: order.recipientName ?? "",
      receiverPhone: order.recipientPhone ?? "",
      shippingAddress: order.recipientAddress ?? "",
    });
    setShippingEditOpen(true);
  };

  const handleSaveShippingEdit = async () => {
    if (!shippingEditForm.receiverName?.trim()) {
      message.warning("Vui lòng nhập tên người nhận");
      return;
    }
    if (!shippingEditForm.receiverPhone?.trim()) {
      message.warning("Vui lòng nhập số điện thoại người nhận");
      return;
    }
    if (!shippingEditForm.shippingAddress?.trim()) {
      message.warning("Vui lòng nhập địa chỉ giao hàng");
      return;
    }
    setShippingEditLoading(true);
    try {
      await updateShippingInfo(orderId, shippingEditForm);
      message.success("Cập nhật thông tin giao hàng thành công");
      setShippingEditOpen(false);
      loadOrder();
    } catch (err: any) {
      message.error(err?.data?.message ?? err?.message ?? "Cập nhật thất bại");
    } finally {
      setShippingEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 0",
        }}
      >
        <p style={{ color: "#EF4444", marginBottom: 16 }}>
          {error ?? "Không tìm thấy đơn hàng"}
        </p>
        <Button onClick={loadOrder}>Thử lại</Button>
        <Button type="link" onClick={onBack} style={{ marginTop: 8 }}>
          ← Quay lại
        </Button>
      </div>
    );
  }

  const isCancelled = order.orderStatus === "DA_HUY";
  const isPOS = order.orderType === "OFFLINE";
  const isDelivery =
    order.orderType === "GIAO_HANG" || order.orderType === "ONLINE";
  const currentStepIndex = isCancelled
    ? -1
    : STEPS_DEF.findIndex((s) => s.status === order.orderStatus);

  const timelineMap: Record<string, string | null> = {};
  (order.timeline ?? []).forEach((t) => {
    timelineMap[t.status] = t.timestamp ?? null;
  });

  const statusColor = STATUS_COLORS[order.orderStatus] ?? {
    bg: "#f3f4f6",
    text: "#6b7280",
  };

  const promotionFromItems = (order.items ?? []).reduce(
    (s, i) => s + toNum(i.discountAmount),
    0,
  );
  const campaignTotal = Math.max(
    toNum(order.campaignDiscount),
    promotionFromItems,
  );
  const originalSubtotalDisplay =
    order.originalSubtotal != null
      ? toNum(order.originalSubtotal)
      : toNum(order.totalAmount) + campaignTotal;
  const voucherTotal = toNum(order.voucherDiscount);

  return (
    <div>
      {/* ===== MAIN CARD ===== */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          overflow: "hidden",
        }}
      >
        {/* Card header */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              size="small"
              style={{ border: "1px solid #e5e7eb", borderRadius: 8 }}
            />
            <div>
              <h1
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#111827",
                  margin: 0,
                }}
              >
                Đơn hàng {order.code}
              </h1>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                {dayjs(order.createdDate).format("DD/MM/YYYY HH:mm")}
                {order.paymentMethodLabel && (
                  <span style={{ marginLeft: 8 }}>
                    • {order.paymentMethodLabel}
                  </span>
                )}
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 6,
                background: statusColor.bg,
                color: statusColor.text,
              }}
            >
              {order.orderStatusLabel}
            </span>
            {isPOS && (
              <Tag
                icon={<ShopOutlined />}
                color="purple"
                style={{ borderRadius: 6 }}
              >
                Tại quầy
              </Tag>
            )}
            {order.orderType === "ONLINE" && (
              <Tag
                icon={<GlobalOutlined />}
                color="blue"
                style={{ borderRadius: 6 }}
              >
                Online
              </Tag>
            )}
            {order.orderType === "GIAO_HANG" && (
              <Tag
                icon={<CarOutlined />}
                color="cyan"
                style={{ borderRadius: 6 }}
              >
                Giao hàng
              </Tag>
            )}
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#D32F2F" }}>
            {formatPrice(order.totalAfterDiscount)}
          </span>
        </div>

        {/* ===== STATUS STEPPER ===== */}
        <div
          style={{
            padding: "28px 28px 24px",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#374151",
              marginBottom: 20,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Trạng thái đơn hàng
          </p>
          {isCancelled ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                background: "#FEF2F2",
                borderRadius: 10,
                border: "1px solid #FECACA",
              }}
            >
              <CloseCircleOutlined style={{ fontSize: 20, color: "#DC2626" }} />
              <div>
                <p style={{ fontWeight: 700, color: "#DC2626", margin: 0 }}>
                  Đơn hàng đã bị hủy
                </p>
                {timelineMap["DA_HUY"] && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                      margin: "2px 0 0",
                    }}
                  >
                    {dayjs(timelineMap["DA_HUY"]).format("DD/MM/YYYY HH:mm")}
                  </p>
                )}
              </div>
            </div>
          ) : order.orderStatus === "GIAO_HANG_KHONG_THANH_CONG" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                background: "#FEF2F2",
                borderRadius: 10,
                border: "1px solid #FECACA",
              }}
            >
              <WarningOutlined style={{ fontSize: 20, color: "#D97706" }} />
              <div>
                <p style={{ fontWeight: 700, color: "#D97706", margin: 0 }}>
                  Giao hàng không thành công
                </p>
                {timelineMap["GIAO_HANG_KHONG_THANH_CONG"] && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                      margin: "2px 0 0",
                    }}
                  >
                    {dayjs(timelineMap["GIAO_HANG_KHONG_THANH_CONG"]).format(
                      "DD/MM/YYYY HH:mm",
                    )}
                  </p>
                )}
                <p
                  style={{
                    fontSize: 13,
                    color: "#92400E",
                    margin: 0,
                    marginTop: 4,
                  }}
                >
                  Đơn hàng của bạn đã được giao nhưng không thành công. Vui lòng
                  liên hệ CSKH để được hỗ trợ.
                </p>
              </div>
            </div>
          ) : isPOS ? (
            /* POS order — no stepper, just show completion status */
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                background: "#F0FDF4",
                borderRadius: 10,
                border: "1px solid #BBF7D0",
              }}
            >
              <ShopOutlined style={{ fontSize: 22, color: "#15803D" }} />
              <div>
                <p style={{ fontWeight: 700, color: "#15803D", margin: 0 }}>
                  Giao dịch tại quầy — {order.orderStatusLabel}
                </p>
                {order.paymentDate && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                      margin: "2px 0 0",
                    }}
                  >
                    Thanh toán:{" "}
                    {dayjs(order.paymentDate).format("DD/MM/YYYY HH:mm")}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <Steps
              current={
                currentStepIndex >= 0 ? currentStepIndex : STEPS_DEF.length - 1
              }
              size="small"
              items={STEPS_DEF.map((step, idx) => {
                const ts = timelineMap[step.status];
                const done =
                  idx <=
                  (currentStepIndex >= 0
                    ? currentStepIndex
                    : STEPS_DEF.length - 1);
                return {
                  title: (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: done ? 600 : 400,
                        color: done ? "#111827" : "#9ca3af",
                      }}
                    >
                      {step.label}
                    </span>
                  ),
                  subTitle: ts ? (
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>
                      {dayjs(ts).format("DD/MM/YYYY")}
                    </span>
                  ) : undefined,
                  icon: done ? (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "#059669",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckOutlined style={{ color: "#fff", fontSize: 13 }} />
                    </div>
                  ) : undefined,
                };
              })}
            />
          )}
        </div>

        {/* ===== NGƯỜI NHẬN (only for delivery orders) ===== */}
        {isDelivery && (order.recipientName || order.recipientAddress) && (
          <div
            style={{ padding: "20px 28px", borderBottom: "1px solid #f3f4f6" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#374151",
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Người nhận
              </p>
              {order.orderStatus === "CHO_XAC_NHAN" && (
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={handleOpenShippingEdit}
                  style={{ borderRadius: 6 }}
                >
                  Sửa
                </Button>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                color: "#111827",
                marginBottom: 6,
              }}
            >
              <span style={{ fontWeight: 600 }}>
                {order.recipientName ?? "—"}
              </span>
              {order.recipientPhone && (
                <>
                  <span style={{ color: "#d1d5db" }}>•</span>
                  <PhoneOutlined style={{ fontSize: 12, color: "#9ca3af" }} />
                  <span style={{ color: "#374151" }}>
                    {order.recipientPhone}
                  </span>
                </>
              )}
            </div>
            {order.recipientAddress && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 6,
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                <EnvironmentOutlined
                  style={{ fontSize: 13, marginTop: 2, flexShrink: 0 }}
                />
                <span>{order.recipientAddress}</span>
              </div>
            )}
            {order.note && (
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 14px",
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#92400E",
                }}
              >
                <strong>Ghi chú:</strong> {order.note}
              </div>
            )}
          </div>
        )}

        {/* ===== PRODUCT TABLE ===== */}
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr 130px 80px 130px",
              padding: "12px 28px",
              background: "#f9fafb",
              borderBottom: "1px solid #f3f4f6",
              fontSize: 12,
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            <span>#</span>
            <span>Sản phẩm</span>
            <span style={{ textAlign: "right" }}>Đơn giá</span>
            <span style={{ textAlign: "center" }}>Số lượng</span>
            <span style={{ textAlign: "right" }}>Thành tiền</span>
          </div>

          {(order.items ?? []).map((item, idx) => (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 130px 80px 130px",
                padding: "14px 28px",
                borderBottom:
                  idx < (order.items?.length ?? 0) - 1
                    ? "1px solid #f3f4f6"
                    : "none",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600 }}>
                {idx + 1}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                    flexShrink: 0,
                    background: "#f9fafb",
                  }}
                >
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
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
                        fontSize: 20,
                      }}
                    >
                      📷
                    </div>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#111827",
                      fontSize: 13,
                      marginBottom: 2,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.productName}
                  </div>
                  {item.variantLabel && (
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {item.variantLabel}
                    </div>
                  )}
                  {item.serialNumbers && item.serialNumbers.length > 0 && (
                    <div
                      style={{
                        marginTop: 4,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 4,
                      }}
                    >
                      {item.serialNumbers.map((sn) => (
                        <span
                          key={sn}
                          style={{
                            fontSize: 11,
                            fontFamily: "monospace",
                            background: "#F3F4F6",
                            color: "#374151",
                            padding: "1px 6px",
                            borderRadius: 4,
                            border: "1px solid #E5E7EB",
                          }}
                        >
                          {sn}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#374151",
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 2,
                }}
              >
                {(() => {
                  const saleU = toNum(item.unitPrice);
                  const listU =
                    item.listUnitPrice != null
                      ? toNum(item.listUnitPrice)
                      : saleU;
                  const linePromo = toNum(item.discountAmount);
                  if (linePromo > 0 && listU > saleU) {
                    return (
                      <>
                        <Text delete type="secondary" style={{ fontSize: 12 }}>
                          {formatPrice(listU)}
                        </Text>
                        <Text strong style={{ color: "#DC2626", fontSize: 13 }}>
                          {formatPrice(saleU)}
                        </Text>
                      </>
                    );
                  }
                  return <span>{formatPrice(item.unitPrice)}</span>;
                })()}
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: "#374151",
                  textAlign: "center",
                  fontWeight: 600,
                }}
              >
                {item.quantity}
              </span>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#111827",
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 2,
                }}
              >
                {(() => {
                  const lineSale = toNum(item.totalPrice);
                  const linePromo = toNum(item.discountAmount);
                  const lineOrig = lineSale + linePromo;
                  if (linePromo > 0 && lineOrig > lineSale) {
                    return (
                      <>
                        <Text delete type="secondary" style={{ fontSize: 12 }}>
                          {formatPrice(lineOrig)}
                        </Text>
                        <span style={{ color: "#DC2626" }}>
                          {formatPrice(lineSale)}
                        </span>
                      </>
                    );
                  }
                  return <span>{formatPrice(item.totalPrice)}</span>;
                })()}
              </div>
            </div>
          ))}
        </div>

        {/* ===== PRICE SUMMARY ===== */}
        <div
          style={{
            padding: "20px 28px",
            borderTop: "1px solid #f3f4f6",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              width: 300,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {campaignTotal > 0 ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    color: "#6b7280",
                    gap: 12,
                  }}
                >
                  <span>Giá gốc (niêm yết)</span>
                  <span style={{ color: "#374151", textAlign: "right" }}>
                    {formatPrice(originalSubtotalDisplay)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    color: "#6b7280",
                    gap: 12,
                  }}
                >
                  <span>Khuyến mãi</span>
                  <span style={{ color: "#DC2626", fontWeight: 600 }}>
                    -{formatPrice(campaignTotal)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    color: "#6b7280",
                    gap: 12,
                  }}
                >
                  <span>Tạm tính (sau khuyến mãi)</span>
                  <span style={{ color: "#374151", fontWeight: 600 }}>
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#6b7280",
                  gap: 12,
                }}
              >
                <span>Tạm tính</span>
                <span style={{ color: "#374151", fontWeight: 600 }}>
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            )}
            {!isPOS && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                <span>Phí vận chuyển</span>
                <span style={{ color: "#374151" }}>
                  {formatPrice(order.shippingFee)}
                </span>
              </div>
            )}
            {voucherTotal > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#6b7280",
                  gap: 12,
                }}
              >
                <span>
                  Giảm voucher
                  {order.voucherCode ? ` (${order.voucherCode})` : ""}
                </span>
                <span style={{ color: "#DC2626", fontWeight: 600 }}>
                  -{formatPrice(voucherTotal)}
                </span>
              </div>
            )}
            {isPOS && order.customerPaid != null && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                <span>Khách đã trả</span>
                <span style={{ color: "#374151" }}>
                  {formatPrice(order.customerPaid)}
                </span>
              </div>
            )}
            <div
              style={{
                borderTop: "1px solid #f3f4f6",
                paddingTop: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>
                Tổng cộng
              </span>
              <span style={{ fontWeight: 800, color: "#D32F2F", fontSize: 18 }}>
                {formatPrice(order.totalAfterDiscount)}
              </span>
            </div>
          </div>
        </div>

        {/* ===== ACTION BUTTONS ===== */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            background: "#fafafa",
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{ borderRadius: 8 }}
          >
            Quay lại danh sách
          </Button>

          <div style={{ display: "flex", gap: 10 }}>
            {/* Chỉ cho phép hủy khi trạng thái là CHO_XAC_NHAN */}
            {order.orderStatus === "CHO_XAC_NHAN" && (
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setCancelModalOpen(true)}
                style={{ fontWeight: 600, borderRadius: 8 }}
              >
                Hủy đơn
              </Button>
            )}
            {order.canBuyAgain && (
              <Button
                icon={<ShoppingCartOutlined />}
                onClick={handleBuyAgain}
                loading={actionLoading}
                style={{
                  borderColor: "#D32F2F",
                  color: "#D32F2F",
                  fontWeight: 600,
                  borderRadius: 8,
                }}
              >
                Mua lại
              </Button>
            )}
            {order.canConfirmReceived && (
              <Popconfirm
                title="Xác nhận đã nhận hàng?"
                description="Bạn đã nhận được đầy đủ sản phẩm chứ?"
                onConfirm={handleConfirmReceived}
                okText="Đã nhận hàng"
                cancelText="Chưa"
                okButtonProps={{
                  style: { backgroundColor: "#059669", borderColor: "#059669" },
                }}
              >
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={actionLoading}
                  style={{
                    backgroundColor: "#059669",
                    borderColor: "#059669",
                    fontWeight: 600,
                    borderRadius: 8,
                  }}
                >
                  Xác nhận đã nhận hàng
                </Button>
              </Popconfirm>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        title={<span style={{ fontWeight: 700 }}>Hủy đơn hàng</span>}
        open={cancelModalOpen}
        onCancel={() => {
          setCancelModalOpen(false);
          setCancelReason("");
        }}
        footer={null}
        width={480}
      >
        <div style={{ marginTop: 16 }}>
          <p style={{ color: "#374151", marginBottom: 12, fontSize: 14 }}>
            Bạn có chắc chắn muốn hủy đơn hàng <strong>#{order.code}</strong>{" "}
            không?
          </p>
          <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 16 }}>
            <WarningOutlined style={{ marginRight: 6 }} />
            Đơn hàng đã thanh toán sẽ được hoàn tiền trong thời gian sớm nhất.
          </p>
          <Input.TextArea
            rows={3}
            placeholder="Lý do hủy đơn (bắt buộc)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            maxLength={300}
            showCount
          />
          {!cancelReason.trim() && (
            <div style={{ color: "#DC2626", fontSize: 13, marginTop: 4 }}>
              * Vui lòng nhập lý do hủy đơn hàng
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 16,
            }}
          >
            <Button
              onClick={() => {
                setCancelModalOpen(false);
                setCancelReason("");
              }}
            >
              Không hủy
            </Button>
            <Button
              danger
              type="primary"
              loading={actionLoading}
              onClick={handleCancel}
              style={{ minWidth: 100 }}
              disabled={!cancelReason.trim() || actionLoading}
            >
              Xác nhận hủy
            </Button>
          </div>
        </div>
      </Modal>

      {/* Buy Again Modal */}
      <Modal
        title={<span style={{ fontWeight: 700 }}>Kết quả mua lại</span>}
        open={buyAgainModal.open}
        onCancel={() => setBuyAgainModal((prev) => ({ ...prev, open: false }))}
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button
              onClick={() =>
                setBuyAgainModal((prev) => ({ ...prev, open: false }))
              }
            >
              Đóng
            </Button>
            <Button
              type="primary"
              style={{ backgroundColor: "#D32F2F", borderColor: "#D32F2F" }}
              onClick={() => {
                setBuyAgainModal((prev) => ({ ...prev, open: false }));
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: 600,
                  color: "#065F46",
                  marginBottom: 8,
                }}
              >
                <CheckCircleOutlined style={{ color: "#059669" }} />
                Đã thêm vào giỏ ({buyAgainModal.added.length}):
              </div>
              {buyAgainModal.added.map((p, i) => (
                <div
                  key={i}
                  style={{ fontSize: 13, color: "#374151", paddingLeft: 22 }}
                >
                  • {p}
                </div>
              ))}
            </div>
          )}
          {buyAgainModal.unavailable.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: 600,
                  color: "#92400E",
                  marginBottom: 8,
                }}
              >
                <WarningOutlined style={{ color: "#D97706" }} />
                Không thể thêm ({buyAgainModal.unavailable.length}):
              </div>
              {buyAgainModal.unavailable.map((p, i) => (
                <div
                  key={i}
                  style={{ fontSize: 13, color: "#6B7280", paddingLeft: 22 }}
                >
                  • {p}
                </div>
              ))}
            </div>
          )}
          {buyAgainModal.added.length === 0 &&
            buyAgainModal.unavailable.length === 0 && (
              <p style={{ color: "#6B7280", textAlign: "center" }}>
                Không có sản phẩm nào có thể thêm.
              </p>
            )}
        </div>
      </Modal>

      {/* Sửa thông tin giao hàng */}
      <Modal
        title={<span style={{ fontWeight: 700 }}>Cập nhật thông tin giao hàng</span>}
        open={shippingEditOpen}
        onCancel={() => setShippingEditOpen(false)}
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button onClick={() => setShippingEditOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              loading={shippingEditLoading}
              onClick={handleSaveShippingEdit}
              style={{ backgroundColor: "#D32F2F", borderColor: "#D32F2F" }}
            >
              Lưu thay đổi
            </Button>
          </div>
        }
        width={500}
      >
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: 13,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Tên người nhận <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <Input
              placeholder="Nhập tên người nhận"
              value={shippingEditForm.receiverName}
              onChange={(e) =>
                setShippingEditForm((prev) => ({
                  ...prev,
                  receiverName: e.target.value,
                }))
              }
              maxLength={255}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: 13,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Số điện thoại <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <Input
              placeholder="Nhập số điện thoại (0xxx xxx xxx)"
              value={shippingEditForm.receiverPhone}
              onChange={(e) =>
                setShippingEditForm((prev) => ({
                  ...prev,
                  receiverPhone: e.target.value,
                }))
              }
              maxLength={11}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: 13,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Địa chỉ giao hàng <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <Input.TextArea
              rows={3}
              placeholder="Nhập địa chỉ giao hàng đầy đủ"
              value={shippingEditForm.shippingAddress}
              onChange={(e) =>
                setShippingEditForm((prev) => ({
                  ...prev,
                  shippingAddress: e.target.value,
                }))
              }
              maxLength={500}
              showCount
            />
          </div>
          <div
            style={{
              padding: "10px 14px",
              background: "#FEF3C7",
              border: "1px solid #FDE68A",
              borderRadius: 8,
              fontSize: 13,
              color: "#92400E",
            }}
          >
            <WarningOutlined style={{ marginRight: 6 }} />
            Chỉ có thể sửa khi đơn hàng còn ở trạng thái <strong>Chờ xác nhận</strong>. Đơn đã xác nhận vui lòng liên hệ <strong>0943888307</strong> để được hỗ trợ.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetailEmbed;
