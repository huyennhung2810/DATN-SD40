import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  DatePicker,
  Tag,
  Space,
  Popconfirm,
  Typography,
  Select,
  Row,
  Col,
  Calendar,
  Badge,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  TableOutlined,
  CalendarOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import type { ColumnsType } from "antd/es/table";

import workScheduleApi from "../../../api/workScheduleApi";
import employeeApi from "../../../api/employeeApi";
import type { WorkScheduleResponse } from "../../../models/workSchedule";
import type { EmployeeResponse } from "../../../models/employee";
import WorkScheduleModal from "./WorkScheduleModal";

const { Text } = Typography;

const STATUS_MAP = {
  REGISTERED: { color: "blue", label: "Đã đăng ký" },
  WORKING: { color: "orange", label: "Đang làm việc" },
  COMPLETED: { color: "green", label: "Hoàn thành" },
  ABSENT: { color: "red", label: "Vắng mặt" },
};

const WorkSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<WorkScheduleResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [editingRecord, setEditingRecord] =
    useState<WorkScheduleResponse | null>(null);

  const [employees, setEmployees] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<Dayjs | null>(null);

  const fetchEmployees = async () => {
    try {
      const res = await employeeApi.getAll({ page: 0, size: 100 });
      const resData = res as any;
      const empList = resData?.data?.data || resData?.data || [];
      setEmployees([
        { label: "Tất cả nhân viên", value: "all" },
        ...empList.map((e: EmployeeResponse) => ({
          label: e.name,
          value: e.id,
        })),
      ]);
    } catch (error) {
      console.error("Lỗi fetch nhân viên:", error);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const params = {
        fromDate: dayjs().startOf("month").format("YYYY-MM-DD"),
        toDate: dayjs().endOf("month").format("YYYY-MM-DD"),
      };
      const res = await workScheduleApi.getSchedules(params);
      setSchedules(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Lỗi fetch lịch làm việc:", error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchSchedules();
  }, []);

  const displayedSchedules = useMemo(() => {
    return schedules.filter((item) => {
      const matchEmp =
        selectedEmployee === "all" || item.employeeId === selectedEmployee;
      const matchDate =
        !filterDate || item.workDate === filterDate.format("YYYY-MM-DD");
      return matchEmp && matchDate;
    });
  }, [schedules, selectedEmployee, filterDate]);

  const handleRefresh = () => {
    setSelectedEmployee("all");
    setFilterDate(null);
    fetchSchedules();
  };

  const [currentPage, _setCurrentPage] = useState(1);
  const pageSize = 10;

  const columns: ColumnsType<WorkScheduleResponse> = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    { title: "Mã NV", dataIndex: "employeeCode", key: "employeeCode" },
    {
      title: "Tên nhân viên",
      dataIndex: "employeeName",
      key: "employeeName",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Khung giờ",
      align: "center",
      render: (_, record) => (
        <Tag color="blue" style={{ borderRadius: "4px" }}>
          {`${record.startTime?.slice(0, 5)} - ${record.endTime?.slice(0, 5)}`}
        </Tag>
      ),
    },
    {
      title: "Ngày làm",
      dataIndex: "workDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (status: keyof typeof STATUS_MAP) => {
        const config = STATUS_MAP[status] || {
          color: "default",
          label: status,
        };
        return (
          <Tag color={config.color} style={{ minWidth: 90 }}>
            {config.label.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ color: "#1890ff" }} />}
            disabled={record.status !== "REGISTERED"}
            onClick={() => {
              setEditingRecord(record);
              setIsModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa lịch làm việc?"
            disabled={record.status !== "REGISTERED"}
            onConfirm={() =>
              workScheduleApi
                .deleteSchedule(record.id)
                .then(() => fetchSchedules())
            }
          >
            <Button
              type="text"
              danger
              size="small"
              disabled={record.status !== "REGISTERED"}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "10px 0" }}>
      {/* Thanh công cụ và lọc */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space size="middle">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingRecord(null);
                setIsModalOpen(true);
              }}
              style={{
                background: "#20c997",
                borderColor: "#20c997",
                borderRadius: 6,
              }}
            >
              Thêm lịch trực
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              Tải lại
            </Button>
          </Space>
        </Col>

        <Col>
          <Space size="large">
            <Space>
              <Text strong>Nhân viên:</Text>
              <Select
                style={{ width: 180 }}
                options={employees}
                value={selectedEmployee}
                onChange={setSelectedEmployee}
                showSearch
                placeholder="Chọn nhân viên"
              />
            </Space>
            <Space>
              <Text strong>Ngày:</Text>
              <DatePicker
                format="DD/MM/YYYY"
                value={filterDate}
                onChange={setFilterDate}
                placeholder="Chọn ngày"
              />
            </Space>
            <Space.Compact>
              <Button
                type={viewMode === "table" ? "primary" : "default"}
                icon={<TableOutlined />}
                onClick={() => setViewMode("table")}
              />
              <Button
                type={viewMode === "calendar" ? "primary" : "default"}
                icon={<CalendarOutlined />}
                onClick={() => setViewMode("calendar")}
              />
            </Space.Compact>
          </Space>
        </Col>
      </Row>

      {/* Hiển thị nội dung chính */}
      {viewMode === "table" ? (
        <Table
          columns={columns}
          dataSource={displayedSchedules}
          rowKey="id"
          loading={loading}
          bordered
          size="middle"
          pagination={{
            pageSize: 8,
            showTotal: (total) => `Tổng cộng ${total} lịch trực`,
          }}
        />
      ) : (
        <div
          style={{
            background: "#fff",
            padding: 16,
            borderRadius: 8,
            border: "1px solid #f0f0f0",
          }}
        >
          <Calendar
            cellRender={(value) => {
              const listData = displayedSchedules.filter(
                (s) => s.workDate === value.format("YYYY-MM-DD"),
              );
              return (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {listData.map((item) => (
                    <li key={item.id}>
                      <Badge
                        status="processing"
                        text={`${item.employeeName} (${item.startTime?.slice(0, 5)})`}
                      />
                    </li>
                  ))}
                </ul>
              );
            }}
          />
        </div>
      )}

      <WorkScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onSuccess={fetchSchedules}
        initialData={editingRecord}
      />
    </div>
  );
};

export default WorkSchedulePage;
