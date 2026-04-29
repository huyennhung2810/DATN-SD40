import {
  CalendarOutlined,
  DollarCircleOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  PlayCircleOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { shiftHandoverApi } from "../../../api/shiftHandoverApi";
import { shiftActions } from "../../../redux/shiftHandover/shiftHandoverSlice";
import { useSelector } from "react-redux";
import { workScheduleApi } from "../../../api/workScheduleApi";
import { getGreeting } from "../../../constants/time";
import type { RootState } from "../../../redux/store";
import CheckInModal from "./CheckInModal";
import CheckOutModal from "./CheckOutModal";

const { Title, Text } = Typography;

const ShiftHandoverPage: React.FC = () => {
  // --- REDUX STATE ---
  const { currentShift, isLoading: isShiftLoading } = useSelector(
    (state: RootState) => state.shiftHandover,
  );
  const dispatch = useDispatch();

  // Xác định ID ca làm việc (Lấy scheduleId mới thêm, fallback về workScheduleId)
  const targetId = currentShift?.scheduleId || currentShift?.workScheduleId;
  
  useEffect(() => {
    const fetchShiftStats = async () => {
      if (targetId) {
        try {
          const res = await shiftHandoverApi.getShiftStats(targetId);
          const statsData = (res as any).data || res;
          console.log("=== THỐNG KÊ CA TỪ BACKEND ===", statsData);
          dispatch(
            shiftActions.checkInSuccess({ ...currentShift, ...statsData }),
          );
        } catch (err) {
          // Không cần báo lỗi, chỉ log
          console.error("Không thể cập nhật lại thông tin ca làm việc:", err);
        }
      }
    };
    if (currentShift) {
      fetchShiftStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);
  const { user } = useSelector((state: RootState) => state.auth);

  // --- LOCAL STATE ---
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState<boolean>(false);
  const [todaySchedule, setTodaySchedule] = useState<{
    id: string;
    shiftName?: string;
  } | null>(null);
  const [fetchingSchedule, setFetchingSchedule] = useState<boolean>(false);

  //  LẤY LỊCH TRỰC HÔM NAY ---
  const fetchTodaySchedule = useCallback(async () => {
    // Nếu đã trong ca thì không cần tìm lịch trực nữa
    if (!user?.userId || !!currentShift) return;

    setFetchingSchedule(true);
    try {
      const res = await workScheduleApi.getTodaySchedule(user.userId);
      if (res && res.data) {
        setTodaySchedule(res.data);
      }
    } catch (error: any) {
      // Xử lý lỗi 404 hoặc không có lịch trực
      if (error?.response?.status === 404) {
        setTodaySchedule(null);
      }
      console.error("Lỗi khi tải lịch trực:", error);
    } finally {
      setFetchingSchedule(false);
    }
  }, [user?.userId, currentShift]);

  useEffect(() => {
    fetchTodaySchedule();
  }, [fetchTodaySchedule]);

  const hasStartedShift = !!currentShift;

  return (
    <div style={{ padding: "24px", minHeight: "85vh", background: "#f0f2f5" }}>
      <Row justify="center">
        <Col xs={24} sm={22} md={18} lg={14} xl={10}>
          <Spin
            spinning={isShiftLoading || fetchingSchedule}
            description="Đang tải dữ liệu..."
          >
            <Card
              variant="borderless"
              style={{
                borderRadius: 16,
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
              title={
                <Space>
                  <SwapOutlined style={{ color: "#1890ff", fontSize: 20 }} />
                  <Title level={4} style={{ margin: 0 }}>
                    Hệ Thống Giao Ca Hikari
                  </Title>
                </Space>
              }
              extra={
                <Text type="secondary">{dayjs().format("DD/MM/YYYY")}</Text>
              }
            >
              {!hasStartedShift ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <PlayCircleOutlined
                    style={{ fontSize: 80, color: "#f0f0f0", marginBottom: 20 }}
                  />
                  <Title level={4} style={{ margin: 0 }}>
                    {getGreeting()}, {user?.fullName || "bạn"}!
                  </Title>

                  {todaySchedule ? (
                    <Alert
                      message={
                        <b>Lịch trực hôm nay: {todaySchedule.shiftName}</b>
                      }
                      description="Bạn đã sẵn sàng? Vui lòng kiểm tra tiền mặt tại quầy và thực hiện Check-in để bắt đầu bán hàng."
                      type="info"
                      showIcon
                      style={{
                        marginBottom: 30,
                        textAlign: "left",
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    <Alert
                      message="Không tìm thấy lịch trực"
                      description="Hệ thống chưa ghi nhận lịch làm việc của bạn trong hôm nay. Vui lòng liên hệ quản lý nếu có sai sót."
                      type="warning"
                      showIcon
                      style={{
                        marginBottom: 30,
                        textAlign: "left",
                        borderRadius: 8,
                      }}
                    />
                  )}

                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleOutlined />}
                    disabled={!todaySchedule}
                    onClick={() => setIsCheckInOpen(true)}
                    style={{
                      height: 55,
                      padding: "0 60px",
                      borderRadius: 30,
                      fontSize: 18,
                      fontWeight: 700,
                      backgroundColor: todaySchedule ? "#20c997" : "#d9d9d9",
                      borderColor: todaySchedule ? "#20c997" : "#d9d9d9",
                      boxShadow: todaySchedule
                        ? "0 4px 15px rgba(32, 201, 151, 0.4)"
                        : "none",
                    }}
                  >
                    BẮT ĐẦU CA LÀM VIỆC
                  </Button>
                </div>
              ) : (
                /* ================= GIAO DIỆN KHI ĐANG TRONG CA ================= */
                <>
                  <div
                    style={{
                      background: "#f0f5ff",
                      padding: "16px",
                      borderRadius: "12px",
                      marginBottom: "25px",
                      border: "1px solid #adc6ff",
                    }}
                  >
                    <Row align="middle" justify="space-between">
                      <Space>
                        <Tag
                          color="blue"
                          style={{
                            borderRadius: 10,
                            padding: "2px 12px",
                            fontWeight: 600,
                          }}
                        >
                          ONLINE
                        </Tag>
                        <Text strong style={{ color: "#003a8c" }}>
                          CA LÀM VIỆC ĐANG HOẠT ĐỘNG
                        </Text>
                      </Space>
                      <Text type="secondary" code>
                        {currentShift.id?.substring(0, 12)}
                      </Text>
                    </Row>
                  </div>

                  <Row gutter={[16, 16]} style={{ marginBottom: 25 }}>
                    <Col span={6}>
                      <Card
                        size="small"
                        style={{ borderRadius: 12, background: "#fafafa" }}
                      >
                        <Statistic
                          title={
                            <Text type="secondary">
                              <CalendarOutlined /> Thời gian vào ca
                            </Text>
                          }
                          value={dayjs(currentShift.checkInTime).format(
                            "HH:mm:ss DD/MM/YYYY",
                          )}
                          valueStyle={{ fontSize: "20px", fontWeight: 700 }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card
                        size="small"
                        style={{ borderRadius: 12, background: "#fafafa" }}
                      >
                        <Statistic
                          title={
                            <Text type="secondary">
                              <DollarCircleOutlined /> Tiền mặt đầu ca
                            </Text>
                          }
                          value={currentShift.initialCash || 0}
                          suffix="₫"
                          valueStyle={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#52c41a",
                          }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card
                        size="small"
                        style={{ borderRadius: 12, background: "#fafafa" }}
                      >
                        <Statistic
                          title={
                            <Text type="secondary">
                              <DollarCircleOutlined /> Doanh thu tiền mặt
                            </Text>
                          }
                          value={currentShift.totalCashSales || 0}
                          suffix="₫"
                          valueStyle={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#faad14",
                          }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card
                        size="small"
                        style={{ borderRadius: 12, background: "#fafafa" }}
                      >
                        <Statistic
                          title={
                            <Text type="secondary">
                              <DollarCircleOutlined /> Doanh thu chuyển khoản
                            </Text>
                          }
                          value={currentShift.totalBankSales || 0}
                          suffix="₫"
                          valueStyle={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#1890ff",
                          }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  <div
                    style={{
                      padding: "16px",
                      background: "#fffbe6",
                      border: "1px solid #ffe58f",
                      borderRadius: "12px",
                      marginBottom: "30px",
                    }}
                  >
                    <Space align="start">
                      <InfoCircleOutlined
                        style={{ color: "#faad14", marginTop: 4 }}
                      />
                      <div>
                        <Text strong>Ghi chú nhận ca:</Text>
                        <br />
                        <Text italic type="secondary">
                          {currentShift.note ||
                            "Không có ghi chú bàn giao từ ca trước."}
                        </Text>
                      </div>
                    </Space>
                  </div>

                  <Button
                    type="primary"
                    danger
                    block
                    size="large"
                    icon={<LogoutOutlined />}
                    onClick={() => setIsCheckOutOpen(true)}
                    style={{
                      height: 55,
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: 17,
                      boxShadow: "0 4px 15px rgba(255, 77, 79, 0.3)",
                    }}
                  >
                    KẾT THÚC CA & BÀN GIAO TIỀN
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
        scheduleId={targetId || todaySchedule?.id || ""}
      />
    </div>
  );
};

export default ShiftHandoverPage;
