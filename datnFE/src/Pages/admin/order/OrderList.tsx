import {
  EyeOutlined,
  FileExcelOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
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
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { orderActions } from "../../../redux/order/OrderSlice";
import { orderApi } from "../../../api/admin/orderApi";
import { message, Modal } from "antd";
import type { OrderResponse } from "../../../models/order";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Định nghĩa trạng thái chuẩn như ảnh mẫu
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



const OrderPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { ordersData, isLoadingList } = useSelector(
    (state: any) => state.order,
  );

  const [activeTab, setActiveTab] = useState("CHO_XAC_NHAN");
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);
  const [orderType, setOrderType] = useState<string | undefined>("ONLINE");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadData = useCallback(() => {
    dispatch(
      orderActions.fetchOrdersRequest({
        page: currentPage - 1,
        size: pageSize,
        q: keyword.trim() || undefined,
        status: activeTab === "ALL" ? undefined : activeTab,
        orderType: orderType || undefined,
        startDate: dateRange
          ? dayjs(dateRange[0]).startOf("day").valueOf()
          : undefined,
        endDate: dateRange
          ? dayjs(dateRange[1]).endOf("day").valueOf()
          : undefined,
      }),
    );
  }, [
    dispatch,
    currentPage,
    pageSize,
    keyword,
    activeTab,
    dateRange,
    orderType,
  ]);

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
          <Space orientation="vertical" size={0}>
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
          <Space orientation="vertical" size={0}>
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
          <Tag
            color="orange"
            style={{ border: "none", background: "#fff7e6", color: "#d46b08" }}
          >
            {type === "OFFLINE" ? "Tại quầy" : "Online"}
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
          const statusMap: any = {
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
            onClick={() => navigate(`/admin/orders/${record.maHoaDon}`)}
          />
        ),
      },
    ],
    [currentPage, pageSize, navigate],
  );

  // Xuất toàn bộ danh sách hóa đơn (không phân trang)

  const handleExportExcel = async () => {
    try {
      const params = {
        q: keyword.trim() || undefined,
        status: activeTab === "ALL" ? undefined : activeTab,
        orderType: orderType || undefined,
        startDate: dateRange
          ? dayjs(dateRange[0]).startOf("day").valueOf()
          : undefined,
        endDate: dateRange
          ? dayjs(dateRange[1]).endOf("day").valueOf()
          : undefined,
        page: 0,
        size: 10000, // lấy tối đa 10.000 bản ghi
      };
      const res = await orderApi.searchOrders(params);
      // Log dữ liệu trả về để debug
      console.log("[Xuất Excel] Params:", params);
      console.log("[Xuất Excel] API response:", res);
      console.log("[Xuất Excel] res.data:", res.data);
      console.log("[Xuất Excel] res.data.page:", res.data?.data?.page);
      let allData = res.data?.data?.page?.content || [];

      // 过滤：柜台订单 (OFFLINE) 只导出已完成的 (HOAN_THANH)
      allData = allData.filter((order: any) => {
        if (order.loaiHoaDon === "OFFLINE") {
          return order.status === "HOAN_THANH";
        }
        return true; // 在线订单导出全部
      });

      message.info(`Số bản ghi lấy được: ${allData.length}`);
      if (!allData.length) {
        message.warning("Không có dữ liệu để xuất!");
        return;
      }
      const exportData = allData.map((row: any, idx: number) => ({
        STT: idx + 1,
        "Mã HĐ": row.maHoaDon,
        "Khách hàng": row.tenKhachHang,
        "SĐT KH": row.sdtKhachHang,
        "Nhân viên": row.tenNhanVien,
        "Mã NV": row.maNhanVien,
        Loại:
          row.loaiHoaDon === "OFFLINE"
            ? "Tại quầy"
            : row.loaiHoaDon === "ONLINE"
              ? "Online"
              : row.loaiHoaDon,
        "Ngày tạo": row.createdDate
          ? dayjs(row.createdDate).format("HH:mm DD/MM/YYYY")
          : "",
        "Tổng tiền":
          (row.tongTienSauGiam ?? row.tongTien)?.toLocaleString("vi-VN") + " đ",
        "Trạng thái": row.status,
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "DanhSachHoaDon");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([excelBuffer], { type: "application/octet-stream" }),
        `DanhSachHoaDon_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`,
      );
      message.success("Xuất Excel thành công!");
    } catch (err: any) {
      message.error("Lỗi khi xuất Excel. Vui lòng thử lại!");
      // Log chi tiết lỗi để debug
      console.error("Lỗi khi xuất Excel:", err);
    }
  };

  const confirmExportExcel = () => {
    Modal.confirm({
      title: "Xác nhận xuất Excel",
      content:
        "Bạn có chắc chắn muốn xuất toàn bộ danh sách hóa đơn ra file Excel?",
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
            <ShoppingCartOutlined
              style={{
                fontSize: "24px",
                color: "var(--color-primary)",
              }}
            />
          </div>

          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              Quản lý Đơn hàng
            </Title>
            <Text type="secondary" style={{ fontSize: "13px" }}>
              Quản lý và theo dõi danh sách đơn hàng của cửa hàng
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
              setDateRange(null);
              setActiveTab("CHO_XAC_NHAN");
              setOrderType("ONLINE");
              setCurrentPage(1);
            }}
          />
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Text strong>Tìm kiếm chung</Text>
            <Input
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Mã hóa đơn, tên KH, SĐT..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </Col>
          <Col span={8}>
            <Text strong>Khoảng thời gian</Text>
            <RangePicker
              style={{ width: "100%", marginTop: 8 }}
              value={dateRange}
              onChange={(val) => setDateRange(val)}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col span={4}>
            <Text strong>Loại hóa đơn</Text>
            <Select
              placeholder="Tất cả"
              style={{ width: "100%", marginTop: 8 }}
              value={orderType || "ALL"}
              onChange={(val) => {
                setOrderType(val === "ALL" ? undefined : val);
                setCurrentPage(1);
              }}
              options={[
                { value: "ALL", label: "Tất cả" },
                { value: "OFFLINE", label: "Tại quầy" },
                { value: "ONLINE", label: "Online" },
              ]}
            />
            {orderType === "OFFLINE" && (
              <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 4 }}>
                Chỉ hiển thị đơn hàng đã hoàn thành
              </Text>
            )}
          </Col>
          <Col span={4}>
            <Text strong>Trạng thái</Text>
            <Select
              value={activeTab}
              style={{ width: "100%", marginTop: 8 }}
              onChange={setActiveTab}
              options={OrderStatuses.map((s) => ({
                value: s.key,
                label: s.label,
              }))}
            />
          </Col>
        </Row>
      </Card>

      {/* 3. Table Card */}
      <Card variant="borderless" style={{ borderRadius: 8 }}>
        <Row justify="space-between" style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: "16px" }}>
            Danh sách Đơn hàng
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
          dataSource={useMemo(() => {
            const raw = ordersData?.page?.content || [];
            // 过滤：柜台订单 (OFFLINE) 只显示已完成的 (HOAN_THANH)
            const filtered = raw.filter((order: any) => {
              if (order.loaiHoaDon === "OFFLINE") {
                return order.status === "HOAN_THANH";
              }
              return true; // 在线订单显示全部
            });
            // 排序规则：线上待确认订单优先，其他订单按创建时间倒序
            return [...filtered].sort((a, b) => {
              const aIsOnline = a.loaiHoaDon === "ONLINE" || a.loaiHoaDon === "GIAO_HANG";
              const bIsOnline = b.loaiHoaDon === "ONLINE" || b.loaiHoaDon === "GIAO_HANG";
              const aIsOnlinePending = aIsOnline && a.status === "CHO_XAC_NHAN";
              const bIsOnlinePending = bIsOnline && b.status === "CHO_XAC_NHAN";

              // 1. 线上待确认订单排在最前
              if (aIsOnlinePending && !bIsOnlinePending) return -1;
              if (!aIsOnlinePending && bIsOnlinePending) return 1;

              // 2. 同类型订单按创建时间倒序（新的在前）
              return (b.createdDate ?? 0) - (a.createdDate ?? 0);
            });
          }, [ordersData?.page?.content])}
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

export default OrderPage;
