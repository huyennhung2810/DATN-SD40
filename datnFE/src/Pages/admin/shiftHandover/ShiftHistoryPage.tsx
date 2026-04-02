import React, { useEffect, useState } from "react";
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
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  FileExcelOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { shiftHandoverApi } from "../../../api/shiftHandoverApi";
import * as XLSX from "xlsx"; // npm install xlsx
import type { ShiftHistoryItem } from "../../../models/shiftHandover";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const ShiftHistoryPage: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({
    page: 0,
    size: 10,
    staffId: "",
    fromDate: null,
    toDate: null,
  });

  // UI States
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [adminNote, setAdminNote] = useState("");
  // Modal xem chi tiết ca
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    record: ShiftHistoryItem | null;
  }>({ open: false, record: null });

  const loadHistory = async () => {
    setLoading(true);
    // Debug: log filter và response
    console.log("[DEBUG] Filter gửi lên API:", filter);
    try {
      const res = await shiftHandoverApi.getShiftHistory(filter);
      console.log("[DEBUG] Response trả về từ API:", res.data.content);
      setData(res.data.content);
      setTotal(res.data.totalElements);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử giao ca:", error);
    } finally {
      setLoading(false);
    }
  };

  // Chỉ gọi API khi filter thực sự thay đổi (Debounce cho staffId)
  useEffect(() => {
    const handler = setTimeout(() => {
      loadHistory();
    }, 500); // Đợi 500ms sau khi người dùng ngừng gõ mới gọi API
    return () => clearTimeout(handler);
  }, [
    filter.staffId,
    filter.fromDate,
    filter.toDate,
    filter.page,
    filter.size,
  ]);
  // Tính năng Xuất Excel dành cho Admin
  const handleExportExcel = () => {
    // Thêm check an toàn trước khi xuất
    if (!data || data.length === 0) {
      return message.warning("Không có dữ liệu để xuất file!");
    }

    const exportData = data.map((item: ShiftHistoryItem) => ({
      "Nhân viên": item.employeeName,
      "Giờ vào": dayjs(item.checkInTime).format("HH:mm DD/MM/YYYY"),
      "Giờ ra": item.checkOutTime
        ? dayjs(item.checkOutTime).format("HH:mm DD/MM/YYYY")
        : "Chưa ra ca",
      "Doanh thu (VND)": item.totalCashSales.toLocaleString("vi-VN"),
      "Thực tế (VND)": item.actualCashAtEnd.toLocaleString("vi-VN"),
      "Chênh lệch (VND)": item.differenceAmount.toLocaleString("vi-VN"),
      "Trạng thái": item.status === "CLOSED" ? "Hoàn tất" : "Chờ duyệt",
      "Ghi chú": item.note || "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Senior Tip: Chỉnh độ rộng cột tự động để file Excel đẹp hơn
    const columnWidths = [
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
    ];
    ws["!cols"] = columnWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LichSuGiaoCa");
    XLSX.writeFile(
      wb,
      `Bao_Cao_Giao_Ca_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`,
    );
  };

  const columns = [
    {
      title: "Mã ca",
      dataIndex: "code",
      width: 120,
      render: (text: string) => (
        <Text code style={{ fontSize: 15 }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "employeeName",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Giờ vào",
      dataIndex: "checkInTime",
      render: (val: number) =>
        val ? dayjs(val).format("HH:mm:ss DD/MM/YYYY") : "-",
    },
    {
      title: "Giờ ra",
      dataIndex: "checkOutTime",
      render: (val: number) =>
        val ? (
          dayjs(val).format("HH:mm:ss DD/MM/YYYY")
        ) : (
          <Text type="warning">Chưa ra ca</Text>
        ),
    },
    {
      title: "Tiền đầu ca",
      dataIndex: "initialCash",
      render: (val: number) => val?.toLocaleString() + " ₫",
    },
    {
      title: "Doanh thu (VND)",
      dataIndex: "totalCashSales",
      render: (val: number) => val?.toLocaleString() + " ₫",
    },
    {
      title: "Tiền mặt cuối ca",
      dataIndex: "actualCashAtEnd",
      render: (val: number) => val?.toLocaleString() + " ₫",
    },
    {
      title: "Chênh lệch",
      dataIndex: "differenceAmount",
      render: (val: number) => (
        <Tooltip
          title={
            val < 0
              ? "Thâm hụt tiền"
              : val > 0
                ? "Thừa tiền mặt"
                : "Khớp dữ liệu"
          }
        >
          <Text
            type={val < 0 ? "danger" : val > 0 ? "warning" : "success"}
            strong
          >
            {val > 0 ? "+" : ""}
            {val?.toLocaleString()} ₫
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      ellipsis: true,
      render: (text: string) => <Text type="secondary">{text || "-"}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string) => {
        const config: Record<string, { color: string; text: string }> = {
          CLOSED: { color: "green", text: "Hoàn tất" },
          PENDING: { color: "orange", text: "Chờ duyệt" },
          OPEN: { color: "blue", text: "Đang mở" },
        };
        const currentConfig = config[status] || {
          color: "default",
          text: status,
        };
        return <Tag color={currentConfig.color}>{currentConfig.text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center" as const,
      render: (_: any, record: ShiftHistoryItem) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDetailModal({ open: true, record })}
            />
          </Tooltip>
          {record.status === "PENDING" && (
            <Tooltip title="Duyệt ca lệch tiền">
              <Button
                type="primary"
                ghost
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setSelectedId(record.id);
                  setIsConfirmModalOpen(true);
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];
  // Modal chi tiết ca làm việc chuyên nghiệp hơn
  const renderDetailModal = () => {
    const record = detailModal.record;
    return (
      <Modal
        open={detailModal.open}
        title={
          <Space>
            <HistoryOutlined />
            Chi tiết ca làm việc
          </Space>
        }
        onCancel={() => setDetailModal({ open: false, record: null })}
        footer={null}
        width={540}
      >
        {record ? (
          <Descriptions
            bordered
            size="middle"
            column={1}
            labelStyle={{ width: 180, fontWeight: 600 }}
            contentStyle={{ fontWeight: 500 }}
          >
            <Descriptions.Item label="Mã ca">
              <Text code>{record.code || record.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Nhân viên">
              {record.employeeName}
            </Descriptions.Item>
            <Descriptions.Item label="Giờ vào">
              {record.checkInTime
                ? dayjs(record.checkInTime).format("HH:mm:ss DD/MM/YYYY")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Giờ ra">
              {record.checkOutTime ? (
                dayjs(record.checkOutTime).format("HH:mm:ss DD/MM/YYYY")
              ) : (
                <Text type="warning">Chưa ra ca</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Tiền đầu ca">
              {record.initialCash?.toLocaleString()} ₫
            </Descriptions.Item>
            <Descriptions.Item label="Doanh thu (VND)">
              {record.totalCashSales?.toLocaleString()} ₫
            </Descriptions.Item>
            <Descriptions.Item label="Tiền mặt cuối ca">
              {record.actualCashAtEnd?.toLocaleString()} ₫
            </Descriptions.Item>
            <Descriptions.Item label="Chênh lệch">
              <Text
                type={
                  record.differenceAmount < 0
                    ? "danger"
                    : record.differenceAmount > 0
                      ? "warning"
                      : "success"
                }
              >
                {record.differenceAmount > 0 ? "+" : ""}
                {record.differenceAmount?.toLocaleString()} ₫
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {record.note || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  record.status === "CLOSED"
                    ? "green"
                    : record.status === "PENDING"
                      ? "orange"
                      : "blue"
                }
              >
                {record.status === "CLOSED"
                  ? "Hoàn tất"
                  : record.status === "PENDING"
                    ? "Chờ duyệt"
                    : "Đang mở"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <Space>
            <HistoryOutlined /> Lịch Sử Đối Soát Tiền Mặt
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadHistory} />
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
              disabled={data.length === 0}
            >
              Xuất Excel
            </Button>
          </Space>
        }
      >
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space wrap>
            <Input
              placeholder="Mã nhân viên..."
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) =>
                setFilter({ ...filter, staffId: e.target.value, page: 0 })
              }
            />
            <RangePicker
              onChange={(dates: any) => {
                setFilter({
                  ...filter,
                  fromDate: dates ? dates[0].startOf("day").valueOf() : null,
                  toDate: dates ? dates[1].endOf("day").valueOf() : null,
                  page: 0,
                });
              }}
            />
          </Space>
          <Text type="secondary">
            Tìm thấy <b>{total}</b> bản ghi
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          bordered
          size="middle"
          pagination={{
            total: total,
            pageSize: filter.size,
            current: filter.page + 1,
            showSizeChanger: true,
            onChange: (page, size) =>
              setFilter({ ...filter, page: page - 1, size }),
          }}
        />
      </Card>

      {renderDetailModal()}
      <Modal
        title="Xác nhận duyệt ca trực"
        open={isConfirmModalOpen}
        onOk={async () => {
          try {
            await shiftHandoverApi.confirmShift({
              handoverId: selectedId,
              adminNote,
            });
            message.success("Duyệt thành công");
            setIsConfirmModalOpen(false);
            loadHistory();
          } catch (e) {
            console.error("Lỗi khi duyệt ca trực:", e);
          }
        }}
        onCancel={() => setIsConfirmModalOpen(false)}
      >
        <Alert
          message="Lưu ý: Hành động này sẽ chuyển trạng thái ca trực thành CLOSED"
          type="warning"
          showIcon
          style={{ marginBottom: 15 }}
        />
        <Text strong>Ghi chú của Quản lý:</Text>
        <Input.TextArea
          rows={3}
          placeholder="Ví dụ: Đã đối soát, nhân viên nộp đủ tiền mặt..."
          style={{ marginTop: 8 }}
          onChange={(e) => setAdminNote(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ShiftHistoryPage;
