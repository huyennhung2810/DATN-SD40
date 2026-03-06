import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Tag,
  Space,
  Typography,
  Pagination,
  Tooltip,
  Form,
  notification,
  Radio,
  Modal,
  TimePicker,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  SyncOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import type { ColumnsType } from "antd/es/table";

// Giả định các types này bạn định nghĩa trong folder models
export interface ShiftTemplateResponse {
  id: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  status: string;
  isActive: boolean;
}

const { Text } = Typography;

const ShiftTemplatePage: React.FC = () => {
  const dispatch = useDispatch();
  const [formFilter] = Form.useForm();
  const [formModal] = Form.useForm();

  // Local State
  const [keyword, setKeyword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
  });

  // Lấy dữ liệu từ Redux (Thay thế bằng slice thực tế của bạn)
  const { list, loading, totalElements } = useSelector(
    (state: any) => state.shiftTemplate,
  );

  // 1. Fetch dữ liệu
  const fetchShifts = useCallback(() => {
    // dispatch(shiftTemplateActions.getAll(filter));
    console.log("Fetching shifts with filter:", filter);
  }, [dispatch, filter]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // 2. Debounce tìm kiếm keyword
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilter((prev) => ({
        ...prev,
        keyword: keyword.trim(),
        page: 0,
      }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [keyword]);

  // 3. Xử lý sự kiện
  const handleRefresh = () => {
    fetchShifts();
    notification.success({ message: "Làm mới dữ liệu thành công" });
  };

  const handleReset = () => {
    formFilter.resetFields();
    setKeyword("");
    setFilter({ page: 0, size: 10, keyword: "", status: undefined });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setFilter((prev) => ({ ...prev, page: page - 1, size: pageSize }));
  };

  const handleCreateShift = (values: any) => {
    const _payload = {
      name: values.name,
      startTime: values.timeRange[0].format("HH:mm:ss"),
      endTime: values.timeRange[1].format("HH:mm:ss"),
    };
    // dispatch(shiftTemplateActions.create(payload));
    setIsModalOpen(false);
    formModal.resetFields();
  };

  // 4. Định nghĩa cột của Bảng
  const columns: ColumnsType<ShiftTemplateResponse> = [
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
          onValuesChange={(_, vals) => {
            setKeyword(vals.keyword || "");
            setFilter((prev) => ({ ...prev, status: vals.status, page: 0 }));
          }}
        >
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
        title={
          <Text strong style={{ fontSize: "16px" }}>
            Danh sách ca làm việc mẫu ({totalElements})
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
              icon={<SyncOutlined spin={loading} />}
              onClick={handleRefresh}
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
          loading={loading}
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
        >
          <Pagination
            current={filter.page + 1}
            pageSize={filter.size}
            total={totalElements}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={["5", "10", "20"]}
          />
        </div>
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
        <Form form={formModal} layout="vertical" onFinish={handleCreateShift}>
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
