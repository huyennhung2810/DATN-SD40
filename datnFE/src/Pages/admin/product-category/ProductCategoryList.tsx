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
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  Select,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import type { ProductCategoryPageParams, ProductCategoryResponse } from "../../../models/productCategory";
import type { RootState } from "../../../redux/store";
import { productCategoryActions } from "../../../redux/productCategory/productCategorySlice";
import { App } from "antd";

const { Title, Text } = Typography;

const ProductCategoryPage: React.FC = () => {
  const dispatch = useDispatch();
  const { list, loading, totalElements } = useSelector(
    (state: RootState) => state.productCategory,
  );
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [keyword, setKeyword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategoryResponse | null>(null);
  const { notification } = App.useApp();

  const [filter, setFilter] = useState<ProductCategoryPageParams>({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
  });

  const fetchCategories = useCallback(() => {
    dispatch(productCategoryActions.getAll(filter));
  }, [dispatch, filter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
    fetchCategories();
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

  const openModal = (category?: ProductCategoryResponse) => {
    if (category) {
      setEditingCategory(category);
      modalForm.setFieldsValue({
        name: category.name,
        code: category.code,
        description: category.description,
        status: category.status,
      });
    } else {
      setEditingCategory(null);
      modalForm.resetFields();
      modalForm.setFieldsValue({ status: "ACTIVE" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    modalForm.resetFields();
  };

    const handleSubmit = () => {
        modalForm.validateFields().then((values) => {
            const data = {
                id: editingCategory?.id,
                name: values.name,
                code: values.code,
                description: values.description,
                status: values.status,
            };

            dispatch(
                editingCategory
                    ? productCategoryActions.updateCategory({ data, onSuccess: closeModal })
                    : productCategoryActions.addCategory({ data, onSuccess: closeModal })
            );
        });
    };

  const handleDelete = (id: string) => {
    dispatch(productCategoryActions.deleteCategory(id));
  };

  const columns: ColumnsType<ProductCategoryResponse> = [
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
      title: "Tên danh mục",
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
      render: (_, record: ProductCategoryResponse) => (
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
            title="Xóa danh mục"
            description="Bạn có chắc chắn muốn xóa danh mục này?"
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
            <TagOutlined style={{ fontSize: "26px", color: "#1890ff" }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Quản lý loại sản phẩm
            </Title>
            <Text type="secondary" style={{ fontSize: "14px" }}>
              Quản lý danh mục sản phẩm của hệ thống
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
                placeholder="Nhập mã hoặc tên danh mục..."
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
            Danh sách loại sản phẩm ({totalElements})
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
        title={editingCategory ? "Cập nhật danh mục" : "Thêm mới danh mục"}
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
            label="Mã danh mục"
            rules={[
              { required: true, message: "Vui lòng nhập mã danh mục" },
              { max: 50, message: "Mã tối đa 50 ký tự" },
            ]}
          >
            <Input placeholder="Nhập mã danh mục" disabled={!!editingCategory} />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[
              { required: true, message: "Vui lòng nhập tên danh mục" },
              { min: 2, message: "Tên phải có ít nhất 2 ký tự" },
            ]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả danh mục" />
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

export default ProductCategoryPage;

