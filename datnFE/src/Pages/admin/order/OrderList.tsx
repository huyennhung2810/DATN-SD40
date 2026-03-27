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
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { orderActions } from "../../../redux/order/OrderSlice";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Định nghĩa trạng thái chuẩn như ảnh mẫu
const OrderStatuses = [
  { key: "ALL", label: "Tất cả" },
  { key: "CHO_XAC_NHAN", label: "Chờ xác nhận" },
  { key: "DA_XAC_NHAN", label: "Đã xác nhận" },
  { key: "CHO_GIAO", label: "Chờ giao" },
  { key: "DANG_GIAO", label: "Đang giao" },
  { key: "HOAN_THANH", label: "Hoàn thành" },
  { key: "DA_HUY", label: "Đã hủy" },
];

const OrderPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { ordersData, isLoadingList } = useSelector(
    (state: any) => state.order,
  );

  const [activeTab, setActiveTab] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);
  const [_orderType, setOrderType] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadData = useCallback(() => {
    dispatch(
      orderActions.fetchOrdersRequest({
        page: currentPage - 1,
        size: pageSize,
        q: keyword.trim() || undefined,
        status: activeTab === "ALL" ? undefined : activeTab,
        startDate: dateRange
          ? dayjs(dateRange[0]).startOf("day").valueOf()
          : undefined,
        endDate: dateRange
          ? dayjs(dateRange[1]).endOf("day").valueOf()
          : undefined,
      }),
    );
  }, [dispatch, currentPage, pageSize, keyword, activeTab, dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = useMemo(
    () => [
      {
        title: "STT",
        key: "index",
        width: 70,
        align: "center" as const,
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
        render: (_: any, record: any) => (
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
        render: (_: any, record: any) => (
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
        dataIndex: "tongTien",
        key: "tongTien",
        align: "right" as const,
        render: (v: number) => (
          <Text type="danger" strong>
            {v?.toLocaleString("vi-VN")} đ
          </Text>
        ),
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
              Quản lý Hóa Đơn
            </Title>
            <Text type="secondary" style={{ fontSize: "13px" }}>
              Quản lý và theo dõi danh sách hóa đơn của cửa hàng
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
              setActiveTab("ALL");
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
              allowClear
              onChange={setOrderType}
            />
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
            Danh sách Hóa Đơn
          </Text>
          <Space>
            <Button
              icon={<FileExcelOutlined />}
              style={{ color: "#217346", borderColor: "#217346" }}
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

export default OrderPage;
