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
  Select,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import type { BrandPageParams, BrandResponse } from "../../../models/brand";
import type { RootState } from "../../../redux/store";
import { brandActions } from "../../../redux/brand/brandSlice";
import { App } from "antd";

const { Title, Text } = Typography;

const BrandPage: React.FC = () => {
  const dispatch = useDispatch();
  const { list, loading, totalElements } = useSelector(
    (state: RootState) => state.brand,
  );
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [keyword, setKeyword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandResponse | null>(null);
  const { notification } = App.useApp();

  const [filter, setFilter] = useState<BrandPageParams>({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
  });

  const fetchBrands = useCallback(() => {
    dispatch(brandActions.getAll(filter));
  }, [dispatch, filter]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

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

  const handleRefresh = () => {
    fetchBrands();
    notification.success({
      message: "Làm mới thành công",
      description: "Dữ liệu đã được cập nhật",
    });
  };

  const handleReset = () => {
    form.resetFields();
    setKeyword("");
    setFilter({
      page: 0,
      size: 10,
      keyword: "",
      status: undefined,
    });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setFilter((prev) => ({ ...prev, page: page - 1, size: pageSize }));
  };

  const openModal = (brand?: BrandResponse) => {
    if (brand) {
      setEditingBrand(brand);
      modalForm.setFieldsValue({
        name: brand.name,
        code: brand.code,
        description: brand.description,
        status: brand.status,
      });
    } else {
      setEditingBrand(null);
      modalForm.resetFields();
      modalForm.setFieldsValue({ status: "ACTIVE" });
    }
    setIsModalOpen(true);
  };

  const validateName = async (_: any, value: string) => {
    if (!value) {
      return Promise.reject("Vui lòng nhập tên thương hiệu");
    }
    if (!value.trim()) {
      return Promise.reject("Tên thương hiệu không được chỉ chứa khoảng trắng");
    }
    if (value.trim().length < 2) {
      return Promise.reject("Tên thương hiệu phải có ít nhất 2 ký tự");
    }

    const trimmedValue = value.trim().toLowerCase();
    const isDuplicate = list.some(
      (item) => item.name?.toLowerCase().trim() === trimmedValue
    );

    if (isDuplicate) {
      if (editingBrand && editingBrand.name?.toLowerCase().trim() === trimmedValue) {
        return Promise.resolve();
      }
      return Promise.reject("Tên thương hiệu đã tồn tại");
    }

    return Promise.resolve();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    modalForm.resetFields();
  };

  const handleSubmit = () => {
    modalForm.validateFields().then((values) => {
      const data = {
        id: editingBrand?.id,
        name: values.name?.trim(),
        code: values.code?.trim(),
        description: values.description?.trim() || undefined,
        status: values.status,
      };

      dispatch(
        editingBrand
          ? brandActions.updateBrand({ data, onSuccess: closeModal })
          : brandActions.addBrand({ data, onSuccess: closeModal })
      );
    });
  };

  const handleDelete = (id: string) => {
    dispatch(brandActions.deleteBrand(id));
  };

  const columns: ColumnsType<BrandResponse> = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => filter.page * filter.size + index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      width: 120,
    },
    {
      title: "Tên thương hiệu",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
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
      fixed: "right",
      render: (_, record: BrandResponse) => (
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
            title="Xóa thương hiệu"
            description="Bạn có chắc chắn muốn xóa thương hiệu này?"
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
            <BankOutlined style={{ fontSize: "26px", color: "#1890ff" }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Quản lý thương hiệu
            </Title>
            <Text type="secondary" style={{ fontSize: "14px" }}>
              Quản lý thương hiệu sản phẩm của hệ thống
            </Text>
          </div>
        </Space>
      </Card>

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
                placeholder="Nhập mã hoặc tên thương hiệu..."
                allowClear
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card
        title={
          <Text strong style={{ fontSize: "16px" }}>
            Danh sách thương hiệu ({totalElements})
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
          scroll={{ x: 900 }}
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
        title={editingBrand ? "Cập nhật thương hiệu" : "Thêm mới thương hiệu"}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText="Lưu"
        cancelText="Hủy"
        width={500}
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item
            name="code"
            label="Mã thương hiệu"
            rules={[
              { required: true, message: "Vui lòng nhập mã thương hiệu" },
              { max: 20, message: "Mã tối đa 20 ký tự" },
            ]}
          >
            <Input placeholder="Nhập mã thương hiệu" disabled={!!editingBrand} />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên thương hiệu"
            rules={[
              { validator: validateName }
            ]}
          >
            <Input placeholder="Nhập tên thương hiệu" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả thương hiệu" />
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

export default BrandPage;
