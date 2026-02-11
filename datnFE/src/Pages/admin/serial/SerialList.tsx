import React, { useState, useEffect, useCallback } from "react";
import {
  Table, Card, Button, Input, Tag, Space, Typography,
  Pagination, Tooltip, Form, Radio, notification, Drawer, Select
} from "antd";
import {
  SearchOutlined, EditOutlined, ShoppingCartOutlined,
  PlusOutlined, SaveOutlined, CalendarOutlined, SyncOutlined
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { serialActions } from "../../../redux/serial/serialSlice";
import dayjs from "dayjs";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";
import type { SerialPageParams, SerialResponse } from "../../../models/serial";
import type { RootState } from "../../../redux/store";

const { Title, Text } = Typography;

const SerialPage: React.FC = () => {
  const dispatch = useDispatch();
  const [formFilter] = Form.useForm();
  const [formManager] = Form.useForm();

  const { list = [], loading, totalElements = 0 } = useSelector(
    (state: RootState) => state.serial || {}
  );

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<SerialPageParams>({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [productDetails, setProductDetails] = useState<any[]>([]);

  /* ================= FETCH ================= */

  const fetchSerials = useCallback(() => {
    dispatch(serialActions.getAll(filter));
  }, [dispatch, filter]);

  useEffect(() => {
    fetchSerials();
  }, [fetchSerials]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter(p => ({ ...p, keyword: keyword.trim(), page: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    axios
      .get("http://localhost:8386/api/v1/admin/products/product-detail")
      .then(res => res.data?.success && setProductDetails(res.data.data))
      .catch(() => console.error("Load product detail failed"));
  }, []);


  /* ================= HANDLER ================= */

  const openDrawer = (record?: SerialResponse) => {
    formManager.resetFields();
    setEditingId(record?.id || null);

    if (record) {
      formManager.setFieldsValue(record);
    }
    setDrawerOpen(true);
  };

  const handleStatusChange = (status: string | undefined) => {
    setFilter(prev => ({
      ...prev,
      status: status,
      page: 0
    }));
  };

  const submitForm = async (values: any, isContinue = false) => {
  setSubmitting(true);
  try {
    const api = "http://localhost:8386/api/v1/admin/serial";
    const res = editingId
      ? await axios.put(`${api}/${editingId}`, values)
      : await axios.post(api, values);

    if (res.data.success) {
      notification.success({
        message: "Thành công",
        description: isContinue ? "Quét tiếp mã mới" : "Dữ liệu đã lưu",
      });
      fetchSerials();
      if (isContinue) {
        formManager.setFieldsValue({ serialNumber: "" });
        setTimeout(() => document.getElementById("serial_input")?.focus(), 100);
      } else {
        setDrawerOpen(false);
      }
    }
  } catch (e: any) {
    // Quan trọng: Lấy chính xác message lỗi từ Backend (Mã trùng, ID không tồn tại...)
    const errorMsg = e.response?.data?.message || "Lỗi hệ thống hoặc trùng mã Serial";
    notification.error({
      message: "Lỗi lưu dữ liệu",
      description: errorMsg,
    });
  } finally {
    setSubmitting(false);
  }
};

  /* ================= TABLE ================= */

  const columns: ColumnsType<SerialResponse> = [
    {
      title: "STT",
      align: "center",
      width: 60,
      render: (_, __, i) => filter.page * filter.size + i + 1,
    },
    {
      title: "Serial Number",
      render: r => (
          <div>
            <Text strong>{r.serialNumber}</Text>
          </div>
      ),
    },
    {
      title: "Code",
      render: r => (
          <div>
            <Text strong>{r.code}</Text>
          </div>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      render: v => (
        <div>
          <Text strong>{v || "---"}</Text>
        </div>
      ),
    },
    {
      title: "Ngày nhập",
      dataIndex: "createdDate",
      align: "center",
      render: d => (
        <div>
        {dayjs(d).format("DD/MM/YYYY")}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: s => (
        <Tag color={s === "ACTIVE" ? "green" : "red"}>
          {s === "ACTIVE" ? "TRONG KHO" : "ĐÃ BÁN"}
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
        <Title level={4}>Quản lý Serial</Title>
      </Card>

      {/* 2. Card Bộ lọc */}
      <Card 
        variant="borderless" 
        style={{ borderRadius: "12px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <Form layout="vertical">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            
            {/* Ô tìm kiếm Serial */}
            <Form.Item label={<Text strong><SearchOutlined /> Tìm kiếm Serial</Text>}>
              <Input 
                placeholder="Nhập số Serial hoặc mã định danh..." 
                size="large"
                allowClear
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </Form.Item>

            {/* Nhóm nút Trạng thái */}
            <Form.Item label={<Text strong>Trạng thái sản phẩm</Text>}>
              <Radio.Group 
                size="large" 
                buttonStyle="solid" 
                value={filter.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <Radio.Button value={undefined} style={{ minWidth: "100px", textAlign: "center" }}>
                  Tất cả
                </Radio.Button>
                <Radio.Button value="ACTIVE" style={{ minWidth: "100px", textAlign: "center" }}>
                  <Tag color="green" style={{ border: "none", background: "transparent", margin: 0 }}>
                    Trong kho
                  </Tag>
                </Radio.Button>
                <Radio.Button value="INACTIVE" style={{ minWidth: "100px", textAlign: "center" }}>
                  <Tag color="red" style={{ border: "none", background: "transparent", margin: 0 }}>
                    Đã bán
                  </Tag>
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card
        title={`Danh sách (${totalElements})`}
        extra={
          <Space>
            <Button icon={<PlusOutlined />} type="primary" onClick={() => openDrawer()}>
              Thêm
            </Button>
            <Button icon={<SyncOutlined />} loading={loading} onClick={fetchSerials} />
          </Space>
        }
      >
        <Table 
        columns={columns} 
        dataSource={list} // Dùng trực tiếp list từ useSelector
        loading={loading} 
        pagination={false} 
        rowKey="id" 
        bordered 
        size="middle"
        scroll={{ x: 1000 }}
        />

        <Pagination
          style={{ marginTop: 16, textAlign: "right" }}
          current={filter.page + 1}
          pageSize={filter.size}
          total={totalElements}
          onChange={(p, s) => setFilter({ ...filter, page: p - 1, size: s })}
        />
      </Card>

      <Drawer
  title={
    <Space>
      <Text strong>{editingId ? "CẬP NHẬT SERIAL" : "NHẬP KHO SERIAL"}</Text>
    </Space>
  }
  open={drawerOpen}
  width={450} // Hoặc style={{ width: 450 }}
  onClose={() => setDrawerOpen(false)}
  maskClosable={false} // Chặn việc bấm nhầm ra ngoài làm mất dữ liệu
  footer={
    <div style={{ textAlign: "right", padding: "10px 0" }}>
      <Space>
        <Button onClick={() => setDrawerOpen(false)}>Hủy bỏ</Button>
        
        {/* Nút "Lưu & Tiếp tục" chỉ hiện khi Thêm mới */}
        {!editingId && (
          <Button 
            onClick={() => formManager.validateFields().then(v => submitForm(v, true))}
            loading={submitting}
          >
            Lưu & Tiếp tục
          </Button>
        )}

        <Button
          type="primary"
          loading={submitting}
          icon={<SaveOutlined />}
          onClick={() => formManager.submit()}
          style={{ background: "#fa8c16", borderColor: "#fa8c16" }}
        >
          {editingId ? "Cập nhật" : "Lưu dữ liệu"}
        </Button>
      </Space>
    </div>
  }
>
  <Form 
    form={formManager} 
    layout="vertical" 
    onFinish={v => submitForm(v, false)}
    requiredMark="optional"
  >
    <Form.Item 
      name="serialNumber" 
      label={<Text strong>Số Serial (IMEI)</Text>} 
      rules={[{ required: true, message: "Vui lòng nhập hoặc quét mã Serial!" }]}
    >
      <Input 
        id="serial_input" 
        placeholder="Quét mã barcode tại đây..." 
        size="large" 
      />
    </Form.Item>

    <Form.Item 
      name="code" 
      label={<Text strong>Mã định danh nội bộ</Text>} 
      rules={[{ required: true, message: "Vui lòng nhập mã code hệ thống!" }]}
    >
      <Input placeholder="Ví dụ: SR-IP15-001" size="large" />
    </Form.Item>

    <Form.Item
      name="productDetailId"
      label={<Text strong>Sản phẩm áp dụng</Text>}
      rules={[{ required: true, message: "Vui lòng chọn một sản phẩm!" }]}
    >
      <Select 
        showSearch 
        size="large" 
        placeholder="Tìm tên sản phẩm..."
        optionFilterProp="label"
      >
        {productDetails.map(p => (
          <Select.Option key={p.id} value={p.id} label={`${p.productName} ${p.colorName}`}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text strong>{p.productName}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Màu: {p.colorName} / Size: {p.sizeName}
              </Text>
            </div>
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
    <Text type="secondary" italic style={{ fontSize: '12px' }}>
      * Lưu ý: Hệ thống sẽ tự động kiểm tra trùng lặp Serial khi bạn nhấn Lưu.
    </Text>
  </Form>
</Drawer>
    </>
  );
};

export default SerialPage;
