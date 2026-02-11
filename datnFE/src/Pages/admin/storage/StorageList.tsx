import React, { useState, useEffect, useCallback } from "react";
import {
  Table, Card, Button, Input, Tag, Space, Typography,
  Pagination, Tooltip, Form, Radio, notification, Drawer
} from "antd";
import {
  SearchOutlined, EditOutlined,
  PlusOutlined, SaveOutlined, SyncOutlined
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { storageCapacityActions } from "../../../redux/storage/storageSlice";
import type { ColumnsType } from "antd/es/table";
import type {
  StorageCapacityResponse,
  StorageCapacityFormValues,
  StorageCapacityPageParams
} from "../../../models/storage";
import type { RootState } from "../../../redux/store";

const { Title, Text } = Typography;

const StorageCapacityPage: React.FC = () => {
  const dispatch = useDispatch();
  const [formManager] = Form.useForm<StorageCapacityFormValues>();

  const { list = [], loading, totalElements = 0 } = useSelector(
    (state: RootState) => state.storage || {}
  );

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<StorageCapacityPageParams>({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* ================= FETCH ================= */

  const fetchStorageCapacities = useCallback(() => {
    dispatch(storageCapacityActions.getAll(filter));
  }, [dispatch, filter]);

  useEffect(() => {
    fetchStorageCapacities();
  }, [fetchStorageCapacities]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter(p => ({ ...p, keyword: keyword.trim(), page: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  /* ================= HANDLER ================= */

  const openDrawer = (record?: StorageCapacityResponse) => {
    formManager.resetFields();
    setEditingId(record?.id || null);

    if (record) {
      formManager.setFieldsValue({
        code: record.code,
        name: record.name,
        status: record.status,
      });
    }
    setDrawerOpen(true);
  };

  const submitForm = async (values: StorageCapacityFormValues) => {
    setSubmitting(true);
    try {
      const api = "http://localhost:8386/api/v1/admin/products/storage-capacity";
      const res = editingId
        ? await fetch(`${api}/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          })
        : await fetch(api, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

      const data = await res.json();

      if (data.success) {
        notification.success({
          message: "Thành công",
          description: editingId
            ? "Cập nhật dung lượng thành công"
            : "Thêm dung lượng thành công",
        });
        fetchStorageCapacities();
        setDrawerOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (e: any) {
      notification.error({
        message: "Lỗi",
        description: e.message || "Không thể lưu dữ liệu",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= TABLE ================= */

  const columns: ColumnsType<StorageCapacityResponse> = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_, __, i) => filter.page * filter.size + i + 1,
    },
    {
      title: "Mã dung lượng",
      dataIndex: "code",
      render: v => <Text strong>{v}</Text>,
    },
    {
      title: "Tên dung lượng",
      dataIndex: "name",
      render: v => <Text>{v}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: s => (
        <Tag color={s === "ACTIVE" ? "green" : "red"}>
          {s === "ACTIVE" ? "HOẠT ĐỘNG" : "NGỪNG"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      align: "center",
      render: r => (
        <Tooltip title="Sửa">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openDrawer(r)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Title level={4}>Quản lý Dung lượng</Title>
      </Card>

      {/* FILTER */}
      <Card style={{ marginBottom: 12 }}>
        <Space size="large">
          <Input
            allowClear
            placeholder="Tìm mã hoặc tên dung lượng..."
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />

          <Radio.Group
            value={filter.status}
            onChange={e =>
              setFilter(p => ({
                ...p,
                status: e.target.value,
                page: 0,
              }))
            }
          >
            <Radio.Button value={undefined}>Tất cả</Radio.Button>
            <Radio.Button value="ACTIVE">Hoạt động</Radio.Button>
            <Radio.Button value="INACTIVE">Ngừng</Radio.Button>
          </Radio.Group>
        </Space>
      </Card>

      {/* TABLE */}
      <Card
        title={`Danh sách (${totalElements})`}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()}>
              Thêm
            </Button>
            <Button icon={<SyncOutlined />} loading={loading} onClick={fetchStorageCapacities} />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={loading}
          pagination={false}
          bordered
        />

        <Pagination
          style={{ marginTop: 16, textAlign: "right" }}
          current={filter.page + 1}
          pageSize={filter.size}
          total={totalElements}
          onChange={(p, s) => setFilter({ ...filter, page: p - 1, size: s })}
        />
      </Card>

      {/* DRAWER */}
      <Drawer
        title={editingId ? "Cập nhật dung lượng" : "Thêm dung lượng"}
        open={drawerOpen}
        width={400}
        onClose={() => setDrawerOpen(false)}
        footer={
          <Space style={{ float: "right" }}>
            <Button onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={submitting}
              onClick={() => formManager.submit()}
            >
              Lưu
            </Button>
          </Space>
        }
      >
        <Form
          form={formManager}
          layout="vertical"
          onFinish={submitForm}
          initialValues={{ status: "ACTIVE" }}
        >
          <Form.Item
            name="code"
            label="Mã dung lượng"
            rules={[{ required: true, message: "Vui lòng nhập mã dung lượng" }]}
          >
            <Input placeholder="VD: ST-128" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên dung lượng"
            rules={[{ required: true, message: "Vui lòng nhập tên dung lượng" }]}
          >
            <Input placeholder="VD: 128GB" />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Radio.Group>
              <Radio value="ACTIVE">Hoạt động</Radio>
              <Radio value="INACTIVE">Ngừng</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default StorageCapacityPage;
