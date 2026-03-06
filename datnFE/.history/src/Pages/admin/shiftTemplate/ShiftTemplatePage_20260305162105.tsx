import React from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Pagination,
  Tooltip,
  Form,
  Radio,
  Modal,
  TimePicker,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Text } from "recharts";

const ShiftTemplatePage: React.FC = () => {
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      align: "center",
    },
    {
      title: "Mã Ca",
      dataIndex: "code",
      key: "code",
      width: 120,
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
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 150,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 100,
      fixed: "right",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "10px",
      }}
    >
      {/* CARD BỘ LỌC */}
      <Card
        title={
          <span>
            <SearchOutlined /> Bộ lọc tìm kiếm
          </span>
        }
        extra={
          <Tooltip title="Làm mới bộ lọc">
            <Button
              shape="circle"
              icon={<ReloadOutlined />}
              type="primary"
              ghost
            />
          </Tooltip>
        }
      >
        <Form>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            <Form.Item name="keyword" label="Tìm kiếm ca">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Nhập tên hoặc mã ca..."
                allowClear
              />
            </Form.Item>

            <Form.Item name="status" label="Trạng thái">
              <Radio.Group buttonStyle="solid">
                <Radio value={undefined}>Tất cả</Radio>
                <Radio value="ACTIVE">Hoạt động</Radio>
                <Radio value="INACTIVE">Ngừng hoạt động</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        </Form>
      </Card>

      {/* CARD DANH SÁCH */}
      <Card
        title={<Text>Danh sách ca làm việc mẫu </Text>}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ borderRadius: "20px" }}
            >
              Thêm mới
            </Button>
            <Button style={{ borderRadius: "20px" }}>Tải lại</Button>
          </Space>
        }
      >
        <Table
          dataSource={list}
          pagination={false}
          rowKey="id"
          bordered
          className="custom-table"
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "16px",
          }}
        ></div>
      </Card>

      {/* MODAL THÊM MỚI */}
      <Modal
        title={
          <span>
            <ClockCircleOutlined /> Tạo ca làm việc mới
          </span>
        }
        okText="Lưu lại"
        cancelText="Hủy bỏ"
      >
        <Form>
          <Form.Item
            name="name"
            label="Tên ca làm việc"
            rules={[{ required: true, message: "Vui lòng nhập tên ca!" }]}
          >
            <Input placeholder="Ví dụ: Ca sáng, Ca chiều..." />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="Khoảng thời gian (Giờ bắt đầu - Giờ kết thúc)"
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
