import React, { useState, useEffect, useMemo } from "react";
import { Button, Space, Typography, Table, Row, Col, Tag } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { ColumnsType } from "antd/es/table";

// Import API đã được định nghĩa
import workScheduleApi from "../../../api/workScheduleApi";
import shiftTemplateApi from "../../../api/shiftTemplateApi";
import type { WorkScheduleResponse } from "../../../models/workSchedule";
import type { ADShiftTemplateResponse } from "../../../models/shiftTemplate";

// Kích hoạt plugin để tính toán tuần theo chuẩn quốc tế (Thứ 2 là đầu tuần)
dayjs.extend(isoWeek);

const { Text } = Typography;

// Map màu sắc cho trạng thái ca làm việc
const STATUS_MAP: Record<string, { color: string; label: string }> = {
  REGISTERED: { color: "blue", label: "Đã đăng ký" },
  WORKING: { color: "orange", label: "Đang làm" },
  COMPLETED: { color: "green", label: "Hoàn thành" },
  ABSENT: { color: "red", label: "Vắng mặt" },
};

const EmployeeWeeklySchedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());

  // State lưu dữ liệu thật từ API
  const [schedules, setSchedules] = useState<WorkScheduleResponse[]>([]);
  const [shiftTemplates, setShiftTemplates] = useState<
    ADShiftTemplateResponse[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Tính toán 7 ngày trong tuần hiện tại
  const startOfWeek = currentDate.startOf("isoWeek"); // Thứ 2
  const endOfWeek = currentDate.endOf("isoWeek"); // Chủ Nhật

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, index) =>
      startOfWeek.add(index, "day"),
    );
  }, [startOfWeek]);

  // --- HÀM GỌI API ĐỒNG THỜI ---
  const fetchWeeklyData = async () => {
    setLoading(true);
    try {
      // Dùng Promise.all để gọi 2 API cùng lúc giúp tăng tốc độ tải trang
      const [shiftsRes, schedulesRes] = await Promise.all([
        shiftTemplateApi.getAll({ status: "ACTIVE", page: 0, size: 100 }), // Lấy các ca đang hoạt động
        workScheduleApi.getSchedules({
          fromDate: startOfWeek.format("YYYY-MM-DD"),
          toDate: endOfWeek.format("YYYY-MM-DD"),
        }),
      ]);

      // Bóc tách dữ liệu Mẫu Ca (Xử lý an toàn phòng trường hợp API trả về Pageable)
      let shiftsData: ADShiftTemplateResponse[] = [];
      if (Array.isArray(shiftsRes.data)) {
        shiftsData = shiftsRes.data;
      } else if (
        shiftsRes.data &&
        Array.isArray((shiftsRes.data as any).content)
      ) {
        shiftsData = (shiftsRes.data as any).content;
      }

      // Sắp xếp ca làm việc theo thời gian bắt đầu
      shiftsData.sort((a, b) =>
        (a.startTime || "").localeCompare(b.startTime || ""),
      );
      setShiftTemplates(shiftsData);

      // Bóc tách dữ liệu Lịch làm việc (getSchedules đã return res.data.data)
      setSchedules(Array.isArray(schedulesRes) ? schedulesRes : []);
    } catch (error) {
      console.error("Lỗi fetch dữ liệu lịch tuần:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  // --- MAP DỮ LIỆU VÀO MA TRẬN BẢNG ---
  const dataSource = useMemo(() => {
    return shiftTemplates.map((shift) => {
      const rowData: any = { key: shift.id, shiftInfo: shift };

      // Lấy 5 ký tự đầu của giờ (VD: "08:00:00" -> "08:00") để so sánh cho chuẩn
      const shiftStartMatched = shift.startTime
        ? shift.startTime.substring(0, 5)
        : "";

      weekDays.forEach((day) => {
        const dateStr = day.format("YYYY-MM-DD");
        // Lọc các lịch trực khớp với ngày hiện tại và khớp với giờ bắt đầu của ca
        const schedulesForCell = schedules.filter(
          (s) =>
            s.workDate === dateStr &&
            s.startTime?.startsWith(shiftStartMatched),
        );
        rowData[dateStr] = schedulesForCell;
      });

      return rowData;
    });
  }, [schedules, weekDays, shiftTemplates]);

  // --- CẤU HÌNH CÁC CỘT (COLUMNS) ---
  const columns: ColumnsType<any> = [
    {
      title: (
        <div style={{ textAlign: "center", color: "#8c8c8c" }}>CA / NGÀY</div>
      ),
      dataIndex: "shiftInfo",
      key: "shiftInfo",
      width: 150,
      fixed: "left",
      align: "center",
      render: (shiftInfo: ADShiftTemplateResponse) => (
        <div style={{ padding: "8px 0" }}>
          <div style={{ fontWeight: "bold", fontSize: 14, color: "#262626" }}>
            {shiftInfo.name}
          </div>
          <div style={{ marginTop: 6 }}>
            <span
              style={{
                background: "#e6f7ff",
                color: "#096dd9",
                padding: "4px 8px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {`${shiftInfo.startTime?.slice(0, 5)} - ${shiftInfo.endTime?.slice(0, 5)}`}
            </span>
          </div>
        </div>
      ),
    },
    ...weekDays.map((day) => {
      const dateStr = day.format("YYYY-MM-DD");
      const isToday = day.isSame(dayjs(), "day");
      const dayNames = [
        "CN",
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
      ];

      return {
        title: (
          <div
            style={{
              textAlign: "center",
              color: isToday ? "#1890ff" : "inherit",
            }}
          >
            <div style={{ fontWeight: "bold" }}>{dayNames[day.day()]}</div>
            <div
              style={{ fontSize: 12, fontWeight: "normal", color: "#8c8c8c" }}
            >
              {day.format("DD/MM")}
            </div>
          </div>
        ),
        dataIndex: dateStr,
        key: dateStr,
        width: 170,
        render: (cellSchedules: WorkScheduleResponse[]) => {
          if (!cellSchedules || cellSchedules.length === 0) return null;

          return (
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              {cellSchedules.map((sch) => {
                const statusConfig = STATUS_MAP[sch.status] || {
                  color: "default",
                  label: sch.status,
                };

                return (
                  <div
                    key={sch.id}
                    style={{
                      border: "1px solid #e8e8e8",
                      borderLeft: `4px solid ${statusConfig.color === "default" ? "#d9d9d9" : statusConfig.color}`,
                      borderRadius: 6,
                      padding: "8px",
                      background: "#fff",
                      textAlign: "center",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#262626",
                      }}
                    >
                      {sch.employeeName}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 4,
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{ fontSize: 11, fontWeight: 500 }}
                      >
                        {sch.employeeCode}
                      </Text>
                      {/* Hiển thị 1 chấm màu nhỏ thể hiện trạng thái (Đã đăng ký/Đang làm/Hoàn thành) */}
                      <Tag
                        color={statusConfig.color}
                        style={{
                          margin: 0,
                          padding: "0 4px",
                          fontSize: 10,
                          lineHeight: "16px",
                        }}
                      >
                        {statusConfig.label}
                      </Tag>
                    </div>
                  </div>
                );
              })}
            </Space>
          );
        },
      };
    }),
  ];

  return (
    <div>
      {/* Header */}
      <div className="solid-card" style={{ padding: "var(--spacing-lg)" }}>
        <Row justify="space-between" align="middle" wrap={false}>
          <Space align="center" size={16}>
            <div
              style={{
                backgroundColor: "var(--color-primary-light)",
                padding: "12px",
                borderRadius: "var(--radius-md)",
              }}
            >
              <CalendarOutlined
                style={{ fontSize: "24px", color: "var(--color-primary)" }}
              />
            </div>

            <div>
              <Typography.Title
                level={4}
                style={{ margin: 0, fontWeight: 600 }}
              >
                Quản lý lịch làm việc
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: "13px" }}>
                Quản lý lịch làm việc của nhân viên
              </Typography.Text>
            </div>
          </Space>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchWeeklyData}
            loading={loading}
            style={{
              borderRadius: "12px",
              height: "42px",
              paddingInline: "20px",
            }}
          >
            Làm mới
          </Button>
        </Row>
      </div>

      {/* Toolbar điều hướng */}
      <Row
        justify="space-between"
        align="middle"
        style={{
          marginBottom: 10,
          background: "#fff",
          padding: "12px 20px",
          borderRadius: 8,
          border: "1px solid #f0f0f0",
          marginTop: 10,
        }}
      >
        <Col>
          <Space>
            <Button.Group>
              <Button
                icon={<LeftOutlined />}
                onClick={() =>
                  setCurrentDate((prev) => prev.subtract(1, "week"))
                }
              />
              <Button onClick={() => setCurrentDate(dayjs())}>
                <CalendarOutlined /> Hôm nay
              </Button>
              <Button
                icon={<RightOutlined />}
                onClick={() => setCurrentDate((prev) => prev.add(1, "week"))}
              />
            </Button.Group>
          </Space>
        </Col>
        <Col>
          <Text strong style={{ color: "#20c997", fontSize: 15 }}>
            TUẦN: {startOfWeek.format("DD/MM/YYYY")} ➔{" "}
            {endOfWeek.format("DD/MM/YYYY")}
          </Text>
        </Col>
      </Row>

      {/* Bảng Lịch (Ma trận) */}
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        loading={loading}
        rowClassName={() => "schedule-table-row"}
        style={{
          background: "#fff",
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid #f0f0f0",
        }}
        scroll={{ x: "max-content" }} // Hỗ trợ cuộn ngang nếu màn hình nhỏ
      />

      <style>{`
        .schedule-table-row td {
          vertical-align: top;
          padding: 12px 8px !important;
          background-color: #fafafa;
        }
        .schedule-table-row td:first-child {
          background-color: #fff;
        }
      `}</style>
    </div>
  );
};

export default EmployeeWeeklySchedule;
