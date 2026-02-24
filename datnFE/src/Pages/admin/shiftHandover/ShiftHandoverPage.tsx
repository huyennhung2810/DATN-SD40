import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  message,
} from "antd";
import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import type { ShiftHandoverResponse } from "../../../models/shiftHandover";
import CheckInModal from "./CheckInModal";
import CheckOutModal from "./CheckOutModal";

const { Title, Text } = Typography;

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const ShiftHandoverPage: React.FC = () => {
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState<boolean>(false);

  const [handovers, setHandovers] = useState<ShiftHandoverResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const currentScheduleId = "mock-schedule-uuid-123";

  const fetchHandoverHistory = async () => {
    setLoading(true);
    try {
      const mockData: ShiftHandoverResponse[] = [
        {
          id: "1",
          checkInTime: Date.now() - 86400000,
          checkOutTime: Date.now() - 70000000,
          initialCash: 2000000,
          actualCashAtEnd: 15000000,
          differenceAmount: 0,
          handoverStatus: "CLOSED",
        },
        {
          id: "2",
          checkInTime: Date.now(),
          initialCash: 2000000,
          handoverStatus: "OPEN",
        },
      ];
      setHandovers(mockData);
    } catch (error: unknown) {
      const err = error as ApiError;
      message.error(
        err.response?.data?.message || "Lỗi khi tải lịch sử giao ca",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandoverHistory();
  }, []);

  const columns: ColumnsType<ShiftHandoverResponse> = [
    {
      title: "Mã Phiếu",
      dataIndex: "id",
      render: (text: string) => <Text strong>#{text.substring(0, 6)}</Text>,
    },
    {
      title: "Giờ vào ca",
      dataIndex: "checkInTime",
      render: (time: number) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Giờ kết ca",
      dataIndex: "checkOutTime",
      render: (time?: number) =>
        time ? (
          dayjs(time).format("DD/MM/YYYY HH:mm")
        ) : (
          <Text type="secondary">Chưa kết ca</Text>
        ),
    },
    {
      title: "Tiền nhận đầu ca",
      dataIndex: "initialCash",
      render: (cash: number) => `${cash.toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Tiền thực tế cuối ca",
      dataIndex: "actualCashAtEnd",
      render: (cash?: number) =>
        cash ? `${cash.toLocaleString("vi-VN")} đ` : "---",
    },
    {
      title: "Chênh lệch",
      dataIndex: "differenceAmount",
      render: (diff?: number) => {
        if (diff === undefined || diff === null) return "---";
        if (diff === 0) return <Text type="success">Khớp</Text>;
        return (
          <Text type="danger">
            {diff > 0 ? "+" : ""}
            {diff.toLocaleString("vi-VN")} đ
          </Text>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "handoverStatus",
      render: (status: string) => {
        const config: Record<string, { color: string; text: string }> = {
          OPEN: { color: "blue", text: "Đang mở" },
          PENDING: { color: "warning", text: "Chờ duyệt lệch tiền" },
          CLOSED: { color: "green", text: "Đã hoàn tất" },
        };
        const current = config[status] || { color: "default", text: status };
        return <Tag color={current.color}>{current.text}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 24, minHeight: "80vh" }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            variant="borderless"
            style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <Title level={4} style={{ margin: 0 }}>
                  Quản lý Ca làm việc
                </Title>
                <Text type="secondary">
                  Thực hiện nhận ca trước khi bán hàng và kết ca khi ra về.
                </Text>
              </Col>
              <Col>
                <Space size="large">
                  <Button
                    type="primary"
                    size="large"
                    icon={<LoginOutlined />}
                    onClick={() => setIsCheckInOpen(true)}
                    style={{
                      backgroundColor: "#52c41a",
                      borderColor: "#52c41a",
                    }}
                  >
                    Nhận Ca (Check-in)
                  </Button>
                  <Button
                    type="primary"
                    danger
                    size="large"
                    icon={<LogoutOutlined />}
                    onClick={() => setIsCheckOutOpen(true)}
                  >
                    Kết Ca (Check-out)
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title="Lịch sử giao ca gần đây"
            variant="borderless"
            style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <Table
              columns={columns}
              dataSource={handovers}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>

      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        scheduleId={currentScheduleId}
      />

      <CheckOutModal
        isOpen={isCheckOutOpen}
        onClose={() => setIsCheckOutOpen(false)}
        scheduleId={currentScheduleId}
      />
    </div>
  );
};

export default ShiftHandoverPage;
