import {
  EyeOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import { invoiceApi } from "../../../api/admin/invoiceApi";
import { message, Modal } from "antd";
import type { OrderPageResponse, OrderResponse } from "../../../models/order";
import type { ColumnsType } from "antd/es/table";
import {
  invoiceTypeLabel,
  invoiceTypeTagColor,
} from "../../../utils/invoiceTypeLabel";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const OrderStatuses = [
  { key: "ALL", label: "Tất cả" },
  { key: "CHO_XAC_NHAN", label: "Chờ xác nhận" },
  { key: "DA_XAC_NHAN", label: "Đã xác nhận" },
  { key: "CHO_GIAO", label: "Chờ giao hàng" },
  { key: "DANG_GIAO", label: "Đang giao hàng" },
  { key: "GIAO_HANG_KHONG_THANH_CONG", label: "Giao hàng không thành công" },
  { key: "HOAN_THANH", label: "Hoàn thành" },
  { key: "DA_HUY", label: "Đã hủy" },
];

const PaymentMethods = [
  { key: "ALL", label: "Tất cả" },
  { key: "TIEN_MAT", label: "Tiền mặt" },
  { key: "CHUYEN_KHOAN", label: "Chuyển khoản" },
  { key: "COD", label: "COD" },
  { key: "VNPAY", label: "VNPAY" },
];

const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [ordersData, setOrdersData] = useState<OrderPageResponse | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const [activeTab, setActiveTab] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [productName, setProductName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("ALL");
  const [orderType, setOrderType] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadData = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const res = await invoiceApi.searchInvoices({
        page: currentPage - 1,
        size: pageSize,
        q: keyword.trim() || undefined,
        productName: productName.trim() || undefined,
        paymentMethod: paymentMethod === "ALL" ? undefined : paymentMethod,
        status: activeTab === "ALL" ? undefined : activeTab,
        orderType: orderType === "ALL" ? undefined : orderType,
        startDate: dateRange
          ? dayjs(dateRange[0]).startOf("day").valueOf()
          : undefined,
        endDate: dateRange
          ? dayjs(dateRange[1]).endOf("day").valueOf()
          : undefined,
      });
      const body = res.data;
      if (body.isSuccess || body.success) {
        setOrdersData(body.data);
      } else {
        message.error(body.message || "Không tải được danh sách hóa đơn");
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || "Lỗi mạng");
    } finally {
      setIsLoadingList(false);
    }
  }, [currentPage, pageSize, keyword, productName, paymentMethod, activeTab, dateRange, orderType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns: ColumnsType<OrderResponse> = useMemo(
    () => [
      {
        title: "STT",
        key: "index",
        width: 70,
        align: "center",
        render: (_: any, __: any, index: number) =>
          (currentPage - 1) * pageSize + index + 1,
      },
      {
        title: "Mã HĐ",
        dataIndex: "maHoaDon",
        key: "maHoaDon",
        render: (t: string) => (
          <Text style={{ color: "#52c41a" }} strong>
            {t}
          </Text>
        ),
      },
      {
        title: "Khách hàng",
        key: "customer",
        render: (_: any, record: OrderResponse) => (
          <Space direction="vertical" size={0}>
            <Text strong>{record.tenKhachHang || "Khách vãng lai"}</Text>
            {record.sdtKhachHang && (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.sdtKhachHang}
              </Text>
            )}
          </Space>
        ),
      },
      {
        title: "Nhân viên",
        key: "staff",
        render: (_: any, record: OrderResponse) => (
          <Space direction="vertical" size={0}>
            <Text>{record.tenNhanVien || "N/A"}</Text>
            <Text
              type="secondary"
              style={{ fontSize: "12px", color: "#1677ff" }}
            >
              {record.maNhanVien || ""}
            </Text>
          </Space>
        ),
      },
      {
        title: "Loại",
        dataIndex: "loaiHoaDon",
        key: "loaiHoaDon",
        render: (type: string) => (
          <Tag color={invoiceTypeTagColor(type)} style={{ borderRadius: "4px" }}>
            {invoiceTypeLabel(type)}
          </Tag>
        ),
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdDate",
        key: "createdDate",
        render: (d: number) => dayjs(d).format("HH:mm DD/MM/YYYY"),
      },
      {
        title: "Tổng tiền",
        dataIndex: "tongTienSauGiam",
        key: "tongTienSauGiam",
        align: "right",
        render: (value: number, record: any) => {
          const finalAmount =
            value ?? record.totalAfterDiscount ?? record.tongTien;
          return (
            <Typography.Text strong style={{ color: "#cf1322" }}>
              {finalAmount?.toLocaleString("vi-VN")} đ
            </Typography.Text>
          );
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        align: "center" as const,
        render: (st: string) => {
          const statusMap: Record<string, { color: string; label: string }> = {
            CHO_XAC_NHAN: { color: "blue", label: "Chờ xác nhận" },
            DA_XAC_NHAN: { color: "cyan", label: "Đã xác nhận" },
            CHO_GIAO: { color: "cyan", label: "Chờ giao hàng" },
            DANG_GIAO: { color: "geekblue", label: "Đang giao hàng" },
            GIAO_HANG_KHONG_THANH_CONG: {
              color: "volcano",
              label: "Giao hàng không thành công",
            },
            HOAN_THANH: { color: "green", label: "Hoàn thành" },
            DA_HUY: { color: "red", label: "Đã hủy" },
          };
          const config = statusMap[st] || { color: "default", label: st };
          return (
            <Tag color={config.color} style={{ borderRadius: "4px" }}>
              {config.label}
            </Tag>
          );
        },
      },
      {
        title: "Thao tác",
        key: "action",
        align: "center" as const,
        render: (_: any, record: any) => (
          <Button
            type="text"
            shape="circle"
            icon={
              <EyeOutlined style={{ color: "#1677ff", fontSize: "16px" }} />
            }
            onClick={() => navigate(`/admin/invoices/${record.maHoaDon}`)}
          />
        ),
      },
    ],
    [currentPage, pageSize, navigate],
  );

  const handleExportExcel = async () => {
    try {
      const params = {
        q: keyword.trim() || undefined,
        productName: productName.trim() || undefined,
        paymentMethod: paymentMethod === "ALL" ? undefined : paymentMethod,
        status: activeTab === "ALL" ? undefined : activeTab,
        orderType: orderType === "ALL" ? undefined : orderType,
        startDate: dateRange
          ? dayjs(dateRange[0]).startOf("day").valueOf()
          : undefined,
        endDate: dateRange
          ? dayjs(dateRange[1]).endOf("day").valueOf()
          : undefined,
        page: 0,
        size: 10000,
      };
      const res = await invoiceApi.searchInvoices(params);
      const allData = res.data?.data?.page?.content || [];
      message.info(`Số bản ghi lấy được: ${allData.length}`);
      if (!allData.length) {
        message.warning("Không có dữ liệu để xuất!");
        return;
      }
      const exportData = allData.map((row: OrderResponse, idx: number) => ({
        STT: idx + 1,
        "Mã HĐ": row.maHoaDon,
        "Khách hàng": row.tenKhachHang,
        "SĐT KH": row.sdtKhachHang,
        "Nhân viên": row.tenNhanVien,
        "Mã NV": row.maNhanVien,
        Loại: invoiceTypeLabel(row.loaiHoaDon),
        "Ngày tạo": row.createdDate
          ? dayjs(row.createdDate).format("HH:mm DD/MM/YYYY")
          : "",
        "Tổng tiền":
          (row.tongTienSauGiam ?? row.tongTien)?.toLocaleString("vi-VN") + " đ",
        "Trạng thái": row.status,
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "HoaDon");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([excelBuffer], { type: "application/octet-stream" }),
        `QuanLyHoaDon_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`,
      );
      message.success("Xuất Excel thành công!");
    } catch {
      message.error("Lỗi khi xuất Excel. Vui lòng thử lại!");
    }
  };

  const confirmExportExcel = () => {
    Modal.confirm({
      title: "Xác nhận xuất Excel",
      content:
        "Xuất danh sách hóa đơn (theo bộ lọc hiện tại) ra file Excel?",
      okText: "Xuất Excel",
      cancelText: "Hủy",
      onOk: handleExportExcel,
    });
  };

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>
      <div
        className="solid-card"
        style={{ padding: "var(--spacing-lg)", marginBottom: 16 }}
      >
        <Space align="center" size={16}>
          <div
            style={{
              backgroundColor: "var(--color-primary-light)",
              padding: "12px",
              borderRadius: "var(--radius-md)",
            }}
          >
            <FileTextOutlined
              style={{
                fontSize: "24px",
                color: "var(--color-primary)",
              }}
            />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              Quản lý hóa đơn
            </Title>
            <Text type="secondary" style={{ fontSize: "13px" }}>
              Tra cứu chứng từ online và tại quầy — không xử lý flow duyệt đơn
              online tại đây
            </Text>
          </div>
        </Space>
      </div>

      <Card variant="borderless" style={{ marginBottom: 16, borderRadius: 8 }}>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 20 }}
        >
          <Space>
            <FilterOutlined style={{ fontSize: "18px", color: "#52c41a" }} />
            <Text strong style={{ fontSize: "16px" }}>
              Bộ lọc tìm kiếm
            </Text>
          </Space>
          <Button
            icon={<ReloadOutlined />}
            type="text"
            style={{
              background: "#f6ffed",
              color: "#52c41a",
              border: "1px solid #b7eb8f",
            }}
            onClick={() => {
              setKeyword("");
              setProductName("");
              setPaymentMethod("ALL");
              setOrderType("ALL");
              setDateRange(null);
              setActiveTab("ALL");
              setCurrentPage(1);
            }}
          >
            Đặt lại
          </Button>
        </Row>

        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Tìm kiếm chung</Text>
            <Input
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Mã hóa đơn, tên KH, SĐT..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ marginTop: 8 }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Tên sản phẩm</Text>
            <Input
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Tìm theo tên sản phẩm..."
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              style={{ marginTop: 8 }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Khoảng thời gian</Text>
            <RangePicker
              style={{ width: "100%", marginTop: 8 }}
              value={dateRange}
              onChange={(val) => setDateRange(val)}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Loại hóa đơn</Text>
            <Select
              value={orderType}
              style={{ width: "100%", marginTop: 8 }}
              onChange={(val) => {
                setOrderType(val);
                setCurrentPage(1);
              }}
              options={[
                { value: "ALL", label: "Tất cả" },
                { value: "OFFLINE", label: "Tại quầy" },
                { value: "ONLINE", label: "Online" },
                { value: "GIAO_HANG", label: "Giao hàng (quầy)" },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Phương thức thanh toán</Text>
            <Select
              value={paymentMethod}
              style={{ width: "100%", marginTop: 8 }}
              onChange={(val) => {
                setPaymentMethod(val);
                setCurrentPage(1);
              }}
              options={PaymentMethods.map((pm) => ({
                value: pm.key,
                label: pm.label,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Text strong>Trạng thái</Text>
            <Select
              value={activeTab}
              style={{ width: "100%", marginTop: 8 }}
              onChange={(val) => {
                setActiveTab(val);
                setCurrentPage(1);
              }}
              options={OrderStatuses.map((s) => ({
                value: s.key,
                label: s.label,
              }))}
            />
          </Col>
        </Row>
      </Card>

      <Card variant="borderless" style={{ borderRadius: 8 }}>
        <Row justify="space-between" style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: "16px" }}>
            Danh sách hóa đơn
          </Text>
          <Space>
            <Button
              icon={<FileExcelOutlined />}
              style={{ color: "#217346", borderColor: "#217346" }}
              onClick={confirmExportExcel}
            >
              Xuất Excel
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadData} />
          </Space>
        </Row>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setCurrentPage(1);
          }}
          items={OrderStatuses.map((s) => ({
            key: s.key,
            label: (
              <Space>
                {s.label}
                <Badge
                  count={
                    s.key === "ALL"
                      ? ordersData?.page?.totalElements
                      : ordersData?.countByStatus?.[s.key]
                  }
                  showZero
                  color={activeTab === s.key ? "#1677ff" : "#bfbfbf"}
                  style={{ fontSize: "10px" }}
                />
              </Space>
            ),
          }))}
        />

        <Table
          columns={columns}
          dataSource={ordersData?.page?.content || []}
          loading={isLoadingList}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: ordersData?.page?.totalElements || 0,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hóa đơn`,
          }}
          onChange={(p) => {
            setCurrentPage(p.current!);
            setPageSize(p.pageSize!);
          }}
        />
      </Card>
    </div>
  );
};

export default InvoiceListPage;
