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
  Modal,
  Popconfirm,
  Select,
  Tabs,
  Row,
  Col,
  Badge,
  Empty,
  Divider,
  Spin,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import type { ColumnsType } from "antd/es/table";
import type { RootState } from "../../../redux/store";
import { techSpecGroupActions } from "../../../redux/techSpec/techSpecGroupSlice";
import { techSpecDefinitionActions } from "../../../redux/techSpec/techSpecDefinitionSlice";
import { techSpecDefinitionItemApi } from "../../../api/techSpecGroupApi";
import type {
  TechSpecGroupResponse,
  TechSpecDefinitionResponse,
  TechSpecGroupRequest,
  TechSpecDefinitionRequest,
  TechSpecDataType,
  TechSpecDefinitionItemResponse,
  TechSpecDefinitionItemRequest,
} from "../../../models/techSpecGroup";

const { Title, Text } = Typography;

const DATA_TYPE_LABELS: Record<TechSpecDataType, { label: string; color: string }> = {
  TEXT: { label: "Văn bản", color: "blue" },
  NUMBER: { label: "Số", color: "green" },
  ENUM: { label: "Danh sách", color: "orange" },
  BOOLEAN: { label: "Có/Không", color: "purple" },
  RANGE: { label: "Khoảng", color: "cyan" },
};

// ---- Sub-component: Item Manager for ENUM definitions ----

interface EnumItemManagerProps {
  definition: TechSpecDefinitionResponse;
  open: boolean;
  onClose: () => void;
}

