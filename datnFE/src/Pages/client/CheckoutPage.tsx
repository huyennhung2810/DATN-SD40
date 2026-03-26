import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Select,
  Modal,
} from "antd";
import {
  CreditCardOutlined,
  CarOutlined,
  ArrowLeftOutlined,
  TagOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  CheckCircleFilled,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import axiosClient from "../../api/axiosClient";
import paymentApi from "../../api/paymentApi";
import type { Voucher } from "../../models/Voucher";
import VoucherPickerModal from "../../components/customer/VoucherPickerModal";
import { getProfile } from "../../api/clientProfileApi";
import type { AddressResponse } from "../../models/address";

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

interface Province {
  name: string;
  code: number;
}

interface Ward {
  name: string;
  code: number;
}

type AddrMode = "saved" | "new";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [noteForm] = Form.useForm();
  const [newAddrForm] = Form.useForm();

  const { user } = useSelector((state: RootState) => state.auth);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY">("COD");

  // ---- Địa chỉ ----
  const [savedAddresses, setSavedAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addrMode, setAddrMode] = useState<AddrMode>("saved");
  const [addrModalOpen, setAddrModalOpen] = useState(false);

  // Province/ward
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);

  // ---- Voucher ----
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.userId) {
      navigate("/login");
      return;
    }
    fetchCart();
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/client/cart?customerId=${user?.userId}`);
      const data = response.data;
      setCartItems(Array.isArray(data) ? data : []);
    } catch {
      message.error("Không thể tải giỏ hàng!");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    if (!user?.userId) return;
    try {
      const profile = await getProfile(user.userId);
      const addrs = profile.addresses ?? [];
      setSavedAddresses(addrs);
      if (addrs.length > 0) {
        const def = addrs.find((a) => a.isDefault) ?? addrs[0];
        setSelectedAddressId(def.id);
        setAddrMode("saved");
      } else {
        setAddrMode("new");
        loadProvinces();
      }
    } catch {
      // silent – không ảnh hưởng flow
    }
  };

  const loadProvinces = async () => {
    if (provinces.length > 0) return;
    try {
      const res = await axios.get<Province[]>("https://provinces.open-api.vn/api/v2/p/?depth=1");
      setProvinces(res.data);
    } catch {
      message.error("Không tải được danh sách Tỉnh/Thành");
    }
  };

  const loadWards = async (provinceCode: number) => {
    setLoadingWards(true);
    setWards([]);
    newAddrForm.setFieldsValue({ wardCode: undefined, wardCommune: "" });
    try {
      const res = await axios.get(`https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`);
      setWards(res.data.wards ?? []);
    } catch {
      message.error("Không tải được danh sách Phường/Xã");
    } finally {
      setLoadingWards(false);
    }
  };

  const normalizeStr = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/^(tinh|thanh pho|huyen|quan|thi xa|xa|phuong|thi tran)\s+/i, "")
      .trim();

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

  const selectedAddr = savedAddresses.find((a) => a.id === selectedAddressId) ?? null;

  const handlePlaceOrder = async () => {
    const noteValues = await noteForm.validateFields().catch(() => ({ note: "" }));

    let recipientName = "";
    let recipientPhone = "";
    let recipientAddress = "";

    if (addrMode === "saved") {
      if (!selectedAddr) {
        message.warning("Vui lòng chọn địa chỉ giao hàng!");
        return;
      }
      recipientName = selectedAddr.name;
      recipientPhone = selectedAddr.phoneNumber;
      recipientAddress = `${selectedAddr.addressDetail}, ${selectedAddr.wardCommune}, ${selectedAddr.provinceCity}`;
    } else {
      let newVals: any;
      try {
        newVals = await newAddrForm.validateFields();
      } catch {
        return;
      }
      recipientName = newVals.name;
      recipientPhone = newVals.phoneNumber;
      recipientAddress = `${newVals.addressDetail}, ${newVals.wardCommune}, ${newVals.provinceCity}`;
    }

    if (cartItems.length === 0) {
      message.warning("Giỏ hàng trống!");
      return;
    }

    setSubmitting(true);
    try {
      const response = await paymentApi.checkout({
        customerId: user!.userId,
        recipientName,
        recipientPhone,
        recipientEmail: user!.email ?? "",
        recipientAddress,
        paymentMethod,
        note: noteValues.note,
        voucherCode: appliedVoucher?.code,
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

            {/* ===== CỘT TRÁI ===== */}
            <div style={{ flex: 1, minWidth: 340, display: "flex", flexDirection: "column", gap: 16 }}>

              {/* ---- Card địa chỉ giao hàng ---- */}
              <Card
                style={{ borderRadius: 12 }}
                title={
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <span><EnvironmentOutlined style={{ marginRight: 8, color: "#D32F2F" }} />Địa chỉ giao hàng</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {addrMode === "saved" && savedAddresses.length > 0 && (
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => setAddrModalOpen(true)}
                        >
                          Đổi địa chỉ
                        </Button>
                      )}
                      {savedAddresses.length > 0 && (
                        <Button
                          size="small"
                          icon={addrMode === "saved" ? <PlusOutlined /> : <EnvironmentOutlined />}
                          style={{ color: "#D32F2F", borderColor: "#D32F2F" }}
                          onClick={() => {
                            if (addrMode === "saved") {
                              loadProvinces();
                              setAddrMode("new");
                            } else {
                              setAddrMode("saved");
                            }
                          }}
                        >
                          {addrMode === "saved" ? "Địa chỉ mới" : "Dùng địa chỉ đã lưu"}
                        </Button>
                      )}
                    </div>
                  </div>
                }
              >
                {/* --- Chế độ: địa chỉ đã lưu --- */}
                {addrMode === "saved" && (
                  <>
                    {savedAddresses.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af" }}>
                        <EnvironmentOutlined style={{ fontSize: 32, display: "block", marginBottom: 8 }} />
                        <p style={{ margin: 0 }}>Chưa có địa chỉ nào trong tài khoản</p>
                        <Button
                          type="link"
                          style={{ color: "#D32F2F", padding: 0, marginTop: 4 }}
                          onClick={() => { loadProvinces(); setAddrMode("new"); }}
                        >
                          Nhập địa chỉ mới
                        </Button>
                      </div>
                    ) : selectedAddr ? (
                      <div
                        style={{
                          border: "2px solid #D32F2F",
                          borderRadius: 10,
                          padding: "14px 16px",
                          background: "#fff9f9",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <CheckCircleFilled style={{ color: "#D32F2F", fontSize: 16 }} />
                          <span style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>{selectedAddr.name}</span>
                          <span style={{ color: "#d1d5db" }}>|</span>
                          <span style={{ color: "#6b7280" }}>{selectedAddr.phoneNumber}</span>
                          {selectedAddr.isDefault && (
                            <Tag color="red" style={{ margin: 0 }}>Mặc định</Tag>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: "#6b7280", margin: 0, paddingLeft: 24 }}>
                          {selectedAddr.addressDetail}, {selectedAddr.wardCommune}, {selectedAddr.provinceCity}
                        </p>
                      </div>
                    ) : null}
                  </>
                )}

                {/* --- Chế độ: nhập địa chỉ mới --- */}
                {addrMode === "new" && (
                  <Form form={newAddrForm} layout="vertical" requiredMark={false}>
                    {/* hidden fields for tên tỉnh/xã */}
                    <Form.Item name="provinceCity" hidden><Input /></Form.Item>
                    <Form.Item name="wardCommune" hidden><Input /></Form.Item>

                    <div style={{ display: "flex", gap: 12 }}>
                      <Form.Item
                        label="Họ tên người nhận"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="Nguyễn Văn A" size="large" />
                      </Form.Item>
                      <Form.Item
                        label="Số điện thoại"
                        name="phoneNumber"
                        rules={[
                          { required: true, message: "Vui lòng nhập SĐT" },
                          { pattern: /^0(3|5|7|8|9)\d{8}$/, message: "SĐT không hợp lệ" },
                        ]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="0901234567" size="large" />
                      </Form.Item>
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                      <Form.Item
                        label="Tỉnh / Thành phố"
                        name="provinceCode"
                        rules={[{ required: true, message: "Vui lòng chọn Tỉnh/Thành" }]}
                        style={{ flex: 1 }}
                      >
                        <Select
                          showSearch
                          size="large"
                          placeholder="Chọn Tỉnh / Thành phố"
                          filterOption={(input, option) =>
                            normalizeStr(String(option?.label ?? "")).includes(normalizeStr(input))
                          }
                          options={provinces.map((p) => ({ label: p.name, value: p.code }))}
                          onChange={(val, opt) => {
                            const label = Array.isArray(opt) ? opt[0]?.label : (opt as any)?.label;
                            newAddrForm.setFieldsValue({
                              provinceCity: String(label ?? ""),
                              wardCode: undefined,
                              wardCommune: "",
                            });
                            if (val) loadWards(val);
                            else setWards([]);
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        label="Phường / Xã"
                        name="wardCode"
                        rules={[{ required: true, message: "Vui lòng chọn Phường/Xã" }]}
                        style={{ flex: 1 }}
                      >
                        <Select
                          showSearch
                          size="large"
                          placeholder="Chọn Phường / Xã"
                          disabled={wards.length === 0 && !loadingWards}
                          loading={loadingWards}
                          filterOption={(input, option) =>
                            normalizeStr(String(option?.label ?? "")).includes(normalizeStr(input))
                          }
                          options={wards.map((w) => ({ label: w.name, value: w.code }))}
                          onChange={(val, opt) => {
                            const label = Array.isArray(opt) ? opt[0]?.label : (opt as any)?.label;
                            newAddrForm.setFieldsValue({
                              wardCommune: String(label ?? ""),
                              wardCode: val,
                            });
                          }}
                        />
                      </Form.Item>
                    </div>

                    <Form.Item
                      label="Địa chỉ cụ thể"
                      name="addressDetail"
                      rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                    >
                      <Input
                        placeholder="Số nhà, tên đường…"
                        size="large"
                        prefix={<EnvironmentOutlined style={{ color: "#d1d5db" }} />}
                      />
                    </Form.Item>
                  </Form>
                )}
              </Card>

              {/* ---- Card phương thức thanh toán ---- */}
              <Card
                style={{ borderRadius: 12 }}
                title={<span><CreditCardOutlined style={{ marginRight: 8, color: "#D32F2F" }} />Phương thức thanh toán</span>}
              >
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Radio value="COD" style={{ padding: "10px 0" }}>
                      <Space>
                        <CarOutlined style={{ fontSize: 20, color: "#52c41a" }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>Thanh toán khi nhận hàng (COD)</div>
                          <div style={{ color: "#888", fontSize: 12 }}>Trả tiền mặt khi nhận hàng</div>
                        </div>
                      </Space>
                    </Radio>
                    <Radio value="VNPAY" style={{ padding: "10px 0" }}>
                      <Space>
                        <CreditCardOutlined style={{ fontSize: 20, color: "#1677ff" }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>Thanh toán qua VNPay</div>
                          <div style={{ color: "#888", fontSize: 12 }}>Thẻ ATM, VISA, MasterCard, QR Code…</div>
                        </div>
                      </Space>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Card>

              {/* ---- Ghi chú ---- */}
              <Card style={{ borderRadius: 12 }}>
                <Form form={noteForm} layout="vertical" requiredMark={false}>
                  <Form.Item label="Ghi chú cho đơn hàng" name="note" style={{ margin: 0 }}>
                    <Input.TextArea placeholder="Ghi chú thêm cho người giao hàng…" rows={2} />
                  </Form.Item>
                </Form>
              </Card>
            </div>

            {/* ===== CỘT PHẢI: Tóm tắt đơn hàng ===== */}
            <div style={{ width: 360, flexShrink: 0 }}>
              <Card
                title="Tóm tắt đơn hàng"
                style={{ borderRadius: 12, position: "sticky", top: 100 }}
              >
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

                {/* Voucher */}
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
                      style={{ borderStyle: "dashed", color: "#D32F2F", borderColor: "#D32F2F" }}
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

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={submitting}
                  onClick={handlePlaceOrder}
                  style={{
                    marginTop: 16,
                    height: 48,
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 8,
                    backgroundColor: paymentMethod === "VNPAY" ? undefined : "#D32F2F",
                    borderColor: paymentMethod === "VNPAY" ? undefined : "#D32F2F",
                  }}
                  danger={paymentMethod === "VNPAY"}
                >
                  {paymentMethod === "VNPAY" ? "Thanh toán qua VNPay" : "Đặt hàng (COD)"}
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* ===== Modal chọn địa chỉ ===== */}
      <Modal
        title={<span><EnvironmentOutlined style={{ marginRight: 8 }} />Chọn địa chỉ giao hàng</span>}
        open={addrModalOpen}
        onCancel={() => setAddrModalOpen(false)}
        footer={null}
        width={520}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {savedAddresses.map((addr) => {
            const isSelected = addr.id === selectedAddressId;
            return (
              <div
                key={addr.id}
                onClick={() => {
                  setSelectedAddressId(addr.id);
                  setAddrModalOpen(false);
                }}
                style={{
                  border: `2px solid ${isSelected ? "#D32F2F" : "#e5e7eb"}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  background: isSelected ? "#fff9f9" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: `2px solid ${isSelected ? "#D32F2F" : "#d1d5db"}`,
                    background: isSelected ? "#D32F2F" : "#fff",
                    flexShrink: 0,
                    marginTop: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSelected && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, color: "#111827" }}>{addr.name}</span>
                    <span style={{ color: "#d1d5db" }}>|</span>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>{addr.phoneNumber}</span>
                    {addr.isDefault && <Tag color="red" style={{ margin: 0 }}>Mặc định</Tag>}
                  </div>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                    {addr.addressDetail}, {addr.wardCommune}, {addr.provinceCity}
                  </p>
                </div>
              </div>
            );
          })}

          <Button
            block
            icon={<PlusOutlined />}
            style={{ marginTop: 4, borderStyle: "dashed", color: "#D32F2F", borderColor: "#D32F2F" }}
            onClick={() => {
              setAddrModalOpen(false);
              loadProvinces();
              setAddrMode("new");
            }}
          >
            Nhập địa chỉ mới
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CheckoutPage;