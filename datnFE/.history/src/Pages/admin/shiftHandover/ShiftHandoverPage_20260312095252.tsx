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
} from "antd";
import {
  ContainerOutlined,
  PlayCircleOutlined,
  LogoutOutlined,
  InfoCircleOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import type { RootState } from "../../../redux/store";
import { workScheduleApi } from "../../../api/workScheduleApi";
import CheckInModal from "./CheckInModal";
import CheckOutModal from "./CheckOutModal";

const { Title, Text } = Typography;

const ShiftHandoverPage: React.FC = () => {
  // 1. Lấy trạng thái ca làm việc từ Redux (đã đồng bộ LocalStorage)
  const { currentShift, isLoading } = useSelector(
    (state: RootState) => state.shiftHandover,
  );

  // 2. Lấy thông tin user (để gọi API lấy lịch trực)
  const user = useSelector((state: any) => state.auth?.user);

  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState<boolean>(false);

  // State lưu lịch trực hôm nay lấy từ Backend
  const [todaySchedule, setTodaySchedule] = useState<{
    id: string;
    shiftName?: string;
  } | null>(null);
  const [fetchingSchedule, setFetchingSchedule] = useState<boolean>(false);

  // 3. Effect: Tìm lịch làm việc của nhân viên này trong ngày hôm nay
  useEffect(() => {
    const fetchTodaySchedule = async () => {
      if (!user?.id) return;
      setFetchingSchedule(true);
      try {
        const res = await workScheduleApi.getTodaySchedule(user.id);
        if (res && res.data) {
          setTodaySchedule(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy lịch trực hôm nay:", error);
        setTodaySchedule(null);
      } finally {
        setFetchingSchedule(false);
      }
    };

    // Chỉ tìm lịch trực nếu nhân viên chưa vào ca
    if (!currentShift) {
      fetchTodaySchedule();
    }
  }, [user?.id, currentShift]);

  const hasStartedShift = !!currentShift;

  return (
    <div style={{ padding: "24px", minHeight: "85vh", background: "#f0f2f5" }}>
      <Row justify="center">
        <Col xs={24} sm={22} md={18} lg={14} xl={12}>
          <Spin
            spinning={isLoading || fetchingSchedule}
            tip="Đang xử lý dữ liệu..."
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
                  <Title level={3}>Chào {user?.name}, bạn chưa vào ca</Title>
                  <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: 32, fontSize: 16 }}
                  >
                    {todaySchedule
                      ? `Bạn có lịch trực hôm nay. Vui lòng Check-in để bắt đầu.`
                      : "Bạn không có lịch trực hôm nay hoặc đã hết ca."}
                  </Text>

                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleOutlined />}
                    disabled={!todaySchedule}
                    onClick={() => setIsCheckInOpen(true)}
                    style={{
                      height: 50,
                      padding: "0 40px",
                      borderRadius: 25,
                      backgroundColor: todaySchedule ? "#20c997" : "#d9d9d9",
                      borderColor: todaySchedule ? "#20c997" : "#d9d9d9",
                      fontWeight: 600,
                      fontSize: 18,
                    }}
                  >
                    {todaySchedule
                      ? "Bắt Đầu Ca Làm Việc"
                      : "Không có lịch trực"}
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
                        ID: {currentShift.id?.substring(0, 8)}...
                      </Text>
                    </div>

                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Card size="small" style={{ background: "#f9f9f9" }}>
                          <Space direction="vertical">
                            <Text type="secondary">
                              <CalendarOutlined /> Thời gian bắt đầu
                            </Text>
                            <Text strong>
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
                      "
                      {currentShift.note ||
                        "Không có ghi chú bàn giao đặc biệt."}
                      "
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

      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        scheduleId={todaySchedule?.id || ""}
      />

      <CheckOutModal
        isOpen={isCheckOutOpen}
        onClose={() => setIsCheckOutOpen(false)}
        scheduleId={currentShift?.workScheduleId || todaySchedule?.id || ""}
      />
    </div>
  );
};

export default ShiftHandoverPage;
