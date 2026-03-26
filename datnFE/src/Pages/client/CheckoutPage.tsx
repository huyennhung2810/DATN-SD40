import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Radio,
  Typography,
  Divider,
  Card,
  Spin,
  message,
  Space,
  Tag,
} from "antd";
import {
  CreditCardOutlined,
  CarOutlined,
  ArrowLeftOutlined,
  TagOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import axiosClient from "../../api/axiosClient";
import paymentApi from "../../api/paymentApi";
import type { Voucher } from "../../models/Voucher";
import VoucherPickerModal from "../../components/customer/VoucherPickerModal";

const { Title, Text } = Typography;

interface CartItem {
  id: string;
  productName: string;
  variantName: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

interface AppliedVoucher {
  code: string;
  discountValue: number;
  discountUnit: "PERCENT" | "VND";
  maxDiscountAmount?: number;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // 1. Lấy thông tin User và danh sách Voucher từ Redux
  const { user } = useSelector((state: RootState) => state.auth);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY">("COD");

  // State Voucher
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.userId) {
      navigate("/login");
      return;
    }
    fetchCart();
    form.setFieldsValue({
      recipientName: user.fullName,
      recipientEmail: user.email,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(
        `/client/cart?customerId=${user?.userId}`
      );
      const data = response.data;
      setCartItems(Array.isArray(data) ? data : []);
    } catch {
      message.error("Không thể tải giỏ hàng!");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // Tính tiền
  const subTotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discountUnit === "PERCENT") {
      discountAmount = (subTotal * appliedVoucher.discountValue) / 100;
      if (appliedVoucher.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, appliedVoucher.maxDiscountAmount);
      }
    } else {
      discountAmount = appliedVoucher.discountValue;
    }
  }

  const totalAmount = Math.max(0, subTotal - discountAmount);

  const handleApplyVoucher = (v: Voucher) => {
    setAppliedVoucher({
      code: v.code,
      discountValue: v.discountValue,
      discountUnit: v.discountUnit,
      maxDiscountAmount: v.maxDiscountAmount,
    });
    message.success(`Áp dụng mã "${v.code}" thành công!`);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    message.info("Đã bỏ mã giảm giá.");
  };

  const handleSubmit = async (values: any) => {
    if (cartItems.length === 0) {
      message.warning("Giỏ hàng trống!");
      return;
    }
    setSubmitting(true);
    try {
      const response = await paymentApi.checkout({
        customerId: user!.userId,
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        recipientEmail: values.recipientEmail,
        recipientAddress: values.recipientAddress,
        paymentMethod,
        note: values.note,
        voucherCode: appliedVoucher?.code ,
      });

      if (response.status === "REDIRECT" && response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        message.success(response.message);
        navigate("/client");
      }
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Đặt hàng thất bại, vui lòng thử lại!"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.userId) return null;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "80vh", padding: "40px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          type="link"
          onClick={() => navigate("/client/cart")}
          style={{ marginBottom: 16, paddingLeft: 0 }}
        >
          Quay lại giỏ hàng
        </Button>

        <Title level={2} style={{ marginBottom: 24 }}>
          Thanh toán
        </Title>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            
            {/* Form thông tin giao hàng */}
            <div style={{ flex: 1, minWidth: 320 }}>
              <Card title="Thông tin giao hàng" style={{ borderRadius: 12 }}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
                  <Form.Item
                    label="Họ và tên người nhận"
                    name="recipientName"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                  >
                    <Input placeholder="Nguyễn Văn A" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Số điện thoại"
                    name="recipientPhone"
                    rules={[
                      { required: true, message: "Vui lòng nhập số điện thoại!" },
                      { pattern: /^(0|\+84)[0-9]{9}$/, message: "Số điện thoại không hợp lệ!" },
                    ]}
                  >
                    <Input placeholder="0987654321" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Email"
                    name="recipientEmail"
                    rules={[
                      { required: true, message: "Vui lòng nhập email!" },
                      { type: "email", message: "Email không hợp lệ!" },
                    ]}
                  >
                    <Input placeholder="example@email.com" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Địa chỉ giao hàng"
                    name="recipientAddress"
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ giao hàng!" }]}
                  >
                    <Input.TextArea placeholder="Số nhà, tên đường..." rows={3} size="large" />
                  </Form.Item>

                  <Form.Item label="Ghi chú" name="note">
                    <Input.TextArea placeholder="Ghi chú thêm..." rows={2} />
                  </Form.Item>

                  <Divider />
                  <Title level={5} style={{ marginBottom: 12 }}>Phương thức thanh toán</Title>
                  <Radio.Group
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Radio value="COD">
                        <Space>
                          <CarOutlined style={{ fontSize: 18, color: "#52c41a" }} />
                          <div>
                            <div style={{ fontWeight: 600 }}>Thanh toán khi nhận hàng (COD)</div>
                            <div style={{ color: "#888", fontSize: 12 }}>Trả tiền mặt khi nhận hàng</div>
                          </div>
                        </Space>
                      </Radio>

                      <Radio value="VNPAY">
                        <Space>
                          <CreditCardOutlined style={{ fontSize: 18, color: "#1677ff" }} />
                          <div>
                            <div style={{ fontWeight: 600 }}>Thanh toán qua VNPay</div>
                            <div style={{ color: "#888", fontSize: 12 }}>Thẻ ATM, VISA, MasterCard...</div>
                          </div>
                        </Space>
                      </Radio>
                    </Space>
                  </Radio.Group>

                  <Button
                    type="primary"
                    size="large"
                    block
                    htmlType="submit"
                    loading={submitting}
                    style={{ marginTop: 24, height: 48, fontSize: 16, fontWeight: 600, borderRadius: 8 }}
                    danger={paymentMethod === "VNPAY"}
                  >
                    {paymentMethod === "VNPAY" ? "Thanh toán qua VNPay" : "Đặt hàng (COD)"}
                  </Button>
                </Form>
              </Card>
            </div>

            {/* Tóm tắt đơn hàng */}
            <div style={{ width: 360, flexShrink: 0 }}>
              <Card title="Tóm tắt đơn hàng" style={{ borderRadius: 12, position: "sticky", top: 100 }}>
                <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 16 }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
                      <img
                        src={item.imageUrl || "https://via.placeholder.com/60"}
                        alt={item.productName}
                        style={{ width: 60, height: 60, objectFit: "contain", border: "1px solid #f0f0f0", borderRadius: 8, padding: 4 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {item.productName}
                        </div>
                        <div style={{ color: "#888", fontSize: 12 }}>{item.variantName}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>x{item.quantity}</Text>
                          <Text strong style={{ color: "#e53935" }}>{formatPrice(item.price * item.quantity)}</Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Divider style={{ margin: "12px 0" }} />

                {/* --- KHU VỰC CHỌN VOUCHER --- */}
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>
                    <TagOutlined style={{ marginRight: 6 }} />
                    Mã giảm giá
                  </Text>
                  {appliedVoucher ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: "#fff5f5",
                        border: "1.5px dashed #D32F2F",
                        borderRadius: 8,
                      }}
                    >
                      <Space>
                        <TagOutlined style={{ color: "#D32F2F" }} />
                        <Tag
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            fontSize: 13,
                            background: "#fff",
                            border: "1px solid #D32F2F",
                            color: "#D32F2F",
                          }}
                        >
                          {appliedVoucher.code}
                        </Tag>
                        <Text style={{ fontSize: 12, color: "#374151" }}>
                          {appliedVoucher.discountUnit === "PERCENT"
                            ? `Giảm ${appliedVoucher.discountValue}%${
                                appliedVoucher.maxDiscountAmount
                                  ? ` (tối đa ${formatPrice(appliedVoucher.maxDiscountAmount)})`
                                  : ""
                              }`
                            : `Giảm ${formatPrice(appliedVoucher.discountValue)}`}
                        </Text>
                      </Space>
                      <CloseCircleOutlined
                        style={{ color: "#9ca3af", cursor: "pointer", fontSize: 16 }}
                        onClick={handleRemoveVoucher}
                      />
                    </div>
                  ) : (
                    <Button
                      block
                      icon={<TagOutlined />}
                      onClick={() => setVoucherModalOpen(true)}
                      style={{
                        borderStyle: "dashed",
                        color: "#D32F2F",
                        borderColor: "#D32F2F",
                      }}
                    >
                      Chọn hoặc nhập mã giảm giá
                    </Button>
                  )}
                </div>

                <VoucherPickerModal
                  open={voucherModalOpen}
                  onClose={() => setVoucherModalOpen(false)}
                  subTotal={subTotal}
                  onApply={handleApplyVoucher}
                  appliedCode={appliedVoucher?.code}
                />

                <Divider style={{ margin: "12px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text>Tạm tính:</Text>
                  <Text>{formatPrice(subTotal)}</Text>
                </div>

                {appliedVoucher && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text>Giảm giá ({appliedVoucher.code}):</Text>
                    <Text type="danger">-{formatPrice(discountAmount)}</Text>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text>Phí vận chuyển:</Text>
                  <Text style={{ color: "#52c41a" }}>Miễn phí</Text>
                </div>

                <Divider style={{ margin: "12px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text strong style={{ fontSize: 16 }}>Tổng cộng:</Text>
                  <Text strong style={{ fontSize: 22, color: "#e53935" }}>{formatPrice(totalAmount)}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 11, display: "block", textAlign: "right" }}>(Đã bao gồm VAT)</Text>

                {paymentMethod === "VNPAY" && (
                  <div style={{ marginTop: 16, padding: "10px 14px", background: "#e8f4ff", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <img
                      src="https://vnpay.vn/s1/statics/img/logo2.bd27729b.svg"
                      alt="VNPay"
                      style={{ height: 24 }}
                    />
                    <Text style={{ fontSize: 12 }}>Bạn sẽ được chuyển tới cổng thanh toán VNPay</Text>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;