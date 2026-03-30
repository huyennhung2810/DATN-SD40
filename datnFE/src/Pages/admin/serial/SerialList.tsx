import {
  BarcodeOutlined,
  SearchOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import {
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Image,
  Input,
  Modal,
  Pagination,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { QRCodeSVG } from "qrcode.react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import productCategoryApi from "../../../api/productCategoryApi";
import productApi from "../../../api/productApi";
import productDetailApi from "../../../api/productDetailApi";
import type { SerialPageParams, SerialResponse } from "../../../models/serial";
import type { ProductDetailResponse } from "../../../models/productdetail";
import type { ProductCategoryResponse } from "../../../models/productCategory";
import type { ProductResponse } from "../../../models/product";
import { serialActions } from "../../../redux/serial/serialSlice";
import type { RootState } from "../../../redux/store";

const { Title, Text } = Typography;

function isSerialInOrder(r: SerialResponse): boolean {
  return String(r.serialStatus ?? "").toUpperCase() === "IN_ORDER";
}

function isSerialSold(r: SerialResponse): boolean {
  return String(r.serialStatus ?? "").toUpperCase() === "SOLD";
}

const SerialPage: React.FC = () => {
  const dispatch = useDispatch();

  const {
    list = [],
    loading,
    totalElements = 0,
    currentSerial,
  } = useSelector((state: RootState) => state.serial || {});

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<SerialPageParams>({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
    productCategoryId: undefined,
    productId: undefined,
  });

  const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(
    undefined
  );

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailSerial, setDetailSerial] = useState<SerialResponse | null>(null);
  const [detailVariant, setDetailVariant] = useState<ProductDetailResponse | null>(null);

  useEffect(() => {
    dispatch(serialActions.getAll(filter));
  }, [dispatch, filter]);

  useEffect(() => {
    productCategoryApi
      .getAll()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setLoadingProducts(true);
      productApi
        .search({ page: 0, size: 1000, idProductCategory: selectedCategory })
        .then((res) => setProducts(res.data ?? []))
        .catch(() => setProducts([]))
        .finally(() => setLoadingProducts(false));
    } else {
      setProducts([]);
      if (selectedProduct) {
        setSelectedProduct(undefined);
        setFilter((prev) => ({ ...prev, productId: undefined }));
      }
    }
  }, [selectedCategory]);

  const handleStatusChange = (status: string | undefined) => {
    setFilter((prev) => ({
      ...prev,
      status,
      keyword: keyword.trim(),
      page: 0,
    }));
  };

  const handleCategoryChange = (catId: string | undefined) => {
    setSelectedCategory(catId);
    setFilter((prev) => ({ ...prev, productCategoryId: catId, page: 0 }));
  };

  const handleProductChange = (prodId: string | undefined) => {
    setSelectedProduct(prodId);
    setFilter((prev) => ({ ...prev, productId: prodId, page: 0 }));
  };

  const handleKeywordSearch = () => {
    setFilter((prev) => ({ ...prev, keyword: keyword.trim(), page: 0 }));
  };

  const handleViewDetail = async (serial: SerialResponse) => {
    setDetailSerial(serial);
    setDetailVariant(null);
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await productDetailApi.getById(serial.productDetailId ?? "");
      setDetailVariant(res);
    } catch {
      setDetailVariant(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDetailModalClose = () => {
    setDetailModalOpen(false);
    setDetailSerial(null);
    setDetailVariant(null);
  };

  const columns: ColumnsType<SerialResponse> = [
    {
      title: "STT",
      align: "center",
      width: 60,
      render: (_, __, i) => filter.page * filter.size + i + 1,
    },
    {
      title: "Serial Number",
      key: "serialNumber",
      render: (r) => (
        <Text
          strong
          style={{ cursor: "pointer", color: "#1677ff" }}
          onClick={() => handleViewDetail(r)}
        >
          {r.serialNumber}
        </Text>
      ),
    },
    {
      title: "QR Code",
      align: "center",
      render: (r) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <QRCodeSVG value={r.serialNumber} size={64} />
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      render: (v) => (
        <div>
          <Text strong>{v || "---"}</Text>
        </div>
      ),
    },
    {
      title: "Ngày nhập",
      dataIndex: "createdDate",
      align: "center",
      render: (d) => (
        <div>
          {d ? dayjs(d, "DD/MM/YYYY HH:mm:ss").format("DD/MM/YYYY") : "---"}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "serialStatus",
      align: "center",
      render: (ss) => {
        const sold = isSerialSold({ serialStatus: ss } as SerialResponse);
        const inOrder = isSerialInOrder({ serialStatus: ss } as SerialResponse);
        return (
          <Tag color={sold ? "gold" : inOrder ? "processing" : "success"}>
            {sold ? "ĐÃ BÁN" : inOrder ? "ĐANG TRONG ĐƠN" : "TRONG KHO"}
          </Tag>
        );
      },
    },
  ];

  return (
    <>
      {/* Header */}
      <div
        className="solid-card"
        style={{ padding: "var(--spacing-lg)", marginBottom: 16 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                backgroundColor: "var(--color-primary-light)",
                padding: "12px",
                borderRadius: "var(--radius-md)",
              }}
            >
              <BarcodeOutlined
                style={{
                  fontSize: "24px",
                  color: "var(--color-primary)",
                }}
              />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                Quản lý Serial
              </Title>
              <Text type="secondary" style={{ fontSize: "13px" }}>
                Quản lý mã Serial và trạng thái sản phẩm
              </Text>
            </div>
          </div>
          <Text type="secondary">
            Tổng: <b>{totalElements}</b> serial
          </Text>
        </div>
      </div>

      {/* Filter Card */}
      <Card
        variant="borderless"
        style={{
          borderRadius: "12px",
          marginBottom: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item label={<Text strong>Loại sản phẩm</Text>}>
                <Select
                  placeholder="-- Chọn loại sản phẩm --"
                  allowClear
                  size="large"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label={<Text strong>Sản phẩm</Text>}>
                <Select
                  placeholder={
                    selectedCategory
                      ? "-- Chọn sản phẩm --"
                      : "-- Chọn loại sản phẩm trước --"
                  }
                  allowClear
                  size="large"
                  value={selectedProduct}
                  onChange={handleProductChange}
                  disabled={!selectedCategory}
                  loading={loadingProducts}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  notFoundContent={
                    !selectedCategory ? (
                      <Text type="secondary">Vui lòng chọn loại sản phẩm trước</Text>
                    ) : loadingProducts ? (
                      <Spin size="small" />
                    ) : null
                  }
                  options={products.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label={
                  <Text strong>
                    <SearchOutlined /> Tìm kiếm Serial
                  </Text>
                }
              >
                <Input.Search
                  placeholder="Nhập số Serial hoặc mã định danh..."
                  size="large"
                  allowClear
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onSearch={handleKeywordSearch}
                  enterButton="Tìm"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24}>
              <Form.Item label={<Text strong>Trạng thái sản phẩm</Text>}>
                <Radio.Group
                  size="large"
                  buttonStyle="solid"
                  value={filter.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <Radio.Button
                    value={undefined}
                    style={{ minWidth: "100px", textAlign: "center" }}
                  >
                    Tất cả
                  </Radio.Button>
                  <Radio.Button
                    value="ACTIVE"
                    style={{ minWidth: "100px", textAlign: "center" }}
                  >
                    <Tag
                      color="success"
                      style={{
                        border: "none",
                        background: "transparent",
                        margin: 0,
                      }}
                    >
                      Trong kho
                    </Tag>
                  </Radio.Button>
                  <Radio.Button
                    value="INACTIVE"
                    style={{ minWidth: "100px", textAlign: "center" }}
                  >
                    <Tag
                      color="gold"
                      style={{
                        border: "none",
                        background: "transparent",
                        margin: 0,
                      }}
                    >
                      Đã bán
                    </Tag>
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Table */}
      <Card title={`Danh sách (${totalElements})`}>
        <Table
          columns={columns}
          dataSource={list}
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

      {/* Detail Modal */}
      <Modal
        title={
          <span>
            <AppstoreOutlined /> Chi tiết Serial
          </span>
        }
        open={detailModalOpen}
        onCancel={handleDetailModalClose}
        footer={null}
        width={680}
        destroyOnHidden
      >
        <Spin spinning={detailLoading}>
          {!detailSerial && !detailLoading ? (
            <Text type="secondary">Không có dữ liệu.</Text>
          ) : (
            <>
              {/* Serial info section */}
              <Card
                size="small"
                style={{ marginBottom: 16, background: "#fafafa" }}
              >
                <Descriptions column={2} size="small" colon>
                  <Descriptions.Item label="Mã Serial">
                    <Text strong style={{ color: "#1677ff" }}>
                      {detailSerial?.serialNumber ?? "---"}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã code">
                    <Text code>{detailSerial?.code ?? "---"}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag
                      color={
                        isSerialSold(detailSerial as SerialResponse)
                          ? "gold"
                          : isSerialInOrder(detailSerial as SerialResponse)
                            ? "processing"
                            : "success"
                      }
                    >
                      {isSerialSold(detailSerial as SerialResponse)
                        ? "ĐÃ BÁN"
                        : isSerialInOrder(detailSerial as SerialResponse)
                          ? "ĐANG TRONG ĐƠN"
                          : "TRONG KHO"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày nhập">
                    {detailSerial?.createdDate
                      ? dayjs(
                          detailSerial.createdDate,
                          "DD/MM/YYYY HH:mm:ss"
                        ).format("DD/MM/YYYY HH:mm")
                      : "---"}
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <QRCodeSVG
                    value={detailSerial?.serialNumber ?? ""}
                    size={120}
                  />
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {detailSerial?.serialNumber}
                    </Text>
                  </div>
                </div>
              </Card>

              {/* Variant info section */}
              <Divider orientation="left" plain>
                Thông tin biến thể sản phẩm
              </Divider>

              {detailVariant ? (
                <Card size="small">
                  <Row gutter={[16, 12]}>
                    <Col xs={24} md={12}>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Sản phẩm">
                          <Text strong>{detailVariant.productName ?? "---"}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mã sản phẩm">
                          {detailVariant.productCode ?? "---"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mã biến thể">
                          {detailVariant.code ?? "---"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phiên bản">
                          {detailVariant.variantVersionDisplayName ?? detailVariant.variantVersion ?? "---"}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>

                    <Col xs={24} md={12}>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Màu sắc">
                          <Space>
                            {detailVariant.colorName ?? "---"}
                            {detailVariant.colorId && (
                              <Tag>{detailVariant.colorName}</Tag>
                            )}
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Dung lượng">
                          {detailVariant.storageCapacityName ?? "---"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giá bán">
                          <Text strong style={{ color: "#1677ff" }}>
                            {detailVariant.salePrice
                              ? new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(Number(detailVariant.salePrice))
                              : "---"}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Số lượng tồn">
                          <Text>{detailVariant.quantity ?? 0}</Text>
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>

                    {/* Variant image */}
                    {detailVariant.imageUrl && (
                      <Col xs={24}>
                        <Divider plain style={{ margin: "8px 0" }} />
                        <div>
                          <Text type="secondary">Hình ảnh biến thể: </Text>
                          <Image
                            src={detailVariant.imageUrl}
                            width={120}
                            style={{ borderRadius: 8, marginTop: 8 }}
                            placeholder={
                              <div
                                style={{
                                  background: "#f0f0f0",
                                  width: 120,
                                  height: 90,
                                  borderRadius: 8,
                                }}
                              />
                            }
                          />
                        </div>
                      </Col>
                    )}

                    {/* Selected image from product */}
                    {detailVariant.selectedImage?.url && (
                      <Col xs={24}>
                        <Text type="secondary">Hình ảnh đại diện: </Text>
                        <Image
                          src={detailVariant.selectedImage.url}
                          width={120}
                          style={{ borderRadius: 8, marginTop: 8 }}
                        />
                      </Col>
                    )}

                    {/* Note */}
                    {detailVariant.note && (
                      <Col xs={24}>
                        <Text type="secondary">Ghi chú: </Text>
                        <Text>{detailVariant.note}</Text>
                      </Col>
                    )}
                  </Row>
                </Card>
              ) : !detailLoading ? (
                <Text type="secondary">
                  Không tìm thấy thông tin biến thể sản phẩm.
                </Text>
              ) : null}
            </>
          )}
        </Spin>
      </Modal>
    </>
  );
};

export default SerialPage;
