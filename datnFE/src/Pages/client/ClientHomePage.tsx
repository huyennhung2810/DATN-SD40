import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Input,
  Select,
  Row,
  Col,
  Spin,
  Empty,
  Button,
  Typography,
  Carousel,
  Pagination,
  Form,
} from "antd";
import {
  SearchOutlined,
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import bannerApi from "../../api/bannerApi";
import productApi from "../../api/productApi";
import productCategoryApi from "../../api/productCategoryApi";
import sensorTypeApi from "../../api/sensorTypeApi";
import lensMountApi from "../../api/lensMountApi";
import resolutionApi from "../../api/resolutionApi";
import processorApi from "../../api/processorApi";
import imageFormatApi from "../../api/imageFormatApi";
import videoFormatApi from "../../api/videoFormatApi";
import type { BannerResponse } from "../../models/banner";
import type { ProductResponse, ProductPageParams } from "../../models/product";
import type { ProductCategoryResponse } from "../../models/productCategory";

const { Title, Text } = Typography;
const { Search } = Input;

// Banner Slider Component
const BannerSlider: React.FC<{ banners: BannerResponse[] }> = ({ banners }) => {
  const navigate = useNavigate();
  
  if (banners.length === 0) {
    return (
      <div
        style={{
          height: 400,
          backgroundColor: "#ff4d4f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "#fff" }}>
          <Title level={2} style={{ color: "#fff", margin: 0 }}>
            Chào mừng đến với Hikari Camera
          </Title>
          <Text style={{ color: "#fff", fontSize: 16 }}>
            Chuyên máy ảnh và linh phụ kiện chính hãng
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <Carousel
        autoplay
        autoplaySpeed={5000}
        arrows
        prevArrow={<LeftOutlined style={{ fontSize: 20, color: "#fff" }} />}
        nextArrow={<RightOutlined style={{ fontSize: 20, color: "#fff" }} />}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            style={{
              height: 400,
              position: "relative",
              cursor: banner.targetUrl ? "pointer" : "default",
            }}
            onClick={() => {
              if (banner.targetUrl) {
                navigate(banner.targetUrl);
              }
            }}
          >
            <img
              src={banner.imageUrl}
              alt={banner.title}
              style={{
                width: "100%",
                height: 400,
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                padding: "40px 60px",
                color: "#fff",
              }}
            >
              <Title level={2} style={{ color: "#fff", margin: 0 }}>
                {banner.title}
              </Title>
              {banner.description && (
                <Text style={{ color: "#fff", fontSize: 16 }}>
                  {banner.description}
                </Text>
              )}
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

// Product Card Component
const ProductCard: React.FC<{ product: ProductResponse }> = ({ product }) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      onClick={() => navigate(`/client/products/${product.id}`)}
      cover={
        <div
          style={{
            height: 220,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
            position: "relative",
          }}
        >
          {product.imageUrls && product.imageUrls.length > 0 ? (
            <img
              src={product.imageUrls[0]}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: 16,
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Text type="secondary">Chưa có hình ảnh</Text>
            </div>
          )}
        </div>
      }
    >
      <Card.Meta
        title={
          <Text strong style={{ fontSize: 15 }} ellipsis={{ rows: 2 }}>
            {product.name}
          </Text>
        }
        description={
          <div style={{ marginTop: 8 }}>
            {product.productCategoryName && (
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                {product.productCategoryName}
              </Text>
            )}
            {product.price && (
              <Text strong style={{ fontSize: 16, color: "#ff4d4f", display: "block", marginTop: 8 }}>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(product.price)}
              </Text>
            )}
          </div>
        }
      />
    </Card>
  );
};

interface FilterOption {
  id: string;
  name: string;
}

const ClientHomePage: React.FC = () => {
  const [form] = Form.useForm();
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filter states
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedSensorType, setSelectedSensorType] = useState<string | undefined>();
  const [selectedLensMount, setSelectedLensMount] = useState<string | undefined>();
  const [selectedResolution, setSelectedResolution] = useState<string | undefined>();
  const [selectedProcessor, setSelectedProcessor] = useState<string | undefined>();
  const [selectedImageFormat, setSelectedImageFormat] = useState<string | undefined>();
  const [selectedVideoFormat, setSelectedVideoFormat] = useState<string | undefined>();
  const [selectedIso, setSelectedIso] = useState<string | undefined>();

  // Filter options (loaded from API)
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);
  const [sensorTypes, setSensorTypes] = useState<FilterOption[]>([]);
  const [lensMounts, setLensMounts] = useState<FilterOption[]>([]);
  const [resolutions, setResolutions] = useState<FilterOption[]>([]);
  const [processors, setProcessors] = useState<FilterOption[]>([]);
  const [imageFormats, setImageFormats] = useState<FilterOption[]>([]);
  const [videoFormats, setVideoFormats] = useState<FilterOption[]>([]);

  const [filter, setFilter] = useState<ProductPageParams>({
    page: 0,
    size: 12,
    name: "",
    idProductCategory: undefined,
    status: "ACTIVE",
  });

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const [catRes, sensorRes, lensRes, resRes, procRes, imgRes, vidRes] = await Promise.all([
        productCategoryApi.search({ page: 0, size: 1000 }),
        sensorTypeApi.search({ page: 0, size: 1000, keyword: "" }),
        lensMountApi.search({ page: 0, size: 1000, keyword: "" }),
        resolutionApi.search({ page: 0, size: 1000, keyword: "" }),
        processorApi.search({ page: 0, size: 1000, keyword: "" }),
        imageFormatApi.search({ page: 0, size: 1000, keyword: "" }),
        videoFormatApi.search({ page: 0, size: 1000, keyword: "" }),
      ]);
      
      setCategories(catRes.data);
      setSensorTypes(sensorRes.data);
      setLensMounts(lensRes.data);
      setResolutions(resRes.data);
      setProcessors(procRes.data);
      setImageFormats(imgRes.data);
      setVideoFormats(vidRes.data);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }, []);

  // Fetch banners
  const fetchBanners = useCallback(async () => {
    try {
      const data = await bannerApi.getActiveBanners();
      const sortedBanners = [...data].sort((a, b) => a.displayOrder - b.displayOrder);
      setBanners(sortedBanners);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setProductLoading(true);
    try {
      const result = await productApi.search(filter);
      setProducts(result.data);
      setTotalProducts(result.totalElements);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBanners(), fetchFilterOptions()]);
      setLoading(false);
    };
    loadData();
  }, [fetchBanners, fetchFilterOptions]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounce search and filters
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilter((prev) => ({
        ...prev,
        name: keyword.trim(),
        idProductCategory: selectedCategory,
        sensorType: selectedSensorType,
        lensMount: selectedLensMount,
        resolution: selectedResolution,
        processor: selectedProcessor,
        imageFormat: selectedImageFormat,
        videoFormat: selectedVideoFormat,
        iso: selectedIso?.trim() || undefined,
        page: 0,
      }));
    }, 300);
    return () => clearTimeout(timeout);
  }, [keyword, selectedCategory, selectedSensorType, selectedLensMount, selectedResolution, selectedProcessor, selectedImageFormat, selectedVideoFormat, selectedIso]);

  const handlePageChange = (page: number, pageSize: number) => {
    setFilter((prev) => ({ ...prev, page: page - 1, size: pageSize }));
  };

  const handleResetFilters = () => {
    form.resetFields();
    setKeyword("");
    setSelectedCategory(undefined);
    setSelectedSensorType(undefined);
    setSelectedLensMount(undefined);
    setSelectedResolution(undefined);
    setSelectedProcessor(undefined);
    setSelectedImageFormat(undefined);
    setSelectedVideoFormat(undefined);
    setSelectedIso(undefined);
    setFilter({
      page: 0,
      size: 12,
      name: "",
      idProductCategory: undefined,
      status: "ACTIVE",
    });
  };

  return (
    <div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 100 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Banner Slider */}
          <BannerSlider banners={banners} />

          {/* Main Content */}
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
            {/* Products Section */}
            <div style={{ marginBottom: 24 }}>
              <Title level={3} style={{ marginBottom: 24, color: "#333" }}>
                Sản phẩm nổi bật
              </Title>

              {/* Filters */}
              <Card 
                style={{ marginBottom: 24 }}
                title={<span><SearchOutlined /> Bộ lọc tìm kiếm</span>}
                extra={
                  <TooltipButton title="Làm mới bộ lọc">
                    <Button
                      shape="circle"
                      icon={<ReloadOutlined />}
                      onClick={handleResetFilters}
                      type="primary"
                      ghost
                    />
                  </TooltipButton>
                }
              >
                <Form form={form} layout="vertical">
                  <Row gutter={[16, 16]}>
                    {/* Row 1 */}
                    <Col xs={24} md={6}>
                      <Form.Item name="keyword" label="Tìm kiếm">
                        <Search
                          placeholder="Nhập tên sản phẩm..."
                          allowClear
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={5}>
                      <Form.Item name="idProductCategory" label="Loại sản phẩm">
                        <Select
                          placeholder="Tất cả loại"
                          allowClear
                          value={selectedCategory}
                          onChange={(val) => setSelectedCategory(val)}
                          options={categories.map((cat) => ({
                            label: cat.name,
                            value: cat.id,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                      <Form.Item name="sensorType" label="Loại cảm biến">
                        <Select
                          placeholder="Tất cả"
                          allowClear
                          showSearch
                          optionFilterProp="children"
                          value={selectedSensorType}
                          onChange={(val) => setSelectedSensorType(val)}
                          options={sensorTypes.map((item) => ({
                            label: item.name,
                            value: item.name,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={5}>
                      <Form.Item name="lensMount" label="Ngàm lens">
                        <Select
                          placeholder="Tất cả"
                          allowClear
                          showSearch
                          optionFilterProp="children"
                          value={selectedLensMount}
                          onChange={(val) => setSelectedLensMount(val)}
                          options={lensMounts.map((item) => ({
                            label: item.name,
                            value: item.name,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                      <Button onClick={handleResetFilters} block style={{ marginTop: 29 }}>
                        Xóa bộ lọc
                      </Button>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    {/* Row 2 */}
                    <Col xs={24} md={4}>
                      <Form.Item name="resolution" label="Độ phân giải">
                        <Select
                          placeholder="Tất cả"
                          allowClear
                          showSearch
                          optionFilterProp="children"
                          value={selectedResolution}
                          onChange={(val) => setSelectedResolution(val)}
                          options={resolutions.map((item) => ({
                            label: item.name,
                            value: item.name,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                      <Form.Item name="processor" label="Bộ xử lý">
                        <Select
                          placeholder="Tất cả"
                          allowClear
                          showSearch
                          optionFilterProp="children"
                          value={selectedProcessor}
                          onChange={(val) => setSelectedProcessor(val)}
                          options={processors.map((item) => ({
                            label: item.name,
                            value: item.name,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                      <Form.Item name="imageFormat" label="Định dạng ảnh">
                        <Select
                          placeholder="Tất cả"
                          allowClear
                          showSearch
                          optionFilterProp="children"
                          value={selectedImageFormat}
                          onChange={(val) => setSelectedImageFormat(val)}
                          options={imageFormats.map((item) => ({
                            label: item.name,
                            value: item.name,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                      <Form.Item name="videoFormat" label="Định dạng video">
                        <Select
                          placeholder="Tất cả"
                          allowClear
                          showSearch
                          optionFilterProp="children"
                          value={selectedVideoFormat}
                          onChange={(val) => setSelectedVideoFormat(val)}
                          options={videoFormats.map((item) => ({
                            label: item.name,
                            value: item.name,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                      <Form.Item name="iso" label="ISO">
                        <Input
                          placeholder="ví dụ: 100-51200"
                          allowClear
                          value={selectedIso}
                          onChange={(e) => setSelectedIso(e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>

              {/* Products Grid */}
              {productLoading ? (
                <div style={{ textAlign: "center", padding: 50 }}>
                  <Spin size="large" />
                </div>
              ) : products.length === 0 ? (
                <Empty description="Không tìm thấy sản phẩm nào" />
              ) : (
                <>
                  <Row gutter={[16, 16]}>
                    {products.map((product) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                        <ProductCard product={product} />
                      </Col>
                    ))}
                  </Row>

                  {/* Pagination */}
                  {totalProducts > 0 && (
                    <div style={{ marginTop: 32, textAlign: "center" }}>
                      <Pagination
                        current={filter.page + 1}
                        pageSize={filter.size}
                        total={totalProducts}
                        onChange={handlePageChange}
                        showSizeChanger
                        pageSizeOptions={["12", "24", "48"]}
                        showTotal={(total) => `Tổng ${total} sản phẩm`}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Tooltip button helper
const TooltipButton: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  return (
    <span style={{ cursor: "pointer" }} title={title}>
      {children}
    </span>
  );
};

export default ClientHomePage;
