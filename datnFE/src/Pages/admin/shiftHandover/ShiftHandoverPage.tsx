import React, { useState } from "react";
import { Card, Button, Typography, Row, Col, Divider, Space } from "antd";
import { ContainerOutlined } from "@ant-design/icons";
import CheckInModal from "./CheckInModal";
import CheckOutModal from "./CheckOutModal";

const { Title, Text } = Typography;

const ShiftHandoverPage: React.FC = () => {
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState<boolean>(false);
  const currentScheduleId = "mock-schedule-uuid-123";

  // TODO: Bạn cần lấy trạng thái thật từ Redux để biết đã vào ca hay chưa.
  // Ở đây tôi dùng biến tạm để bạn test giao diện.
  const hasStartedShift = true;

  return (
    <div style={{ padding: "24px", minHeight: "80vh", background: "#f5f5f5" }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card
            title={
              <Space>
                <ContainerOutlined />
                <Title level={5} style={{ margin: 0 }}>
                  Ca Làm Việc Hiện Tại
                </Title>
              </Space>
            }
            style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            {!hasStartedShift ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Text
                  type="secondary"
                  style={{ display: "block", marginBottom: 20 }}
                >
                  Bạn chưa bắt đầu ca làm việc nào.
                </Text>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setIsCheckInOpen(true)}
                  style={{ backgroundColor: "#20c997", borderColor: "#20c997" }}
                >
                  Bắt Đầu Ca Làm Việc
                </Button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 20 }}>
                  <p>
                    <Text>Ca làm việc của bạn đã bắt đầu lúc: </Text>
                    <Text strong>21:28 28 thg 8, 2025</Text>
                  </p>
                  <p>
                    <Text>Số tiền mặt ban đầu: </Text>
                    <Text strong>30.000.000 ₫</Text>
                  </p>
                </div>

                <Title level={5}>Thông tin ca trước (Bàn giao)</Title>
                <div
                  style={{
                    background: "#fafafa",
                    padding: "16px",
                    borderRadius: 8,
                    border: "1px solid #f0f0f0",
                    marginBottom: 20,
                  }}
                >
                  <p style={{ margin: 0, marginBottom: 8 }}>
                    <Text>Tiền mặt cuối ca trước: </Text>
                    <Text strong>30.000.000 ₫</Text>
                  </p>
                  <p style={{ margin: 0 }}>
                    <Text>Số đơn hàng chờ xử lý: </Text>
                    <Text strong>0</Text>
                  </p>
                </div>

                <p>
                  <Text>Số hóa đơn chờ xử lý hiện tại: </Text>
                  <Text strong>0</Text>
                </p>

                <Divider />

                <Button
                  type="primary"
                  danger
                  block
                  size="large"
                  onClick={() => setIsCheckOutOpen(true)}
                  style={{ height: 45, fontWeight: "bold" }}
                >
                  Kết Thúc Ca
                </Button>
              </>
            )}
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
