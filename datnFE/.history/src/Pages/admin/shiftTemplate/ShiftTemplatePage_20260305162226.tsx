import React, { useState } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tooltip,
  Form,
  Radio,
  Modal,
  TimePicker,
  Typography,
  Tag,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const ShiftTemplatePage: React.FC = () => {
  const [formFilter] = Form.useForm();
  const [formModal] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hàm xử lý khi giá trị bộ lọc thay đổi
  const handleFilterChange = () => {
    const values = formFilter.getFieldsValue();
    // Logic gửi dispatch action (Redux-Saga) sẽ nằm ở đây
    console.log("Dữ liệu lọc:", {
      ...values,
      startTime: values.timeSlot ? values.timeSlot[0].format("HH:mm:ss") : null,
      endTime: values.timeSlot ? values.timeSlot[1].format("HH:mm:ss") : null,
    });
  };

  const handleReset = () => {
    formFilter.resetFields();
    handleFilterChange();
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 70,
      align: "center" as const,
    },
    {
      title: "Mã Ca",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (text: string) => <Text strong>{text || "---"}</Text>,
    },
    {
      title: "Tên Ca Làm Việc",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Thời Gian",
      key: "time",
      width: 250,
      render: (record: any) => (
        <Space>
          <Tag color="blue">{record.startTime || "00:00"}</Tag>
          <Text>-</Text>
          <Tag color="orange">{record.endTime || "00:00"}</Tag>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      width: 150,
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>
          {status === "ACTIVE" ? "Hoạt động" : "Ngừng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center" as const,
      width: 100,
      fixed: "right" as const,
      render: () => (
        <Button type="link" size="small">
          Chỉnh sửa
        </Button>
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
          <Tooltip title="Làm mới bộ lọc">
            <Button
              shape="circle"
              icon={<ReloadOutlined />}
              onClick={handleReset}
              type="primary"
              ghost
            />
          </Tooltip>
        }
      >
        <Form
          form={formFilter}
          layout="vertical"
          onValuesChange={handleFilterChange}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Tìm kiếm theo text */}
            <Form.Item name="keyword" label="Tìm kiếm ca">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Nhập tên hoặc mã ca..."
                allowClear
              />
            </Form.Item>

            {/* Lọc theo khung giờ - NHU CẦU MỚI CỦA BẠN */}
            <Form.Item name="timeSlot" label="Lọc theo khung giờ">
              <TimePicker.RangePicker
                format="HH:mm"
                style={{ width: "100%" }}
                placeholder={["Giờ bắt đầu", "Giờ kết thúc"]}
              />
            </Form.Item>

            {/* Lọc theo trạng thái */}
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
          <Text strong style={{ fontSize: "16px" }}>
            Danh sách ca làm việc mẫu
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
              style={{ borderRadius: "20px" }}
              onClick={() => {
                /* logic refresh list */
              }}
            >
              Tải lại
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={[]} // Sẽ map dữ liệu từ Redux vào đây
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
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
        width={500}
      >
        <Form
          form={formModal}
          layout="vertical"
          onFinish={(values) => {
            console.log("Dữ liệu tạo mới:", values);
            setIsModalOpen(false);
          }}
        >
          <Form.Item
            name="name"
            label="Tên ca làm việc"
            rules={[{ required: true, message: "Vui lòng nhập tên ca!" }]}
          >
            <Input placeholder="Ví dụ: Ca sáng, Ca chiều..." />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="Khoảng thời gian (Bắt đầu - Kết thúc)"
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
