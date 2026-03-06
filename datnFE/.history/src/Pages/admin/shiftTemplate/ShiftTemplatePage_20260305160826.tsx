import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  TimePicker,
  message,
  Tag,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios"; // Hoặc instance axios bạn đã cấu hình

const ShiftTemplatePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 1. Lấy danh sách ca làm việc
  const fetchShifts = async () => {
    setLoading(true);
    try {
      // Thay MappingConstants.API_ADMIN_PREFIX_SHIFT_TEMPLATE bằng URL thực tế
      const response = await axios.get("/api/admin/shift-templates");
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      message.error("Không thể tải danh sách ca làm việc");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // 2. Xử lý tạo mới ca làm việc
  const handleCreate = async (values) => {
    const payload = {
      name: values.name,
      startTime: values.timeRange[0].format("HH:mm:ss"),
      endTime: values.timeRange[1].format("HH:mm:ss"),
    };

    try {
      const response = await axios.post("/api/admin/shift-templates", payload);
      if (response.data.success) {
        message.success("Tạo ca làm việc thành công!");
        setIsModalOpen(false);
        form.resetFields();
        fetchShifts();
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo ca",
      );
    }
  };

  const columns = [
    { title: "STT", render: (text, record, index) => index + 1, width: 60 },
    { title: "Tên ca", dataIndex: "name", key: "name" },
    {
      title: "Giờ bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
      render: (time) => <Tag color="blue">{time}</Tag>,
    },
    {
      title: "Giờ kết thúc",
      dataIndex: "endTime",
      key: "endTime",
      render: (time) => <Tag color="orange">{time}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      render: () => <Button type="link">Chỉnh sửa</Button>,
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h2>Danh sách ca làm việc</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Thêm ca làm việc
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal Thêm mới */}
      <Modal
        title="Tạo ca làm việc mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Tên ca làm việc"
            rules={[{ required: true, message: "Vui lòng nhập tên ca!" }]}
          >
            <Input placeholder="Ví dụ: Ca sáng, Ca hành chính..." />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="Khoảng thời gian"
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
