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
import dayjs from "dayjs"; // Đảm bảo bạn đã cài đặt dayjs
import type { RootState } from "../../../redux/store";
import { shiftTemplateActions } from "../../../redux/shiftTemplate/ShiftTemplateSlice";

const { Text } = Typography;

const ShiftTemplatePage: React.FC = () => {
  const dispatch = useDispatch();
  const [formFilter] = Form.useForm();
  const [formModal] = Form.useForm();

  // State quản lý Modal và trạng thái sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { list, isLoading, totalElements } = useSelector(
    (state: RootState) => state.shiftTemplate,
  );

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

  // --- LOGIC XỬ LÝ SỬA ---
  const handleEdit = (record: any) => {
    setEditingId(record.id); // Đánh dấu đang sửa ID này
    setIsModalOpen(true);

    // Đổ dữ liệu từ hàng vào Form
    formModal.setFieldsValue({
      name: record.name,
      // Chuyển string "08:00:00" thành object dayjs để TimePicker hiển thị
      timeRange: [
        dayjs(record.startTime, "HH:mm:ss"),
        dayjs(record.endTime, "HH:mm:ss"),
      ],
    });
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    formModal.resetFields();
  };

  const onFinishModal = (values: any) => {
    const payload = {
      name: values.name,
      startTime: values.timeRange[0].format("HH:mm:ss"),
      endTime: values.timeRange[1].format("HH:mm:ss"),
    };

    if (editingId) {
      // Gọi action Cập nhật (Bạn cần thêm updateRequest vào Slice/Saga)
      // dispatch(shiftTemplateActions.updateRequest({ id: editingId, ...payload }));
      console.log("Cập nhật ca:", editingId, payload);
    } else {
      dispatch(shiftTemplateActions.createRequest(payload));
    }

    handleCancelModal();
  };

  const handleStatusChange = (id: string) => {
    dispatch(shiftTemplateActions.changeStatusRequest(id));
  };

  // --- CẤU TRÚC CỘT (ĐÃ CHIA LẠI TỶ LỆ) ---
  const columns = [
    {
      title: "STT",
      align: "center" as const,
      width: 60,
      render: (_: any, __: any, index: number) => (
        <Text type="secondary">{index + 1}</Text>
      ),
    },
    {
      title: "Mã Ca",
      dataIndex: "code",
      width: 100,
      align: "center" as const,
      render: (code: string) => (
        <Tag color="blue" style={{ fontWeight: 500 }}>
          {code}
        </Tag>
      ),
    },
    {
      title: "Tên Ca Làm Việc",
      dataIndex: "name",
      ellipsis: true,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Khung Giờ",
      width: 220,
      align: "center" as const,
      render: (record: any) => (
        <Space>
          <Tag color="cyan" bordered={false}>
            {record.startTime}
          </Tag>
          <Text type="secondary">→</Text>
          <Tag color="orange" bordered={false}>
            {record.endTime}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center" as const,
      width: 130,
      render: (status: string, record: any) => (
        <Popconfirm
          title="Đổi trạng thái"
          description="Xác nhận thay đổi?"
          onConfirm={() => handleStatusChange(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Tooltip title={status === "ACTIVE" ? "Đang chạy" : "Đã tắt"}>
            <Switch
              checked={status === "ACTIVE"}
              loading={isLoading}
              size="small"
            />
            <span style={{ marginLeft: 8, fontSize: "12px" }}>
              {status === "ACTIVE" ? "Bật" : "Tắt"}
            </span>
          </Tooltip>
        </Popconfirm>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center" as const,
      width: 80,
      fixed: "right" as const,
      render: (record: any) => (
        <Tooltip title="Chỉnh sửa ca">
          <Button
            type="text"
            shape="circle"
            icon={<EditOutlined style={{ color: "#faad14", fontSize: 16 }} />}
            onClick={() => handleEdit(record)}
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
            onClick={() => {
              formFilter.resetFields();
              fetchShifts();
            }}
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
        title={
          <Text strong style={{ fontSize: 16 }}>
            Danh sách ca làm việc ({totalElements})
          </Text>
        }
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
          scroll={{ x: 800 }}
        />
      </Card>

      {/* MODAL THÊM/SỬA */}
      <Modal
        title={
          <span>
            <ClockCircleOutlined />{" "}
            {editingId ? "Cập nhật ca làm việc" : "Tạo ca làm việc mới"}
          </span>
        }
        open={isModalOpen}
        onCancel={handleCancelModal}
        onOk={() => formModal.submit()}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
      >
        <Form form={formModal} layout="vertical" onFinish={onFinishModal}>
          <Form.Item
            name="name"
            label="Tên ca"
            rules={[{ required: true, message: "Vui lòng nhập tên ca!" }]}
          >
            <Input placeholder="Ví dụ: Ca sáng" />
          </Form.Item>
          <Form.Item
            name="timeRange"
            label="Thời gian"
            rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
          >
            <TimePicker.RangePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ShiftTemplatePage;
