import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Tag,
  Typography,
  Tabs,
  Button,
  Drawer,
  Space,
  message,
  Row,
  Col,
  Badge,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CarOutlined,
  InboxOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { orderApi } from "../../../api/admin/orderApi";
import dayjs from "dayjs";
import AssignSerialModal from "../../../components/AssignSerialModal";

const { Title, Text } = Typography;

const OrderStatuses = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "PACKAGING", label: "Đang đóng gói" },
  { key: "SHIPPING", label: "Đang vận chuyển" },
  { key: "COMPLETED", label: "Hoàn thành" },
  { key: "CANCELED", label: "Đã hủy" },
  { key: "RETURNED", label: "Trả hàng/Hoàn tiền" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "orange";
    case "CONFIRMED":
      return "blue";
    case "PACKAGING":
      return "cyan";
    case "SHIPPING":
      return "purple";
    case "COMPLETED":
      return "green";
    case "CANCELED":
      return "red";
    case "RETURNED":
      return "volcano";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  const found = OrderStatuses.find((s) => s.key === status);
  return found ? found.label : status;
};

const OrderPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState("ALL");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // Detail Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any[]>([]);

  // Serial Modal
  const [serialModalOpen, setSerialModalOpen] = useState(false);
  const [activeDetailForSerial, setActiveDetailForSerial] = useState<any>(null);

  useEffect(() => {
    fetchStatusCounts();
    fetchOrders();
  }, [activeTab, pagination.current, pagination.pageSize]);

  const fetchStatusCounts = async () => {
    try {
      const counts: Record<string, number> = {};
      for (const status of OrderStatuses) {
        if (status.key === "ALL") continue;
        const params = { page: 0, size: 1, status: status.key };
        const res = await orderApi.searchOrders(params);
        counts[status.key] = res.data?.data?.totalElements || 0;
      }
      setStatusCounts(counts);
    } catch (e) {
      console.error(e);
      // Không hiển thị error cho counts, để tránh spam
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.current - 1,
        size: pagination.pageSize,
      };
      if (activeTab !== "ALL") params.status = activeTab;

      const res = await orderApi.searchOrders(params);
      if (res.data?.data) {
        setOrders(res.data.data.content);
        setTotal(res.data.data.totalElements);
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (record: any) => {
    setSelectedOrder(record);
    setDrawerOpen(true);
    setOrderDetails([]); // reset
    try {
      const res = await orderApi.getOrderDetails(record.id);
      setOrderDetails(res.data.data);
    } catch (e) {
      console.error(e);
      message.error("Không thể tải chi tiết đơn hàng");
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    try {
      await orderApi.updateOrderStatus(selectedOrder.id, newStatus);
      message.success("Cập nhật trạng thái thành công");
      setDrawerOpen(false);
      fetchOrders();
    } catch (e) {
      console.error(e);
      message.error("Lỗi cập nhật trạng thái");
    }
  };

  const handleAssignSerials = async (serialNumbers: string[]) => {
    try {
      await orderApi.assignSerials(
        selectedOrder.id,
        activeDetailForSerial.id,
        serialNumbers,
      );
      message.success("Đã xuất kho Serial cho sản phẩm này!");
      setSerialModalOpen(false);

      // Refresh order details map
      const res = await orderApi.getOrderDetails(selectedOrder.id);
      setOrderDetails(res.data.data);
    } catch (e: any) {
      message.error(e.response?.data?.message || "Lỗi khi gán Serial");
    }
  };

  const columns = [
    {
      title: "Mã Đơn",
      dataIndex: "code",
      key: "code",
      render: (t: string) => <Text strong>{t || "---"}</Text>,
    },
    {
      title: "Khách hàng",
      dataIndex: "recipientName",
      key: "recipientName",
      render: (t: string, record: any) => (
        <div>
          <Text strong>{t || "Thách vãng lai"}</Text>
          <br />
          <Text type="secondary">{record.recipientPhone}</Text>
        </div>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (d: number) => dayjs(d).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAfterDiscount",
      key: "totalAfterDiscount",
      render: (price: number) => (
        <Text type="danger" strong>
          {price?.toLocaleString("vi-VN")} đ
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Loại đơn",
      dataIndex: "orderType",
      key: "orderType",
      render: (type: string) => (
        <Tag color={type === "ONLINE" ? "geekblue" : "magenta"}>{type}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const detailColumns = [
    {
      title: "Sản phẩm",
      render: (record: any) =>
        record.productDetail?.product?.name || "Máy ảnh/Ống kính",
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      render: (price: number) => `${price?.toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      align: "center",
      render: (qty: number) => <Tag color="blue">{qty}</Tag>,
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      render: (price: number) => (
        <Text strong>{`${price?.toLocaleString("vi-VN")} đ`}</Text>
      ),
    },
    {
      title: "Hành động (Serial)",
      render: (record: any) => {
        const assigned = record.assignedSerialsCount || 0;
        const req = record.quantity || 0;
        const isComplete = assigned === req;

        if (selectedOrder?.orderStatus === "CONFIRMED") {
          return (
            <Space>
              <Tag color={isComplete ? "green" : "warning"}>
                Đã gán {assigned}/{req}
              </Tag>
              <Button
                type={isComplete ? "dashed" : "primary"}
                onClick={() => {
                  setActiveDetailForSerial(record);
                  setSerialModalOpen(true);
                }}
              >
                {isComplete ? "Sửa Serial" : "Xuất kho (Gán)"}
              </Button>
            </Space>
          );
        }
        return (
          <Tag color={isComplete ? "green" : "default"}>
            Đã gán {assigned}/{req}
          </Tag>
        );
      },
    },
  ];

  return (
    <>
      <Card>
        <Title level={4}>Quản Lý Đơn Hàng</Title>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {OrderStatuses.map((status) => (
            <Tabs.TabPane
              key={status.key}
              tab={
                <span>
                  {status.label}{" "}
                  <Badge
                    count={
                      status.key === "ALL"
                        ? total
                        : statusCounts[status.key] || 0
                    }
                    size="small"
                  />
                </span>
              }
            />
          ))}
        </Tabs>
        <Table
          columns={columns as any}
          dataSource={orders}
          loading={loading}
          rowKey="id"
          pagination={{ ...pagination, total }}
          onChange={(pg) => setPagination(pg as any)}
        />
      </Card>

      <Drawer
        title={`Chi tiết đơn hàng: ${selectedOrder?.code || ""}`}
        width={720}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        extra={
          <Space>
            {selectedOrder?.orderStatus === "PENDING" && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleUpdateStatus("CONFIRMED")}
              >
                Xác nhận đơn
              </Button>
            )}
            {selectedOrder?.orderStatus === "CONFIRMED" && (
              <Button
                style={{ background: "#17A2B8", color: "#fff" }}
                icon={<InboxOutlined />}
                onClick={() => handleUpdateStatus("PACKAGING")}
              >
                Chốt Đóng gói
              </Button>
            )}
            {selectedOrder?.orderStatus === "PACKAGING" && (
              <Button
                style={{ background: "#6F42C1", color: "#fff" }}
                icon={<CarOutlined />}
                onClick={() => handleUpdateStatus("SHIPPING")}
              >
                Giao hàng
              </Button>
            )}
            {selectedOrder?.orderStatus === "SHIPPING" && (
              <Button
                type="primary"
                style={{ background: "#28A745", color: "#fff" }}
                icon={<CheckCircleOutlined />}
                onClick={() => handleUpdateStatus("COMPLETED")}
              >
                Giao Thành Công (Sinh Bảo hành)
              </Button>
            )}
            {["PENDING", "CONFIRMED"].includes(selectedOrder?.orderStatus) && (
              <Button
                danger
                icon={<StopOutlined />}
                onClick={() => handleUpdateStatus("CANCELED")}
              >
                Hủy đơn
              </Button>
            )}
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card size="small" title="Thông tin người nhận">
              <p>
                <Text strong>Người nhận:</Text> {selectedOrder?.recipientName}
              </p>
              <p>
                <Text strong>Điện thoại:</Text> {selectedOrder?.recipientPhone}
              </p>
              <p>
                <Text strong>Ghi chú:</Text> {selectedOrder?.note || "..."}
              </p>
              <p>
                <Text strong>Trạng thái:</Text>{" "}
                <Tag color={getStatusColor(selectedOrder?.orderStatus)}>
                  {getStatusLabel(selectedOrder?.orderStatus)}
                </Tag>
              </p>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Tổng quan thanh toán">
              <p>
                <Text strong>Tổng tiền hàng:</Text>{" "}
                {selectedOrder?.totalAmount?.toLocaleString("vi-VN")} đ
              </p>
              <p>
                <Text strong>Giảm giá:</Text>{" "}
                {selectedOrder?.discountAmount?.toLocaleString("vi-VN") || 0} đ
              </p>
              <p>
                <Text strong>Phải thanh toán:</Text>{" "}
                <Text type="danger" strong>
                  {selectedOrder?.totalAfterDiscount?.toLocaleString("vi-VN")} đ
                </Text>
              </p>
            </Card>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 24 }}>
          Danh sách sản phẩm xuất kho
        </Title>
        <Table
          columns={detailColumns as any}
          dataSource={orderDetails}
          rowKey="id"
          pagination={false}
          bordered
          size="middle"
        />
      </Drawer>

      {/* Serial Scanner popup */}
      {activeDetailForSerial && (
        <AssignSerialModal
          open={serialModalOpen}
          onClose={() => setSerialModalOpen(false)}
          maxQuantity={activeDetailForSerial.quantity}
          onAssign={handleAssignSerials}
        />
      )}
    </>
  );
};

export default OrderPage;
