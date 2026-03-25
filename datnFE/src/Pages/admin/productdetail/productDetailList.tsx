import { CameraOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  notification,
  Radio,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import type { ProductDetailResponse } from "../../../models/productdetail";
import {
  getProductVersionDisplayName,
  ProductVersion,
  ProductVersionOptions,
} from "../../../models/productVersion";
import { colorActions } from "../../../redux/color/colorSlice";
import { productDetailActions } from "../../../redux/productdetail/productDetailSlice";
import { storageCapacityActions } from "../../../redux/storage/storageSlice";
import type { RootState } from "../../../redux/store";

const { Text } = Typography;

const ProductDetailPage: React.FC = () => {
  const dispatch = useDispatch();
  const [formManager] = Form.useForm();

  const [serialModalOpen, setSerialModalOpen] = useState(false);
  const [selectedSerials, setSelectedSerials] = useState<any[]>([]);
  const [viewingProductName, setViewingProductName] = useState("");
  const [loadingSerials, setLoadingSerials] = useState(false);

  // 1. Lấy dữ liệu Màu sắc và Dung lượng từ Redux (kèm fallback mảng rỗng để tránh lỗi map)
  const { list: colors = [] } = useSelector(
    (state: RootState) => state.color || {}
  );
  const { list: capacities = [] } = useSelector(
    (state: RootState) => state.storage || {}
  );

  const handleViewSerials = (record: ProductDetailResponse) => {
    if (!record || !record.id) return;

    setSerialModalOpen(true);
    setViewingProductName(
      `${record.productName || "Sản phẩm"} - ${record.version || ""}`
    );
    setLoadingSerials(true);

    dispatch(
      productDetailActions.getById({
        id: record.id,
        onSuccess: (response: any) => {
          const productDetail = response.data ? response.data : response;

          if (productDetail && productDetail.serials) {
            // Lọc và giữ lại nguyên object thay vì chỉ lấy string
            const serialsList = productDetail.serials
              .filter(
                (s: any) =>
                  s.serialNumber && String(s.serialNumber).trim() !== ""
              )
              .map((s: any) => ({
                serialNumber: String(s.serialNumber),
                status: s.status || s.serialStatus, // Tùy BE trả về trường nào
                createdDate: s.createdDate,
              }));

            setSelectedSerials(serialsList);
          } else {
            setSelectedSerials([]);
          }
          setLoadingSerials(false);
        },
      })
    );
  };

  // 2. Lấy danh sách SPCT (list) và Sản phẩm cha (productList) từ productDetailSlice
  const {
    list = [],
    productList = [],
    loading,
    totalElements = 0,
  } = useSelector((state: RootState) => state.productDetail || {});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
  });

  // Fetch dữ liệu cho bảng
  const fetchData = useCallback(() => {
    dispatch(productDetailActions.getAll(filter));
  }, [dispatch, filter]);

  const handleSearch = useCallback(
    debounce((value: string) => {
      setFilter((prev) => ({
        ...prev,
        keyword: value.trim(),
        page: 0,
      }));
    }, 500),
    []
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch dữ liệu cho các Select trong Form khi component mount
  useEffect(() => {
    dispatch(colorActions.getAll({ page: 0, size: 1000 }));
    dispatch(storageCapacityActions.getAll({ page: 0, size: 1000 }));
    dispatch(productDetailActions.getAllProduct({ page: 0, size: 1000 }));
  }, [dispatch]);

  const generateCode = () => {
    return `SPCT${Date.now()}`;
  };

  // Mở Drawer và fill dữ liệu
  const openDrawer = (record?: ProductDetailResponse) => {
    formManager.resetFields();
    setEditingId(record?.id || null);

    if (record?.id) {
      dispatch(
        productDetailActions.getById({
          id: record.id,
          onSuccess: (data: ProductDetailResponse) => {
            const serialText =
              data.serials?.map((s) => s.serialNumber).join("\n") || "";

            formManager.setFieldsValue({
              ...data,
              productId: data.productId ? String(data.productId) : undefined,
              colorId: data.colorId ? String(data.colorId) : undefined,
              storageCapacityId: data.storageCapacityId
                ? String(data.storageCapacityId)
                : undefined,
              serialList: serialText,
              serialCode: data.serials?.[0]?.code || "",
              // LEVEL 1: Set variantVersion với fallback về BODY_ONLY nếu không có
              variantVersion: data.variantVersion || ProductVersion.BODY_ONLY,
            });
          },
        })
      );
    } else {
      formManager.setFieldsValue({
        code: generateCode(),
        status: "ACTIVE",
        quantity: 0,
        // LEVEL 1: Default variantVersion là BODY_ONLY khi tạo mới
        variantVersion: ProductVersion.BODY_ONLY,
      });
    }

    setDrawerOpen(true);
  };

  const handleImportExcel = (file: any) => {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // lấy cột đầu tiên làm serial
      const serials = jsonData
        .map((row: any) => row[0])
        .filter((v: any) => v)
        .join("\n");

      formManager.setFieldsValue({
        serialList: serials,
        quantity: serials.split("\n").length,
      });
    };

    reader.readAsArrayBuffer(file);

    return false;
  };

  // Xử lý khi Submit Form
  const onFinish = (values: any) => {
    // 1. GIỮ NGUYÊN KIỂU STRING CHO CÁC ID (Vì BE dùng UUID)
    const formattedValues = {
      ...values,
      productId: values.productId || null,
      colorId: values.colorId || null,
      storageCapacityId: values.storageCapacityId || null,
      salePrice: Number(values.salePrice), // Chú ý: Chỉ ép kiểu số cho Giá bán
    };

    let payload: any = { ...formattedValues };

    // --- NẾU LÀ THÊM MỚI (ADD) ---
    if (!editingId) {
      const rawSerials = values.serialList
        ? values.serialList
            .split(/\n/)
            .map((s: string) => s.trim())
            .filter((s: string) => s !== "")
        : [];

      // Loại bỏ các mã trùng lặp do người dùng nhập nhầm trong form
      const uniqueSerials = Array.from(new Set<string>(rawSerials));

      if (uniqueSerials.length !== rawSerials.length) {
        notification.warning({
          message: "Đã tự động loại bỏ các mã Serial nhập trùng!",
        });
      }

      const serials = uniqueSerials.map((sn: string) => ({
        serialNumber: sn,
        status: "ACTIVE",
      }));

      // Đóng gói Payload
      payload = {
        ...payload,
        quantity: serials.length, // Số lượng tồn kho TỰ ĐỘNG BẰNG số lượng Serial
        serials: serials, // Gửi kèm mảng Serial
      };
    }
    // --- NẾU LÀ CẬP NHẬT (UPDATE) ---
    else {
      payload.quantity = values.quantity;
      // Xóa mảng serials để không gửi lên BE gây lỗi 400
      delete payload.serials;
    }

    // Xóa rác (các trường chỉ dùng cho Frontend)
    delete payload.serialList;
    delete payload.serialCode;

    // --- GỌI API ---
    if (editingId) {
      dispatch(
        productDetailActions.update({
          id: editingId,
          data: payload,
          navigate: () => {
            setDrawerOpen(false);
            fetchData();
          },
        })
      );
    } else {
      dispatch(
        productDetailActions.add({
          data: payload,
          navigate: () => {
            setDrawerOpen(false);
            fetchData();
          },
        })
      );
    }
  };

  // Cấu hình cột cho bảng
  const columns: ColumnsType<ProductDetailResponse> = [
    {
      title: "STT",
      align: "center",
      width: 60,
      render: (_, __, i) => filter.page * filter.size + i + 1,
    },
    { title: "Mã SPCT", render: (r) => <Text strong>{r.code}</Text> },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      render: (v) => <Text strong>{v || "---"}</Text>,
    },
    {
      title: "Phiên bản",
      // LEVEL 1: Hiển thị variantVersion (Body Only / Kit 18-45 / Kit 18-150)
      render: (r) => (
        <Tag color="green" style={{ fontWeight: 600 }}>
          {getProductVersionDisplayName(r.variantVersion) || "Body Only"}
        </Tag>
      ),
    },
    {
      title: "Cấu hình",
      // LEVEL 1: version đã được backend auto-generate: "{VariantVersion} / {Color} / {Storage}"
      render: (r) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: "#1890ff" }}>
            {`${r.colorName || "---"} / ${r.storageCapacityName || "---"}`}
          </Text>
        </Space>
      ),
    },
    {
      title: "Giá bán",
      dataIndex: "salePrice",
      render: (v: number) => (
        <Text strong style={{ color: "#ff4d4f" }}>
          {v?.toLocaleString("vi-VN")} đ
        </Text>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      align: "center",
      render: (v) => <Tag color={v > 0 ? "cyan" : "volcano"}>{v} máy</Tag>,
    },
    {
      title: "Thao tác",
      align: "center",
      render: (r) => (
        <Button
          type="text"
          icon={<EditOutlined style={{ color: "#1890ff" }} />}
          onClick={(e) => {
            e.stopPropagation();
            openDrawer(r);
          }}
        />
      ),
    },
  ];

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>
      <div
        className="solid-card"
        style={{
          padding: "16px 20px",
          marginBottom: "16px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Space align="center" size={16}>
          <div
            style={{
              backgroundColor: "var(--color-primary-light)",
              padding: "12px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CameraOutlined
              style={{
                fontSize: "22px",
                color: "var(--color-primary)",
              }}
            />
          </div>

          <div>
            <Typography.Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              Quản lý Chi tiết Sản phẩm
            </Typography.Title>

            <Typography.Text type="secondary" style={{ fontSize: "13px" }}>
              Quản lý các biến thể sản phẩm
            </Typography.Text>
          </div>
        </Space>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openDrawer()}
          style={{
            borderRadius: "8px",
            height: "36px",
            padding: "0 16px",
          }}
        >
          Thêm SPCT mới
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space size="large">
          <Input
            placeholder="Tìm theo mã, tên..."
            style={{ width: 300 }}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
          <Radio.Group
            buttonStyle="solid"
            value={filter.status}
            onChange={(e) =>
              setFilter((p) => ({ ...p, status: e.target.value, page: 0 }))
            }
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
        onRow={(record) => ({
          onClick: () => handleViewSerials(record),
          style: { cursor: "pointer" },
        })}
        pagination={{
          current: filter.page + 1,
          pageSize: filter.size,
          total: totalElements,
          onChange: (p, s) =>
            setFilter((prev) => ({ ...prev, page: p - 1, size: s })),
        }}
      />

      <Drawer
        title={editingId ? "CẬP NHẬT SPCT" : "THÊM MỚI SPCT"}
        open={drawerOpen}
        width={500}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setDrawerOpen(false)}>Hủy</Button>
              <Button
                type="primary"
                onClick={() => formManager.submit()}
                loading={loading}
              >
                Xác nhận
              </Button>
            </Space>
          </div>
        }
      >
        <Form form={formManager} layout="vertical" onFinish={onFinish}>
          <Card
            size="small"
            title="Quản lý Serial"
            style={{ marginBottom: 16, background: "#fafafa" }}
          >
            {!editingId && (
              <Upload
                beforeUpload={handleImportExcel}
                showUploadList={false}
                accept=".xlsx,.xls"
              >
                <Button style={{ marginBottom: 10 }}>
                  Import Serial từ Excel
                </Button>
              </Upload>
            )}

            <Form.Item
              label={
                <Text strong>
                  {editingId
                    ? "Danh sách Serial hiện tại"
                    : "Nhập danh sách Serial mới"}
                </Text>
              }
              name="serialList"
              extra={!editingId && "Mỗi mã một dòng hoặc import từ Excel"}
              rules={[
                { required: !editingId, message: "Vui lòng nhập Serial!" },
              ]}
            >
              <Input.TextArea
                rows={5}
                disabled={!!editingId}
                placeholder={`SP0001\nSP0002\nSP0003\nSP0004`}
              />
            </Form.Item>
          </Card>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Form.Item label="Mã SPCT" name="code" rules={[{ required: true }]}>
              <Input
                placeholder="Mã định danh SPCT"
                disabled
                value={generateCode()}
              />
            </Form.Item>
            {/* LEVEL 1: Thêm field "Phiên bản" - Select bắt buộc với 3 giá trị */}
            <Form.Item
              label="Phiên bản"
              name="variantVersion"
              rules={[{ required: true, message: "Vui lòng chọn phiên bản!" }]}
            >
              <Select
                placeholder="Chọn phiên bản máy ảnh"
                options={ProductVersionOptions}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Sản phẩm"
            name="productId"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Chọn sản phẩm"
              showSearch
              optionFilterProp="label"
              loading={productList.length === 0}
              options={(productList || []).map((p: any) => ({
                label: p.name,
                value: String(p.id),
              }))}
            />
          </Form.Item>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Form.Item
              label="Màu sắc"
              name="colorId"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Chọn màu sắc"
                loading={colors.length === 0}
                options={(colors || []).map((c: any) => ({
                  label: c.name,
                  value: String(c.id),
                }))}
              />
            </Form.Item>
            <Form.Item
              label="Dung lượng"
              name="storageCapacityId"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Chọn dung lượng"
                loading={capacities.length === 0}
                options={(capacities || []).map((s: any) => ({
                  label: s.name,
                  value: String(s.id),
                }))}
              />
            </Form.Item>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Form.Item
              label="Giá bán (VNĐ)"
              name="salePrice"
              rules={[{ required: true }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(v) => v!.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>

            {editingId && (
              <Form.Item label="Số lượng tồn" name="quantity">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  disabled={!!editingId}
                />
              </Form.Item>
            )}
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

      {/* --- MODAL HIỂN THỊ DANH SÁCH SERIAL --- */}
      <Modal
        title={`Danh sách Serial: ${viewingProductName}`}
        open={serialModalOpen}
        onCancel={() => setSerialModalOpen(false)}
        width={600} 
        footer={[
          <Button key="close" onClick={() => setSerialModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {loadingSerials ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin tip="Đang tải danh sách serial..." />
          </div>
        ) : (
          <List
            size="small"
            bordered
            dataSource={selectedSerials}
            locale={{ emptyText: "Sản phẩm này hiện không có serial nào." }}
            style={{ maxHeight: "400px", overflowY: "auto" }}
            renderItem={(item, index) => (
              <List.Item key={`serial-${index}`}>
                <List.Item.Meta
                  avatar={
                    <Text
                      strong
                      style={{ paddingTop: 4, display: "inline-block" }}
                    >
                      {index + 1}.
                    </Text>
                  }
                  title={
                    <Text code style={{ fontSize: "15px" }}>
                      {item.serialNumber}
                    </Text>
                  }
                  description={
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Ngày thêm: {item.createdDate}
                    </Text>
                  }
                />
                <div>
                  {item.status === "ACTIVE" ? (
                    <Tag color="green">TRONG KHO</Tag>
                  ) : item.status === "INACTIVE" ? (
                    <Tag color="red">ĐÃ BÁN</Tag>
                  ) : (
                    <Tag color="default">{item.status || "KHÔNG RÕ"}</Tag>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default ProductDetailPage;