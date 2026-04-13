import React, { useState, useEffect, useRef } from "react";
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
  Alert,
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
  CheckCircleOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { clearCartCount, setCartCount } from "../../redux/cart/cartSlice";
import axiosClient from "../../api/axiosClient";
import paymentApi from "../../api/paymentApi";
import type { Voucher } from "../../models/Voucher";
import VoucherPickerModal from "../../components/customer/VoucherPickerModal";
import { getProfile } from "../../api/clientProfileApi";
import type { AddressResponse } from "../../models/address";
import { useLocation } from "react-router-dom";
import { getClientVouchers } from "../../api/voucherApi";
import AuthModal from "../../components/auth/AuthModal";

const { Title, Text } = Typography;

interface CartItem {
  id: string;
  productDetailId?: string;
  productName: string;
  variantName?: string;
  version?: string;
  imageUrl: string;
  price: number;
  discountedPrice?: number | string | null;
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
  const dispatch = useDispatch();
  const location = useLocation();
  const [noteForm] = Form.useForm();
  const [newAddrForm] = Form.useForm();

  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY">("COD");

  // Auth Modal - bắt buộc đăng nhập
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // ---- Địa chỉ ----
  const [savedAddresses, setSavedAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addrMode, setAddrMode] = useState<AddrMode>("saved");
  const [addrModalOpen, setAddrModalOpen] = useState(false);

  // Province/ward
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // ---- Voucher ----
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [autoAppliedBestVoucher, setAutoAppliedBestVoucher] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const hasAutoAppliedRef = useRef(false);

  // Xử lý xác thực
  useEffect(() => {
    if (!isLoggedIn) {
      // Chưa đăng nhập -> mở modal login
      setAuthModalOpen(true);
    } else {
      // Đã đăng nhập -> tải giỏ hàng
      fetchCart();
      fetchAddresses();
    }
  }, [isLoggedIn, user?.userId]);

