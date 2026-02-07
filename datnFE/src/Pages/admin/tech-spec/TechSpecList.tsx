import React, { useState, useCallback, useEffect } from "react";
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
  Modal,
  Popconfirm,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import type { RootState } from "../../../redux/store";
import { sensorTypeActions } from "../../../redux/techSpec/sensorTypeSlice";
import { lensMountActions } from "../../../redux/techSpec/lensMountSlice";
import { resolutionActions } from "../../../redux/techSpec/resolutionSlice";
import { processorActions } from "../../../redux/techSpec/processorSlice";
import { imageFormatActions } from "../../../redux/techSpec/imageFormatSlice";
import { videoFormatActions } from "../../../redux/techSpec/videoFormatSlice";
import type { SensorTypeResponse } from "../../../api/sensorTypeApi";
import type { LensMountResponse } from "../../../api/lensMountApi";
import type { ResolutionResponse } from "../../../api/resolutionApi";
import type { ProcessorResponse } from "../../../api/processorApi";
import type { ImageFormatResponse } from "../../../api/imageFormatApi";
import type { VideoFormatResponse } from "../../../api/videoFormatApi";
import { App } from "antd";

const { Title, Text } = Typography;

// Common Tab Component
interface TabItemProps {
  title: string;
  dataIndex: string;
  actions: typeof sensorTypeActions;
  list: any[];
  loading: boolean;
  totalElements: number;
  filter: any;
  setFilter: React.Dispatch<React.SetStateAction<any>>;
  currentItem: any | null;
  setCurrentItem: React.Dispatch<React.SetStateAction<any | null>>;
  deleteItem: (id: string) => void;
  nameField: string;
  descriptionField: string;
}

