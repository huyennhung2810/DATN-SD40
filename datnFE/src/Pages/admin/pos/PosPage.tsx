import {
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  PrinterOutlined,
  ScanOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  UserAddOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import axios from "axios";
import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import type { CheckoutPosRequest } from "../../../api/admin/posApi";
import { posApi } from "../../../api/admin/posApi";
import shiftHandoverApi from "../../../api/shiftHandoverApi";
import { useDispatch, useSelector } from "react-redux";
import { shiftActions } from "../../../redux/shiftHandover/shiftHandoverSlice";
import type { RootState } from "../../../redux/store";
import { customerApi } from "../../../api/customerApi";
import { productDetailApi } from "../../../api/productDetailApi";
import QuickAddCustomerModal from "../../../components/QuickAddCustomerModal";
import SerialAssignmentModal from "../../../components/SerialAssignmentModal";
import ReceiptTemplate from "../../../Pages/admin/pos/ReceiptTemplate";
import { useAppSelector } from "../../../app/hook";
const { useEffect, useState, useRef } = React;

const { Title, Text } = Typography;

const PosPage: React.FC = () => {
  const dispatch = useDispatch();
  const currentShift = useSelector(
    (state: RootState) => state.shiftHandover.currentShift,
  );
  // Lấy thông tin nhân viên đăng nhập
  const authUser = useAppSelector((state) => state.auth.user);
  // Orders / Cart State
  const [orders, setOrders] = useState<any[]>([]);
  const [activeKey, setActiveKey] = useState<string>("");
  const [cartDetails, setCartDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Payment State
  const [customerCash, setCustomerCash] = useState<number | null>(null);
  const [qrModal, setQrModal] = useState<{
    open: boolean;
    totalAmount: number;
    orderCode: string;
  }>({
    open: false,
    totalAmount: 0,
    orderCode: "",
  });
  const [orderType, setOrderType] = useState<"OFFLINE" | "GIAO_HANG">(
    "OFFLINE",
  );
  const [posPaymentMethod, setPosPaymentMethod] = useState<
    "TIEN_MAT" | "CHUYEN_KHOAN"
  >("TIEN_MAT");
  const [recipientInfo, setRecipientInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "", // computed full string
    addressDetail: "",
    provinceCode: undefined as number | undefined,
    provinceCity: "",
    wardCode: undefined as number | undefined,
    wardCommune: "",
    note: "",
  });
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [recipientModalOpen, setRecipientModalOpen] = useState(false);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [draftRecipient, setDraftRecipient] = useState({
    name: "",
    phone: "",
    email: "",
    addressDetail: "",
    provinceCode: undefined as number | undefined,
    provinceCity: "",
    wardCode: undefined as number | undefined,
    wardCommune: "",
    note: "",
    shippingFee: 0,
  });
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  // const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [posProvinces, setPosProvinces] = useState<any[]>([]);
  const [posCommunes, setPosCommunes] = useState<any[]>([]);
  const [posLoadingCommunes, setPosLoadingCommunes] = useState(false);
  const [checkoutSuccessModal, setCheckoutSuccessModal] = useState<{
    open: boolean;
    orderCode: string;
    totalAmount: number;
    change: number;
    cartItems: any[];
    customerCash: number;
    voucherSaving: number;
    customerName?: string;
  }>({
    open: false,
    orderCode: "",
    totalAmount: 0,
    change: 0,
    cartItems: [],
    customerCash: 0,
    voucherSaving: 0,
  });

  // Customer Selection State
  const [customerOptions, setCustomerOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [fetchingCustomer, setFetchingCustomer] = useState(false);
  const [customerSearchKeyword, setCustomerSearchKeyword] = useState("");
  const [initialCustomersLoaded, setInitialCustomersLoaded] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Assign Serial Modal State
  const [assignModal, setAssignModal] = useState<{
    open: boolean;
    orderId: string;
    detailId: string;
    productName: string;
    requiredQty: number;
    productDetailId: string;
    initialSerials: { id: string; serialNumber: string; code: string }[];
  }>({
    open: false,
    orderId: "",
    detailId: "",
    productName: "",
    requiredQty: 0,
    productDetailId: "",
    initialSerials: [],
  });

  // Voucher State
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [applicableVouchers, setApplicableVouchers] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);

  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `HoaDon_${checkoutSuccessModal.orderCode}`,
  });

  useEffect(() => {
    fetchPendingOrders();
    fetchProducts();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const res = await posApi.getPendingOrders();
      if (res.data?.data) {
        setOrders(res.data.data);
        if (res.data.data.length > 0 && !activeKey) {
          setActiveKey(res.data.data[0].id);
          fetchOrderDetails(res.data.data[0].id);
        } else if (res.data.data.length === 0) {
          setActiveKey("");
          setCartDetails([]);
        }
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const res = await posApi.getOrderDetails(orderId);
      if (res.data?.data) {
        setCartDetails(res.data.data);
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải chi tiết hóa đơn");
    }
  };

  const fetchProducts = async (keyword = "") => {
    try {
      setLoadingProducts(true);
      const res: any = await productDetailApi.getAll({
        keyword,
        page: 0,
        size: 50,
      });
      // Accommodate generic PageResponse structures
      const productList = res?.content || res?.data || res || [];
      if (Array.isArray(productList)) {
        setProducts(productList);
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải danh sách sản phẩm");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    fetchOrderDetails(key);
    setCustomerCash(null); // Reset cash input when switching tabs
    setOrderType("OFFLINE");
    setPosPaymentMethod("TIEN_MAT");
    setRecipientInfo({
      name: "",
      phone: "",
      email: "",
      address: "",
      addressDetail: "",
      provinceCode: undefined,
      provinceCity: "",
      wardCode: undefined,
      wardCommune: "",
      note: "",
    });
    setPosCommunes([]);
    setShippingFee(0);
    setCustomerAddresses([]);
    setSelectedAddressId(null);
    // Reset applied voucher when switching tabs (will be set from activeOrder)
    setAppliedVoucher(null);
    // Reset customer search
    setCustomerSearchKeyword("");
    setCustomerOptions([]);
  };

  const handleTabEdit = (targetKey: any, action: "add" | "remove") => {
    if (action === "remove") {
      handleCancelOrder(targetKey as string);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    Modal.confirm({
      title: "Xác nhận hủy hóa đơn",
      content:
        "Bạn có chắc chắn muốn hủy và xóa hóa đơn đang chờ này? Các Serial đã gán sẽ được trả lại kho.",
      okText: "Đồng ý",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          await posApi.cancelOrder(orderId);
          message.success("Đã hủy hóa đơn thành công");
          if (activeKey === orderId) {
            setActiveKey("");
            setCartDetails([]);
          }
          fetchPendingOrders();
        } catch (error) {
          console.error(error);
          message.error("Lỗi khi hủy hóa đơn");
        }
      },
    });
  };

  const createNewOrder = async () => {
    try {
      const res = await posApi.createOrder();
      if (res.data?.data) {
        message.success("Tạo Hóa đơn mới thành công");
        fetchPendingOrders();
        setActiveKey(res.data.data.id);
        setCartDetails([]);
      } else {
        message.error(res.data?.message || "Lỗi khi tạo hóa đơn mới");
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || "Lỗi khi tạo hóa đơn mới");
    }
  };

  const handleAddProductToCart = async (productDetailId: string) => {
    if (!activeKey) {
      message.warning(
        "Vui lòng chọn hoặc tạo hóa đơn trước khi thêm sản phẩm.",
      );
      return;
    }

    try {
      await posApi.addProductToOrder(activeKey, productDetailId, 1);
      message.success("Đã thêm sản phẩm vào giỏ");
      fetchOrderDetails(activeKey);
      fetchPendingOrders();
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || "Lỗi khi thêm sản phẩm");
    }
  };

  const handleSearchCustomer = async (value: string) => {
    setCustomerSearchKeyword(value);

    // Nếu nhập text để tìm kiếm
    if (value && value.trim() !== "") {
      setFetchingCustomer(true);
      try {
        const res = await customerApi.getAll({
          keyword: value,
          page: 0,
          size: 20,
        });
        if (res && res.data && Array.isArray(res.data)) {
          const opts = res.data.map((c: any) => ({
            value: c.id,
            label: `${c.name || "Khách"} - ${c.phoneNumber || "N/A"}`,
          }));
          setCustomerOptions(opts);
        } else {
          setCustomerOptions([]);
        }
      } catch (error: any) {
        console.error("Lỗi tìm kiếm khách hàng:", error);
        message.error(
          error.response?.data?.message || "Lỗi khi tìm kiếm khách hàng",
        );
        setCustomerOptions([]);
      } finally {
        setFetchingCustomer(false);
      }
    } else {
      // Nếu xóa keyword, chỉ reset options (giữ lại danh sách cũ nếu đã load)
      setCustomerOptions([]);
    }
  };

  // Load tất cả khách hàng khi dropdown được mở (chỉ lần đầu)
  const handleCustomerDropdownOpenChange = async (open: boolean) => {
    if (
      open &&
      !initialCustomersLoaded &&
      customerOptions.length === 0 &&
      customerSearchKeyword === ""
    ) {
      setFetchingCustomer(true);
      try {
        const res = await customerApi.getAll({
          page: 0,
          size: 100, // Load nhiều khách hàng hơn
        });
        if (res && res.data && Array.isArray(res.data)) {
          const opts = res.data.map((c: any) => ({
            value: c.id,
            label: `${c.name || "Khách"} - ${c.phoneNumber || "N/A"}`,
          }));
          setCustomerOptions(opts);
          setInitialCustomersLoaded(true);
        }
      } catch (error: any) {
        console.error("Lỗi tải danh sách khách hàng:", error);
        message.error(
          error.response?.data?.message || "Lỗi tải danh sách khách hàng",
        );
      } finally {
        setFetchingCustomer(false);
      }
    }
  };

  const handleSelectCustomer = async (customerId: string | null) => {
    if (!activeKey) return;

    // Nếu xóa khách hàng (customerId = null/undefined) → xóa khách và voucher khỏi hóa đơn
    if (!customerId) {
      try {
        await posApi.removeVoucher(activeKey);
        setAppliedVoucher(null);
        await fetchOrderDetails(activeKey);
        await fetchPendingOrders();
      } catch {
        // Lỗi removeVoucher không ảnh hưởng đến việc xóa khách
      }
      return;
    }

    try {
      await posApi.setCustomer(activeKey, customerId);
      message.success("Đã cập nhật khách hàng cho hóa đơn");
      await fetchOrderDetails(activeKey);
      await fetchPendingOrders();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi thêm khách hàng");
      console.error(error);
    }
  };

  const handleQuickCustomerCreated = async (
    customerId: string,
    label: string,
  ) => {
    setCustomerOptions([{ value: customerId, label }]);
    await handleSelectCustomer(customerId);
  };

  const openVoucherModal = async () => {
    if (!activeOrder) {
      message.warning("Chưa chọn hóa đơn");
      return;
    }
    if (cartDetails.length === 0) {
      message.warning("Hóa đơn trống, không có voucher phù hợp");
      return;
    }
    setVoucherModalOpen(true);
    setLoadingVouchers(true);
    try {
      const totalToCheck = activeOrder.totalAmount || 0;
      console.log("Tìm voucher cho đơn hàng:", {
        totalAmount: totalToCheck,
        orderId: activeKey,
      });
      const res = await posApi.getApplicableVouchers(
        totalToCheck,
        activeOrder?.customer?.id || null,
      );
      console.log("Vouchers từ API:", res.data?.data);
      setApplicableVouchers(res.data?.data || []);
      if (!res.data?.data || res.data.data.length === 0) {
        message.info("Không có voucher phù hợp với đơn hàng này");
      }
    } catch (error: any) {
      console.error("Lỗi tải voucher:", error);
      message.error(
        error.response?.data?.message || "Không thể tải danh sách voucher",
      );
      setApplicableVouchers([]);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleApplyVoucher = async (voucher: any) => {
    if (!voucher || !voucher.id) {
      message.error("Voucher không hợp lệ");
      return;
    }
    console.log("Áp dụng voucher:", {
      voucherId: voucher.id,
      voucherCode: voucher.code,
      orderId: activeKey,
    });
    try {
      await posApi.applyVoucher(activeKey, voucher.id);
      setAppliedVoucher(voucher);
      message.success(`Đã áp dụng voucher ${voucher.code}`);
      setVoucherModalOpen(false);
      // Refresh order details to reflect discount
      await fetchOrderDetails(activeKey);
      await fetchPendingOrders();
    } catch (err: any) {
      console.error("Lỗi áp dụng voucher:", err);
      message.error(err.response?.data?.message || "Lỗi khi áp dụng voucher");
      // Reset applied voucher if API fails
      setAppliedVoucher(null);
    }
  };

  const handleRemoveVoucher = async () => {
    try {
      await posApi.removeVoucher(activeKey);
      setAppliedVoucher(null);
      message.success("Đã bỏ voucher");
      // Refresh order details to reflect removed discount
      await fetchOrderDetails(activeKey);
      await fetchPendingOrders();
    } catch {
      message.error("Lỗi khi bỏ voucher");
    }
  };

  // Compute activeOrder early (before useEffect to avoid TDZ)
  const activeOrder = orders.find((o) => o.id === activeKey);
  /** Sau giảm giá/voucher, chưa cộng phí ship FE; API từng không trả totalAfterDiscount */
  const payableOrderSubtotal = activeOrder
    ? Number(activeOrder.totalAfterDiscount ?? activeOrder.totalAmount ?? 0)
    : 0;

  // Fetch customer addresses khi activeOrder thay đổi customer
  useEffect(() => {
    const customerId = activeOrder?.customer?.id;
    if (customerId) {
      customerApi
        .getCustomerById(customerId)
        .then((customer: any) => setCustomerAddresses(customer.addresses || []))
        .catch(() => setCustomerAddresses([]));
    } else {
      setCustomerAddresses([]);
      setSelectedAddressId(null);
    }
  }, [activeOrder?.customer?.id]);

  // Load danh sách tỉnh/thành khi mở modal
  useEffect(() => {
    if (
      (recipientModalOpen || addressPickerOpen) &&
      posProvinces.length === 0
    ) {
      axios
        .get("https://provinces.open-api.vn/api/v2/p/?depth=1")
        .then((res) => setPosProvinces(res.data))
        .catch(() => message.error("Không tải được danh sách Tỉnh/Thành"));
    }
  }, [recipientModalOpen, addressPickerOpen]);

  // Fetch communes without side-effects — caller sets state when all data is ready
  const fetchCommunes = async (pCode: number): Promise<any[]> => {
    try {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/v2/p/${pCode}?depth=2`,
      );
      return res.data.wards || [];
    } catch {
      return [];
    }
  };

  // loadPosCommunes: fetch + cập nhật state communes cho Select tỉnh/phường
  const loadPosCommunes = async (pCode: number): Promise<any[]> => {
    if (!pCode) return [];
    setPosLoadingCommunes(true);
    const wards = await fetchCommunes(pCode);
    setPosCommunes(wards);
    setPosLoadingCommunes(false);
    return wards;
  };
  // const setAddressAsDefault = async (targetAddrId: string) => {
  //   const customer = activeOrder?.customer;
  //   if (!customer) return;
  //   setSettingDefaultId(targetAddrId);
  //   try {
  //     const updatedAddresses = customerAddresses.map((addr: any) => ({
  //       id: addr.id,
  //       name: addr.name || "",
  //       phoneNumber: addr.phoneNumber || "",
  //       provinceCode: addr.provinceCode,
  //       wardCode: addr.wardCode,
  //       provinceCity: addr.provinceCity || "",
  //       wardCommune: addr.wardCommune || "",
  //       addressDetail: addr.addressDetail || "",
  //       isDefault: addr.id === targetAddrId,
  //     }));
  //     await customerApi.updateCustomer({
  //       id: customer.id,
  //       name: customer.name || "",
  //       email: customer.email || "",
  //       phoneNumber: customer.phoneNumber || "",
  //       gender: customer.gender ?? true,
  //       dateOfBirth: customer.dateOfBirth ?? null,
  //       image: customer.image ?? null,
  //       addresses: updatedAddresses,
  //     });
  //     const updated = await customerApi.getCustomerById(customer.id);
  //     setCustomerAddresses((updated as any).addresses || []);
  //     message.success("Đã đặt làm địa chỉ mặc định");
  //   } catch {
  //     message.error("Không thể cập nhật địa chỉ mặc định");
  //   } finally {
  //     setSettingDefaultId(null);
  //   }
  // };

  useEffect(() => {
    if (activeOrder?.voucher) {
      setAppliedVoucher(activeOrder.voucher);
    } else if (activeOrder && !activeOrder.voucher) {
      setAppliedVoucher(null);
    }
  }, [activeOrder?.id, activeOrder?.voucher]);

  // Helper: compute best voucher saving amount
  const calcVoucherSaving = (voucher: any, total: number): number => {
    if (!voucher) return 0;

    const unit = voucher.discountUnit
      ? String(voucher.discountUnit).trim().toUpperCase()
      : "";

    if (unit === "%" || unit === "PERCENT") {
      const disc = (total * voucher.discountValue) / 100;
      return voucher.maxDiscountAmount
        ? Math.min(disc, voucher.maxDiscountAmount)
        : disc;
    }
    return voucher.discountValue || 0;
  };

  // Helper: product discount = totalAmount - sum(unitPrice*qty from cart before voucher)
  const productDiscountAmount = (): number => {
    return cartDetails.reduce((acc: number, d: any) => {
      const originalPrice = d.productDetail?.originalPrice || 0;
      const currentPrice = d.unitPrice || 0;
      return acc + (originalPrice - currentPrice) * (d.quantity || 1);
    }, 0);
  };

  const handleRemoveProduct = async (detailId: string) => {
    if (!activeKey) return;
    try {
      await posApi.removeProductFromOrder(activeKey, detailId);
      message.success("Đã xóa sản phẩm khỏi giỏ");
      fetchOrderDetails(activeKey);
      fetchPendingOrders();
    } catch (error: any) {
      console.error(error);
      message.error("Lỗi khi xóa sản phẩm");
    }
  };

  const openRecipientModal = async (currentCustomer?: any) => {
    const customer = currentCustomer ?? activeOrder?.customer;

    let provinces = posProvinces;
    if (provinces.length === 0) {
      try {
        const res = await axios.get(
          "https://provinces.open-api.vn/api/v2/p/?depth=1",
        );
        provinces = res.data;
        setPosProvinces(provinces);
      } catch {
        message.error("Không tải được danh sách Tỉnh/Thành");
      }
    }

    const defaultAddr =
      customerAddresses.find((a) => a.isDefault) || customerAddresses[0];
    if (defaultAddr && !recipientInfo.name) {
      // Chưa có thông tin → tự điền địa chỉ mặc định
      setSelectedAddressId(defaultAddr.id);
      setDraftRecipient({
        name: defaultAddr.name || "",
        phone: defaultAddr.phoneNumber || "",
        email: recipientInfo.email || customer?.email || "",
        addressDetail: defaultAddr.addressDetail || "",
        provinceCode: defaultAddr.provinceCode
          ? Number(defaultAddr.provinceCode)
          : undefined,
        provinceCity: defaultAddr.provinceCity || "",
        wardCode: undefined,
        wardCommune: "",
        note: recipientInfo.note,
        shippingFee,
      });
      if (defaultAddr.provinceCode) {
        const wards = await loadPosCommunes(Number(defaultAddr.provinceCode));
        const wCode = defaultAddr.wardCode
          ? Number(defaultAddr.wardCode)
          : undefined;
        const matched = wards.find((w: any) => w.code === wCode);
        setDraftRecipient((prev) => ({
          ...prev,
          wardCode: matched ? wCode : undefined,
          wardCommune: matched
            ? matched.name || defaultAddr.wardCommune || ""
            : "",
        }));
      }
    } else {
      // Đã có thông tin hoặc không có địa chỉ → giữ nguyên
      setSelectedAddressId(recipientInfo.addressDetail ? "existing" : null);
      setDraftRecipient({
        name: recipientInfo.name || customer?.name || "",
        phone: recipientInfo.phone || customer?.phoneNumber || "",
        email: recipientInfo.email || customer?.email || "",
        addressDetail: recipientInfo.addressDetail,
        provinceCode: recipientInfo.provinceCode,
        provinceCity: recipientInfo.provinceCity,
        wardCode: undefined,
        wardCommune: "",
        note: recipientInfo.note,
        shippingFee,
      });
      if (recipientInfo.provinceCode) {
        const wards = await loadPosCommunes(recipientInfo.provinceCode);
        const wCode = recipientInfo.wardCode;
        const matched = wards.find((w: any) => w.code === wCode);
        setDraftRecipient((prev) => ({
          ...prev,
          wardCode: matched ? wCode : undefined,
          wardCommune: matched
            ? matched.name || recipientInfo.wardCommune || ""
            : "",
        }));
      }
    }
    setRecipientModalOpen(true);
  };

  const handleSaveRecipient = async () => {
    if (!draftRecipient.name.trim()) {
      message.error("Vui lòng nhập tên người nhận!");
      return;
    }
    if (!draftRecipient.phone.trim()) {
      message.error("Vui lòng nhập số điện thoại người nhận!");
      return;
    }
    if (!draftRecipient.provinceCity) {
      message.error("Vui lòng chọn Tỉnh/Thành phố!");
      return;
    }
    if (!draftRecipient.wardCommune) {
      message.error("Vui lòng chọn Xã/Phường!");
      return;
    }
    if (!draftRecipient.addressDetail.trim()) {
      message.error("Vui lòng nhập số nhà, tên đường!");
      return;
    }
    const fullAddress = [
      draftRecipient.addressDetail,
      draftRecipient.wardCommune,
      draftRecipient.provinceCity,
    ]
      .filter(Boolean)
      .join(", ");
    setRecipientInfo({
      name: draftRecipient.name,
      phone: draftRecipient.phone,
      email: draftRecipient.email,
      address: fullAddress,
      addressDetail: draftRecipient.addressDetail,
      provinceCode: draftRecipient.provinceCode,
      provinceCity: draftRecipient.provinceCity,
      wardCode: draftRecipient.wardCode,
      wardCommune: draftRecipient.wardCommune,
      note: draftRecipient.note,
    });
    setShippingFee(draftRecipient.shippingFee);

    // Nếu là địa chỉ mới và đơn hàng có khách hàng → lưu vào sổ địa chỉ
    const customer = activeOrder?.customer;
    if (selectedAddressId === "custom" && customer?.id) {
      try {
        const existingAddresses = customerAddresses.map((addr: any) => ({
          id: addr.id,
          name: addr.name || "",
          phoneNumber: addr.phoneNumber || "",
          provinceCode: addr.provinceCode,
          wardCode: addr.wardCode,
          provinceCity: addr.provinceCity || "",
          wardCommune: addr.wardCommune || "",
          addressDetail: addr.addressDetail || "",
          isDefault: addr.isDefault ?? false,
        }));
        const newAddr = {
          name: draftRecipient.name,
          phoneNumber: draftRecipient.phone,
          provinceCode: draftRecipient.provinceCode,
          wardCode: draftRecipient.wardCode,
          provinceCity: draftRecipient.provinceCity,
          wardCommune: draftRecipient.wardCommune,
          addressDetail: draftRecipient.addressDetail,
          // Mặc định nếu chưa có địa chỉ nào
          isDefault: existingAddresses.length === 0,
        };
        await customerApi.updateCustomer({
          id: customer.id,
          name: customer.name || "",
          email: customer.email || "",
          phoneNumber: customer.phoneNumber || "",
          gender: customer.gender ?? true,
          dateOfBirth: customer.dateOfBirth ?? null,
          image: customer.image ?? null,
          addresses: [...existingAddresses, newAddr],
        });
        // Tải lại danh sách địa chỉ
        const updated = await customerApi.getCustomerById(customer.id);
        const updatedAddresses = (updated as any).addresses || [];
        setCustomerAddresses(updatedAddresses);
        // Tự động chọn địa chỉ vừa thêm (địa chỉ cuối cùng)
        const newSaved = updatedAddresses[updatedAddresses.length - 1];
        if (newSaved) setSelectedAddressId(newSaved.id);
        message.success("Đã lưu địa chỉ mới vào danh sách");
      } catch {
        message.warning(
          "Lưu thông tin giao hàng thành công, nhưng không thể lưu địa chỉ vào danh sách khách hàng",
        );
      }
    }

    setRecipientModalOpen(false);
    message.success("Đã lưu thông tin người nhận");
  };

  const handleQrOpen = () => {
    if (!activeKey || cartDetails.length === 0) {
      message.warning("Hóa đơn trống, không thể thanh toán.");
      return;
    }
    const isMissingSerials = cartDetails.some(
      (d) => (d.assignedSerialsCount || 0) < d.quantity,
    );
    if (isMissingSerials) {
      message.error(
        "Vui lòng gán ĐẦY ĐỦ số lượng Serial cho tất cả các sản phẩm trước khi thanh toán.",
      );
      return;
    }
    const totalToPay =
      payableOrderSubtotal + (orderType === "GIAO_HANG" ? shippingFee : 0);
    setQrModal({
      open: true,
      totalAmount: totalToPay,
      orderCode: activeOrder?.code || "",
    });
  };

  const handleCheckout = async () => {
    if (!activeKey || cartDetails.length === 0) {
      message.warning("Hóa đơn trống, không thể thanh toán.");
      return;
    }

    const totalToPay =
      payableOrderSubtotal + (orderType === "GIAO_HANG" ? shippingFee : 0);

    // Validate tiền mặt chỉ khi TIEN_MAT
    if (posPaymentMethod === "TIEN_MAT") {
      if (customerCash === null) {
        message.error("Vui lòng nhập số tiền khách đưa trước khi thanh toán!");
        return;
      }
      if (customerCash < totalToPay) {
        message.error("Số tiền khách đưa không đủ!");
        return;
      }
    }

    // Validate thông tin người nhận khi giao hàng
    if (orderType === "GIAO_HANG") {
      if (!recipientInfo.name.trim()) {
        message.error("Vui lòng nhập tên người nhận!");
        return;
      }
      if (!recipientInfo.phone.trim()) {
        message.error("Vui lòng nhập số điện thoại người nhận!");
        return;
      }
      if (!recipientInfo.address.trim()) {
        message.error("Vui lòng nhập địa chỉ giao hàng!");
        return;
      }
    }

    const isMissingSerials = cartDetails.some(
      (d) => (d.assignedSerialsCount || 0) < d.quantity,
    );
    if (isMissingSerials) {
      message.error(
        "Vui lòng gán ĐẦY ĐỦ số lượng Serial cho tất cả các sản phẩm trước khi thanh toán.",
      );
      return;
    }

    const checkoutBody: CheckoutPosRequest = {
      orderType,
      paymentMethod: posPaymentMethod,
      ...(orderType === "GIAO_HANG" && {
        recipientName: recipientInfo.name,
        recipientPhone: recipientInfo.phone,
        recipientEmail: recipientInfo.email,
        recipientAddress: recipientInfo.address,
        shippingFee: shippingFee,
      }),
      ...(posPaymentMethod === "TIEN_MAT" && {
        customerPaid: customerCash ?? 0,
      }),
    };

    try {
      const res = await posApi.checkout(activeKey, checkoutBody);
      if (res.data?.data) {
        const changeAmount =
          posPaymentMethod === "TIEN_MAT" && customerCash !== null
            ? customerCash - totalToPay
            : 0;

        setCheckoutSuccessModal({
          open: true,
          orderCode: activeOrder.code,
          totalAmount: totalToPay,
          change: changeAmount > 0 ? changeAmount : 0,
          cartItems: [...cartDetails],
          customerCash: customerCash || 0,
          voucherSaving: calcVoucherSaving(
            appliedVoucher,
            activeOrder.totalAmount || 0,
          ),
          customerName: activeOrder?.customer?.name,
        });

        // --- Cập nhật lại doanh thu ca làm việc ---
        if (currentShift?.workScheduleId) {
          try {
            const stats = await shiftHandoverApi.getShiftStats(
              currentShift.workScheduleId,
            );
            // Cập nhật toàn bộ thông tin ca làm việc mới nhất vào Redux/localStorage
            dispatch(
              shiftActions.checkInSuccess({
                ...currentShift,
                ...stats,
              }),
            );
          } catch (err) {
            console.error("Không thể cập nhật doanh thu ca làm việc:", err);
          }
        }

        fetchPendingOrders();
      }
    } catch (error: any) {
      console.error(error);
      message.error(
        error.response?.data?.message || "Thanh toán lỗi. Hãy kiểm tra lại.",
      );
    }
  };

  const cartColumns = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_: any, record: any) => {
        const name = record.productDetail?.product?.name;
        const ver = record.productDetail?.version;
        const color = record.productDetail?.color?.name;
        return (
          <Text
            strong
          >{`${name || "Sản phẩm"} ${ver ? `(${ver})` : ""} - ${color || ""}`}</Text>
        );
      },
    },
    {
      title: "Mã SP",
      key: "productCode",
      render: (_: any, record: any) => (
        <Text code style={{ fontSize: 12 }}>
          {record.productDetail?.product?.code || "—"}
        </Text>
      ),
    },
    {
      title: "Mã SPCT",
      key: "productDetailCode",
      render: (_: any, record: any) => (
        <Text code style={{ fontSize: 12 }}>
          {record.productDetail?.code || "—"}
        </Text>
      ),
    },
    {
      title: "Đơn giá",
      key: "unitPrice",
      render: (_: any, record: any) => {
        const original = record.productDetail?.originalPrice;
        const current = record.unitPrice;
        const hasDiscount = original && original > current;
        return (
          <Space orientation="vertical" size={0}>
            {hasDiscount && (
              <Text delete type="secondary" style={{ fontSize: "10px" }}>
                {original.toLocaleString("vi-VN")} đ
              </Text>
            )}
            <Text strong style={{ color: hasDiscount ? "#f5222d" : undefined }}>
              {current?.toLocaleString("vi-VN") || 0} đ
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      render: (qty: number) => <Tag color="blue">{qty}</Tag>,
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => (
        <Text
          type="success"
          strong
        >{`${price?.toLocaleString("vi-VN") || 0} đ`}</Text>
      ),
    },
    {
      title: "Serial",
      key: "serial",
      align: "center" as const,
      render: (_: any, record: any) => {
        const assigned = record.assignedSerialsCount || 0;
        const req = record.quantity || 0;
        const isComplete = assigned === req;
        return (
          <Space orientation="vertical" size="small">
            {isComplete ? (
              <Tag color="success">
                Đã gán đủ {assigned}/{req}
              </Tag>
            ) : (
              <Tag color="warning">
                Đã gán {assigned}/{req}
              </Tag>
            )}
            <Button
              type={isComplete ? "default" : "primary"}
              danger={!isComplete}
              size="small"
              icon={<ScanOutlined />}
              onClick={() =>
                setAssignModal({
                  open: true,
                  orderId: activeKey,
                  detailId: record.id,
                  productName:
                    record.productDetail?.product?.name || "Sản phẩm",
                  requiredQty: record.quantity,
                  productDetailId: record.productDetail?.id || "",
                  initialSerials: record.assignedSerials || [],
                })
              }
            >
              {isComplete ? "Sửa Serial" : "Chọn Serial"}
            </Button>
          </Space>
        );
      },
    },
    {
      title: "Xóa",
      key: "action",
      align: "center" as const,
      render: (_: any, record: any) => (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveProduct(record.id)}
        />
      ),
    },
  ];

  const productColumns = [
    {
      title: "Mã SP",
      key: "productCode",
      render: (_: any, record: any) => (
        <Text code style={{ fontSize: 12 }}>
          {record.productCode || "—"}
        </Text>
      ),
    },
    {
      title: "Mã SPCT",
      key: "productDetailCode",
      render: (_: any, record: any) => (
        <Text code style={{ fontSize: 12 }}>
          {record.code || "—"}
        </Text>
      ),
    },
    {
      title: "Tên SP",
      key: "name",
      render: (_: any, record: any) => (
        <Text strong>{record.productName || record.product?.name || "—"}</Text>
      ),
    },
    {
      title: "Màu sắc",
      key: "color",
      render: (_: any, record: any) => (
        <Text>{record.colorName || record.color?.name || "—"}</Text>
      ),
    },
    {
      title: "Phiên bản",
      dataIndex: "version",
      key: "version",
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
    },
    {
      title: "Giá bán",
      key: "price",
      render: (_: any, record: any) => {
        const original = record.salePrice;
        const current = record.discountedPrice;
        const hasDiscount = current && current < original;
        return (
          <Space orientation="vertical" size={0}>
            {hasDiscount && (
              <Text delete type="secondary" style={{ fontSize: "11px" }}>
                {original?.toLocaleString("vi-VN")} đ
              </Text>
            )}
            <Text type={hasDiscount ? "danger" : undefined} strong>
              {(current || original)?.toLocaleString("vi-VN")} đ
            </Text>
            {hasDiscount && (
              <Tag color="red" style={{ fontSize: "9px", margin: 0 }}>
                GIẢM GIÁ
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "center" as const,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          disabled={record.quantity === 0}
          onClick={() => handleAddProductToCart(record.id)}
        >
          Thêm
        </Button>
      ),
    },
  ];

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>
      <div
        className="solid-card"
        style={{ padding: "var(--spacing-lg)", marginBottom: 16 }}
      >
        <Row justify="space-between" align="middle">
          <Space align="center" size={16}>
            <div
              style={{
                backgroundColor: "var(--color-primary-light)",
                padding: "12px",
                borderRadius: "var(--radius-md)",
              }}
            >
              <ShoppingCartOutlined
                style={{ fontSize: "24px", color: "var(--color-primary)" }}
              />
            </div>

            <div>
              <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                Bán Hàng Tại Quầy (POS)
              </Title>
              <Text type="secondary" style={{ fontSize: "13px" }}>
                Hệ thống tạo và quản lý hóa đơn
              </Text>
            </div>
          </Space>

          <Space>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Hóa đơn chờ:{" "}
              <Text
                strong
                style={{ color: orders.length >= 10 ? "#f5222d" : undefined }}
              >
                {orders.length}/10
              </Text>
            </Text>

            <Tooltip
              title={
                orders.length >= 10 ? "Đã đạt giới hạn 10 hóa đơn chờ" : ""
              }
            >
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={createNewOrder}
                disabled={orders.length >= 10}
              >
                Tạo Hóa đơn Mới
              </Button>
            </Tooltip>
          </Space>
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        <Col
          span={16}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <Card
            title="Giỏ Hàng (Các Hóa đơn)"
            variant="borderless"
            style={{ flex: 1, minHeight: "350px" }}
          >
            {orders.length > 0 ? (
              <Tabs
                activeKey={activeKey}
                onChange={handleTabChange}
                type="editable-card"
                hideAdd
                onEdit={handleTabEdit}
                items={orders.map((order) => ({
                  label: `HĐ ${order.code || order.id.substring(0, 5)}`,
                  key: order.id,
                  children: (
                    <Table
                      dataSource={cartDetails}
                      columns={cartColumns as any}
                      rowKey="id"
                      pagination={false}
                      loading={loading}
                      bordered
                      size="small"
                    />
                  ),
                }))}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <Text type="secondary">
                  Chưa có hóa đơn nào. Vui lòng Bấm "Tạo Hóa đơn Mới".
                </Text>
              </div>
            )}
          </Card>

          <Card
            title="Tìm kiếm Kho Hàng"
            variant="borderless"
            style={{ flex: 1 }}
          >
            <Input
              placeholder="Nhập tên máy ảnh, dòng máy..."
              size="large"
              suffix={<SearchOutlined />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={() => fetchProducts(searchKeyword)}
              style={{ marginBottom: 16 }}
            />
            <Table
              loading={loadingProducts}
              dataSource={products}
              columns={productColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
            />
          </Card>

          {orderType === "GIAO_HANG" && activeOrder && (
            <Card
              variant="borderless"
              title={
                <Space>
                  <CarOutlined style={{ color: "#1890ff" }} />
                  <span>Thông tin người nhận</span>
                </Space>
              }
              extra={
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={openRecipientModal}
                >
                  Chỉnh sửa
                </Button>
              }
            >
              {recipientInfo.name ? (
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Space>
                      <UserOutlined style={{ color: "#1890ff" }} />
                      <Text strong>{recipientInfo.name}</Text>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Text>{recipientInfo.phone}</Text>
                  </Col>
                  {recipientInfo.email && (
                    <Col span={24}>
                      <Text type="secondary">{recipientInfo.email}</Text>
                    </Col>
                  )}
                  <Col span={24}>
                    <Space align="start">
                      <CarOutlined style={{ color: "#8c8c8c", marginTop: 3 }} />
                      <Text>{recipientInfo.address}</Text>
                    </Space>
                  </Col>
                  {recipientInfo.note && (
                    <Col span={24}>
                      <Text type="secondary" italic>
                        Ghi chú: {recipientInfo.note}
                      </Text>
                    </Col>
                  )}
                </Row>
              ) : (
                <Alert
                  type="warning"
                  showIcon
                  icon={<InfoCircleOutlined />}
                  message="Chưa có thông tin người nhận"
                  description='Nhấn "Chỉnh sửa" để nhập thông tin giao hàng.'
                />
              )}
            </Card>
          )}
        </Col>

        <Col span={8}>
          <Card
            variant="borderless"
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Title level={4}>Thanh Toán</Title>

            <div style={{ flex: 1, marginTop: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <Text
                  type="secondary"
                  style={{ display: "block", marginBottom: 8 }}
                >
                  Khách hàng:
                </Text>
                <Space.Compact style={{ width: "100%" }}>
                  <Select
                    showSearch
                    placeholder="Chọn khách hàng (Có thể để trống)"
                    style={{ flex: 1 }}
                    allowClear
                    value={activeOrder?.customer?.id || undefined}
                    options={
                      customerOptions.length > 0
                        ? customerOptions
                        : activeOrder?.customer
                          ? [
                              {
                                value: activeOrder.customer.id,
                                label: `${activeOrder.customer.name} - ${activeOrder.customer.phoneNumber || "N/A"}`,
                              },
                            ]
                          : []
                    }
                    onSearch={handleSearchCustomer}
                    onChange={handleSelectCustomer}
                    onOpenChange={handleCustomerDropdownOpenChange}
                    filterOption={false}
                    loading={fetchingCustomer}
                    suffixIcon={<UserOutlined />}
                    notFoundContent={
                      fetchingCustomer ? (
                        <Text type="secondary">Đang tải...</Text>
                      ) : customerOptions.length === 0 ? (
                        <Text type="secondary">
                          Không có khách hàng, hãy thêm khách hàng mới
                        </Text>
                      ) : null
                    }
                  />
                  <Tooltip title="Thêm nhanh khách hàng mới">
                    <Button
                      icon={<UserAddOutlined />}
                      onClick={() => setQuickAddOpen(true)}
                      disabled={!activeKey}
                    />
                  </Tooltip>
                </Space.Compact>
              </div>
              {activeOrder ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <Text>Mã Hóa Đơn:</Text>
                    <Text strong>{activeOrder.code}</Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Text>Tổng tiền hàng:</Text>
                    <Text strong>
                      {activeOrder.totalAmount?.toLocaleString("vi-VN") || 0} đ
                    </Text>
                  </div>
                  {productDiscountAmount() > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Space size={4}>
                        <TagsOutlined style={{ color: "#1890ff" }} />
                        <Text>Giảm giá sản phẩm:</Text>
                      </Space>
                      <Text strong type="success">
                        -{productDiscountAmount().toLocaleString("vi-VN")} đ
                      </Text>
                    </div>
                  )}

                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Space size={4}>
                        <GiftOutlined style={{ color: "#fa8c16" }} />
                        <Text>Voucher:</Text>
                      </Space>
                      {appliedVoucher ? (
                        <Space size={4}>
                          <Tag color="orange" icon={<GiftOutlined />}>
                            {appliedVoucher.code}
                          </Tag>
                          <Text strong type="success">
                            -
                            {calcVoucherSaving(
                              appliedVoucher,
                              activeOrder.totalAmount || 0,
                            ).toLocaleString("vi-VN")}{" "}
                            đ
                          </Text>
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<CloseCircleOutlined />}
                            onClick={handleRemoveVoucher}
                          />
                        </Space>
                      ) : (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Voucher sẽ được tự động áp dụng khi chọn khách hàng
                        </Text>
                      )}
                    </div>
                  </div>
                  {orderType === "GIAO_HANG" && shippingFee > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Space size={4}>
                        <CarOutlined style={{ color: "#1890ff" }} />
                        <Text>Phí giao hàng:</Text>
                      </Space>
                      <Text strong>
                        +{shippingFee.toLocaleString("vi-VN")} đ
                      </Text>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 24,
                      borderTop: "1px dashed #ccc",
                      paddingTop: 16,
                    }}
                  >
                    <Title level={4} style={{ margin: 0 }}>
                      Khách cần trả:
                    </Title>
                    <Title level={4} type="danger" style={{ margin: 0 }}>
                      {(
                        payableOrderSubtotal +
                        (orderType === "GIAO_HANG" ? shippingFee : 0)
                      ).toLocaleString("vi-VN")}{" "}
                      đ
                    </Title>
                  </div>

                  <div
                    style={{
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text strong>
                      <CarOutlined style={{ marginRight: 6 }} />
                      Giao hàng
                    </Text>
                    <Switch
                      checked={orderType === "GIAO_HANG"}
                      onChange={(checked) => {
                        const newType = checked ? "GIAO_HANG" : "OFFLINE";
                        setOrderType(newType);
                        if (checked) {
                          openRecipientModal();
                        }
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      Phương thức thanh toán:
                    </Text>
                    <Radio.Group
                      value={posPaymentMethod}
                      onChange={(e) => setPosPaymentMethod(e.target.value)}
                      style={{ width: "100%" }}
                    >
                      <Radio.Button
                        value="TIEN_MAT"
                        style={{ width: "50%", textAlign: "center" }}
                      >
                        <Space>
                          <WalletOutlined />
                          Tiền mặt
                        </Space>
                      </Radio.Button>
                      <Radio.Button
                        value="CHUYEN_KHOAN"
                        style={{ width: "50%", textAlign: "center" }}
                      >
                        <Space>
                          <ScanOutlined />
                          Chuyển khoản / QR
                        </Space>
                      </Radio.Button>
                    </Radio.Group>
                  </div>

                  {posPaymentMethod === "TIEN_MAT" && (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <Text strong>Tiền khách đưa:</Text>
                        <InputNumber
                          style={{ width: "100%", marginTop: 8 }}
                          size="large"
                          value={customerCash}
                          onChange={(val) => setCustomerCash(val as number)}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) =>
                            value!.replace(/\$\s?|(,*)/g, "") as any
                          }
                          addonAfter="đ"
                          placeholder="Nhập số tiền..."
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 24,
                        }}
                      >
                        <Text>Tiền thối lại:</Text>
                        {(() => {
                          const total =
                            payableOrderSubtotal +
                            (orderType === "GIAO_HANG" ? shippingFee : 0);
                          if (customerCash !== null && customerCash >= total) {
                            return (
                              <Text strong type="success">
                                {(customerCash - total).toLocaleString("vi-VN")}{" "}
                                đ
                              </Text>
                            );
                          }
                          return (
                            <Text
                              strong
                              type={
                                customerCash !== null ? "danger" : "secondary"
                              }
                            >
                              {customerCash !== null
                                ? "Khách đưa thiếu tiền"
                                : "0 đ"}
                            </Text>
                          );
                        })()}
                      </div>
                    </>
                  )}

                  {posPaymentMethod === "CHUYEN_KHOAN" && (
                    <div
                      style={{
                        marginBottom: 24,
                        padding: "14px 16px",
                        background: "#f6ffed",
                        borderRadius: 8,
                        border: "1px solid #b7eb8f",
                        textAlign: "center",
                      }}
                    >
                      <Space align="center" style={{ marginBottom: 8 }}>
                        <ScanOutlined
                          style={{ fontSize: 20, color: "#52c41a" }}
                        />
                        <Text strong style={{ color: "#52c41a" }}>
                          Chuyển khoản / QR
                        </Text>
                      </Space>
                      <div
                        style={{ margin: "10px auto", display: "inline-block" }}
                      >
                        <QRCodeSVG
                          value={`CHUYEN_KHOAN|${activeOrder?.code || ""}|${(
                            payableOrderSubtotal +
                            (orderType === "GIAO_HANG" ? shippingFee : 0)
                          ).toString()}|DATN Camera`}
                          size={160}
                          level="M"
                          includeMargin
                        />
                      </div>
                      <Text
                        type="secondary"
                        style={{ display: "block", fontSize: 12 }}
                      >
                        Khách quét mã QR, chuyển khoản xong nhấn “Xác nhận Thanh
                        toán”.
                      </Text>
                    </div>
                  )}
                </>
              ) : (
                <Text type="secondary">
                  Chọn hóa đơn để xem thông tin thanh toán
                </Text>
              )}
            </div>

            <Button
              type="primary"
              size="large"
              style={{ background: "#52c41a" }}
              block
              onClick={() => {
                if (posPaymentMethod === "CHUYEN_KHOAN") {
                  handleQrOpen();
                  return;
                }
                const totalToPay =
                  payableOrderSubtotal +
                  (orderType === "GIAO_HANG" ? shippingFee : 0);
                Modal.confirm({
                  title: "Xác nhận thanh toán",
                  content: `Bạn có chắc chắn muốn thanh toán hóa đơn ${activeOrder?.code} với số tiền ${totalToPay.toLocaleString("vi-VN")} đ?`,
                  okText: "Thanh toán",
                  okType: "primary",
                  cancelText: "Huỷ",
                  onOk: handleCheckout,
                });
              }}
              disabled={
                !activeOrder ||
                cartDetails.length === 0 ||
                cartDetails.some(
                  (d) => (d.assignedSerialsCount || 0) < d.quantity,
                ) ||
                (posPaymentMethod === "TIEN_MAT" &&
                  (customerCash === null ||
                    customerCash <
                      payableOrderSubtotal +
                        (orderType === "GIAO_HANG" ? shippingFee : 0)))
              }
            >
              Xác nhận Thanh toán
            </Button>
          </Card>
        </Col>
      </Row>

      <SerialAssignmentModal
        open={assignModal.open}
        onClose={() => setAssignModal({ ...assignModal, open: false })}
        orderId={assignModal.orderId}
        detailId={assignModal.detailId}
        productName={assignModal.productName}
        requiredQuantity={assignModal.requiredQty}
        productDetailId={assignModal.productDetailId}
        onSuccess={() => fetchOrderDetails(activeKey)}
        initialSerials={assignModal.initialSerials}
      />

      <QuickAddCustomerModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreated={handleQuickCustomerCreated}
      />

      <Modal
        title={
          <Space>
            <GiftOutlined style={{ color: "#fa8c16" }} />
            <span>Chọn Voucher</span>
          </Space>
        }
        open={voucherModalOpen}
        onCancel={() => setVoucherModalOpen(false)}
        footer={null}
        width={520}
      >
        {loadingVouchers ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <Text type="secondary">Đang tải...</Text>
          </div>
        ) : applicableVouchers.length === 0 ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <GiftOutlined style={{ fontSize: 40, color: "#d9d9d9" }} />
            <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
              Không có voucher phù hợp với đơn hàng này
            </Text>
          </div>
        ) : (
          (() => {
            const total = activeOrder?.totalAmount || 0;
            const withSavings = applicableVouchers.map((v: any) => ({
              ...v,
              saving: calcVoucherSaving(v, total),
            }));
            const bestId = withSavings.reduce(
              (best: any, v: any) =>
                v.saving > (best?.saving ?? -1) ? v : best,
              null,
            )?.id;
            return (
              <div>
                {withSavings.map((v: any) => (
                  <div
                    key={v.id}
                    style={{
                      border:
                        v.id === bestId
                          ? "2px solid #fa8c16"
                          : "1px solid #f0f0f0",
                      borderRadius: 8,
                      padding: "12px 16px",
                      marginBottom: 12,
                      background: v.id === bestId ? "#fff9f0" : "#fafafa",
                      position: "relative",
                    }}
                  >
                    {v.id === bestId && (
                      <Tag
                        color="orange"
                        style={{
                          position: "absolute",
                          top: -10,
                          left: 12,
                          fontSize: 11,
                        }}
                      >
                        GỢI Ý TỐT NHẤT
                      </Tag>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <Space>
                          <Tag color="orange">{v.code}</Tag>
                          <Text strong>{v.name}</Text>
                        </Space>
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Giảm:{" "}
                            {v.discountUnit === "%"
                              ? `${v.discountValue}% (tối đa ${v.maxDiscountAmount?.toLocaleString("vi-VN")} đ)`
                              : `${v.discountValue?.toLocaleString("vi-VN")} đ`}
                            {v.conditions
                              ? ` · Đơn tối thiểu ${v.conditions?.toLocaleString("vi-VN")} đ`
                              : ""}
                          </Text>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div>
                          <Text type="success" strong>
                            -{v.saving.toLocaleString("vi-VN")} đ
                          </Text>
                        </div>
                        <Button
                          type={v.id === bestId ? "primary" : "default"}
                          size="small"
                          style={{ marginTop: 4 }}
                          onClick={() => handleApplyVoucher(v)}
                        >
                          Áp dụng
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()
        )}
      </Modal>

      <ReceiptTemplate
        ref={receiptRef}
        orderCode={checkoutSuccessModal.orderCode}
        cartItems={checkoutSuccessModal.cartItems || []}
        totalAmount={checkoutSuccessModal.totalAmount}
        customerCash={checkoutSuccessModal.customerCash || 0}
        change={checkoutSuccessModal.change}
        voucherSaving={checkoutSuccessModal.voucherSaving}
        customerName={checkoutSuccessModal.customerName}
        staffName={authUser?.fullName || authUser?.username || ""}
      />

      {/* Modal Thông tin người nhận */}
      <Modal
        title={
          <Space>
            <InfoCircleOutlined style={{ color: "#1890ff" }} />
            <span>Thông tin người nhận</span>
          </Space>
        }
        open={recipientModalOpen}
        onCancel={() => setRecipientModalOpen(false)}
        onOk={handleSaveRecipient}
        okText="Lưu thông tin"
        cancelText="Hủy"
        width={560}
      >
        <div style={{ paddingTop: 8 }}>
          {/* Tên + SĐT */}
          <Row gutter={12} style={{ marginBottom: 12 }}>
            <Col span={12}>
              <Text strong>
                Tên người nhận <Text type="danger">*</Text>
              </Text>
              <Input
                style={{ marginTop: 4 }}
                placeholder="Nhập tên người nhận..."
                value={draftRecipient.name}
                onChange={(e) =>
                  setDraftRecipient({ ...draftRecipient, name: e.target.value })
                }
              />
            </Col>
            <Col span={12}>
              <Text strong>
                Số điện thoại <Text type="danger">*</Text>
              </Text>
              <Input
                style={{ marginTop: 4 }}
                placeholder="Nhập số điện thoại..."
                value={draftRecipient.phone}
                onChange={(e) =>
                  setDraftRecipient({
                    ...draftRecipient,
                    phone: e.target.value,
                  })
                }
              />
            </Col>
          </Row>

          {/* Email */}
          <div style={{ marginBottom: 12 }}>
            <Text strong>Email (Tùy chọn)</Text>
            <Input
              style={{ marginTop: 4 }}
              placeholder="Nhập email người nhận..."
              value={draftRecipient.email}
              onChange={(e) =>
                setDraftRecipient({ ...draftRecipient, email: e.target.value })
              }
            />
          </div>

          {/* Địa chỉ giao hàng */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text strong>
                Địa chỉ giao hàng <Text type="danger">*</Text>
              </Text>
              {customerAddresses.length > 0 && (
                <Button
                  size="small"
                  icon={<EnvironmentOutlined />}
                  onClick={() => setAddressPickerOpen(true)}
                >
                  Chọn địa chỉ
                </Button>
              )}
            </div>

            <Row gutter={8} style={{ marginBottom: 8 }}>
              <Col span={12}>
                <Select
                  showSearch
                  style={{ width: "100%" }}
                  placeholder="Tỉnh/Thành phố..."
                  value={draftRecipient.provinceCode}
                  filterOption={(input, option) =>
                    String(option?.label || "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={posProvinces.map((p: any) => ({
                    label: p.name,
                    value: p.code,
                  }))}
                  onChange={(val, opt: any) => {
                    setDraftRecipient((prev) => ({
                      ...prev,
                      provinceCode: val,
                      provinceCity: opt?.label || "",
                      wardCode: undefined,
                      wardCommune: "",
                    }));
                    setPosCommunes([]);
                    loadPosCommunes(val);
                  }}
                />
              </Col>
              <Col span={12}>
                <Select
                  showSearch
                  style={{ width: "100%" }}
                  placeholder={
                    draftRecipient.provinceCode
                      ? "Xã/Phường..."
                      : "Chọn Tỉnh trước"
                  }
                  disabled={!draftRecipient.provinceCode}
                  loading={posLoadingCommunes}
                  value={draftRecipient.wardCode}
                  filterOption={(input, option) =>
                    String(option?.label || "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={posCommunes.map((w: any) => ({
                    label: w.name,
                    value: w.code,
                  }))}
                  onChange={(val, opt: any) => {
                    setDraftRecipient((prev) => ({
                      ...prev,
                      wardCode: val,
                      wardCommune: opt?.label || "",
                    }));
                  }}
                />
              </Col>
            </Row>

            <Input
              placeholder="Số nhà, ngõ, tên đường..."
              value={draftRecipient.addressDetail}
              onChange={(e) =>
                setDraftRecipient((prev) => ({
                  ...prev,
                  addressDetail: e.target.value,
                }))
              }
            />
          </div>

          {/* Ghi chú */}
          <div style={{ marginBottom: 12 }}>
            <Text strong>Ghi chú đơn hàng</Text>
            <Input.TextArea
              style={{ marginTop: 4 }}
              rows={2}
              placeholder="Nhập ghi chú giao hàng (nếu có)..."
              value={draftRecipient.note}
              onChange={(e) =>
                setDraftRecipient({ ...draftRecipient, note: e.target.value })
              }
            />
          </div>

          {/* Phí vận chuyển */}
          <div>
            <Text strong>Phí vận chuyển</Text>
            <InputNumber
              style={{ width: "100%", marginTop: 4 }}
              min={0}
              value={draftRecipient.shippingFee}
              onChange={(val) =>
                setDraftRecipient({
                  ...draftRecipient,
                  shippingFee: (val as number) ?? 0,
                })
              }
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
              addonAfter="đ"
              placeholder="0"
            />
          </div>
        </div>
      </Modal>

      <Modal
        title={
          <Space>
            <EnvironmentOutlined style={{ color: "#1890ff" }} />
            <span>Chọn địa chỉ giao hàng</span>
          </Space>
        }
        open={addressPickerOpen}
        onCancel={() => setAddressPickerOpen(false)}
        footer={null}
        width={500}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            paddingTop: 4,
          }}
        >
          {customerAddresses.map((addr: any) => {
            const isSelected = selectedAddressId === addr.id;
            return (
              <div
                key={addr.id}
                style={{
                  border: isSelected
                    ? "2px solid #1890ff"
                    : "1px solid #d9d9d9",
                  borderRadius: 8,
                  padding: "10px 14px",
                  background: isSelected ? "#e6f7ff" : "#fafafa",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ marginTop: 4, marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {[addr.addressDetail, addr.wardCommune, addr.provinceCity]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </div>
                <Button
                  type={isSelected ? "primary" : "default"}
                  size="small"
                  icon={<EnvironmentOutlined />}
                  onClick={async () => {
                    setSelectedAddressId(addr.id);
                    setDraftRecipient((prev) => ({
                      ...prev,
                      name: addr.name || "",
                      phone: addr.phoneNumber || "",
                      addressDetail: addr.addressDetail || "",
                      provinceCode: addr.provinceCode
                        ? Number(addr.provinceCode)
                        : undefined,
                      provinceCity: addr.provinceCity || "",
                      wardCode: undefined,
                      wardCommune: "",
                    }));
                    if (addr.provinceCode) {
                      const wards = await loadPosCommunes(
                        Number(addr.provinceCode),
                      );
                      const wCode = addr.wardCode
                        ? Number(addr.wardCode)
                        : undefined;
                      const matched = wards.find((w: any) => w.code === wCode);
                      setDraftRecipient((prev) => ({
                        ...prev,
                        wardCode: matched ? wCode : undefined,
                        wardCommune: matched
                          ? matched.name || addr.wardCommune || ""
                          : "",
                      }));
                    }
                    setAddressPickerOpen(false);
                  }}
                >
                  {isSelected ? "Đang chọn" : "Chọn địa chỉ này"}
                </Button>
              </div>
            );
          })}

          {/* Nhập địa chỉ mới */}
          <div
            onClick={() => {
              setSelectedAddressId("custom");
              setPosCommunes([]);
              setDraftRecipient((prev) => ({
                ...prev,
                addressDetail: "",
                provinceCode: undefined,
                provinceCity: "",
                wardCode: undefined,
                wardCommune: "",
              }));
              setAddressPickerOpen(false);
            }}
            style={{
              border:
                selectedAddressId === "custom"
                  ? "2px solid #1890ff"
                  : "1px dashed #d9d9d9",
              borderRadius: 8,
              padding: "12px 14px",
              cursor: "pointer",
              background:
                selectedAddressId === "custom" ? "#e6f7ff" : "#fafafa",
              textAlign: "center",
              transition: "all 0.2s",
            }}
          >
            <PlusOutlined style={{ marginRight: 4, color: "#1890ff" }} />
            <Text style={{ color: "#1890ff" }}>Nhập địa chỉ mới</Text>
          </div>
        </div>
      </Modal>

      {/* Modal QR chuyển khoản */}
      <Modal
        title={
          <Space>
            <ScanOutlined style={{ color: "#52c41a" }} />
            <span>Thanh toán chuyển khoản / QR</span>
          </Space>
        }
        open={qrModal.open}
        onCancel={() =>
          setQrModal({ open: false, totalAmount: 0, orderCode: "" })
        }
        footer={null}
        centered
        width={380}
      >
        <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
          <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
            Mã hóa đơn: <Text strong>{qrModal.orderCode}</Text>
          </Text>
          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            Số tiền cần thanh toán:
          </Text>
          <Title level={3} type="danger" style={{ marginBottom: 16 }}>
            {qrModal.totalAmount.toLocaleString("vi-VN")} đ
          </Title>
          <div
            style={{
              display: "inline-block",
              padding: 8,
              border: "1px solid #d9d9d9",
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <QRCodeSVG
              value={`CHUYEN_KHOAN|${qrModal.orderCode}|${qrModal.totalAmount}|DATN Camera`}
              size={200}
              level="M"
              includeMargin
            />
          </div>
          <Text
            type="secondary"
            style={{ display: "block", marginBottom: 20, fontSize: 13 }}
          >
            Khách quét mã, chuyển khoản xong nhấn xác nhận bên dưới.
          </Text>
          <Space style={{ width: "100%" }} direction="vertical">
            <Button
              type="primary"
              size="large"
              block
              style={{ background: "#52c41a" }}
              onClick={() => {
                Modal.confirm({
                  title: "Xác nhận thanh toán",
                  content: `Đã nhận chuyển khoản cho hóa đơn ${qrModal.orderCode} số tiền ${qrModal.totalAmount.toLocaleString("vi-VN")} đ?`,
                  okText: "Xác nhận",
                  okType: "primary",
                  cancelText: "Huỷ",
                  onOk: async () => {
                    setQrModal({ open: false, totalAmount: 0, orderCode: "" });
                    await handleCheckout();
                  },
                });
              }}
            >
              Đã nhận tiền — Xác nhận Thanh toán
            </Button>
            <Button
              block
              onClick={() =>
                setQrModal({ open: false, totalAmount: 0, orderCode: "" })
              }
            >
              Đóng
            </Button>
          </Space>
        </div>
      </Modal>

      {/* Thanh toán thành công Modal */}
      <Modal
        title={null}
        footer={null}
        closable={false}
        open={checkoutSuccessModal.open}
        centered
      >
        <div style={{ textAlign: "center", padding: "30px 10px 10px" }}>
          <CheckCircleOutlined
            style={{ fontSize: 72, color: "#52c41a", marginBottom: 24 }}
          />
          <Title level={3}>Thanh Toán Thành Công!</Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Khách hàng đã thanh toán cho hóa đơn
          </Text>
          <div
            style={{
              margin: "24px 0",
              padding: "16px",
              background: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: 8,
            }}
          >
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Text>Mã đơn hàng:</Text>
              <Text strong>{checkoutSuccessModal.orderCode}</Text>
            </Row>
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Text>Tổng tiền:</Text>
              <Text strong>
                {checkoutSuccessModal.totalAmount.toLocaleString("vi-VN")} đ
              </Text>
            </Row>
            <Row justify="space-between">
              <Text>Tiền thối lại:</Text>
              <Text type="danger" strong>
                {checkoutSuccessModal.change.toLocaleString("vi-VN")} đ
              </Text>
            </Row>
          </div>
          <Space size="middle" style={{ marginTop: 16 }}>
            <Button
              icon={<PrinterOutlined />}
              size="large"
              onClick={handlePrint}
            >
              In hóa đơn
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => {
                setCheckoutSuccessModal({
                  ...checkoutSuccessModal,
                  open: false,
                });
                setCustomerCash(null);
                setAppliedVoucher(null);
                setCustomerSearchKeyword("");
                setCustomerOptions([]);
                setRecipientInfo({
                  name: "",
                  phone: "",
                  email: "",
                  address: "",
                  addressDetail: "",
                  provinceCode: undefined,
                  provinceCity: "",
                  wardCode: undefined,
                  wardCommune: "",
                  note: "",
                });
                setShippingFee(0);
                setCartDetails([]);
                setActiveKey("");
              }}
            >
              Đóng & Bắt đầu đơn mới
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default PosPage;