  const fetchCart = async () => {
    const state = location.state as any;

    if (state?.isBuyNow && state?.checkoutItems) {
      setCartItems(state.checkoutItems);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axiosClient.get(`/client/cart?customerId=${user?.userId}`);
      const data = response.data;

      if (state?.selectedCartItemIds && Array.isArray(data)) {
        const filteredData = data.filter((item) => state.selectedCartItemIds.includes(item.id));
        setCartItems(filteredData);
      } else {
        setCartItems(Array.isArray(data) ? data : []);
      }
    } catch {
      message.error("Không thể tải thông tin thanh toán!");
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
      // silent
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

  const loadDistricts = async (provinceCode: number) => {
    if (!provinceCode) return;
    setLoadingDistricts(true);
    setDistricts([]);
    setWards([]);
    newAddrForm.setFieldsValue({ districtCode: undefined, wardCode: undefined, wardCommune: "" });
    try {
      const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      setDistricts(res.data.districts ?? []);
    } catch {
      message.error("Không tải được danh sách Quận/Huyện");
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadWards = async (provinceCode: number, districtCode: number) => {
    setLoadingWards(true);
    setWards([]);
    newAddrForm.setFieldsValue({ wardCode: undefined, wardCommune: "" });
    try {
      const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
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

  const toNum = (v: unknown): number => {
    if (v == null) return 0;
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const unitOriginal = (item: CartItem) => toNum(item.price);

  const unitAfterPromotion = (item: CartItem) => {
    const orig = unitOriginal(item);
    const disc = item.discountedPrice != null && item.discountedPrice !== "" ? toNum(item.discountedPrice) : orig;
    return disc > 0 && disc < orig ? disc : orig;
  };

  const lineOriginalTotal = (item: CartItem) => unitOriginal(item) * toNum(item.quantity);
  const lineSaleTotal = (item: CartItem) => unitAfterPromotion(item) * toNum(item.quantity);

  const originalSubtotal = cartItems.reduce((sum, item) => sum + lineOriginalTotal(item), 0);
  const promotionDiscountTotal = cartItems.reduce(
    (sum, item) => sum + (lineOriginalTotal(item) - lineSaleTotal(item)),
    0,
  );
  const subTotalAfterPromotion = cartItems.reduce((sum, item) => sum + lineSaleTotal(item), 0);

  let voucherDiscountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discountUnit === "PERCENT") {
      voucherDiscountAmount = (subTotalAfterPromotion * appliedVoucher.discountValue) / 100;
      if (appliedVoucher.maxDiscountAmount) {
        voucherDiscountAmount = Math.min(voucherDiscountAmount, appliedVoucher.maxDiscountAmount);
      }
    } else {
      voucherDiscountAmount = appliedVoucher.discountValue;
    }
    voucherDiscountAmount = Math.min(voucherDiscountAmount, subTotalAfterPromotion);
  }

  const totalAmount = Math.max(0, subTotalAfterPromotion - voucherDiscountAmount);

  const handleApplyVoucher = (v: Voucher) => {
    setAppliedVoucher({
      code: v.code,
      discountValue: v.discountValue,
      discountUnit: v.discountUnit,
      maxDiscountAmount: v.maxDiscountAmount,
    });
    setAutoAppliedBestVoucher(false);
    hasAutoAppliedRef.current = true;
    message.success(`Áp dụng mã "${v.code}" thành công!`);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setAutoAppliedBestVoucher(false);
    hasAutoAppliedRef.current = false;
    message.info("Đã bỏ mã giảm giá.");
  };

  const calcVoucherDiscount = (v: Voucher, subTotal: number): number => {
    let discount = 0;
    if (v.discountUnit === "PERCENT") {
      discount = (subTotal * v.discountValue) / 100;
      if (v.maxDiscountAmount) {
        discount = Math.min(discount, v.maxDiscountAmount);
      }
    } else {
      discount = v.discountValue;
    }
    return Math.min(discount, subTotal);
  };

  const autoApplyBestVoucher = async (subTotal: number) => {
    if (subTotal <= 0) return;
    try {
      const res: any = await getClientVouchers();
      let vouchers: Voucher[] = [];
      if (Array.isArray(res)) {
        vouchers = res;
      } else if (res?.data) {
        vouchers = Array.isArray(res.data) ? res.data : [];
      }

      const now = Date.now();
      const eligible = vouchers.filter(
        (v) => v.status >= 1 && (!v.endDate || v.endDate > now) && (!v.startDate || v.startDate < now) && (!v.conditions || subTotal >= v.conditions),
      );

      if (eligible.length === 0) return;

      const best = eligible.reduce((prev, curr) => {
        const prevDiscount = calcVoucherDiscount(prev, subTotal);
        const currDiscount = calcVoucherDiscount(curr, subTotal);
        return currDiscount > prevDiscount ? curr : prev;
      });

      const bestDiscount = calcVoucherDiscount(best, subTotal);
      if (bestDiscount > 0) {
        setAppliedVoucher({
          code: best.code,
          discountValue: best.discountValue,
          discountUnit: best.discountUnit,
          maxDiscountAmount: best.maxDiscountAmount,
        });
        setAutoAppliedBestVoucher(true);
        hasAutoAppliedRef.current = true;
        message.info({
          content: (
            <span>
              Đã tự động áp dụng voucher <strong>"{best.code}"</strong> giúp bạn tiết kiệm{" "}
              <strong>{formatPrice(bestDiscount)}</strong>!
              <span style={{ color: "#888", fontSize: 12, display: "block", marginTop: 4 }}>
                Bạn có thể chọn voucher khác nếu muốn.
              </span>
            </span>
          ),
          duration: 4,
        });
      }
    } catch (err) {
      console.error("[DEBUG] Error in autoApplyBestVoucher:", err);
    }
  };

  const selectedAddr = savedAddresses.find((a) => a.id === selectedAddressId) ?? null;

  const handleConfirmOrder = () => {
    const isCOD = paymentMethod === "COD";
    Modal.confirm({
      title: isCOD ? "Xác nhận đặt hàng" : "Xác nhận thanh toán VNPay",
      content: isCOD
        ? `Bạn có chắc chắn muốn đặt hàng với tổng tiền ${formatPrice(totalAmount)} thanh toán khi nhận hàng (COD)?`
        : `Bạn có chắc chắn muốn thanh toán ${formatPrice(totalAmount)} qua cổng VNPay?`,
      okText: isCOD ? "Đặt hàng" : "Tiếp tục thanh toán",
      okType: "primary",
      okButtonProps: {
        style: {
          backgroundColor: isCOD ? "#D32F2F" : undefined,
          borderColor: isCOD ? "#D32F2F" : undefined,
        },
      },
      cancelText: "Huỷ",
      centered: true,
      onOk: handlePlaceOrder,
    });
  };

  const handlePlaceOrder = async () => {
    const noteValues = await noteForm.validateFields().catch(() => ({ note: "" }));

    let recipientName = "";
    let recipientPhone = "";
    let recipientAddress = "";

    // 2. Xử lý logic Địa chỉ
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

    // 3. Kiểm tra giỏ hàng
    if (cartItems.length === 0) {
      message.warning("Không có sản phẩm nào để thanh toán!");
      return;
    }

    // 4. Chuẩn bị Payload - CHỈ DÙNG LOGIC ĐĂNG NHẬP
    setSubmitting(true);
    const isBuyNow = location.state?.isBuyNow || false;

    const payload = {
      paymentMethod,
      note: noteValues.note,
      voucherCode: appliedVoucher?.code,
      isBuyNow: isBuyNow,
      customerId: user!.userId, // Bắt buộc có customerId
      recipientName,
      recipientPhone,
      recipientEmail: user!.email ?? "",
      recipientAddress,
      items: cartItems.map((item) => ({
        productDetailId: item.productDetailId ?? item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await paymentApi.checkout(payload);

      // 5. Xử lý kết quả
      if (response.status === "REDIRECT" && response.paymentUrl) {
        if (!isBuyNow) {
          dispatch(clearCartCount());
        }
        window.location.href = response.paymentUrl;
      } else {
        if (!isBuyNow) {
          dispatch(clearCartCount());
        }
        setSuccessOrderId(response.orderId);
      }
    } catch (error: any) {
      console.error("Lỗi đặt hàng:", error);
      message.error(error?.response?.data?.message || "Đặt hàng thất bại, vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading while checking auth
  if (!isLoggedIn) {
    return (
      <div style={{ background: "#f5f5f5", minHeight: "80vh", padding: "40px 0" }}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, color: "#666" }}>Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  const isGuest = !user?.userId;

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
                    <span>
                      <EnvironmentOutlined style={{ marginRight: 8, color: "#D32F2F" }} />
                      Địa chỉ giao hàng
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {addrMode === "saved" && savedAddresses.length > 0 && (
                        <Button size="small" icon={<EditOutlined />} onClick={() => setAddrModalOpen(true)}>
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
                          onClick={() => {
                            loadProvinces();
                            setAddrMode("new");
                          }}
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
                          {selectedAddr.isDefault && <Tag color="red" style={{ margin: 0 }}>Mặc định</Tag>}
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
                    <Form.Item name="provinceCity" hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name="wardCommune" hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name="districtCode" hidden>
                      <Input />
                    </Form.Item>

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
                              districtCode: undefined,
                              wardCode: undefined,
                              wardCommune: "",
                            });
                            if (val) {
                              loadDistricts(val);
                            } else {
                              setDistricts([]);
                              setWards([]);
                            }
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        label="Quận / Huyện"
                        name="districtCode"
                        rules={[{ required: true, message: "Vui lòng chọn Quận/Huyện" }]}
                        style={{ flex: 1 }}
                      >
                        <Select
                          showSearch
                          size="large"
                          placeholder="Chọn Quận / Huyện"
                          disabled={districts.length === 0 && !loadingDistricts}
                          loading={loadingDistricts}
                          filterOption={(input, option) =>
                            normalizeStr(String(option?.label ?? "")).includes(normalizeStr(input))
                          }
                          options={districts.map((d: any) => ({ label: d.name, value: d.code }))}
                          onChange={(val, opt) => {
                            const label = Array.isArray(opt) ? opt[0]?.label : (opt as any)?.label;
                            newAddrForm.setFieldsValue({
                              districtCode: val,
                              wardCode: undefined,
                              wardCommune: "",
                            });
                            if (val) {
                              const provinceCode = newAddrForm.getFieldValue("provinceCode");
                              if (provinceCode) {
                                loadWards(provinceCode, val);
                              }
                            } else {
                              setWards([]);
                            }
                          }}
                        />
                      </Form.Item>
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
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
                      <Input placeholder="Số nhà, tên đường…" size="large" prefix={<EnvironmentOutlined style={{ color: "#d1d5db" }} />} />
                    </Form.Item>
                  </Form>
                )}
              </Card>

              {/* ---- Card phương thức thanh toán ---- */}
              <Card
                style={{ borderRadius: 12 }}
                title={
                  <span>
                    <CreditCardOutlined style={{ marginRight: 8, color: "#D32F2F" }} />
                    Phương thức thanh toán
                  </span>
                }
              >
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
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
                  </div>
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
              <Card title="Tóm tắt đơn hàng" style={{ borderRadius: 12, position: "sticky", top: 100 }}>
                <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 16 }}>
                  {cartItems.map((item) => {
                    const orig = unitOriginal(item);
                    const sale = unitAfterPromotion(item);
                    const qty = toNum(item.quantity);
                    const hasPromo = sale < orig;
                    return (
                      <div
                        key={item.id}
                        style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}
                      >
                        <img
                          src={item.imageUrl || "https://via.placeholder.com/60"}
                          alt={item.productName}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "contain",
                            border: "1px solid #f0f0f0",
                            borderRadius: 8,
                            padding: 4,
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {item.productName}
                          </div>
                          <div style={{ color: "#888", fontSize: 12 }}>{item.variantName ?? item.version ?? ""}</div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-end",
                              marginTop: 4,
                              gap: 8,
                            }}
                          >
                            <Text type="secondary" style={{ fontSize: 12 }}>x{qty}</Text>
                            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                              {hasPromo && (
                                <Text delete type="secondary" style={{ fontSize: 11 }}>
                                  {formatPrice(orig * qty)}
                                </Text>
                              )}
                              <Text strong style={{ color: "#e53935" }}>
                                {formatPrice(sale * qty)}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Divider style={{ margin: "12px 0" }} />

                {/* Voucher */}
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>
                    <TagOutlined style={{ marginRight: 6 }} />
                    Mã giảm giá
                    {autoAppliedBestVoucher && appliedVoucher && (
                      <Tag color="gold" style={{ marginLeft: 8, fontSize: 11, verticalAlign: "middle" }}>
                        Tự động chọn
                      </Tag>
                    )}
                  </Text>
                  {appliedVoucher ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        padding: "10px 12px",
                        background: "#fff5f5",
                        border: "1.5px dashed #D32F2F",
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
                              ? `Giảm ${appliedVoucher.discountValue}%${appliedVoucher.maxDiscountAmount ? ` (tối đa ${formatPrice(appliedVoucher.maxDiscountAmount)})` : ""}`
                              : `Giảm ${formatPrice(appliedVoucher.discountValue)}`}
                          </Text>
                        </Space>
                        <CloseCircleOutlined
                          style={{ color: "#9ca3af", cursor: "pointer", fontSize: 16 }}
                          onClick={handleRemoveVoucher}
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={{ fontSize: 12, color: "#52c41a" }}>
                          Tiết kiệm: {formatPrice(voucherDiscountAmount)}
                        </Text>
                        <Button
                          type="link"
                          size="small"
                          icon={<TagOutlined />}
                          onClick={() => setVoucherModalOpen(true)}
                          style={{ padding: "2px 0", height: "auto", color: "#D32F2F", fontSize: 12 }}
                        >
                          Thay đổi
                        </Button>
                      </div>
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
                  subTotal={subTotalAfterPromotion}
                  onApply={handleApplyVoucher}
                  appliedCode={appliedVoucher?.code}
                />

                <Divider style={{ margin: "12px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text>Giá gốc (niêm yết):</Text>
                  <Text>{formatPrice(originalSubtotal)}</Text>
                </div>
                {promotionDiscountTotal > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text>Khuyến mãi:</Text>
                    <Text type="danger">-{formatPrice(promotionDiscountTotal)}</Text>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text>Tạm tính (sau khuyến mãi):</Text>
                  <Text strong>{formatPrice(subTotalAfterPromotion)}</Text>
                </div>
                {appliedVoucher && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text>Giảm voucher ({appliedVoucher.code}):</Text>
                    <Text type="danger">-{formatPrice(voucherDiscountAmount)}</Text>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text>Phí vận chuyển:</Text>
                  <Text style={{ color: "#52c41a" }}>Miễn phí</Text>
                </div>

                <Divider style={{ margin: "12px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text strong style={{ fontSize: 16 }}>Tổng cộng:</Text>
                  <Text strong style={{ fontSize: 22, color: "#e53935" }}>
                    {formatPrice(totalAmount)}
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: 11, display: "block", textAlign: "right" }}>
                  (Đã bao gồm VAT)
                </Text>

                {paymentMethod === "VNPAY" && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: "10px 14px",
                      background: "#e8f4ff",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <img src="https://vnpay.vn/s1/statics/img/logo2.bd27729b.svg" alt="VNPay" style={{ height: 24 }} />
                    <Text style={{ fontSize: 12 }}>Bạn sẽ được chuyển tới cổng thanh toán VNPay</Text>
                  </div>
                )}

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={submitting}
                  onClick={handleConfirmOrder}
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
        title={
          <span>
            <EnvironmentOutlined style={{ marginRight: 8 }} />
            Chọn địa chỉ giao hàng
          </span>
        }
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 3,
                    }}
                  >
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

      {/* ===== Modal đặt hàng thành công ===== */}
      <Modal
        open={!!successOrderId}
        footer={null}
        closable={false}
        centered
        width={420}
      >
        <div style={{ textAlign: "center", padding: "24px 16px 8px" }}>
          <CheckCircleOutlined style={{ fontSize: 64, color: "#52c41a", marginBottom: 16 }} />
          <Title level={3} style={{ color: "#1a1a1a", marginBottom: 8 }}>
            Đặt hàng thành công!
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất.
          </Text>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 28,
              justifyContent: "center",
            }}
          >
            <Button size="large" icon={<ShoppingOutlined />} onClick={() => navigate("/client")} style={{ flex: 1 }}>
              Về trang chủ
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<FileTextOutlined />}
              onClick={() => navigate(`/client/orders/${successOrderId}`)}
              style={{ flex: 1, backgroundColor: "#D32F2F", borderColor: "#D32F2F" }}
            >
              Xem đơn hàng
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===== AUTH MODAL - Bắt buộc đăng nhập ===== */}
      <AuthModal
        open={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          navigate("/"); // Đóng modal -> về trang chủ
        }}
        onSuccess={() => {
          setAuthModalOpen(false);
          // Tải lại giỏ hàng sau khi đăng nhập
          fetchCart();
          fetchAddresses();
        }}
      />
    </div>
  );
};

export default CheckoutPage;
