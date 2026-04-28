import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import OrderReceiptTemplate from "./OrderReceiptTemplate";
import SerialAssignmentModal from "../../../components/SerialAssignmentModal"; // <-- IMPORT MODAL MỚI VÀO ĐÂY
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeftOutlined,
  BarcodeOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  HistoryOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  PrinterOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  TagOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import { orderApi } from "../../../api/admin/orderApi";
import { customerApi } from "../../../api/customerApi";
import type {
  OrderDetailResponse,
  OrderHistoryType,
} from "../../../models/order";
import type { AddressResponse } from "../../../models/address";

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_LABELS: Record<string, string> = {
  CHO_XAC_NHAN: "Chờ xác nhận",
  DA_XAC_NHAN: "Đã xác nhận",
  CHO_GIAO: "Chờ giao hàng",
  DANG_GIAO: "Đang giao hàng",
  GIAO_HANG_KHONG_THANH_CONG: "Giao hàng không thành công",
  HOAN_THANH: "Hoàn thành",
  DA_HUY: "Đã hủy",
  LUU_TAM: "Lưu tạm",
  DA_HOAN_HANG: "Hoàn hàng thành công",
};

const STATUS_COLORS: Record<string, string> = {
  CHO_XAC_NHAN: "orange",
  DA_XAC_NHAN: "blue",
  CHO_GIAO: "cyan",
  DANG_GIAO: "geekblue",
  GIAO_HANG_KHONG_THANH_CONG: "volcano",
  HOAN_THANH: "green",
  DA_HUY: "red",
  LUU_TAM: "default",
  DA_HOAN_HANG: "purple",
};

const NEXT_STATUS: Record<string, string> = {
  CHO_XAC_NHAN: "DA_XAC_NHAN",
  DA_XAC_NHAN: "CHO_GIAO",
  CHO_GIAO: "DANG_GIAO",
};

const ONLINE_STEPS = [
  { key: "CHO_XAC_NHAN", label: "Chờ xác nhận" },
  { key: "DA_XAC_NHAN", label: "Đã xác nhận" },
  { key: "CHO_GIAO", label: "Chờ giao hàng" },
  { key: "DANG_GIAO", label: "Đang giao hàng" },
  { key: "GIAO_HANG_KHONG_THANH_CONG", label: "Giao hàng không thành công" },
  { key: "DA_HOAN_HANG", label: "Hoàn hàng thành công" },
  { key: "HOAN_THANH", label: "Hoàn thành" },
];

const fmt = (n?: number | null) =>
  n == null
    ? "0 đ"
    : n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const parseSerials = (raw?: string): Array<{ id: string; code: string }> => {
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
};

const parseHistory = (raw?: string): OrderHistoryType[] => {
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
};

interface FlatRow {
  rowKey: string;
  detailId: string;
  productDetailId: string;
  maSanPham?: string;
  maChiTietSanPham?: string;
  productCode?: string;
  detailCode?: string;
  tenSanPham: string;
  thuongHieu: string;
  mauSac: string;
  size: string;
  anhSanPham: string;
  giaBan: number;
  soLuong: number;
  tongTien: number;
  serialId: string;
  serialCode: string;
  appliedPromotionName?: string;
}

