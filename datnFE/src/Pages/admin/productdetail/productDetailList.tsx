import React, { useState, useEffect, useCallback } from "react";
import {
  Table, Card, Button, Input, Tag, Space, Typography, Form, Tooltip, Drawer,
  Radio, Select, InputNumber, notification
} from "antd";
import { SearchOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { productDetailActions } from "../../../redux/productdetail/productDetailSlice";
import type { ColumnsType } from "antd/es/table";
import type { ProductDetailResponse } from "../../../models/productdetail";
import type { RootState } from "../../../redux/store";
import dayjs from "dayjs";
import { colorActions } from "../../../redux/color/colorSlice";
import { storageCapacityActions } from "../../../redux/storage/storageSlice";

const { Title, Text } = Typography;

const ProductDetailPage: React.FC = () => {
  const dispatch = useDispatch();
  const [formManager] = Form.useForm();
  
  // Lấy dữ liệu từ Redux
  const { list: colors } = useSelector((state: RootState) => state.color);
  const { list: capacities } = useSelector((state: RootState) => state.storage);
  // Giả sử bạn có thêm danh sách sản phẩm cha
  // const { list: products } = useSelector((state: RootState) => state.product); 

  const { list = [], loading, totalElements = 0 } = useSelector(
    (state: RootState) => state.productDetail || {}
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState({ page: 0, size: 10, keyword: "", status: undefined });

  // 1. Fetch dữ liệu
  const fetchData = useCallback(() => {
    dispatch(productDetailActions.getAll(filter));
  }, [dispatch, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    dispatch(colorActions.getAll({ page: 0, size: 1000 }));
    dispatch(storageCapacityActions.getAll({ page: 0, size: 1000 }));
    // dispatch(productActions.getAll({ page: 0, size: 1000 }));
  }, [dispatch]);

  // 2. Mở Drawer (Xử lý gán ID để Select hiển thị đúng)
  const openDrawer = (record?: ProductDetailResponse) => {
    formManager.resetFields();
    setEditingId(record?.id || null);

    if (record?.id) {
      dispatch(
        productDetailActions.getById({
          id: record.id,
          onSuccess: (data: ProductDetailResponse) => {
            // Biến mảng thành chuỗi xuống dòng
            const serialText = data.serials?.map((s) => s.serialNumber).join('\n') || "";

            formManager.setFieldsValue({
              ...data,
              productId: data.productId,
              colorId: data.colorId,
              storageCapacityId: data.storageCapacityId,
              serialList: serialText,
              // TypeScript giờ đã hiểu data.serials[0].code
              serialCode: data.serials?.[0]?.code || "" 
            });
          },
        })
      );
    } else {
      formManager.setFieldsValue({ status: 'ACTIVE', quantity: 0 });
    }
    setDrawerOpen(true);
  };

  // 3. Xử lý lưu dữ liệu (Đóng gói Serial đúng chuẩn ADSerialRequest)
  const onFinish = (values: any) => {
    const serialNumbers = values.serialList
      ? values.serialList.split(/\n/).map((s: string) => s.trim()).filter((s: string) => s !== "")
      : [];

    // Map đúng theo ADSerialRequest ở Backend
    const serials = serialNumbers.map((sn: string) => ({
      serialNumber: sn,
      code: values.serialCode, // Đây là trường 'code' trong ADSerialRequest
      status: values.status,   // Cùng trạng thái với SPCT
      productDetailId: editingId // Backend sẽ xử lý nếu là null
    }));

    const payload = {
      ...values,
      quantity: !editingId ? serials.length : values.quantity,
      serials: serials,
    };

    if (editingId) {
      dispatch(productDetailActions.update({ 
        id: editingId, 
        data: payload, 
        navigate: () => { setDrawerOpen(false); fetchData(); } 
      }));
    } else {
      dispatch(productDetailActions.add({ 
        data: payload, 
        navigate: () => { setDrawerOpen(false); fetchData(); } 
      }));
    }
  };

  const columns: ColumnsType<ProductDetailResponse> = [
    { title: "STT", align: "center", width: 60, render: (_, __, i) => filter.page * filter.size + i + 1 },
    { title: "Mã phiên bản", render: r => <Text strong>{r.code}</Text> },
    { title: "Sản phẩm", dataIndex: "productName", render: v => <Text strong>{v || "---"}</Text> },
    {
      title: "Cấu hình",
      render: r => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#1890ff' }}>{r.version}</Text>
          <Tag color="blue">{r.colorName} | {r.storageCapacityName}</Tag>
        </Space>
      ),
    },
    {
      title: "Giá bán",
      dataIndex: "salePrice",
      render: (v: number) => <Text strong style={{ color: '#ff4d4f' }}>{v?.toLocaleString('vi-VN')} đ</Text>
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      align: "center",
      render: (v) => <Tag color={v > 0 ? "cyan" : "volcano"}>{v} máy</Tag>
    },
    {
      title: "Thao tác",
      align: "center",
      render: r => <Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => openDrawer(r)} />,
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Quản lý Chi tiết Sản phẩm</Title>
          <Button icon={<PlusOutlined />} type="primary" onClick={() => openDrawer()}>Thêm SPCT mới</Button>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Space size="large">
          <Input.Search 
            placeholder="Tìm theo mã, tên..." 
            onSearch={v => setFilter(p => ({...p, keyword: v.trim(), page: 0}))} 
            style={{ width: 300 }} 
          />
          <Radio.Group 
            buttonStyle="solid" 
            value={filter.status} 
            onChange={e => setFilter(p => ({...p, status: e.target.value, page: 0}))}
          >
            <Radio.Button value={undefined}>Tất cả</Radio.Button>
            <Radio.Button value="ACTIVE">Đang bán</Radio.Button>
            <Radio.Button value="INACTIVE">Ngừng bán</Radio.Button>
          </Radio.Group>
        </Space>
      </Card>

      <Table 
        columns={columns} 
        dataSource={list} 
        loading={loading} 
        rowKey="id" 
        pagination={{
          current: filter.page + 1,
          pageSize: filter.size,
          total: totalElements,
          onChange: (p, s) => setFilter(prev => ({ ...prev, page: p - 1, size: s })),
        }} 
      />

      <Drawer
        title={editingId ? "CẬP NHẬT SPCT" : "THÊM MỚI SPCT"}
        open={drawerOpen}
        width={500}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setDrawerOpen(false)}>Hủy</Button>
              <Button type="primary" onClick={() => formManager.submit()} loading={loading}>Xác nhận</Button>
            </Space>
          </div>
        }
      >
        <Form form={formManager} layout="vertical" onFinish={onFinish}>
          {/* Section: Serial Management */}
          <Card size="small" title="Quản lý Serial" style={{ marginBottom: 16, background: '#fafafa' }}>
            <Form.Item 
              label={<Text strong>{editingId ? "Danh sách Serial hiện tại" : "Nhập danh sách Serial mới"}</Text>} 
              name="serialList" 
              extra={!editingId && "Mỗi mã một dòng. Số lượng SPCT sẽ tự động tính theo số mã này."}
              rules={[{ required: !editingId, message: 'Vui lòng nhập Serial!' }]}
            >
              <Input.TextArea 
                rows={5} 
                placeholder="Ví dụ:&#10;SN10001&#10;SN10002" 
                disabled={!!editingId}
                onChange={(e) => {
                  if (!editingId) {
                    const count = e.target.value.split(/\n/).filter(s => s.trim() !== "").length;
                    formManager.setFieldsValue({ quantity: count });
                  }
                }}
              />
            </Form.Item>

            <Form.Item label="Mã Serial chung (Serial Code)" name="serialCode" rules={[{ required: true }]}>
              <Input placeholder="Nhập mã lô hoặc mã Serial chung" />
            </Form.Item>
          </Card>

          {/* Section: Product Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Form.Item label="Mã SPCT" name="code" rules={[{ required: true }]}>
              <Input placeholder="Mã định danh SPCT" disabled={!!editingId} />
            </Form.Item>
            <Form.Item label="Tên phiên bản" name="version" rules={[{ required: true }]}>
              <Input placeholder="iPhone 15 Pro Max..." />
            </Form.Item>
          </div>

          <Form.Item label="Sản phẩm cha" name="productId" rules={[{ required: true }]}>
            <Select 
              placeholder="Chọn sản phẩm" 
              // options={products.map(p => ({ label: p.name, value: p.id }))} 
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Form.Item label="Màu sắc" name="colorId" rules={[{ required: true }]}>
              <Select options={colors.map(c => ({ label: c.name, value: c.id }))} />
            </Form.Item>
            <Form.Item label="Dung lượng" name="storageCapacityId" rules={[{ required: true }]}>
              <Select options={capacities.map(s => ({ label: s.name, value: s.id }))} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Form.Item label="Giá bán (VNĐ)" name="salePrice" rules={[{ required: true }]}>
              <InputNumber 
                style={{ width: '100%' }} 
                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                parser={v => v!.replace(/\$\s?|(,*)/g, '')} 
              />
            </Form.Item>
            <Form.Item label="Số lượng tồn" name="quantity">
              <InputNumber min={0} style={{ width: '100%' }} disabled={!!editingId}/>
            </Form.Item>
          </div>

          <Form.Item label="Trạng thái kinh doanh" name="status">
            <Radio.Group buttonStyle="solid">
              <Radio value="ACTIVE">Đang bán</Radio>
              <Radio value="INACTIVE">Ngừng bán</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ProductDetailPage;