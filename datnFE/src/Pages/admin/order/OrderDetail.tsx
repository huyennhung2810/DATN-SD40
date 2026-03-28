import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import OrderReceiptTemplate from "./OrderReceiptTemplate";
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Row,
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
import { orderApi } from "../../../api/admin/orderApi";
import { posApi } from "../../../api/admin/posApi";
import type {
  OrderDetailResponse,
  OrderHistoryType,
} from "../../../models/order";

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
      });
    } else {
      serials.forEach((s) => {
        rows.push({
          rowKey: `${item.maHoaDonChiTiet}-${s.id}`,
          detailId: item.maHoaDonChiTiet,
          productDetailId: item.productDetailId,
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
        });
      });
    }
  });
  return rows;
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const receiptRef = useRef<HTMLDivElement>(null);
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

  // Serial info modal
  const [serialInfoOpen, setSerialInfoOpen] = useState(false);
  const [serialInfoRow, setSerialInfoRow] = useState<FlatRow | null>(null);

  // Serial change modal
  const [serialChangeOpen, setSerialChangeOpen] = useState(false);
  const [serialChangeRow, setSerialChangeRow] = useState<FlatRow | null>(null);
  const [availableSerials, setAvailableSerials] = useState<
    Array<{ id: string; code: string }>
  >([]);
  const [loadingSerials, setLoadingSerials] = useState(false);
  const [selectedNewSerial, setSelectedNewSerial] = useState("");
  const [changingSerial, setChangingSerial] = useState(false);

  // Derived state
  const currentStatus = order?.trangThaiHoaDon ?? "CHO_XAC_NHAN";
  const isOnline =
    order?.loaiHoaDon === "ONLINE" || order?.loaiHoaDon === "GIAO_HANG";
  const isCompleted = currentStatus === "HOAN_THANH";
  const isCancelled = currentStatus === "DA_HUY";
  const canChangeSerial =
    isOnline &&
    (currentStatus === "CHO_XAC_NHAN" || currentStatus === "DA_XAC_NHAN");
  const showCancelButton = !isCompleted && !isCancelled;
  // Nếu đang giao hàng thì cho phép chọn 2 trạng thái tiếp theo
  const nextStatusKeys =
    currentStatus === "DANG_GIAO"
      ? ["HOAN_THANH", "GIAO_HANG_KHONG_THANH_CONG"]
      : NEXT_STATUS[currentStatus]
        ? [NEXT_STATUS[currentStatus]]
        : [];
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
        setOrder(rows[0]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openStatusModal = (status: string) => {
    setNextStatus(status);
    setStatusNote("");
    setStatusModalOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!order) return;
    // Nếu chọn GIAO_HANG_KHONG_THANH_CONG thì bắt buộc nhập lý do
    if (
      nextStatus === "GIAO_HANG_KHONG_THANH_CONG" &&
      (!statusNote || !statusNote.trim())
    ) {
      message.warning("Vui lòng nhập lý do giao hàng không thành công!");
      return;
    }
    setIsUpdating(true);
    try {
      await orderApi.updateOrderStatus({
        maHoaDon: order.maHoaDon,
        statusTrangThaiHoaDon: nextStatus,
        note: statusNote,
      });
      message.success("Cập nhật trạng thái thành công");
      setStatusModalOpen(false);
      fetchOrder();
    } catch {
      message.error("Cập nhật thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  const openCustomerModal = () => {
    if (!order) return;
    form.setFieldsValue({
      tenKhachHang: order.tenKhachHang,
      sdtKH: order.sdtKH,
      email: order.email,
      diaChi: order.diaChi,
    });
    setCustomerModalOpen(true);
  };

  const handleSaveCustomer = async () => {
    if (!order) return;
    try {
      const values = await form.validateFields();
      setSavingCustomer(true);
      await orderApi.updateCustomerInfo({
        maHoaDon: order.maHoaDon,
        ...values,
      });
      message.success("Cập nhật thông tin khách hàng thành công");
      setCustomerModalOpen(false);
      fetchOrder();
    } catch (err: any) {
      if (!err.errorFields) message.error("Cập nhật thất bại");
    } finally {
      setSavingCustomer(false);
    }
  };

  const openSerialInfo = (row: FlatRow) => {
    setSerialInfoRow(row);
    setSerialInfoOpen(true);
  };

  const openSerialChange = async (row: FlatRow) => {
    setSerialChangeRow(row);
    setSelectedNewSerial("");
    setSerialChangeOpen(true);
    setLoadingSerials(true);
    try {
      const res = await posApi.getAvailableSerials(row.productDetailId);
      // axiosClient returns AxiosResponse; backend wraps list in ResponseObject.data
      const responseBody = (res as any)?.data;
      console.log("[openSerialChange] productDetailId:", row.productDetailId);
      console.log("[openSerialChange] raw response:", responseBody);
      const list: any[] = Array.isArray(responseBody?.data)
        ? responseBody.data
        : Array.isArray(responseBody)
          ? responseBody
          : [];
      console.log("[openSerialChange] parsed list:", list);
      setAvailableSerials(
        list.map((s: any) => ({
          id: String(s.id ?? s.serialId ?? ""),
          code: String(s.serialNumber ?? s.code ?? s.serialCode ?? ""),
        })),
      );
    } catch (err) {
      console.error("[openSerialChange] error:", err);
      message.error("Không thể tải danh sách serial");
    } finally {
      setLoadingSerials(false);
    }
  };

  const handleSaveSerialChange = async () => {
    if (!serialChangeRow || !selectedNewSerial) {
      message.warning("Vui lòng chọn serial mới");
      return;
    }
    setChangingSerial(true);
    try {
      console.log("[assignSerials] request:", {
        hoaDonChiTietId: serialChangeRow.detailId,
        oldImeiId: serialChangeRow.serialId || "",
        newImeiId: selectedNewSerial,
      });
      const res = await orderApi.assignSerials({
        hoaDonChiTietId: serialChangeRow.detailId,
        oldImeiId: serialChangeRow.serialId || "",
        newImeiId: selectedNewSerial,
      });
      console.log("[assignSerials] response:", res);
      // res is now ResponseObject body (unwrapped in orderApi)
      const ok = res?.success ?? (res as any)?.isSuccess ?? true;
      if (!ok) {
        message.error((res as any)?.message || "Đổi serial thất bại");
        return;
      }
      message.success(
        serialChangeRow.serialId
          ? "Đổi serial thành công"
          : "Gán serial thành công",
      );
      setSerialChangeOpen(false);
      await fetchOrder();
    } catch (err: any) {
      console.error("[assignSerials] error:", err);
      const errMsg =
        err?.message ||
        err?.data?.message ||
        err?.error ||
        "Đổi serial thất bại";
      message.error(errMsg);
    } finally {
      setChangingSerial(false);
    }
  };

  const productColumns: ColumnsType<FlatRow> = [
    {
      title: "STT",
      width: 55,
      align: "center",
      render: (_: unknown, __: unknown, i: number) => i + 1,
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
            {r.thuongHieu && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {r.thuongHieu}
              </Text>
            )}
            <div style={{ marginTop: 4 }}>
              {r.mauSac && <Tag style={{ marginRight: 4 }}>{r.mauSac}</Tag>}
              {r.size && <Tag>{r.size}</Tag>}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Serial",
      key: "serial",
      width: 180,
      align: "center",
      render: (_: unknown, r: FlatRow) =>
        r.serialCode !== "Chưa gán" ? (
          <Tag color="blue" style={{ fontFamily: "monospace" }}>
            {r.serialCode}
          </Tag>
        ) : (
          <Tag color="default">Chưa gán</Tag>
        ),
    },
    {
      title: "Đơn giá",
      key: "giaBan",
      align: "right",
      width: 120,
      render: (_: unknown, r: FlatRow) => fmt(r.giaBan),
    },
    {
      title: "SL",
      key: "soLuong",
      align: "center",
      width: 60,
      render: (_: unknown, r: FlatRow) => r.soLuong,
    },
    {
      title: "Thành tiền",
      key: "tongTien",
      align: "right",
      width: 130,
      render: (_: unknown, r: FlatRow) => (
        <Text strong style={{ color: "#cf1322" }}>
          {fmt(r.tongTien)}
        </Text>
      ),
    },
    ...(canChangeSerial
      ? [
          {
            title: "Thao tác",
            key: "action",
            align: "center" as const,
            width: 120,
            render: (_: unknown, r: FlatRow) => (
              <Space>
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => openSerialInfo(r)}
                  title="Xem serial"
                />
                {!r.serialId && (
                  <Button
                    size="small"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openSerialChange(r)}
                    title="Gán serial"
                  />
                )}
                {r.serialId && (
                  <Button
                    size="small"
                    icon={<SwapOutlined />}
                    onClick={() => openSerialChange(r)}
                    title="Đổi serial"
                  />
                )}
              </Space>
            ),
          },
        ]
      : []),
  ];

  const listColumns: ColumnsType<OrderDetailResponse> = [
    {
      title: "STT",
      width: 55,
      align: "center",
      render: (_: unknown, __: unknown, i: number) => i + 1,
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
            <div style={{ marginTop: 4 }}>
              {r.thuongHieu && (
                <Tag style={{ fontSize: 11, marginRight: 4 }}>
                  {r.thuongHieu.toLowerCase()}
                </Tag>
              )}
              {r.mauSac && <Tag style={{ marginRight: 4 }}>{r.mauSac}</Tag>}
              {r.size && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  | Size: {r.size}
                </Text>
              )}
            </div>
          </div>
        </Space>
      ),
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
      render: (_: unknown, r: OrderDetailResponse) => fmt(r.giaBan),
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
        const flatRow: FlatRow = {
          rowKey: r.maHoaDonChiTiet,
          detailId: r.maHoaDonChiTiet,
          productDetailId: r.productDetailId,
          tenSanPham: r.tenSanPham,
          thuongHieu: r.thuongHieu,
          mauSac: r.mauSac,
          size: r.size,
          anhSanPham: r.anhSanPham,
          giaBan: r.giaBan,
          soLuong: r.soLuong,
          tongTien: r.tongTien,
          serialId: firstSerial?.id || "",
          serialCode: firstSerial?.code || "Chưa gán",
        };
        return (
          <Space>
            {!firstSerial && (
              <Button
                size="small"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openSerialChange(flatRow)}
                title="Gán serial"
              />
            )}
            {firstSerial && (
              <Button
                size="small"
                icon={<SwapOutlined />}
                onClick={() => openSerialChange(flatRow)}
                title="Đổi serial"
              />
            )}
          </Space>
        );
      },
    },
  ];

  const availableSerialColumns: ColumnsType<{ id: string; code: string }> = [
    {
      title: "",
      key: "radio",
      width: 50,
      render: (_: unknown, r: { id: string; code: string }) => (
        <Radio
          checked={selectedNewSerial === r.id}
          onChange={() => setSelectedNewSerial(r.id)}
        />
      ),
    },
    { title: "Serial", dataIndex: "code" },
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

    const steps = isOnline ? ONLINE_STEPS : [ONLINE_STEPS[0], ONLINE_STEPS[4]];
    const stepKeys = steps.map((s) => s.key);
    const currentIdx = stepKeys.indexOf(currentStatus);

    const stepIcon = (key: string) => {
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
          const circleColor = done ? "#52c41a" : active ? "#1677ff" : "#d9d9d9";

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
                  {done ? <CheckCircleOutlined /> : stepIcon(step.key)}
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
                {active && nextStatusKeys.length > 0 && !isCompleted && (
                  <Space>
                    {nextStatusKeys.map((status) => (
                      <Button
                        key={status}
                        size="small"
                        type="primary"
                        style={{ marginTop: 6, fontSize: 11, padding: "0 8px" }}
                        onClick={() => openStatusModal(status)}
                      >
                        {STATUS_LABELS[status] || status}
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
                <span>Thông tin khách hàng</span>
              </Space>
            }
            extra={
              isOnline && !isCompleted && !isCancelled ? (
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={openCustomerModal}
                >
                  Sửa
                </Button>
              ) : null
            }
          >
            <Space align="start" style={{ marginBottom: 16, width: "100%" }}>
              <Avatar
                size={52}
                icon={<UserOutlined />}
                style={{
                  background: "#e6f4ff",
                  color: "#1677ff",
                  flexShrink: 0,
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
              }}
            >
              <Text type="secondary">Tổng tiền hàng:</Text>
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
                {fmt(order?.tongTienSauGiam)}
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
                {fmt(order?.tongTienSauGiam)}
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
            color={STATUS_COLORS[nextStatus]}
            style={{ fontSize: 14, padding: "4px 12px" }}
          >
            {STATUS_LABELS[nextStatus] ?? nextStatus}
          </Tag>
        </div>
        <TextArea
          rows={3}
          placeholder={
            nextStatus === "GIAO_HANG_KHONG_THANH_CONG"
              ? "Bắt buộc nhập lý do..."
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
      </Modal>

      <Modal
        title="Cập nhật thông tin khách hàng"
        open={customerModalOpen}
        onOk={handleSaveCustomer}
        onCancel={() => setCustomerModalOpen(false)}
        confirmLoading={savingCustomer}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="tenKhachHang"
            label="Tên khách hàng"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="sdtKH"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập SĐT" },
              {
                pattern: /^0\d{9}$/,
                message: "SĐT không hợp lệ (10 số, bắt đầu bằng 0)",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="diaChi" label="Địa chỉ giao hàng">
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thông tin Serial / IMEI"
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
            <Descriptions.Item label="Serial / IMEI">
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

      <Modal
        title={serialChangeRow?.serialId ? "Đổi Serial" : "Gán Serial"}
        open={serialChangeOpen}
        onOk={handleSaveSerialChange}
        onCancel={() => setSerialChangeOpen(false)}
        confirmLoading={changingSerial}
        okText={serialChangeRow?.serialId ? "Xác nhận đổi" : "Xác nhận gán"}
        cancelText="Hủy"
        width={580}
      >
        {serialChangeRow && (
          <div style={{ marginTop: 8 }}>
            {serialChangeRow.serialId && (
              <p>
                Serial hiện tại:{" "}
                <Tag color="orange" style={{ fontFamily: "monospace" }}>
                  {serialChangeRow.serialCode}
                </Tag>
              </p>
            )}
            <p style={{ marginBottom: 8 }}>
              {serialChangeRow.serialId
                ? "Chọn serial thay thế:"
                : "Chọn serial để gán:"}
            </p>
            {loadingSerials ? (
              <div style={{ textAlign: "center", padding: 32 }}>
                <Spin />
              </div>
            ) : availableSerials.length === 0 ? (
              <Text type="secondary">Không có serial khả dụng</Text>
            ) : (
              <Table<{ id: string; code: string }>
                dataSource={availableSerials}
                rowKey="id"
                columns={availableSerialColumns}
                pagination={false}
                size="small"
                onRow={(r) => ({
                  onClick: () => setSelectedNewSerial(r.id),
                  style: {
                    cursor: "pointer",
                    background:
                      selectedNewSerial === r.id ? "#e6f4ff" : undefined,
                  },
                })}
              />
            )}
          </div>
        )}
      </Modal>

      {order && (
        <OrderReceiptTemplate ref={receiptRef} order={order} items={items} />
      )}
    </div>
  );
};

export default OrderDetailPage;
