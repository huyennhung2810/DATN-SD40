import React, { useEffect, useState } from "react";
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
  message,
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
import { workScheduleApi } from "../../../api/workScheduleApi";
import CheckInModal from "./CheckInModal";
import CheckOutModal from "./CheckOutModal";

const { Title, Text } = Typography;

const ShiftHandoverPage: React.FC = () => {
  const { currentShift, isLoading } = useSelector(
    (state: RootState) => state.shiftHandover,
  );
  const user = useSelector((state: RootState) => (state as any).auth?.user); // Lấy user đang đăng nhập

  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState<boolean>(false);
  const [currentScheduleId, setCurrentScheduleId] = useState<string | null>(
    null,
  );
  const [fetchingSchedule, setFetchingSchedule] = useState<boolean>(false);

  // 🟢 Lấy lịch trực của tôi hôm nay từ Backend
  useEffect(() => {
    const checkTodaySchedule = async () => {
      if (!user?.id) return;
      setFetchingSchedule(true);
      try {
        const res = await workScheduleApi.getTodaySchedule(user.id);
        if (res && res.data?.id) {
          setCurrentScheduleId(res.data.id);
        }
      } catch (error) {
        // Nếu lỗi 404/500 nghĩa là chưa có lịch, giữ currentScheduleId = null
      } finally {
        setFetchingSchedule(false);
      }
    };
    checkTodaySchedule();
  }, [user?.id]);

  const hasStartedShift = !!currentShift;

  return (
    <div style={{ padding: "24px", minHeight: "85vh", background: "#f0f2f5" }}>
      <Row justify="center">
        <Col xs={24} sm={22} md={18} lg={14} xl={12}>
          <Spin
            spinning={isLoading || fetchingSchedule}
            tip="Đang kiểm tra dữ liệu..."
          >
            <Card
              variant="borderless"
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
                    Vui lòng thực hiện Check-in để bắt đầu bán hàng.
                  </Text>

                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleOutlined />}
                    disabled={!currentScheduleId} // 🟢 Chốt chặn: Không có lịch không cho vào
                    onClick={() => setIsCheckInOpen(true)}
                    style={{
                      height: 50,
                      padding: "0 40px",
                      borderRadius: 25,
                      backgroundColor: currentScheduleId
                        ? "#20c997"
                        : "#d9d9d9",
                      fontWeight: 600,
                      fontSize: 18,
                    }}
                  >
                    {currentScheduleId
                      ? "Bắt Đầu Ca Ngay"
                      : "Bạn không có lịch làm việc hôm nay"}
                  </Button>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 30 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 20,
                      }}
                    >
                      <Tag color="processing" icon={<InfoCircleOutlined />}>
                        ĐANG TRONG CA LÀM VIỆC
                      </Tag>
                      <Text type="secondary">
                        Mã ca: {currentShift.id?.substring(0, 8)}...
                      </Text>
                    </div>

                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Card size="small" style={{ background: "#f9f9f9" }}>
                          <Space direction="vertical">
                            <Text type="secondary">
                              <CalendarOutlined /> Bắt đầu lúc
                            </Text>
                            <Text strong>
                              {dayjs(currentShift.checkInTime).format(
                                "HH:mm - DD/MM/YYYY",
                              )}
                            </Text>
                          </Space>
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card size="small" style={{ background: "#f9f9f9" }}>
                          <Space direction="vertical">
                            <Text type="secondary">
                              <DollarCircleOutlined /> Tiền mặt đầu ca
                            </Text>
                            <Text strong style={{ color: "#52c41a" }}>
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
                    <Text type="secondary">Thông tin bàn giao</Text>
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
                      "{currentShift.note || "Không có ghi chú bàn giao."}"
                    </Text>
                  </div>

                  <Button
                    type="primary"
                    danger
                    block
                    size="large"
                    icon={<LogoutOutlined />}
                    onClick={() => setIsCheckOutOpen(true)}
                    style={{ height: 50, borderRadius: 8, fontWeight: 700 }}
                  >
                    KẾT THÚC CA & BÀN GIAO
                  </Button>
                </>
              )}
            </Card>
          </Spin>
        </Col>
      </Row>

      {currentScheduleId && (
        <CheckInModal
          isOpen={isCheckInOpen}
          onClose={() => setIsCheckInOpen(false)}
          scheduleId={currentScheduleId}
        />
      )}
      {currentScheduleId && (
        <CheckOutModal
  isOpen={isCheckOutOpen}
  onClose={() => setIsCheckOutOpen(false)}
  // 🟢 Dùng ID từ currentShift sẽ an toàn hơn nếu trang bị load lại
  scheduleId={currentShift?.workScheduleId || currentScheduleId} 
/>
      )}
    </div>
  );
};

export default ShiftHandoverPage;