const TechSpecTab: React.FC<TabItemProps> = ({
  title,
  dataIndex,
  actions,
  list,
  loading,
  totalElements,
  filter,
  setFilter,
  currentItem,
  setCurrentItem,
  nameField,
  deleteItem,
  descriptionField,
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { notification } = App.useApp();

  const fetchData = useCallback(() => {
    dispatch(actions.getAll(filter));
  }, [dispatch, filter, actions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilter((prev: any) => ({
        ...prev,
        keyword: filter.keyword?.trim() || "",
        page: 0,
      }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [filter.keyword]);

  const handleRefresh = () => {
    fetchData();
    notification.success({
      message: "Làm mới thành công",
      description: "Dữ liệu đã được cập nhật",
    });
  };

  const handleReset = () => {
    form.resetFields();
    setFilter({
      page: 0,
      size: 10,
      keyword: "",
      status: undefined,
    });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setFilter((prev: any) => ({ ...prev, page: page - 1, size: pageSize }));
  };

  const openModal = (item?: any) => {
    if (item) {
      setCurrentItem(item);
      modalForm.setFieldsValue({
        name: item[nameField],
        description: item[descriptionField],
        status: item.status,
      });
    } else {
      setCurrentItem(null);
      modalForm.resetFields();
      modalForm.setFieldsValue({ status: "ACTIVE" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    modalForm.resetFields();
  };

  const handleSubmit = () => {
    modalForm.validateFields().then((values) => {
      const data = {
        id: currentItem?.id,
        name: values.name,
        description: values.description,
        status: values.status,
      };

      dispatch(
        currentItem
          ? actions.update({ data, onSuccess: closeModal })
          : actions.create({ data, onSuccess: closeModal })
      );
    });
  };

  const handleDelete = (id: string) => {
    dispatch(deleteItem(id));
  };

  const columns: ColumnsType<any> = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => filter.page * filter.size + index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Tên",
      dataIndex: nameField,
      key: nameField,
    },
    {
      title: "Mô tả",
      dataIndex: descriptionField,
      key: descriptionField,
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>
          {status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      align: "center",
      render: (date: number) => (
        <span style={{ fontSize: "13px" }}>
          {date ? dayjs(date).format("DD/MM/YYYY") : "---"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              shape="circle"
              icon={<EditOutlined style={{ color: "#faad14" }} />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title={`Xóa ${title}`}
            description={`Bạn có chắc chắn muốn xóa ${title.toLowerCase()} này?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                shape="circle"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
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
        <Form form={form} layout="vertical">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "15px",
            }}
          >
            <Form.Item name="keyword" label="Tìm kiếm">
              <Input
                prefix={<SearchOutlined />}
                placeholder={`Nhập tên ${title.toLowerCase()}...`}
                allowClear
                value={filter.keyword}
                onChange={(e) =>
                  setFilter((prev: any) => ({ ...prev, keyword: e.target.value }))
                }
              />
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card
        title={
          <Text strong style={{ fontSize: "16px" }}>
            Danh sách {title} ({totalElements})
          </Text>
        }
        extra={
          <Space size="middle">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
              style={{ borderRadius: "20px", height: "35px" }}
            >
              Thêm mới
            </Button>
            <Button
              icon={<ReloadOutlined spin={loading} />}
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
          scroll={{ x: 800 }}
          bordered
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
            pageSizeOptions={["5", "10", "20", "50"]}
          />
        </div>
      </Card>

      <Modal
        title={currentItem ? `Cập nhật ${title}` : `Thêm mới ${title}`}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText="Lưu"
        cancelText="Hủy"
        width={500}
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên"
            rules={[
              { required: true, message: `Vui lòng nhập tên ${title.toLowerCase()}` },
              { min: 2, message: "Tên phải có ít nhất 2 ký tự" },
            ]}
          >
            <Input placeholder={`Nhập tên ${title.toLowerCase()}`} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả" />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE">
            <Select
              options={[
                { label: "Hoạt động", value: "ACTIVE" },
                { label: "Không hoạt động", value: "INACTIVE" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const TechSpecPage: React.FC = () => {
  // SensorType state
  const [sensorTypeFilter, setSensorTypeFilter] = useState({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
  });
  const [sensorTypeCurrent, setSensorTypeCurrent] = useState<SensorTypeResponse | null>(null);
  const sensorTypeState = useSelector((state: RootState) => state.sensorType);

  // LensMount state
  const [lensMountFilter, setLensMountFilter] = useState({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
  });
  const [lensMountCurrent, setLensMountCurrent] = useState<LensMountResponse | null>(null);
  const lensMountState = useSelector((state: RootState) => state.lensMount);

  // Resolution state
  const [resolutionFilter, setResolutionFilter] = useState({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
  });
  const [resolutionCurrent, setResolutionCurrent] = useState<ResolutionResponse | null>(null);
  const resolutionState = useSelector((state: RootState) => state.resolution);

  // Processor state
  const [processorFilter, setProcessorFilter] = useState({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
  });
  const [processorCurrent, setProcessorCurrent] = useState<ProcessorResponse | null>(null);
  const processorState = useSelector((state: RootState) => state.processor);

  // ImageFormat state
  const [imageFormatFilter, setImageFormatFilter] = useState({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
  });
  const [imageFormatCurrent, setImageFormatCurrent] = useState<ImageFormatResponse | null>(null);
  const imageFormatState = useSelector((state: RootState) => state.imageFormat);

  // VideoFormat state
  const [videoFormatFilter, setVideoFormatFilter] = useState({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
  });
  const [videoFormatCurrent, setVideoFormatCurrent] = useState<VideoFormatResponse | null>(null);
  const videoFormatState = useSelector((state: RootState) => state.videoFormat);

  const tabItems = [
    {
      key: "sensor-type",
      label: "Loại cảm biến",
      children: (
        <TechSpecTab
          title="Loại cảm biến"
          dataIndex="sensorType"
          actions={sensorTypeActions}
          list={sensorTypeState.list}
          loading={sensorTypeState.loading}
          totalElements={sensorTypeState.totalElements}
          filter={sensorTypeFilter}
          setFilter={setSensorTypeFilter}
          currentItem={sensorTypeCurrent}
          setCurrentItem={setSensorTypeCurrent}
          deleteItem={(id: string) => sensorTypeActions.delete(id)}
          nameField="name"
          descriptionField="description"
        />
      ),
    },
    {
      key: "lens-mount",
      label: "Ngàm lens",
      children: (
        <TechSpecTab
          title="Ngàm lens"
          dataIndex="lensMount"
          actions={lensMountActions}
          list={lensMountState.list}
          loading={lensMountState.loading}
          totalElements={lensMountState.totalElements}
          filter={lensMountFilter}
          setFilter={setLensMountFilter}
          currentItem={lensMountCurrent}
          setCurrentItem={setLensMountCurrent}
          deleteItem={(id: string) => lensMountActions.delete(id)}
          nameField="name"
          descriptionField="description"
        />
      ),
    },
    {
      key: "resolution",
      label: "Độ phân giải",
      children: (
        <TechSpecTab
          title="Độ phân giải"
          dataIndex="resolution"
          actions={resolutionActions}
          list={resolutionState.list}
          loading={resolutionState.loading}
          totalElements={resolutionState.totalElements}
          filter={resolutionFilter}
          setFilter={setResolutionFilter}
          currentItem={resolutionCurrent}
          setCurrentItem={setResolutionCurrent}
          deleteItem={(id: string) => resolutionActions.delete(id)}
          nameField="name"
          descriptionField="description"
        />
      ),
    },
    {
      key: "processor",
      label: "Bộ xử lý",
      children: (
        <TechSpecTab
          title="Bộ xử lý"
          dataIndex="processor"
          actions={processorActions}
          list={processorState.list}
          loading={processorState.loading}
          totalElements={processorState.totalElements}
          filter={processorFilter}
          setFilter={setProcessorFilter}
          currentItem={processorCurrent}
          setCurrentItem={setProcessorCurrent}
          deleteItem={(id: string) => processorActions.delete(id)}
          nameField="name"
          descriptionField="description"
        />
      ),
    },
    {
      key: "image-format",
      label: "Định dạng ảnh",
      children: (
        <TechSpecTab
          title="Định dạng ảnh"
          dataIndex="imageFormat"
          actions={imageFormatActions}
          list={imageFormatState.list}
          loading={imageFormatState.loading}
          totalElements={imageFormatState.totalElements}
          filter={imageFormatFilter}
          setFilter={setImageFormatFilter}
          currentItem={imageFormatCurrent}
          setCurrentItem={setImageFormatCurrent}
          deleteItem={(id: string) => imageFormatActions.delete(id)}
          nameField="name"
          descriptionField="description"
        />
      ),
    },
    {
      key: "video-format",
      label: "Định dạng video",
      children: (
        <TechSpecTab
          title="Định dạng video"
          dataIndex="videoFormat"
          actions={videoFormatActions}
          list={videoFormatState.list}
          loading={videoFormatState.loading}
          totalElements={videoFormatState.totalElements}
          filter={videoFormatFilter}
          setFilter={setVideoFormatFilter}
          currentItem={videoFormatCurrent}
          setCurrentItem={setVideoFormatCurrent}
          deleteItem={(id: string) => videoFormatActions.delete(id)}
          nameField="name"
          descriptionField="description"
        />
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <Card className="mb-3" style={{ borderRadius: "12px" }}>
        <Space align="center" size={16}>
          <div
            style={{
              backgroundColor: "#e6f7ff",
              padding: "12px",
              borderRadius: "10px",
            }}
          >
            <SettingOutlined style={{ fontSize: "26px", color: "#1890ff" }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Quản lý thông số kỹ thuật
            </Title>
            <Text type="secondary" style={{ fontSize: "14px" }}>
              Quản lý các thông số kỹ thuật của sản phẩm
            </Text>
          </div>
        </Space>
      </Card>

      <Card style={{ borderRadius: "12px" }}>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default TechSpecPage;

