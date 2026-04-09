import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Tag,
  Card,
  Typography,
  Space,
  Input,
  DatePicker,
  Button,
  Modal,
  message,
  Tooltip,
  Alert,
  Descriptions,
  Row,
  Col,
  Statistic,
  Divider,
  Empty,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  FileExcelOutlined,
  ReloadOutlined,
  EyeOutlined,
  WalletOutlined,
  TransactionOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { shiftHandoverApi } from "../../../api/shiftHandoverApi";
import * as XLSX from "xlsx";
import type { ShiftHistoryItem } from "../../../models/shiftHandover";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const ShiftHistoryPage: React.FC = () => {
  const [data, setData] = useState<ShiftHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({
    page: 0,
    size: 10,
    staffId: "",
    fromDate: null as number | null,
    toDate: null as number | null,
  });

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    record: ShiftHistoryItem | null;
  }>({
    open: false,
    record: null,
  });

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await shiftHandoverApi.getShiftHistory(filter);
      setData(res.data.content);
      setTotal(res.data.totalElements);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải dữ liệu lịch sử!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => loadHistory(), 400);
    return () => clearTimeout(handler);
  }, [filter]);

  // Thống kê nhanh từ dữ liệu hiện tại
  const stats = useMemo(() => {
    const totalRev = data.reduce(
      (sum, item) =>
        sum + (item.totalCashSales || 0) + (item.totalBankSales || 0),
      0,
    );
    const totalDiff = data.reduce(
      (sum, item) => sum + (item.differenceAmount || 0),
      0,
    );
    return { totalRev, totalDiff };
  }, [data]);

  const handleExportExcel = () => {
    if (!data.length) return message.warning("Không có dữ liệu!");
    const exportData = data.map((item) => ({
      "Mã ca": item.code,
      "Nhân viên": item.employeeName,
      "Giờ vào": dayjs(item.checkInTime).format("HH:mm DD/MM/YYYY"),
      "Giờ ra": item.checkOutTime
        ? dayjs(item.checkOutTime).format("HH:mm DD/MM/YYYY")
        : "N/A",
      "Doanh thu tiền mặt": item.totalCashSales,
      "Doanh thu CK": item.totalBankSales,
      "Chênh lệch": item.differenceAmount,
      "Trạng thái": item.status,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");
    XLSX.writeFile(wb, `Report_${dayjs().format("YYYYMMDD")}.xlsx`);
  };

  const columns = [
    {
      title: "Mã ca",
      dataIndex: "code",
      key: "code",
      render: (text: string) => (
        <Text strong copyable>
          {text}
        </Text>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "employeeName",
      key: "employee",
      render: (text: string) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Thời gian làm việc",
      key: "time",
      render: (_: any, record: ShiftHistoryItem) => (
        <div style={{ fontSize: 13 }}>
          <div>
            <Tag color="blue" variant="filled">
              Vào
            </Tag>{" "}
            {dayjs(record.checkInTime).format("HH:mm DD/MM")}
          </div>
          <div style={{ marginTop: 4 }}>
            <Tag color="default" variant="filled">
              Ra
            </Tag>
            {record.checkOutTime
              ? dayjs(record.checkOutTime).format("HH:mm DD/MM")
              : "---"}
          </div>
        </div>
      ),
    },
    {
      title: "Tổng Doanh Thu",
      key: "revenue",
      align: "right" as const,
      render: (_: any, record: ShiftHistoryItem) => (
        <Text strong color="black">
          {(
            (record.totalCashSales || 0) + (record.totalBankSales || 0)
          ).toLocaleString()}{" "}
          ₫
        </Text>
      ),
    },
    {
      title: "Chênh lệch",
      dataIndex: "differenceAmount",
      align: "right" as const,
      render: (val: number) => (
        <Tooltip title={val < 0 ? "Thâm hụt" : val > 0 ? "Dư tiền" : "Khớp"}>
          <Tag
            color={val === 0 ? "success" : val < 0 ? "error" : "warning"}
            style={{ fontWeight: 600, borderRadius: 4 }}
          >
            {val > 0 ? "+" : ""}
            {val?.toLocaleString()} ₫
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center" as const,
      render: (status: string) => {
        const map: any = {
          CLOSED: { color: "green", text: "Hoàn tất" },
          PENDING: { color: "gold", text: "Chờ duyệt" },
          OPEN: { color: "blue", text: "Đang mở" },
        };
        return (
          <Tag bordered={false} color={map[status]?.color}>
            {map[status]?.text}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center" as const,
      render: (_: any, record: ShiftHistoryItem) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => setDetailModal({ open: true, record })}
          />
          {record.status === "PENDING" && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setSelectedId(record.id);
                setIsConfirmModalOpen(true);
              }}
            >
              Duyệt
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header & Stats Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col span={24}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={4}>
              <HistoryOutlined /> Lịch sử hoạt động
            </Title>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadHistory}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
              >
                Xuất báo cáo
              </Button>
            </Space>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="outlined" className="stat-card">
            <Statistic
              title="Tổng doanh thu (Trang này)"
              value={stats.totalRev}
              precision={0}
              prefix={<WalletOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="outlined" className="stat-card">
            <Statistic
              title="Tổng chênh lệch"
              value={stats.totalDiff}
              styles={{
                content: { color: stats.totalDiff < 0 ? "#cf1322" : "#3f8600" },
              }}
              prefix={<TransactionOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Section */}
      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm theo mã nhân viên..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              allowClear
              onChange={(e) =>
                setFilter({ ...filter, staffId: e.target.value, page: 0 })
              }
            />
          </Col>
          <Col xs={24} md={10}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={(dates: any) =>
                setFilter({
                  ...filter,
                  fromDate: dates ? dates[0].startOf("day").valueOf() : null,
                  toDate: dates ? dates[1].endOf("day").valueOf() : null,
                  page: 0,
                })
              }
            />
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary">
              <FilterOutlined /> Đang hiển thị {data.length}/{total} bản ghi
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Card bordered={false} style={{ borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          size="middle"
          pagination={{
            total,
            pageSize: filter.size,
            current: filter.page + 1,
            showSizeChanger: true,
            onChange: (page, size) =>
              setFilter({ ...filter, page: page - 1, size }),
          }}
        />
      </Card>

      {/* Professional Detail Modal */}
      <Modal
        open={detailModal.open}
        title={null}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setDetailModal({ open: false, record: null })}
          >
            Đóng
          </Button>,
        ]}
        onCancel={() => setDetailModal({ open: false, record: null })}
        width={750}
        centered
      >
        {detailModal.record ? (
          <div style={{ padding: "10px" }}>
            <div
              style={{
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  Chi tiết ca làm việc
                </Title>
                <Text type="secondary">Mã: {detailModal.record.code}</Text>
              </div>
              <Tag style={{ fontSize: 14, padding: "4px 12px" }}></Tag>
            </div>

            <Descriptions
              bordered
              column={2}
              size="small"
              labelStyle={{ background: "#fafafa", fontWeight: 600 }}
            >
              <Descriptions.Item label="Nhân viên" span={2}>
                {detailModal.record.employeeName}
              </Descriptions.Item>
              <Descriptions.Item label="Thời điểm vào">
                {dayjs(detailModal.record.checkInTime).format(
                  "HH:mm:ss DD/MM/YYYY",
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Thời điểm ra">
                {detailModal.record.checkOutTime
                  ? dayjs(detailModal.record.checkOutTime).format(
                      "HH:mm:ss DD/MM/YYYY",
                    )
                  : "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Tiền mặt đầu ca">
                {detailModal.record.initialCash?.toLocaleString()} ₫
              </Descriptions.Item>
              <Descriptions.Item
                label="Tiền mặt cuối ca"
                labelStyle={{ color: "#1890ff" }}
              >
                <Text strong>
                  {detailModal.record.actualCashAtEnd?.toLocaleString()} ₫
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Doanh thu tiền mặt">
                {detailModal.record.totalCashSales?.toLocaleString()} ₫
              </Descriptions.Item>
              <Descriptions.Item label="Doanh thu chuyển khoản">
                {detailModal.record.totalBankSales?.toLocaleString()} ₫
              </Descriptions.Item>

              <Descriptions.Item label="Tiền chi tiêu">
                {detailModal.record.cashWithdraw?.toLocaleString()} ₫
              </Descriptions.Item>
              <Descriptions.Item label="Chênh lệch đối soát">
                <Text
                  strong
                  type={
                    detailModal.record.differenceAmount < 0
                      ? "danger"
                      : "success"
                  }
                >
                  {detailModal.record.differenceAmount?.toLocaleString()} ₫
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Ghi chú nhân viên" span={2}>
                {detailModal.record.note || "Không có ghi chú"}
              </Descriptions.Item>
            </Descriptions>

            {detailModal.record.differenceAmount !== 0 && (
              <Alert
                message="Lưu ý về chênh lệch"
                description="Số tiền mặt thực tế nộp lại không khớp với doanh thu hệ thống tính toán. Cần kiểm tra lại các hóa đơn tiền mặt hoặc phiếu chi."
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        ) : (
          <Empty />
        )}
      </Modal>

      {/* Confirm Approve Modal */}
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined
              style={{ color: "#faad14", marginRight: 8 }}
            />{" "}
            Xác nhận duyệt ca trực
          </span>
        }
        open={isConfirmModalOpen}
        onOk={async () => {
          try {
            await shiftHandoverApi.confirmShift({
              handoverId: selectedId,
              adminNote,
            });
            message.success("Đã phê duyệt ca trực");
            setIsConfirmModalOpen(false);
            loadHistory();
          } catch (e) {
            console.error(e);
            message.error("Lỗi duyệt ca!");
          }
        }}
        onCancel={() => setIsConfirmModalOpen(false)}
        okText="Xác nhận duyệt"
        cancelText="Hủy"
      >
        <p>
          Hành động này sẽ chuyển trạng thái ca trực của nhân viên thành{" "}
          <b>HOÀN TẤT (CLOSED)</b>.
        </p>
        <Divider plain>Phản hồi của quản lý</Divider>
        <Input.TextArea
          rows={3}
          placeholder="Nhập nội dung đối soát (VD: Đã thu đủ tiền thiếu...)"
          onChange={(e) => setAdminNote(e.target.value)}
        />
      </Modal>

      <style>{`
        .stat-card {
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border-radius: 8px;
          transition: all 0.3s;
        }
        .stat-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          font-weight: 700 !important;
        }
      `}</style>
    </div>
  );
};

export default ShiftHistoryPage;
