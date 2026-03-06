import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Form,
  Radio,
  Modal,
  TimePicker,
  Typography,
  Tag,
  Switch,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { shiftTemplateActions } from "../../../redux/shiftTemplate/ShiftTemplateSlice";

const { Text } = Typography;

const ShiftTemplatePage: React.FC = () => {
  const dispatch = useDispatch();
  const [formFilter] = Form.useForm();
  const [formModal] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lấy dữ liệu từ Redux
  const { list, isLoading, totalElements } = useSelector(
    (state: RootState) => state.shiftTemplate,
  );

  // 1. Hàm fetch dữ liệu kèm bộ lọc
  const fetchShifts = useCallback(() => {
    const values = formFilter.getFieldsValue();
    const params = {
      keyword: values.keyword?.trim(),
      status: values.status,
      startTime: values.timeSlot
        ? values.timeSlot[0].format("HH:mm:ss")
        : undefined,
      endTime: values.timeSlot
        ? values.timeSlot[1].format("HH:mm:ss")
        : undefined,
    };
    dispatch(shiftTemplateActions.getAllRequest(params));
  }, [dispatch, formFilter]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // 2. Xử lý tạo mới
  const handleCreate = (values: any) => {
    const payload = {
      name: values.name,
      startTime: values.timeRange[0].format("HH:mm:ss"),
      endTime: values.timeRange[1].format("HH:mm:ss"),
    };
    dispatch(shiftTemplateActions.createRequest(payload));
    setIsModalOpen(false);
    formModal.resetFields();
  };

  const handleReset = () => {
    formFilter.resetFields();
    fetchShifts();
  };

  const handleStatusChange = (id: string) => {
    dispatch(shiftTemplateActions.changeStatusRequest(id));
  };

  const columns = [
    {
      title: "STT",
      render: (_: any, __: any, index: number) => index + 1,
      width: 70,
      align: "center" as const,
    },
    {
      title: "Mã Ca",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (t: string) => <Text strong>{t}</Text>,
    },
    { title: "Tên Ca", dataIndex: "name", key: "name" },
    {
      title: "Thời Gian",
      key: "time",
      width: 250,
      render: (record: any) => (
        <Space>
          <Tag color="blue">{record.startTime}</Tag>
          <Text>-</Text>
          <Tag color="orange">{record.endTime}</Tag>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      width: 120,
      render: (status: string, record: any) => (
        <Popconfirm
          title="Thay đổi trạng thái"
          description={`Bạn có chắc chắn muốn ${
            status === "ACTIVE" ? "ngừng hoạt động" : "kích hoạt"
          } ca làm việc này?`}
          onConfirm={() => handleStatusChange(record.id)}
          okText="Đồng ý"
          cancelText="Hủy"
        >
          <Tooltip
            title={
              status === "ACTIVE"
                ? "Click để ngừng hoạt động"
                : "Click để kích hoạt"
            }
          >
            <Switch
              checked={status === "ACTIVE"}
              loading={isLoading}
              size="default"
            />
          </Tooltip>
        </Popconfirm>
      ),
    },

    {
      title: "Thao tác",
      key: "action",
      align: "center" as const,
      width: 200,
      fixed: "right" as const,
      render: (record: any) => (
        <Tooltip title="Chỉnh sửa">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#faad14" }} />}
            onClick={() => {
              console.log("Edit record:", record);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        padding: "20px",
      }}
    >
      {/* CARD BỘ LỌC */}
      <Card
        title={
          <span>
            <FilterOutlined /> Bộ lọc tìm kiếm
          </span>
        }
        extra={
          <Button
            shape="circle"
            icon={<ReloadOutlined />}
            onClick={handleReset}
            type="primary"
            ghost
          />
        }
      >
        <Form form={formFilter} layout="vertical" onValuesChange={fetchShifts}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            <Form.Item name="keyword" label="Tìm kiếm ca">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Tên hoặc mã ca..."
                allowClear
              />
            </Form.Item>
            <Form.Item name="timeSlot" label="Lọc theo khung giờ">
              <TimePicker.RangePicker
                format="HH:mm"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái">
              <Radio.Group buttonStyle="solid">
                <Radio value={undefined}>Tất cả</Radio>
                <Radio value="ACTIVE">Hoạt động</Radio>
                <Radio value="INACTIVE">Ngừng</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        </Form>
      </Card>

      {/* CARD DANH SÁCH */}
      <Card
        title={<Text strong>Danh sách ca làm việc ({totalElements})</Text>}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              style={{ borderRadius: "20px" }}
            >
              Thêm mới
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchShifts}
              style={{ borderRadius: "20px" }}
            >
              Tải lại
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={isLoading}
          bordered
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* MODAL THÊM MỚI */}
      <Modal
        title={
          <span>
            <ClockCircleOutlined /> Tạo ca làm việc mới
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => formModal.submit()}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
      >
        <Form form={formModal} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Tên ca"
            rules={[{ required: true, message: "Nhập tên ca!" }]}
          >
            <Input placeholder="Ví dụ: Ca sáng" />
          </Form.Item>
          <Form.Item
            name="timeRange"
            label="Thời gian"
            rules={[{ required: true, message: "Chọn thời gian!" }]}
          >
            <TimePicker.RangePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ShiftTemplatePage;
