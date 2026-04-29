import React, { useState, useEffect, useCallback } from "react";
import { message } from "antd";
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
import dayjs from "dayjs";
import type { RootState } from "../../../redux/store";
import { shiftTemplateActions } from "../../../redux/shiftTemplate/ShiftTemplateSlice";
import type { ColumnsType } from "antd/es/table";
import type { ADShiftTemplateResponse } from "../../../models/shiftTemplate";

const { Text } = Typography;

const ShiftTemplatePage: React.FC = () => {
  const dispatch = useDispatch();
  const [formFilter] = Form.useForm();
  const [formModal] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Lấy dữ liệu từ Redux
  const { list, isLoading, totalElements } = useSelector(
    (state: RootState) => state.shiftTemplate,
  );
  // Modal loading state riêng để tránh đóng modal khi lỗi
  const [modalLoading, setModalLoading] = useState(false);

  // Hàm fetch dữ liệu (Bổ sung tham số page, size)
  const fetchShifts = useCallback(
    (page = 0, size = 10) => {
      const values = formFilter.getFieldsValue();
      const params = {
        page,
        size,
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
    },
    [dispatch, formFilter],
  );

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Xử lý mở modal Sửa
  const handleEdit = (record: ADShiftTemplateResponse) => {
    setEditingId(record.id);
    setIsModalOpen(true);
    formModal.setFieldsValue({
      name: record.name,
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

  // Theo dõi trạng thái tạo/sửa thành công/thất bại qua redux
  useEffect(() => {
    if (!modalLoading && isModalOpen) {
      // Nếu modal đang mở mà loading = false thì có thể là vừa xong thao tác
      // Không tự đóng modal ở đây, chỉ đóng khi thành công
    }
  }, [isLoading]);

  const onFinishModal = async (values: any) => {
    const payload = {
      name: values.name,
      startTime: values.timeRange[0].format("HH:mm:ss"),
      endTime: values.timeRange[1].format("HH:mm:ss"),
    };
    setModalLoading(true);
    // Dùng promise để biết thành công/thất bại
    const action = editingId
      ? shiftTemplateActions.updateRequest({ id: editingId, ...payload })
      : shiftTemplateActions.createRequest(payload);
    try {
      // dispatch trả về promise nếu middleware hỗ trợ, nếu không thì dùng saga báo message
      await dispatch(action);
      // Đợi redux cập nhật xong (isLoading false)
      setTimeout(() => {
        setModalLoading(false);
        handleCancelModal();
      }, 400); // delay nhỏ để tránh đóng quá nhanh
    } catch (err: any) {
      setModalLoading(false);
      message.error(err?.message || "Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const handleReset = () => {
    formFilter.resetFields();
    fetchShifts(0, 10);
  };

  const handleStatusChange = async (id: string) => {
    try {
      await dispatch(shiftTemplateActions.changeStatusRequest(id));
    } catch (err: any) {
      message.error(err?.message || "Không thể đổi trạng thái");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const columns: ColumnsType<ADShiftTemplateResponse> = [
    {
      title: "STT",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      width: 70,
      align: "center",
    },
    {
      title: "Mã Ca",
      dataIndex: "code",
      key: "code",
      width: 120,
      align: "center",
      render: (t: string) => (
        <Tag color="blue" style={{ fontWeight: "bold" }}>
          {t}
        </Tag>
      ),
    },
    {
      title: "Tên Ca",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Giờ Bắt Đầu",
      dataIndex: "startTime",
      key: "startTime",
      align: "center",
      render: (time: string) => <Tag color="cyan">{time}</Tag>,
    },
    {
      title: "Giờ Kết Thúc",
      dataIndex: "endTime",
      key: "endTime",
      align: "center",
      render: (time: string) => <Tag color="orange">{time}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: string, record) => (
        <Popconfirm
          title="Thay đổi trạng thái"
          description="Xác nhận đổi trạng thái hoạt động của ca này?"
          onConfirm={() => handleStatusChange(record.id)}
          okText="Đồng ý"
          cancelText="Hủy"
        >
          <Switch
            checked={status === "ACTIVE"}
            loading={isLoading}
            size="default"
          />
        </Popconfirm>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title="Chỉnh sửa">
          <Button
            type="text"
            shape="circle"
            icon={<EditOutlined style={{ color: "#faad14" }} />}
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
      {/* 1. Bộ lọc */}
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
        <Form
          form={formFilter}
          layout="vertical"
          onValuesChange={() => fetchShifts(0, 10)}
        >
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

      {/* 2. Danh sách */}
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
              onClick={() => fetchShifts()}
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
          pagination={{
            current: currentPage,
            total: totalElements,
            pageSize,
            showSizeChanger: false,
            onChange: (page) => {
              setCurrentPage(page);
              fetchShifts(page - 1, pageSize); // Trừ 1 vì Backend Java thường tính từ page 0
            },
          }}
        />
      </Card>

      {/* 3. Modal Thêm/Sửa */}
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
        okText={editingId ? "Cập nhật" : "Lưu lại"}
        cancelText="Hủy bỏ"
        destroyOnHidden
        confirmLoading={modalLoading || isLoading}
      >
        <Form form={formModal} layout="vertical" onFinish={onFinishModal}>
          <Form.Item
            name="name"
            label="Tên ca"
            rules={[{ required: true, message: "Vui lòng nhập tên ca!" }]}
          >
            <Input placeholder="Ví dụ: Ca sáng, Ca hành chính..." />
          </Form.Item>
          <Form.Item
            name="timeRange"
            label="Thời gian (Bắt đầu - Kết thúc)"
            rules={[{ required: true, message: "Vui lòng chọn khung giờ!" }]}
          >
            <TimePicker.RangePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ShiftTemplatePage;