const buildFlatRows = (items: OrderDetailResponse[]): FlatRow[] => {
  const rows: FlatRow[] = [];
  items.forEach((item) => {
    const serials = parseSerials(item.danhSachImei);
    if (serials.length === 0) {
      rows.push({
        rowKey: item.maHoaDonChiTiet,
        detailId: item.maHoaDonChiTiet,
        productDetailId: item.productDetailId,
        maSanPham: item.maSanPham,
        maChiTietSanPham: item.maChiTietSanPham,
        productCode: item.productCode,
        detailCode: item.detailCode,
        tenSanPham: item.tenSanPham,
        thuongHieu: item.thuongHieu,
        mauSac: item.mauSac,
        size: item.size,
        anhSanPham: item.anhSanPham,
        giaBan: item.giaBan,
        soLuong: item.soLuong,
        tongTien: item.tongTien,
        serialId: "",
        serialCode: "Chưa gán",
        appliedPromotionName: (item as any).appliedPromotionName,
      });
    } else {
      serials.forEach((s) => {
        rows.push({
          rowKey: `${item.maHoaDonChiTiet}-${s.id}`,
          detailId: item.maHoaDonChiTiet,
          productDetailId: item.productDetailId,
          maSanPham: item.maSanPham,
          maChiTietSanPham: item.maChiTietSanPham,
          productCode: item.productCode,
          detailCode: item.detailCode,
          tenSanPham: item.tenSanPham,
          thuongHieu: item.thuongHieu,
          mauSac: item.mauSac,
          size: item.size,
          anhSanPham: item.anhSanPham,
          giaBan: item.giaBan,
          soLuong: item.soLuong,
          tongTien: item.tongTien,
          serialId: s.id,
          serialCode: s.code,
          appliedPromotionName: (item as any).appliedPromotionName,
        });
      });
    }
  });
  return rows;
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const receiptRef = useRef<HTMLDivElement>(null);
  const { message } = App.useApp();
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `HoaDon_${id}`,
  });

  // State
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [items, setItems] = useState<OrderDetailResponse[]>([]);
  const [historyList, setHistoryList] = useState<OrderHistoryType[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "serial">("list");

  // Status modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // History modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Customer modal
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<AddressResponse[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressMode, setAddressMode] = useState<"saved" | "new">("saved");
  const [addrForm] = Form.useForm();
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);

  // Serial info modal (Dùng khi xem list dạng Flat)
  const [serialInfoOpen, setSerialInfoOpen] = useState(false);
  const [serialInfoRow, setSerialInfoRow] = useState<FlatRow | null>(null);

  // STATE DÀNH CHO MODAL CAMERA MỚI
  const [serialChangeOpen, setSerialChangeOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<OrderDetailResponse | null>(null);

  // Derived state
  const currentStatus = order?.trangThaiHoaDon ?? "CHO_XAC_NHAN";
  const isOnline =
    order?.loaiHoaDon === "ONLINE" || order?.loaiHoaDon === "GIAO_HANG";
  const isOffline = order?.loaiHoaDon === "OFFLINE";
  const isCompleted = currentStatus === "HOAN_THANH";
  const isCancelled = currentStatus === "DA_HUY";
  const canChangeSerial = isOnline && currentStatus === "CHO_XAC_NHAN";
  // Chỉ cho phép sửa thông tin khách hàng khi đơn ở trạng thái Chờ xác nhận
  const canEditCustomerInfo = isOnline && currentStatus === "CHO_XAC_NHAN";
  const canCancelStatuses = ["CHO_XAC_NHAN", "DA_XAC_NHAN", "CHO_GIAO"];
  const showCancelButton =
    isOnline && canCancelStatuses.includes(currentStatus);

  // Các hành động theo trạng thái
  const getNextActions = (): { key: string; label: string }[] => {
    switch (currentStatus) {
      case "CHO_XAC_NHAN":
        return [{ key: "DA_XAC_NHAN", label: "Đã xác nhận" }];
      case "DA_XAC_NHAN":
        return [{ key: "CHO_GIAO", label: "Chờ giao hàng" }];
      case "CHO_GIAO":
        return [{ key: "DANG_GIAO", label: "Đang giao hàng" }];
      case "DANG_GIAO":
        return [
          { key: "HOAN_THANH", label: "Hoàn thành" },
          {
            key: "GIAO_HANG_KHONG_THANH_CONG",
            label: "Giao hàng không thành công",
          },
        ];
      case "GIAO_HANG_KHONG_THANH_CONG":
        return [
          { key: "GIAO_LAI", label: "Giao lại" },
          { key: "XAC_NHAN_HOAN_HANG", label: "Xác nhận hoàn hàng" },
        ];
      case "DA_HOAN_HANG":
        return [];
      default:
        return [];
    }
  };

  const nextActions = getNextActions();
  const totalProductAmount = items.reduce((s, r) => s + (r.tongTien ?? 0), 0);
  const flatRows = buildFlatRows(items);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await orderApi.getOrderDetails(id);
      if (res.success && res.data?.content?.length) {
        const rows = res.data.content;
        setItems(rows);
        setOrder({ ...rows[0] });
        setHistoryList(parseHistory(rows[0].lichSuTrangThai));
      }
    } catch {
      message.error("Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const openStatusModal = (status: string) => {
    setNextStatus(status);
    setStatusNote("");
    setStatusModalOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!order) return;

    // Kiểm tra serial trước khi xác nhận
    if (nextStatus === "DA_XAC_NHAN") {
      const hasMissingSerial = items.some((item) => {
        const serials = parseSerials(item.danhSachImei);
        return !serials || serials.length === 0;
      });
      if (hasMissingSerial) {
        message.warning(
          "Vui lòng gán serial cho tất cả sản phẩm trước khi xác nhận!",
        );
        return;
      }
    }

    // Kiểm tra lý do khi giao không thành công
    if (
      nextStatus === "GIAO_HANG_KHONG_THANH_CONG" &&
      (!statusNote || !statusNote.trim())
    ) {
      message.warning("Vui lòng nhập lý do giao hàng không thành công!");
      return;
    }

    // Kiểm tra lý do khi hủy đơn
    if (nextStatus === "DA_HUY" && (!statusNote || !statusNote.trim())) {
      message.warning("Vui lòng nhập lý do hủy đơn hàng!");
      return;
    }

    setIsUpdating(true);
    try {
      switch (nextStatus) {
        case "GIAO_HANG_KHONG_THANH_CONG":
          // Dùng API riêng để đánh dấu giao không thành công
          await orderApi.failDelivery(order.maHoaDon, statusNote);
          message.success("Đã đánh dấu giao hàng không thành công");
          break;

        case "GIAO_LAI":
          // Giao lại đơn
          await orderApi.redeliver(order.maHoaDon);
          message.success("Đã chuyển sang trạng thái đang giao hàng");
          break;

        case "XAC_NHAN_HOAN_HANG":
          // Xác nhận hoàn hàng về kho
          await orderApi.returnOrder(order.maHoaDon);
          message.success(
            "Đã xác nhận hoàn hàng về kho, tồn kho đã được cập nhật",
          );
          break;

        case "HUY_SAU_HOAN_HANG":
          // Hủy đơn sau khi hoàn hàng
          await orderApi.cancelAfterReturn(order.maHoaDon, statusNote);
          message.success("Đã hủy đơn hàng");
          break;

        default:
          // Các thao tác còn lại dùng API chung
          await orderApi.updateOrderStatus({
            maHoaDon: order.maHoaDon,
            statusTrangThaiHoaDon: nextStatus,
            note: statusNote,
          });
          message.success("Cập nhật trạng thái thành công");
          break;
      }
      setStatusModalOpen(false);
      fetchOrder();
    } catch {
      message.error("Cập nhật thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  // Load provinces for address form
  useEffect(() => {
    axios
      .get("/api/provinces/v2/p/?depth=1")
      .then((res) => setProvinces(res.data || []))
      .catch(() => {});
  }, []);

  // Province → Wards cascade: load wards when province changes
  const loadWardsFromProvince = async (provinceCode: number) => {
    setLoadingWards(true);
    setWards([]);
    addrForm.setFieldsValue({ wardCode: undefined, phuongXa: "" });
    try {
      const res = await axios.get(
        `/api/provinces/v2/p/${provinceCode}?depth=2`,
      );
      setWards(res.data.wards ?? []);
    } catch {
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  };

  const openCustomerModal = async () => {
    if (!order) return;
    addrForm.resetFields();
    setAddressMode("saved");
    setWards([]);
    setCustomerModalOpen(true);

    // Load saved addresses
    if (order.customerId) {
      setLoadingAddresses(true);
      try {
        const addrs = await customerApi.getAddressesByCustomer(
          order.customerId,
        );
        setSavedAddresses(addrs || []);
      } catch {
        setSavedAddresses([]);
      } finally {
        setLoadingAddresses(false);
      }
    } else {
      setSavedAddresses([]);
    }
  };

  const handleSaveCustomer = async () => {
    if (!order) return;
    setSavingCustomer(true);
    try {
      const values = await addrForm.validateFields();

      // 1. KHỞI TẠO PAYLOAD CHUẨN THEO DTO BACKEND
      const payload: any = {
        maHoaDon: order.maHoaDon,
      };

      if (addressMode === "saved" && values.addressId) {
        // --- CHẾ ĐỘ CHỌN ĐỊA CHỈ CÓ SẴN ---
        payload.addressId = values.addressId;

        const selected = savedAddresses.find((a) => a.id === values.addressId);
        if (selected) {
          payload.tenNguoiNhan = selected.name || "";
          payload.sdtNguoiNhan = selected.phoneNumber || "";
          payload.tinhThanhPho = selected.provinceCity || "";
          payload.phuongXa = selected.wardCommune || "";
          payload.diaChiChiTiet = selected.addressDetail || "";
          payload.diaChi = [
            selected.addressDetail,
            selected.wardCommune,
            selected.provinceCity,
          ]
            .filter(Boolean)
            .join(", ");
        }
      } else {
        // --- CHẾ ĐỘ NHẬP ĐỊA CHỈ MỚI ---
        payload.tenNguoiNhan = values.tenNguoiNhan?.trim() || "";
        payload.sdtNguoiNhan = values.sdtNguoiNhan?.trim() || "";
        payload.tinhThanhPho = values.tinhThanhPho?.trim() || "";
        payload.phuongXa = values.phuongXa?.trim() || "";
        payload.diaChiChiTiet = values.diaChiChiTiet?.trim() || "";
        payload.quanHuyen = ""; // Form hiện tại của bạn không có ô nhập Quận/Huyện nên để trống

        payload.diaChi = [
          payload.diaChiChiTiet,
          payload.phuongXa,
          payload.tinhThanhPho,
        ]
          .filter(Boolean)
          .join(", ");

        // (Tùy chọn) Lưu vào sổ địa chỉ nếu khách có tài khoản
        if (order.customerId) {
          try {
            await customerApi.addAddress(order.customerId, {
              name: payload.tenNguoiNhan,
              phoneNumber: payload.sdtNguoiNhan,
              provinceCity: payload.tinhThanhPho,
              wardCommune: payload.phuongXa,
              addressDetail: payload.diaChiChiTiet,
              provinceCode:
                typeof values.provinceCode === "number"
                  ? values.provinceCode
                  : undefined,
              wardCode:
                typeof values.wardCode === "number"
                  ? values.wardCode
                  : undefined,
              isDefault: false,
            });
          } catch (e) {
            console.warn(
              "Lưu sổ địa chỉ thất bại (không ảnh hưởng đến sửa hóa đơn)",
              e,
            );
          }
        }
      }

      console.log("Dữ liệu gửi lên Backend:", payload);

      // 2. GỌI API
      await orderApi.updateCustomerInfo(payload);
      message.success("Cập nhật thông tin giao hàng thành công");
      setCustomerModalOpen(false);
      fetchOrder(); // Load lại data mới nhất
    } catch (err: any) {
      if (!err.errorFields)
        message.error("Cập nhật thất bại. Vui lòng thử lại!");
      console.error(err);
    } finally {
      setSavingCustomer(false);
    }
  };

  const openSerialInfo = (row: FlatRow) => {
    setSerialInfoRow(row);
    setSerialInfoOpen(true);
  };

  const productColumns: ColumnsType<FlatRow> = [
    {
      title: "STT",
      width: 55,
      align: "center",
      render: (_: unknown, __: unknown, i: number) => i + 1,
    },
    {
      title: "Mã SP",
      dataIndex: "productDetailId",
      key: "productDetailId",
      width: 120,
      align: "center",
      render: (_: unknown, r: FlatRow) =>
        r.maSanPham || r.productCode || r.productDetailId || "—",
    },
    {
      title: "Mã CT SP",
      dataIndex: "detailId",
      key: "detailId",
      width: 120,
      align: "center",
      render: (_: unknown, r: FlatRow) =>
        r.maChiTietSanPham || r.detailCode || r.detailId || "—",
    },
    {
      title: "Sản phẩm",
      key: "sp",
      width: 300,
      render: (_: unknown, r: FlatRow) => (
        <Space align="start">
          <Avatar
            shape="square"
            size={60}
            src={r.anhSanPham}
            style={{ border: "1px solid #f0f0f0", flexShrink: 0 }}
          />
          <div>
            <Text strong style={{ display: "block" }}>
              {r.tenSanPham}
            </Text>
            <div style={{ marginTop: 4, display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
              {r.thuongHieu && (
                <Tag style={{ fontSize: 11, margin: 0 }}>
                  {r.thuongHieu.toLowerCase()}
                </Tag>
              )}
              {r.mauSac && <Tag style={{ margin: 0 }}>{r.mauSac}</Tag>}
              {r.size && (
                <Text type="secondary" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                  | Size: {r.size}
                </Text>
              )}
            </div>
            {r.appliedPromotionName && (
              <div style={{ marginTop: 4 }}>
                <Tag color="volcano" bordered={false} style={{ margin: 0, fontSize: 11, borderRadius: 4 }}>
                  {r.appliedPromotionName}
                </Tag>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center" as const,
      width: 120,
      render: (_: unknown, r: FlatRow) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => openSerialInfo(r)}
          title="Xem serial"
        />
      ),
    },
  ];

  const listColumns: ColumnsType<OrderDetailResponse> = [
    {
      title: "STT",
      width: 55,
      align: "center",
      render: (_: unknown, __: unknown, i: number) => i + 1,
    },
    {
      title: "Mã SP",
      dataIndex: "productDetailId",
      key: "productDetailId",
      width: 120,
      align: "center",
      render: (_: unknown, r: OrderDetailResponse) =>
        r.maSanPham || r.productCode || r.productDetailId || "—",
    },
    {
      title: "Mã CT SP",
      dataIndex: "maHoaDonChiTiet",
      key: "maHoaDonChiTiet",
      width: 120,
      align: "center",
      render: (_: unknown, r: OrderDetailResponse) =>
        r.maChiTietSanPham || r.detailCode || r.maHoaDonChiTiet || "—",
    },
    {
      title: "Sản phẩm",
      key: "sp",
      render: (_: unknown, r: OrderDetailResponse) => (
        <Space align="start">
          <Avatar
            shape="square"
            size={60}
            src={r.anhSanPham}
            style={{ border: "1px solid #f0f0f0", flexShrink: 0 }}
          />
          <div>
            <Text strong style={{ display: "block" }}>
              {r.tenSanPham}
            </Text>
            <div style={{ marginTop: 4, display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
              {r.thuongHieu && (
                <Tag style={{ fontSize: 11, margin: 0 }}>
                  {r.thuongHieu.toLowerCase()}
                </Tag>
              )}
              {r.mauSac && <Tag style={{ margin: 0 }}>{r.mauSac}</Tag>}
              {r.size && (
                <Text type="secondary" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                  | Size: {r.size}
                </Text>
              )}
            </div>
            {(r as any).appliedPromotionName && (
              <div style={{ marginTop: 4 }}>
                <Tag color="volcano" bordered={false} style={{ margin: 0, fontSize: 11, borderRadius: 4 }}>
                  {(r as any).appliedPromotionName}
                </Tag>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "soLuong",
      key: "soLuong",
      width: 80,
      align: "center",
    },
    {
      title: "Mã Serial",
      key: "serial",
      width: 180,
      align: "center",
      render: (_: unknown, r: OrderDetailResponse) => {
        const serials = parseSerials(r.danhSachImei);
        if (serials.length === 0) return <Tag color="warning">Chưa có mã</Tag>;
        return (
          <Space orientation="vertical" size={2}>
            {serials.map((s) => (
              <Tag key={s.id} color="blue" style={{ fontFamily: "monospace" }}>
                {s.code}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Đơn giá",
      key: "giaBan",
      align: "right",
      width: 130,
      render: (_: unknown, r: OrderDetailResponse) => {
        const giaBanGoc =
          typeof r.giaBanGoc === "number" ? r.giaBanGoc : undefined;
        const showDiscount = giaBanGoc && giaBanGoc > r.giaBan;
        return (
          <div>
            <Text
              strong
              style={{
                color: showDiscount ? "#cf1322" : undefined,
                display: "block",
              }}
            >
              {fmt(r.giaBan)}
            </Text>
            {showDiscount && (
              <Text
                delete
                style={{
                  color: "#888",
                  fontSize: 13,
                  display: "block",
                  marginTop: 2,
                }}
              >
                {fmt(giaBanGoc)}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Thành tiền",
      key: "tongTien",
      align: "right",
      width: 140,
      render: (_: unknown, r: OrderDetailResponse) => (
        <Text strong style={{ color: "#cf1322" }}>
          {fmt(r.tongTien)}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center" as const,
      width: 100,
      render: (_: unknown, r: OrderDetailResponse) => {
        if (!canChangeSerial) return <Text type="secondary">—</Text>;
        const serials = parseSerials(r.danhSachImei);
        const firstSerial = serials[0];

        return (
          <Space>
            {/* Truyền nguyên object OrderDetailResponse (r) vào state để ném vào Modal */}
            {!firstSerial && (
              <Button
                size="small"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedOrderDetail(r);
                  setSerialChangeOpen(true);
                }}
                title="Gán serial"
              />
            )}
            {firstSerial && (
              <Button
                size="small"
                icon={<SwapOutlined />}
                onClick={() => {
                  setSelectedOrderDetail(r);
                  setSerialChangeOpen(true);
                }}
                title="Đổi serial"
              />
            )}
          </Space>
        );
      },
    },
  ];

  const historyColumns: ColumnsType<OrderHistoryType> = [
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      render: (v: string) => (
        <Tag color={STATUS_COLORS[v] ?? "default"}>{STATUS_LABELS[v] ?? v}</Tag>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "thoiGian",
      render: (v: number) => (v ? dayjs(v).format("HH:mm DD/MM/YYYY") : "---"),
    },
    { title: "Nhân viên", dataIndex: "nhanVien" },
    { title: "Ghi chú", dataIndex: "ghiChu" },
  ];

  const renderProgressTracker = () => {
    if (isCancelled) {
      return (
        <div
          style={{ display: "flex", alignItems: "center", padding: "8px 0" }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#ff4d4f",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            <ClockCircleOutlined />
          </div>
          <div
            style={{
              flex: 1,
              height: 3,
              background: "#ff4d4f",
              margin: "0 4px",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#ff4d4f",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                margin: "0 auto",
              }}
            >
              <CloseCircleOutlined />
            </div>
            <Text
              type="danger"
              style={{ fontSize: 11, marginTop: 6, display: "block" }}
            >
              Đã hủy
            </Text>
          </div>
        </div>
      );
    }

    let steps;
    if (order?.loaiHoaDon === "GIAO_HANG" || order?.loaiHoaDon === "ONLINE") {
      steps = [...ONLINE_STEPS];
      // Khi hoàn thành: ẩn nhánh giao thất bại
      if (currentStatus === "HOAN_THANH") {
        steps = steps.filter(
          (s) =>
            s.key !== "GIAO_HANG_KHONG_THANH_CONG" && s.key !== "DA_HOAN_HANG",
        );
      }
      // Khi giao không thành công: ẩn nút hoàn thành
      if (currentStatus === "GIAO_HANG_KHONG_THANH_CONG") {
        steps = steps.filter((s) => s.key !== "HOAN_THANH");
      }
      // Khi đã hoàn hàng: ẩn nút hoàn thành
      if (currentStatus === "DA_HOAN_HANG") {
        steps = steps.filter((s) => s.key !== "HOAN_THANH");
      }
    } else {
      steps = [ONLINE_STEPS[0], ONLINE_STEPS[ONLINE_STEPS.length - 1]];
    }
    const stepKeys = steps.map((s) => s.key);
    const currentIdx = stepKeys.indexOf(currentStatus);

    const stepIcon = (key: string) => {
      if (key === "GIAO_HANG_KHONG_THANH_CONG") {
        return <CloseCircleOutlined />;
      }
      if (key === "DA_HOAN_HANG") {
        return <ReloadOutlined />;
      }
      switch (key) {
        case "CHO_XAC_NHAN":
          return <ClockCircleOutlined />;
        case "DA_XAC_NHAN":
          return <CheckCircleOutlined />;
        case "CHO_GIAO":
          return <ShoppingCartOutlined />;
        case "DANG_GIAO":
          return <CarOutlined />;
        default:
          return <CheckCircleOutlined />;
      }
    };

    return (
      <div
        style={{ display: "flex", alignItems: "flex-start", padding: "8px 0" }}
      >
        {steps.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          let circleColor = done ? "#52c41a" : active ? "#1677ff" : "#d9d9d9";
          let icon = null;
          if (step.key === "GIAO_HANG_KHONG_THANH_CONG") {
            if (currentStatus === "GIAO_HANG_KHONG_THANH_CONG" || done) {
              circleColor = "#fa541c";
              icon = <CloseCircleOutlined />;
            } else {
              icon = <CloseCircleOutlined style={{ opacity: 0.3 }} />;
            }
          } else if (step.key === "DA_HOAN_HANG") {
            if (currentStatus === "DA_HOAN_HANG" || done) {
              circleColor = "#722ed1";
              icon = <ReloadOutlined />;
            } else {
              icon = <ReloadOutlined style={{ opacity: 0.3 }} />;
            }
          } else {
            icon = done ? <CheckCircleOutlined /> : stepIcon(step.key);
          }

          return (
            <React.Fragment key={step.key}>
              <div style={{ textAlign: "center", minWidth: 70 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: circleColor,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    margin: "0 auto",
                    boxShadow: active
                      ? "0 0 0 4px rgba(22,119,255,0.2)"
                      : undefined,
                  }}
                >
                  {icon}
                </div>
                <Text
                  style={{
                    fontSize: 11,
                    display: "block",
                    marginTop: 6,
                    color: circleColor,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {step.label}
                </Text>
                {/* Hiển thị lý do giao không thành công */}
                {active &&
                  currentStatus === "GIAO_HANG_KHONG_THANH_CONG" &&
                  order?.failureReason && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "#fa541c",
                        marginTop: 4,
                        padding: "2px 4px",
                        background: "#fff2e8",
                        borderRadius: 4,
                        maxWidth: 80,
                      }}
                    >
                      {order.failureReason}
                    </div>
                  )}
                {/* Hiển thị nút hành động theo trạng thái */}
                {active &&
                  isOnline &&
                  nextActions.length > 0 &&
                  !isCompleted &&
                  !isCancelled && (
                    <Space
                      direction="vertical"
                      size={2}
                      style={{ marginTop: 6 }}
                    >
                      {nextActions.map((action) => (
                        <Button
                          key={action.key}
                          size="small"
                          type={
                            action.key === "XAC_NHAN_HOAN_HANG"
                              ? "default"
                              : "primary"
                          }
                          danger={
                            action.key === "XAC_NHAN_HOAN_HANG" ||
                            action.key === "HUY_SAU_HOAN_HANG"
                          }
                          style={{ fontSize: 11, padding: "0 8px" }}
                          onClick={() => openStatusModal(action.key)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </Space>
                  )}
              </div>
              {idx < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    background: done ? "#52c41a" : "#d9d9d9",
                    marginTop: 18,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>
      <Card variant="borderless" style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row justify="space-between" align="middle" wrap>
          <Col>
            <Space size="middle" wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                Quay lại
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                Đơn hàng #{order?.maHoaDon ?? "---"}
              </Title>
              <Tag color={STATUS_COLORS[currentStatus]}>
                {STATUS_LABELS[currentStatus] ?? currentStatus}
              </Tag>
              <Tag color={isOnline ? "blue" : "purple"}>
                {isOnline ? "Giao hàng" : "Tại quầy"}
              </Tag>
              <Text type="secondary">
                {order?.ngayTao
                  ? dayjs(order.ngayTao).format("HH:mm DD/MM/YYYY")
                  : "---"}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space wrap>
              <Button
                icon={<HistoryOutlined />}
                onClick={() => setHistoryModalOpen(true)}
              >
                Lịch sử
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchOrder}>
                Làm mới
              </Button>
              <Button icon={<PrinterOutlined />} onClick={() => handlePrint()}>
                In hóa đơn
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {currentStatus !== "LUU_TAM" && (
        <Card
          variant="borderless"
          style={{ marginBottom: 16, borderRadius: 12 }}
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Tiến trình đơn hàng</span>
              {showCancelButton && (
                <Button
                  danger
                  ghost
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => openStatusModal("DA_HUY")}
                >
                  Hủy đơn hàng
                </Button>
              )}
            </div>
          }
        >
          {renderProgressTracker()}
        </Card>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Customer */}
        <Col xs={24} lg={8}>
          <Card
            variant="borderless"
            style={{ borderRadius: 12, height: "100%" }}
            title={
              <Space>
                <UserOutlined />
                <span>Thông tin giao hàng</span>
              </Space>
            }
            extra={
              canEditCustomerInfo ? (
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={openCustomerModal}
                >
                  Sửa địa chỉ
                </Button>
              ) : null
            }
          >
            <Space align="start" style={{ marginBottom: 16, width: "100%" }}>
              <Avatar
                size={52}
                src={order?.avatarKhachHang || undefined}
                icon={!order?.avatarKhachHang && <UserOutlined />}
                style={{
                  background: order?.avatarKhachHang ? undefined : "#e6f4ff",
                  color: order?.avatarKhachHang ? undefined : "#1677ff",
                  flexShrink: 0,
                  objectFit: "cover",
                }}
              />
              <div>
                <Text strong style={{ fontSize: 15, display: "block" }}>
                  {order?.tenKhachHang || "Khách lẻ"}
                </Text>
                <Space
                  size={12}
                  style={{ marginTop: 4, flexWrap: "wrap" as const }}
                >
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <PhoneOutlined style={{ marginRight: 4 }} />
                    {order?.sdtKH || "---"}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <MailOutlined style={{ marginRight: 4 }} />
                    {order?.email || "Chưa có email"}
                  </Text>
                </Space>
              </div>
            </Space>
            <Divider style={{ margin: "12px 0" }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Địa chỉ giao hàng:
            </Text>
            <div
              style={{
                marginTop: 6,
                padding: "8px 12px",
                background: "#f5f5f5",
                borderRadius: 6,
                minHeight: 36,
              }}
            >
              <Text>{order?.diaChi || "Mua tại quầy"}</Text>
            </div>
          </Card>
        </Col>

        {/* Order summary */}
        <Col xs={24} lg={8}>
          <Card
            variant="borderless"
            style={{ borderRadius: 12, height: "100%" }}
            title={
              <Space>
                <FileTextOutlined />
                <span>Tóm tắt đơn hàng</span>
              </Space>
            }
          >
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div
                  style={{
                    background: "#f5f5f5",
                    borderRadius: 8,
                    padding: "10px 14px",
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Tổng sản phẩm
                  </Text>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>
                      {items.length} sản phẩm
                    </Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    background: "#f5f5f5",
                    borderRadius: 8,
                    padding: "10px 14px",
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Tổng số lượng
                  </Text>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>
                      {items.reduce((s, r) => s + (r.soLuong ?? 0), 0)}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                alignItems: "center",
              }}
            >
              <Text type="secondary">Tổng tiền hàng:</Text>
              <span>
                {(() => {
                  const totalOrigin = items.reduce(
                    (s, r) =>
                      s +
                      (typeof r.giaBanGoc === "number"
                        ? r.giaBanGoc * (r.soLuong ?? 1)
                        : r.giaBan * (r.soLuong ?? 1)),
                    0,
                  );
                  const hasDiscount = items.some(
                    (r) =>
                      typeof r.giaBanGoc === "number" && r.giaBanGoc > r.giaBan,
                  );
                  return (
                    <>
                      {hasDiscount && (
                        <Text
                          delete
                          style={{
                            color: "#888",
                            fontSize: 13,
                            marginRight: 6,
                          }}
                        >
                          {fmt(totalOrigin)}
                        </Text>
                      )}
                      <Text
                        strong
                        style={{ color: hasDiscount ? "#cf1322" : undefined }}
                      >
                        {fmt(totalProductAmount)}
                      </Text>
                    </>
                  );
                })()}
              </span>
            </div>
            {(order?.giaTriVoucher ?? 0) > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text type="secondary">Giảm giá voucher:</Text>
                <Text style={{ color: "#52c41a" }}>
                  -{fmt(order?.giaTriVoucher)}
                </Text>
              </div>
            )}
            {(order?.phiVanChuyen ?? 0) > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text type="secondary">Phí vận chuyển:</Text>
                <Text>{fmt(order?.phiVanChuyen)}</Text>
              </div>
            )}
            <Divider style={{ margin: "12px 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text strong style={{ fontSize: 15 }}>
                TỔNG CỘNG:
              </Text>
              <Text strong style={{ fontSize: 18, color: "#cf1322" }}>
                {fmt(
                  totalProductAmount -
                    (order?.giaTriVoucher ?? 0) +
                    (order?.phiVanChuyen ?? 0),
                )}
              </Text>
            </div>
            {order?.maVoucher && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background: "#f6ffed",
                  border: "1px solid #b7eb8f",
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#52c41a", fontSize: 12 }}>
                  <TagOutlined style={{ marginRight: 6 }} />
                  Voucher áp dụng
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text strong style={{ color: "#389e0d", display: "block" }}>
                    {order.maVoucher}
                    {order.tenVoucher ? ` - ${order.tenVoucher}` : ""}
                  </Text>
                </div>
                <Text style={{ color: "#52c41a", fontSize: 12 }}>
                  Giảm: {fmt(order.giaTriVoucher)}
                </Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Payment */}
        <Col xs={24} lg={8}>
          <Card
            variant="borderless"
            style={{ borderRadius: 12, height: "100%" }}
            title={
              <Space>
                <CreditCardOutlined />
                <span>Thông tin thanh toán</span>
              </Space>
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #f0f0f0",
                marginBottom: 16,
              }}
            >
              <Space>
                <Avatar
                  icon={<CreditCardOutlined />}
                  style={{ background: "#e6f4ff", color: "#1677ff" }}
                />
                <div>
                  <Text style={{ display: "block" }}>
                    {order?.phuongThucThanhToan || "Chưa xác định"}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Phương thức
                  </Text>
                </div>
              </Space>
              <Tag
                color={
                  order?.trangThaiThanhToan === "PAID" ||
                  order?.trangThaiThanhToan === "DA_THANH_TOAN"
                    ? "green"
                    : "default"
                }
              >
                {order?.trangThaiThanhToan === "PAID" ||
                order?.trangThaiThanhToan === "DA_THANH_TOAN"
                  ? "Đã thanh toán"
                  : "Không xác định"}
              </Tag>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text type="secondary">Tổng tiền thanh toán:</Text>
              <Text strong style={{ color: "#cf1322" }}>
                {fmt(order?.tongTienSauGiam)}
              </Text>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Text type="secondary">Thời gian thanh toán:</Text>
              <Text type="secondary">
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {order?.ngayThanhToan
                  ? dayjs(order.ngayThanhToan).format("HH:mm DD/MM/YYYY")
                  : "Chưa thanh toán"}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        variant="borderless"
        style={{ marginBottom: 16, borderRadius: 12 }}
        title={
          <Space>
            <ShoppingCartOutlined />
            <span>Danh sách sản phẩm</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              type={viewMode === "list" ? "primary" : "default"}
              icon={<UnorderedListOutlined />}
              size="small"
              onClick={() => setViewMode("list")}
            >
              Danh sách
            </Button>
            <Button
              type={viewMode === "serial" ? "primary" : "default"}
              icon={<BarcodeOutlined />}
              size="small"
              onClick={() => setViewMode("serial")}
            >
              Chi tiết Serial
            </Button>
          </Space>
        }
      >
        {viewMode === "list" ? (
          <Table<OrderDetailResponse>
            dataSource={items}
            rowKey="maHoaDonChiTiet"
            columns={listColumns}
            pagination={false}
            scroll={{ x: 900 }}
            size="middle"
          />
        ) : (
          <Table<FlatRow>
            dataSource={flatRows}
            rowKey="rowKey"
            columns={productColumns}
            pagination={false}
            scroll={{ x: 900 }}
            size="middle"
          />
        )}
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}
        >
          <div style={{ minWidth: 320 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text type="secondary">Tạm tính:</Text>
              <Text>{fmt(totalProductAmount)}</Text>
            </div>
            {(order?.giaTriVoucher ?? 0) > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text type="secondary">Giảm giá voucher:</Text>
                <Text style={{ color: "#52c41a" }}>
                  -{fmt(order?.giaTriVoucher)}
                </Text>
              </div>
            )}
            {(order?.phiVanChuyen ?? 0) > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text type="secondary">Phí vận chuyển:</Text>
                <Text>{fmt(order?.phiVanChuyen)}</Text>
              </div>
            )}
            <Divider style={{ margin: "8px 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text strong style={{ fontSize: 15 }}>
                Tổng cộng:
              </Text>
              <Text strong style={{ fontSize: 18, color: "#cf1322" }}>
                {fmt(
                  totalProductAmount -
                    (order?.giaTriVoucher ?? 0) +
                    (order?.phiVanChuyen ?? 0),
                )}
              </Text>
            </div>
          </div>
        </div>
      </Card>

      <Modal
        title="Lịch sử xử lý đơn hàng"
        open={historyModalOpen}
        onCancel={() => setHistoryModalOpen(false)}
        footer={null}
        width={700}
      >
        <Table<OrderHistoryType>
          dataSource={[...historyList].sort(
            (a, b) => (b.thoiGian ?? 0) - (a.thoiGian ?? 0),
          )}
          rowKey="id"
          columns={historyColumns}
          pagination={false}
          size="small"
        />
      </Modal>

      <Modal
        title="Xác nhận thay đổi trạng thái"
        open={statusModalOpen}
        onOk={handleConfirmStatus}
        onCancel={() => setStatusModalOpen(false)}
        confirmLoading={isUpdating}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          disabled:
            ((nextStatus === "DA_HUY" || nextStatus === "HUY_SAU_HOAN_HANG") &&
              !statusNote.trim()) ||
            (nextStatus === "GIAO_HANG_KHONG_THANH_CONG" &&
              !statusNote.trim()) ||
            isUpdating,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: "16px 0",
          }}
        >
          <Tag
            color={STATUS_COLORS[currentStatus]}
            style={{ fontSize: 14, padding: "4px 12px" }}
          >
            {STATUS_LABELS[currentStatus] ?? currentStatus}
          </Tag>
          <Text style={{ fontSize: 20 }}>→</Text>
          <Tag
            color={
              nextStatus === "GIAO_LAI"
                ? "geekblue"
                : nextStatus === "XAC_NHAN_HOAN_HANG"
                  ? "purple"
                  : nextStatus === "HUY_SAU_HOAN_HANG"
                    ? "red"
                    : (STATUS_COLORS[nextStatus] ?? "default")
            }
            style={{ fontSize: 14, padding: "4px 12px" }}
          >
            {nextStatus === "GIAO_LAI"
              ? "Giao lại"
              : nextStatus === "XAC_NHAN_HOAN_HANG"
                ? "Xác nhận hoàn hàng"
                : nextStatus === "HUY_SAU_HOAN_HANG"
                  ? "Hủy đơn"
                  : (STATUS_LABELS[nextStatus] ?? nextStatus)}
          </Tag>
        </div>
        <TextArea
          rows={3}
          placeholder={
            nextStatus === "GIAO_HANG_KHONG_THANH_CONG"
              ? "Bắt buộc nhập lý do giao hàng không thành công..."
              : nextStatus === "DA_HUY" || nextStatus === "HUY_SAU_HOAN_HANG"
                ? "Bắt buộc nhập lý do hủy đơn..."
                : "Ghi chú (tùy chọn)..."
          }
          value={statusNote}
          onChange={(e) => setStatusNote(e.target.value)}
        />
        {nextStatus === "GIAO_HANG_KHONG_THANH_CONG" && (
          <div style={{ color: "#fa541c", marginTop: 8 }}>
            * Bắt buộc nhập lý do giao hàng không thành công
          </div>
        )}
        {(nextStatus === "DA_HUY" || nextStatus === "HUY_SAU_HOAN_HANG") &&
          !statusNote.trim() && (
            <div style={{ color: "#fa541c", marginTop: 8 }}>
              * Vui lòng nhập lý do hủy đơn hàng
            </div>
          )}
        {nextStatus === "XAC_NHAN_HOAN_HANG" && (
          <div style={{ color: "#722ed1", marginTop: 8 }}>
            * Hành động này sẽ hoàn hàng về kho và tăng tồn kho. Bạn có thể hủy
            đơn sau khi hoàn hàng.
          </div>
        )}
        {nextStatus === "GIAO_LAI" && (
          <div style={{ color: "#1677ff", marginTop: 8 }}>
            * Hành động này sẽ chuyển đơn về trạng thái đang giao hàng để giao
            lại.
          </div>
        )}
      </Modal>

      <Modal
        title="Cập nhật địa chỉ giao hàng"
        open={customerModalOpen}
        onOk={handleSaveCustomer}
        onCancel={() => setCustomerModalOpen(false)}
        confirmLoading={savingCustomer}
        okText="Lưu"
        cancelText="Hủy"
        width={640}
        forceRender
      >
        <Form form={addrForm} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <Radio.Group
              value={addressMode}
              onChange={(e) => {
                setAddressMode(e.target.value);
                addrForm.resetFields([
                  "addressId",
                  "tenNguoiNhan",
                  "sdtNguoiNhan",
                  "provinceCode",
                  "phuongXa",
                  "diaChiChiTiet",
                ]);
                setWards([]);
              }}
              style={{ marginBottom: 12 }}
            >
              <Radio value="saved">Chọn địa chỉ có sẵn</Radio>
              <Radio value="new">Nhập địa chỉ mới</Radio>
            </Radio.Group>
          </div>

          {addressMode === "saved" ? (
            <Form.Item
              name="addressId"
              label="Địa chỉ giao hàng"
              rules={[{ required: true, message: "Vui lòng chọn địa chỉ" }]}
            >
              {loadingAddresses ? (
                <Text type="secondary">Đang tải địa chỉ...</Text>
              ) : savedAddresses.length === 0 ? (
                <Text type="secondary">
                  Khách hàng chưa có địa chỉ nào. Vui lòng nhập địa chỉ mới.
                </Text>
              ) : (
                <Select
                  placeholder="-- Chọn địa chỉ --"
                  size="large"
                  onChange={(val) => {
                    const selected = savedAddresses.find((a) => a.id === val);
                    if (selected) {
                      addrForm.setFieldsValue({
                        tenNguoiNhan: selected.name,
                        sdtNguoiNhan: selected.phoneNumber,
                      });
                    }
                  }}
                >
                  {savedAddresses.map((addr) => (
                    <Select.Option key={addr.id} value={addr.id}>
                      <div style={{ padding: "4px 0" }}>
                        <Text strong>
                          {addr.name} - {addr.phoneNumber}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {addr.addressDetail}, {addr.wardCommune},{" "}
                          {addr.provinceCity}
                        </Text>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            <>
              <Form.Item name="tinhThanhPho" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="phuongXa" hidden>
                <Input />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="tenNguoiNhan"
                    label="Tên người nhận"
                    rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                  >
                    <Input placeholder="VD: Nguyễn Văn A" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="sdtNguoiNhan"
                    label="SĐT người nhận"
                    rules={[
                      { required: true, message: "Vui lòng nhập SĐT" },
                      {
                        pattern: /^0\d{9}$/,
                        message: "SĐT gồm 10 số, bắt đầu bằng 0",
                      },
                    ]}
                  >
                    <Input placeholder="0xxxxxxxxx" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="provinceCode"
                label="Tỉnh/Thành phố"
                rules={[{ required: true, message: "Chọn tỉnh/thành phố" }]}
              >
                <Select
                  placeholder="-- Tỉnh/Thành phố --"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label?.toString() ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onChange={(val, opt) => {
                    const label = (opt as any)?.label ?? "";
                    addrForm.setFieldsValue({
                      tinhThanhPho: label,
                      phuongXa: "",
                      wardCode: undefined,
                    });
                    setWards([]);
                    if (val) loadWardsFromProvince(val);
                  }}
                >
                  {provinces.map((p) => (
                    <Select.Option key={p.code} value={p.code} label={p.name}>
                      {p.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="wardCode"
                label="Xã/Phường/Thị trấn"
                rules={[{ required: true, message: "Chọn Xã/Phường/Thị trấn" }]}
              >
                <Select
                  placeholder="-- Xã/Phường/Thị trấn --"
                  showSearch
                  disabled={
                    !addrForm.getFieldValue("provinceCode") || loadingWards
                  }
                  filterOption={(input, option) =>
                    (option?.label?.toString() ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  loading={loadingWards}
                  onChange={(val, opt) => {
                    const label = (opt as any)?.label ?? "";
                    addrForm.setFieldsValue({ phuongXa: label });
                  }}
                >
                  {wards.map((w) => (
                    <Select.Option key={w.code} value={w.code} label={w.name}>
                      {w.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="diaChiChiTiet"
                label="Địa chỉ cụ thể"
                rules={[{ required: true, message: "Nhập số nhà, đường..." }]}
              >
                <Input placeholder="VD: 123 Nguyễn Trãi, P.2" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      <Modal
        title="Thông tin Serial"
        open={serialInfoOpen}
        onCancel={() => setSerialInfoOpen(false)}
        footer={null}
      >
        {serialInfoRow && (
          <Descriptions
            column={1}
            size="small"
            bordered
            style={{ marginTop: 8 }}
          >
            <Descriptions.Item label="Sản phẩm">
              {serialInfoRow.tenSanPham}
            </Descriptions.Item>
            <Descriptions.Item label="Serial">
              <Tag
                color="blue"
                style={{ fontFamily: "monospace", fontSize: 13 }}
              >
                {serialInfoRow.serialCode}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* COMPONENT MODAL QUÉT MÃ MỚI */}
      {selectedOrderDetail && order && (
        <SerialAssignmentModal
          open={serialChangeOpen}
          onClose={() => {
            setSerialChangeOpen(false);
            setSelectedOrderDetail(null);
          }}
          orderId={order.orderId || ""}
          detailId={selectedOrderDetail.maHoaDonChiTiet}
          productName={selectedOrderDetail.tenSanPham}
          requiredQuantity={selectedOrderDetail.soLuong}
          productDetailId={selectedOrderDetail.productDetailId}
          initialSerials={parseSerials(selectedOrderDetail.danhSachImei).map(
            (s) => ({
              id: s.id,
              serialNumber: s.code, // Giả định code backend trả về chính là serialNumber hiển thị
              code: s.code,
            }),
          )}
          onSuccess={() => fetchOrder()} // Gán xong thì load lại giỏ hàng
        />
      )}

      {order && (
        <OrderReceiptTemplate ref={receiptRef} order={order} items={items} />
      )}
    </div>
  );
};

export default OrderDetailPage;
