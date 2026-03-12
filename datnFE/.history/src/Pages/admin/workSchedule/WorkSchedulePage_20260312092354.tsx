import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  DatePicker,
  Tag,
  Space,
  Popconfirm,
  Typography,
  message,
  Select,
  Card,
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

  const fetchEmployees = async (): Promise<void> => {
    try {
      const res = await employeeApi.getAll({ page: 0, size: 100 });
      const resData = res as any;
      const empList = resData?.data?.data || resData?.data || [];

      setEmployees([
        { label: "Tất cả", value: "all" },
        ...empList.map((e: EmployeeResponse) => ({
          label: e.name,
          value: e.id,
        })),
      ]);
    } catch (error: unknown) {
      console.error("Lỗi fetch nhân viên:", error);
    }
  };

  const fetchSchedules = async (): Promise<void> => {
    setLoading(true);
    try {
      const params = {
        fromDate: dayjs().startOf("month").format("YYYY-MM-DD"),
        toDate: dayjs().endOf("month").format("YYYY-MM-DD"),
      };

      const res = await workScheduleApi.getSchedules(params);

      if (Array.isArray(res)) {
        setSchedules(res);
      } else {
        setSchedules([]);
      }
    } catch (error: unknown) {
      console.error("Lỗi fetch lịch:", error);
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
    if (!Array.isArray(schedules)) return [];

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

  const handleEdit = (record: WorkScheduleResponse) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await workScheduleApi.deleteSchedule(id);
      message.success("Xóa lịch thành công");
      fetchSchedules();
    } catch (error: unknown) {
      console.error(error);
      message.error("Lỗi khi xóa lịch làm việc");
    }
  };

  const columns: ColumnsType<WorkScheduleResponse> = [
    { title: "ID", width: 60, render: (_, __, index) => index + 1 },
    { title: "Mã nhân viên", dataIndex: "employeeCode", key: "employeeCode" },
    { title: "Tên nhân viên", dataIndex: "employeeName", key: "employeeName" },
    {
      title: "Ca làm",
      render: (_: string, record: WorkScheduleResponse) => {
        const startH = parseInt(record.startTime.split(":")[0]);
        const endH = parseInt(record.endTime.split(":")[0]);
        return <Tag color="blue">{`${startH}h - ${endH}h`}</Tag>;
      },
    },
    {
      title: "Ngày làm",
      dataIndex: "workDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      render: (_: string, record: WorkScheduleResponse) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa lịch làm việc này?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dateCellRender = (value: Dayjs) => {
    const listData = displayedSchedules.filter(
      (s) => s.workDate === value.format("YYYY-MM-DD"),
    );
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {listData.map((item) => (
          <li key={item.id} style={{ marginBottom: 4 }}>
            <Badge
              status="success"
              text={`${item.employeeName} (${parseInt(item.startTime)}h)`}
              style={{ fontSize: 12 }}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Card style={{ marginBottom: 20, borderRadius: 8 }}>
        <Row justify="space-between" align="bottom">
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                background: "#20c997",
                borderColor: "#20c997",
                height: 40,
              }}
              onClick={() => {
                setEditingRecord(null);
                setIsModalOpen(true);
              }}
            >
              Thêm mới lịch làm việc
            </Button>
          </Col>

          <Col>
            <Row gutter={16} align="bottom">
              <Col>
                <div style={{ marginBottom: 4 }}>
                  <Text strong>Nhân viên:</Text>
                </div>
                <Select
                  style={{ width: 200 }}
                  options={employees}
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
                  showSearch
                />
              </Col>
              <Col>
                <div style={{ marginBottom: 4 }}>
                  <Text strong>Ngày làm:</Text>
                </div>
                <DatePicker
                  style={{ width: 150 }}
                  format="DD/MM/YYYY"
                  value={filterDate}
                  onChange={setFilterDate}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <Space>
            <TableOutlined /> Danh Sách Lịch Làm Việc
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              Làm mới
            </Button>

            <Space.Compact>
              <Button
                type={viewMode === "table" ? "primary" : "default"}
                icon={<TableOutlined />}
                onClick={() => setViewMode("table")}
              >
                Bảng
              </Button>
              <Button
                type={viewMode === "calendar" ? "primary" : "default"}
                icon={<CalendarOutlined />}
                onClick={() => setViewMode("calendar")}
              >
                Lịch
              </Button>
            </Space.Compact>
          </Space>
        }
      >
        {viewMode === "table" ? (
          <Table
            columns={columns}
            dataSource={displayedSchedules}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <div
            style={{
              border: "1px solid #f0f0f0",
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Calendar cellRender={dateCellRender} />
          </div>
        )}
      </Card>

      <WorkScheduleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchSchedules}
        initialData={editingRecord}
      />
    </div>
  );
};

export default WorkSchedulePage;