const EnumItemManager: React.FC<EnumItemManagerProps> = ({ definition, open, onClose }) => {
  const [items, setItems] = useState<TechSpecDefinitionItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TechSpecDefinitionItemResponse | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await techSpecDefinitionItemApi.getByDefinitionId(definition.id);
      setItems(data);
    } catch {
      message.error("Không thể tải danh sách giá trị");
    } finally {
      setLoading(false);
    }
  }, [definition.id]);

  useEffect(() => {
    if (open) {
      loadItems();
    }
  }, [open, loadItems]);

  const openModal = (item?: TechSpecDefinitionItemResponse) => {
    if (item) {
      setEditingItem(item);
      form.setFieldsValue({ name: item.name, value: item.value, displayOrder: item.displayOrder });
    } else {
      setEditingItem(null);
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      setSubmitting(true);
      try {
        const payload: TechSpecDefinitionItemRequest = {
          id: editingItem?.id,
          definitionId: definition.id,
          name: values.name?.trim(),
          value: values.value?.trim() || values.name?.trim(),
          displayOrder: values.displayOrder ?? undefined,
          status: values.status || "ACTIVE",
        };

        if (editingItem) {
          await techSpecDefinitionItemApi.update(editingItem.id, payload);
          message.success("Đã cập nhật giá trị");
        } else {
          await techSpecDefinitionItemApi.create(payload);
          message.success("Đã thêm giá trị mới");
        }

        setModalOpen(false);
        loadItems();
      } catch {
        message.error("Không thể lưu giá trị");
      } finally {
        setSubmitting(false);
      }
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await techSpecDefinitionItemApi.delete(id);
      message.success("Đã xóa giá trị");
      loadItems();
    } catch {
      message.error("Không thể xóa giá trị");
    }
  };

  const itemColumns: ColumnsType<TechSpecDefinitionItemResponse> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, idx) => idx + 1,
    },
    {
      title: "Tên giá trị",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Giá trị hiển thị",
      dataIndex: "value",
      key: "value",
      ellipsis: true,
      render: (v) => v || "—",
    },
    {
      title: "Thứ tự",
      dataIndex: "displayOrder",
      key: "displayOrder",
      width: 80,
      align: "center",
      render: (v) => v || "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      align: "center",
      render: (s: string) => (
        <Tag color={s === "ACTIVE" ? "green" : "red"} style={{ fontSize: "12px" }}>
          {s === "ACTIVE" ? "Hoạt động" : "Tắt"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button type="text" shape="circle" icon={<EditOutlined style={{ color: "#faad14" }} />} onClick={() => openModal(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa giá trị này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger shape="circle" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <UnorderedListOutlined />
          <span>Quản lý giá trị — <Text strong>{definition.name}</Text></span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={700}
      footer={null}
    >
      <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text type="secondary">
          {items.length} giá trị trong danh sách. Nhấn "Thêm giá trị" để mở rộng danh sách chọn cho thông số này.
        </Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} size="small">
          Thêm giá trị
        </Button>
      </div>

      <Table
        columns={itemColumns}
        dataSource={items}
        loading={loading}
        rowKey="id"
        size="small"
        pagination={false}
        bordered
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có giá trị nào. Hãy thêm giá trị cho danh sách này." />
          ),
        }}
      />

      {/* Add/Edit Item Modal */}
      <Modal
        title={editingItem ? "Sửa giá trị" : "Thêm giá trị mới"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText="Lưu"
        cancelText="Hủy"
        width={420}
      >
        <Form form={form} layout="vertical" style={{ marginTop: "16px" }}>
          <Form.Item
            name="name"
            label="Tên giá trị"
            rules={[{ required: true, message: "Vui lòng nhập tên giá trị" }]}
          >
            <Input placeholder="VD: Full-frame CMOS" />
          </Form.Item>
          <Form.Item name="value" label="Giá trị hiển thị (tùy chọn)">
            <Input placeholder="Giá trị hiển thị (mặc định = tên)" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="displayOrder" label="Thứ tự">
                <Input type="number" placeholder="1" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE">
                <Select
                  options={[
                    { label: "Hoạt động", value: "ACTIVE" },
                    { label: "Không hoạt động", value: "INACTIVE" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Modal>
  );
};

// ---- Main Component: TechSpecList ----

const TechSpecListPage: React.FC = () => {
  const dispatch = useDispatch();
  const [groupForm] = Form.useForm();
  const [defForm] = Form.useForm();

  // Group state
  const [groupFilter] = useState({ page: 0, size: 50, keyword: "", status: undefined as any });
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TechSpecGroupResponse | null>(null);
  const [groupSubmitting, setGroupSubmitting] = useState(false);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

  // Definition state
  const [defFilter, setDefFilter] = useState({
    page: 0,
    size: 100,
    keyword: "",
    groupId: undefined as string | undefined,
    status: undefined as any,
  });
  const [defModalOpen, setDefModalOpen] = useState(false);
  const [editingDef, setEditingDef] = useState<TechSpecDefinitionResponse | null>(null);
  const [defSubmitting, setDefSubmitting] = useState(false);

  // ENUM item manager
  const [enumManagerOpen, setEnumManagerOpen] = useState(false);
  const [selectedEnumDef, setSelectedEnumDef] = useState<TechSpecDefinitionResponse | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<string>("");

  const groupState = useSelector((state: RootState) => state.techSpecGroup);
  const defState = useSelector((state: RootState) => state.techSpecDefinition);

  // Load all groups
  const loadGroups = useCallback(() => {
    dispatch(techSpecGroupActions.getAll(groupFilter));
  }, [dispatch, groupFilter]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Auto-select first group and load its definitions
  useEffect(() => {
    if (groupState.list.length > 0) {
      const first = groupState.list[0];
      setActiveTab(first.id);
      setDefFilter((prev) => ({ ...prev, groupId: first.id, keyword: "", page: 0 }));
    }
  }, [groupState.list]);

  // Load definitions when tab/filter changes
  useEffect(() => {
    if (activeTab) {
      dispatch(techSpecDefinitionActions.getAll({ ...defFilter, groupId: activeTab }));
    }
  }, [dispatch, activeTab, defFilter.page, defFilter.size, defFilter.status]);

  // Debounce keyword search
  useEffect(() => {
    const t = setTimeout(() => {
      if (activeTab) {
        setDefFilter((prev) => ({ ...prev, keyword: defFilter.keyword.trim(), page: 0 }));
      }
    }, 500);
    return () => clearTimeout(t);
  }, [defFilter.keyword]); // eslint-disable-line

  // ---- GROUP HANDLERS ----

  const openGroupModal = (g?: TechSpecGroupResponse) => {
    if (g) {
      setEditingGroup(g);
      groupForm.setFieldsValue({ name: g.name, code: g.code, description: g.description, displayOrder: g.displayOrder, status: g.status });
    } else {
      setEditingGroup(null);
      groupForm.resetFields();
      groupForm.setFieldsValue({ status: "ACTIVE" });
    }
    setGroupModalOpen(true);
  };

  const handleGroupSubmit = () => {
    groupForm.validateFields().then((values) => {
      setGroupSubmitting(true);
      const data: TechSpecGroupRequest = {
        id: editingGroup?.id,
        name: values.name?.trim(),
        code: values.code?.trim() || undefined,
        description: values.description?.trim() || undefined,
        displayOrder: values.displayOrder ?? undefined,
        status: values.status,
      };
      const action = editingGroup
        ? techSpecGroupActions.updateGroup({
            id: editingGroup.id, data,
            onSuccess: () => { setGroupSubmitting(false); setGroupModalOpen(false); loadGroups(); },
          })
        : techSpecGroupActions.createGroup({
            data,
            onSuccess: () => { setGroupSubmitting(false); setGroupModalOpen(false); loadGroups(); },
          });
      dispatch(action);
    });
  };

  const handleDeleteGroup = (id: string) => {
    setDeletingGroupId(id);
    dispatch(techSpecGroupActions.deleteGroup(id));
    setTimeout(() => { setDeletingGroupId(null); loadGroups(); }, 800);
  };

  // ---- DEFINITION HANDLERS ----

  const openDefModal = (def?: TechSpecDefinitionResponse) => {
    if (def) {
      setEditingDef(def);
      defForm.setFieldsValue({
        name: def.name, code: def.code, groupId: def.groupId, description: def.description,
        dataType: def.dataType, unit: def.unit, isFilterable: def.isFilterable,
        isRequired: def.isRequired, displayOrder: def.displayOrder, status: def.status,
      });
    } else {
      setEditingDef(null);
      defForm.resetFields();
      defForm.setFieldsValue({ groupId: activeTab, dataType: "ENUM", status: "ACTIVE", isFilterable: false, isRequired: false });
    }
    setDefModalOpen(true);
  };

  const handleDefSubmit = () => {
    defForm.validateFields().then((values) => {
      setDefSubmitting(true);
      const data: TechSpecDefinitionRequest = {
        id: editingDef?.id,
        name: values.name?.trim(),
        code: values.code?.trim() || undefined,
        groupId: values.groupId,
        description: values.description?.trim() || undefined,
        dataType: values.dataType,
        unit: values.unit?.trim() || undefined,
        isFilterable: values.isFilterable ?? false,
        isRequired: values.isRequired ?? false,
        displayOrder: values.displayOrder ?? undefined,
        status: values.status,
      };
      const action = editingDef
        ? techSpecDefinitionActions.updateDefinition({
            id: editingDef.id, data,
            onSuccess: () => { setDefSubmitting(false); setDefModalOpen(false); reloadDefs(); },
          })
        : techSpecDefinitionActions.createDefinition({
            data,
            onSuccess: () => { setDefSubmitting(false); setDefModalOpen(false); reloadDefs(); },
          });
      dispatch(action);
    });
  };

  const reloadDefs = () => {
    if (activeTab) {
      dispatch(techSpecDefinitionActions.getAll({ ...defFilter, groupId: activeTab }));
    }
  };

  const defColumns: ColumnsType<TechSpecDefinitionResponse> = [
    {
      title: "STT",
      key: "index",
      width: 55,
      align: "center",
      render: (_, __, idx) => defFilter.page * defFilter.size + idx + 1,
    },
    {
      title: "Tên thông số",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      width: 140,
      ellipsis: true,
      render: (v: string) => v ? <Text code style={{ fontSize: "11px" }}>{v}</Text> : "—",
    },
    {
      title: "Kiểu",
      dataIndex: "dataType",
      key: "dataType",
      width: 110,
      align: "center",
      render: (dt: TechSpecDataType) => {
        const meta = DATA_TYPE_LABELS[dt] || { label: dt, color: "default" };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 70,
      align: "center",
      render: (v: string) => v || "—",
    },
    {
      title: "Lọc",
      dataIndex: "isFilterable",
      key: "isFilterable",
      width: 65,
      align: "center",
      render: (v: boolean) =>
        v ? <Badge status="success" text={<span style={{ fontSize: "12px" }}>Có</span>} /> : <span style={{ color: "#ccc", fontSize: "12px" }}>—</span>,
    },
    {
      title: "Bắt buộc",
      dataIndex: "isRequired",
      key: "isRequired",
      width: 90,
      align: "center",
      render: (v: boolean) =>
        v ? <Badge status="error" text={<span style={{ fontSize: "12px" }}>Có</span>} /> : <span style={{ color: "#ccc", fontSize: "12px" }}>—</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      align: "center",
      render: (s: string) => (
        <Tag color={s === "ACTIVE" ? "green" : "red"} style={{ fontSize: "12px" }}>
          {s === "ACTIVE" ? "Hoạt động" : "Tắt"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          {record.dataType === "ENUM" && (
            <Tooltip title="Quản lý giá trị danh sách">
              <Button
                type="text"
                shape="circle"
                icon={<UnorderedListOutlined style={{ color: "#1890ff" }} />}
                onClick={() => { setSelectedEnumDef(record); setEnumManagerOpen(true); }}
              />
            </Tooltip>
          )}
          <Tooltip title="Sửa">
            <Button type="text" shape="circle" icon={<EditOutlined style={{ color: "#faad14" }} />} onClick={() => openDefModal(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa thông số?"
            onConfirm={() => {
              dispatch(techSpecDefinitionActions.deleteDefinition(record.id));
              setTimeout(reloadDefs, 800);
            }}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger shape="circle" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Build tab items from group list
  const tabItems = groupState.list.map((group) => ({
    key: group.id,
    label: <Space>{group.name}</Space>,
    children: (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <Text strong style={{ fontSize: "14px" }}>
            Danh sách thông số trong nhóm
            <Text type="secondary" style={{ fontSize: "12px", marginLeft: "8px" }}>
              ({defState.totalElements} thông số)
            </Text>
          </Text>
          <Space>
            <Button icon={<ReloadOutlined spin={defState.loading} />} onClick={reloadDefs} size="small">
              Tải lại
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openDefModal()} size="small" style={{ borderRadius: "6px" }}>
              Thêm thông số
            </Button>
          </Space>
        </div>

        <Input
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          placeholder="Tìm thông số..."
          allowClear
          style={{ marginBottom: "12px" }}
          value={defFilter.keyword}
          onChange={(e) => setDefFilter((prev) => ({ ...prev, keyword: e.target.value }))}
        />

        <Table
          columns={defColumns}
          dataSource={defState.list}
          loading={defState.loading}
          pagination={false}
          rowKey="id"
          size="small"
          bordered
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thông số nào trong nhóm này" />
            ),
          }}
        />

        {defState.totalElements > defFilter.size && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
            <Pagination
              current={defFilter.page + 1}
              pageSize={defFilter.size}
              total={defState.totalElements}
              onChange={(p, s) => setDefFilter((prev) => ({ ...prev, page: p - 1, size: s }))}
              showSizeChanger
              pageSizeOptions={["10", "20", "50", "100"]}
              size="small"
            />
          </div>
        )}
      </div>
    ),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {/* Header */}
      <Card style={{ borderRadius: "12px" }}>
        <Space align="center" size={16}>
          <div style={{ background: "#e6f7ff", padding: "12px", borderRadius: "10px" }}>
            <SettingOutlined style={{ fontSize: "26px", color: "#1890ff" }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Quản lý thông số kỹ thuật</Title>
            <Text type="secondary" style={{ fontSize: "13px" }}>
              Chia theo nhóm — ENUM: nhấn biểu tượng danh sách để quản lý giá trị con
            </Text>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Button type="link" icon={<PlusOutlined />} onClick={() => openGroupModal()} style={{ padding: 0, height: "auto" }}>
              Thêm nhóm mới
            </Button>
          </div>
        </Space>
      </Card>

      {/* Nhóm thông số — horizontal tabs */}
      <Card style={{ borderRadius: "12px" }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setDefFilter((prev) => ({ ...prev, groupId: key, keyword: "", page: 0 }));
          }}
          type="card"
          items={tabItems}
          tabBarExtraContent={
            <Space style={{ marginRight: "8px" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>{groupState.list.length} nhóm</Text>
            </Space>
          }
        />
      </Card>

      {/* Group Modal */}
      <Modal
        title={editingGroup ? "Sửa nhóm thông số" : "Thêm nhóm thông số mới"}
        open={groupModalOpen}
        onCancel={() => setGroupModalOpen(false)}
        onOk={handleGroupSubmit}
        confirmLoading={groupSubmitting}
        okText="Lưu"
        cancelText="Hủy"
        width={480}
      >
        <Form form={groupForm} layout="vertical">
          <Row gutter={12}>
            <Col span={14}>
              <Form.Item name="name" label="Tên nhóm" rules={[{ required: true, message: "Vui lòng nhập tên nhóm" }]}>
                <Input placeholder="VD: Cảm biến & Chất lượng ảnh" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="code" label="Mã nhóm">
                <Input placeholder="VD: sensor-image" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Mô tả ngắn về nhóm" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="displayOrder" label="Thứ tự">
                <Input type="number" placeholder="1" min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE">
                <Select options={[{ label: "Hoạt động", value: "ACTIVE" }, { label: "Không hoạt động", value: "INACTIVE" }]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="action" label="Thao tác">
                <Button
                  danger size="small" block
                  onClick={() => { if (editingGroup) { handleDeleteGroup(editingGroup.id); setGroupModalOpen(false); } }}
                >
                  Xóa nhóm
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Definition Modal */}
      <Modal
        title={editingDef ? "Sửa thông số kỹ thuật" : "Thêm thông số kỹ thuật mới"}
        open={defModalOpen}
        onCancel={() => setDefModalOpen(false)}
        onOk={handleDefSubmit}
        confirmLoading={defSubmitting}
        okText="Lưu"
        cancelText="Hủy"
        width={560}
      >
        <Form form={defForm} layout="vertical">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="name" label="Tên thông số" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                <Input placeholder="VD: Kích thước cảm biến" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="code" label="Mã thông số">
                <Input placeholder="VD: sensor_size" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item name="groupId" label="Nhóm" rules={[{ required: true, message: "Vui lòng chọn nhóm" }]}>
                <Select
                  placeholder="Chọn nhóm"
                  options={groupState.list.map((g) => ({ label: g.name, value: g.id }))}
                  showSearch optionFilterProp="label"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dataType" label="Kiểu dữ liệu" rules={[{ required: true, message: "Vui lòng chọn kiểu" }]}>
                <Select
                  placeholder="Chọn kiểu"
                  options={[
                    { label: "Danh sách (ENUM)", value: "ENUM" },
                    { label: "Văn bản (TEXT)", value: "TEXT" },
                    { label: "Số (NUMBER)", value: "NUMBER" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="unit" label="Đơn vị">
                <Input placeholder="VD: MP, fps, g, mm..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="displayOrder" label="Thứ tự">
                <Input type="number" placeholder="1" min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE">
                <Select options={[{ label: "Hoạt động", value: "ACTIVE" }, { label: "Không hoạt động", value: "INACTIVE" }]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="isFilterable" label="Dùng để lọc" initialValue={false}>
                <Select options={[{ label: "Có", value: true }, { label: "Không", value: false }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isRequired" label="Bắt buộc nhập" initialValue={false}>
                <Select options={[{ label: "Có", value: true }, { label: "Không", value: false }]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Mô tả chi tiết thông số này" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ENUM Item Manager Modal */}
      {selectedEnumDef && (
        <EnumItemManager
          definition={selectedEnumDef}
          open={enumManagerOpen}
          onClose={() => { setEnumManagerOpen(false); setSelectedEnumDef(null); }}
        />
      )}
    </div>
  );
};

export default TechSpecListPage;
