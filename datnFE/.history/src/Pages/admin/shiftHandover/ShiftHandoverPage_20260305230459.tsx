import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Divider,
  Space,
  Tag,
  Spin,
} from "antd";
import {
  ContainerOutlined,
  PlayCircleOutlined,
  LogoutOutlined,
  InfoCircleOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import type { RootState } from "../../../redux/store";
import CheckInModal from "./CheckInModal";
import CheckOutModal from "./CheckOutModal";

const { Title, Text } = Typography;

const ShiftHandoverPage: React.FC = () => {
  const _dispatch = useDispatch();

  // 1. Lấy dữ liệu từ Redux Store
  const { currentShift, isLoading } = useSelector(
    (state: RootState) => state.shiftHandover,
  );

  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState<boolean>(false);

  // 2. Mock Schedule ID (Phần này Nhung sẽ thay bằng ID thật từ lịch làm việc sau này)
  const currentScheduleId = "mock-schedule-uuid-123";

  // 3. Xác định trạng thái ca làm việc
  const hasStartedShift = !!currentShift;

  return (
    <div style={{ padding: "24px", minHeight: "85vh", background: "#f0f2f5" }}>
      <Row justify="center">
        <Col xs={24} sm={22} md={18} lg={14} xl={12}>
          <Spin spinning={isLoading} tip="Đang xử lý dữ liệu...">
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              title={
                <Space>
                  <ContainerOutlined style={{ color: "#1890ff" }} />
                  <Title level={4} style={{ margin: 0 }}>
                    Quản Lý Ca Làm Việc
                  </Title>
                </Space>
              }
            >
              {!hasStartedShift ? (
                // --- TRƯỜNG HỢP 1: CHƯA VÀO CA ---
                <div style={{ textAlign: "center", padding: "50px 0" }}>
                  <div style={{ marginBottom: 24 }}>
                    <PlayCircleOutlined
                      style={{ fontSize: 64, color: "#d9d9d9" }}
                    />
                  </div>
                  <Title level={3}>Bạn chưa vào ca làm việc</Title>
                  <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: 32, fontSize: 16 }}
                  >
                    Vui lòng kiểm tra lại tiền mặt tại quầy và thực hiện
                    Check-in để bắt đầu bán hàng.
                  </Text>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleOutlined />}
                    onClick={() => setIsCheckInOpen(true)}
                    style={{
                      height: 50,
                      padding: "0 40px",
                      borderRadius: 25,
                      backgroundColor: "#20c997",
                      borderColor: "#20c997",
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    Bắt Đầu Ca Ngay
                  </Button>
                </div>
              ) : (
                // --- TRƯỜNG HỢP 2: ĐANG TRONG CA ---
                <>
                  <div style={{ marginBottom: 30 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                      }}
                    >
                      <Tag
                        color="processing"
                        icon={<InfoCircleOutlined />}
                        style={{ padding: "4px 12px", borderRadius: 4 }}
                      >
                        ĐANG TRONG CA LÀM VIỆC
                      </Tag>
                      <Text type="secondary">
                        ID Ca: {currentShift.id?.substring(0, 8)}...
                      </Text>
                    </div>

                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Card
                          size="small"
                          bordered
                          style={{ background: "#f9f9f9" }}
                        >
                          <Space direction="vertical">
                            <Text type="secondary">
                              <CalendarOutlined /> Thời gian bắt đầu
                            </Text>
                            <Text strong style={{ fontSize: 16 }}>
                              {currentShift.checkInTime
                                ? dayjs(currentShift.checkInTime).format(
                                    "HH:mm - DD/MM/YYYY",
                                  )
                                : "---"}
                            </Text>
                          </Space>
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card
                          size="small"
                          bordered
                          style={{ background: "#f9f9f9" }}
                        >
                          <Space ="vertical">
                            <Text type="secondary">
                              <DollarCircleOutlined /> Tiền mặt đầu ca
                            </Text>
                            <Text
                              strong
                              style={{ fontSize: 16, color: "#52c41a" }}
                            >
                              {currentShift.initialCash?.toLocaleString(
                                "vi-VN",
                              )}{" "}
                              ₫
                            </Text>
                          </Space>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                  <Divider>
                    <Text type="secondary">Thông tin bàn giao từ ca trước</Text>
                  </Divider>
                  <div
                    style={{
                      padding: 16,
                      background: "#fffbe6",
                      border: "1px solid #ffe58f",
                      borderRadius: 8,
                      marginBottom: 30,
                    }}
                  >
                    <Text italic>
                      "
                      {currentShift.note ||
                        "Không có ghi chú bàn giao đặc biệt từ ca trước."}
                      "
                    </Text>
                  </div>
                  <AlertInfo />{" "}
                  {/* Một component nhỏ thông báo nếu có hóa đơn chờ */}
                  <Button
                    type="primary"
                    danger
                    block
                    size="large"
                    icon={<LogoutOutlined />}
                    onClick={() => setIsCheckOutOpen(true)}
                    style={{
                      height: 50,
                      borderRadius: 8,
                      fontSize: 18,
                      fontWeight: 700,
                      marginTop: 10,
                      boxShadow: "0 4px 10px rgba(255, 77, 79, 0.3)",
                    }}
                  >
                    KẾT THÚC CA & BÀN GIAO
                  </Button>
                </>
              )}
            </Card>
          </Spin>
        </Col>
      </Row>

      {/* Modals điều khiển */}
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

// Component phụ trợ hiển thị nhắc nhở
const AlertInfo = () => (
  <div style={{ marginBottom: 20, textAlign: "center" }}>
    <Text type="secondary" style={{ fontSize: 13 }}>
      * Hệ thống sẽ tự động tính toán doanh thu tiền mặt dựa trên các hóa đơn
      bạn đã hoàn thành trong ca.
    </Text>
  </div>
);

export default ShiftHandoverPage;
