import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Steps,
  Divider,
  Table,
  Tag,
  message,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  ArrowLeftOutlined, // <-- Thêm icon này
} from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface TrackedOrder {
  id: string;
  code: string;
  status: string;
  createdDate: string;
  totalAmount: number;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  orderDetails: Array<{
    id: string;
    productName: string;
    variantName?: string;
    imageUrl: string;
    quantity: number;
    originalPrice: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

const OrderTrackingPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<TrackedOrder | null>(null);

  const handleTrackOrder = async (values: {
    orderCode: string;
    contactInfo: string;
  }) => {
    setLoading(true);
    setOrderData(null);
    try {
      const response = await axiosClient.get(`/public/orders/track`, {
        params: {
          orderCode: values.orderCode.trim(),
          contactInfo: values.contactInfo.trim(),
        },
      });

      setOrderData(response.data);
      message.success("Tra cứu đơn hàng thành công!");
    } catch (error: any) {
      console.error("Lỗi tra cứu:", error);
      message.error(
        error.response?.data?.message ||
          "Không tìm thấy đơn hàng! Vui lòng kiểm tra lại Mã đơn hàng và thông tin liên hệ.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);

  const getStepCurrent = (status: string) => {
    const statusMap: Record<string, number> = {
      CHO_XAC_NHAN: 0,
      DA_XAC_NHAN: 1,
      DANG_GIAO_HANG: 2,
      DA_GIAO_HANG: 3,
      HOAN_THANH: 4,
      DA_HUY: -1,
    };
    return statusMap[status] ?? 0;
  };

  const columns = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (record: any) => (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img
            src={record.imageUrl || "https://via.placeholder.com/60"}
            alt={record.productName}
            style={{
              width: 60,
              height: 60,
              objectFit: "contain",
              border: "1px solid #f0f0f0",
              borderRadius: 8,
              padding: 4,
            }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              {record.productName}
            </div>
            <div style={{ color: "#888", fontSize: 12 }}>
              {record.variantName}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Đơn giá",
      key: "unitPrice",
      align: "right" as const,
      width: 150,
      render: (_: unknown, r: any) => {
        const hasDiscount =
          typeof r.originalPrice === "number" && r.originalPrice > r.unitPrice;
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <Text
              strong
              style={{
                color: hasDiscount ? "#cf1322" : undefined,
                display: "block",
              }}
            >
              {formatPrice(r.unitPrice)}
            </Text>
            {hasDiscount && (
              <Text
                delete
                style={{
                  color: "#888",
                  fontSize: 12,
                  display: "block",
                  marginTop: 2,
                }}
              >
                {formatPrice(r.originalPrice)}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "right" as const,
      render: (price: number) => (
        <Text strong style={{ color: "#D32F2F" }}>
          {formatPrice(price)}
        </Text>
      ),
    },
  ];

  return (
    <div
      style={{ background: "#f5f5f5", minHeight: "80vh", padding: "40px 20px" }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Nút quay lại trang chủ */}
        <Button
          icon={<ArrowLeftOutlined />}
          type="link"
          onClick={() => navigate("/client")}
          style={{ marginBottom: 16, paddingLeft: 0, color: "#666" }}
        >
          Quay lại trang chủ
        </Button>

        {/* ===== Form Tra Cứu ===== */}
        <Card
          style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
          bodyStyle={{ padding: "32px 40px" }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <SearchOutlined
              style={{ fontSize: 48, color: "#D32F2F", marginBottom: 16 }}
            />
            <Title level={2} style={{ margin: 0 }}>
              Tra cứu đơn hàng
            </Title>
            <Text type="secondary">
              Để theo dõi đơn hàng, vui lòng nhập mã đơn hàng và số điện thoại
              hoặc email lúc đặt hàng.
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleTrackOrder}
            size="large"
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<b>Mã đơn hàng</b>}
                  name="orderCode"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã đơn hàng" },
                  ]}
                >
                  <Input
                    placeholder="VD: HD001234"
                    prefix={<FileTextOutlined style={{ color: "#bfbfbf" }} />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<b>Số điện thoại / Email</b>}
                  name="contactInfo"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập thông tin liên hệ",
                    },
                  ]}
                >
                  <Input placeholder="Số điện thoại hoặc Email nhận hàng" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ margin: 0, textAlign: "center", marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  height: 48,
                  padding: "0 40px",
                  fontSize: 16,
                  fontWeight: 600,
                  backgroundColor: "#D32F2F",
                  borderColor: "#D32F2F",
                  borderRadius: 8,
                }}
              >
                TRA CỨU NGAY
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* ===== Kết quả Tra Cứu ===== */}
        {orderData && (
          <Card
            style={{
              borderRadius: 16,
              marginTop: 24,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  Đơn hàng:{" "}
                  <Text strong style={{ color: "#D32F2F" }}>
                    #{orderData.code}
                  </Text>
                </span>
                {orderData.status === "DA_HUY" ? (
                  <Tag color="red">Đã hủy</Tag>
                ) : (
                  <Tag color="blue">Đang xử lý</Tag>
                )}
              </div>
            }
          >
            {/* Timeline trạng thái */}
            {orderData.status !== "DA_HUY" && (
              <div style={{ padding: "20px 0 40px", overflowX: "auto" }}>
                <Steps
                  current={getStepCurrent(orderData.status)}
                  size="small"
                  items={[
                    { title: "Chờ xác nhận" },
                    { title: "Đã xác nhận" },
                    { title: "Đang giao" },
                    { title: "Đã giao" },
                    { title: "Hoàn thành" },
                  ]}
                />
              </div>
            )}

            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <div
                  style={{
                    background: "#f9f9f9",
                    padding: 16,
                    borderRadius: 8,
                    height: "100%",
                  }}
                >
                  <Text
                    strong
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <EnvironmentOutlined style={{ color: "#D32F2F" }} /> Thông
                    tin nhận hàng
                  </Text>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      fontSize: 14,
                    }}
                  >
                    <Text>
                      <b>Người nhận:</b> {orderData.recipientName}
                    </Text>
                    <Text>
                      <b>Số điện thoại:</b> {orderData.recipientPhone}
                    </Text>
                    <Text>
                      <b>Địa chỉ:</b> {orderData.recipientAddress}
                    </Text>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div
                  style={{
                    background: "#f9f9f9",
                    padding: 16,
                    borderRadius: 8,
                    height: "100%",
                  }}
                >
                  <Text
                    strong
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <ShoppingOutlined style={{ color: "#D32F2F" }} /> Thanh toán
                  </Text>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      fontSize: 14,
                    }}
                  >
                    <Text>
                      <b>Phương thức:</b>{" "}
                      {orderData.paymentMethod === "COD"
                        ? "Thanh toán khi nhận hàng"
                        : "VNPay"}
                    </Text>
                    <Text>
                      <b>Trạng thái: </b>
                      <Tag
                        color={
                          orderData.paymentStatus === "DA_THANH_TOAN"
                            ? "success"
                            : "warning"
                        }
                      >
                        {orderData.paymentStatus === "DA_THANH_TOAN"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </Tag>
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider style={{ margin: "24px 0" }} />

            <Title level={5}>Sản phẩm đã đặt</Title>
            <Table
              columns={columns}
              dataSource={orderData.orderDetails}
              pagination={false}
              rowKey="id"
              scroll={{ x: 600 }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 24,
              }}
            >
              <div style={{ width: 300 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    fontSize: 16,
                  }}
                >
                  <Text>Tổng cộng:</Text>
                  <Text strong style={{ fontSize: 20, color: "#D32F2F" }}>
                    {formatPrice(orderData.totalAmount)}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
