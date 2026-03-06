import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Skeleton, Empty, Button, Tabs, Tag } from "antd";
import {
  FireOutlined,
  ThunderboltOutlined,
  StarFilled,
  ArrowRightOutlined,
} from "@ant-design/icons";
import BannerCarousel from "../../components/customer/BannerCarousel";
import ProductCard from "../../components/customer/ProductCard";
import { bannerApi } from "../../api/customerApi";
import { customerProductApi } from "../../api/customerProductApi";
import type { BannerResponse } from "../../models/banner";
import type { ProductResponse } from "../../models/product";

const { Title, Text } = Typography;

// Camera-specific categories for shortcuts
const cameraCategories = [
  { key: "may-anh", name: "Máy ảnh", icon: "📷", href: "/client/catalog?category=may-anh" },
  { key: "ong-kinh", name: "Ống kính", icon: "🔭", href: "/client/catalog?category=ong-kinh" },
  { key: "action-cam", name: "Action Cam", icon: "🎥", href: "/client/catalog?category=action-cam" },
  { key: "gimbal", name: "Gimbal", icon: "🎬", href: "/client/catalog?category=gimbal" },
  { key: "tripod", name: "Tripod", icon: "📐", href: "/client/catalog?category=tripod" },
  { key: "flash", name: "Flash", icon: "⚡", href: "/client/catalog?category=flash" },
  { key: "micro", name: "Micro", icon: "🎤", href: "/client/catalog?category=micro" },
  { key: "phu-kien", name: "Phụ kiện", icon: "🎒", href: "/client/catalog?category=phu-kien" },
  { key: "the-nho", name: "Thẻ nhớ", icon: "💾", href: "/client/catalog?category=the-nho" },
  { key: "kinh-loc", name: "Kính lọc", icon: "🔲", href: "/client/catalog?category=kinh-loc" },
];

// Camera brands
const cameraBrands = [
  { name: "Canon", color: "#000", href: "/client/catalog?brand=canon" },
  { name: "Sony", color: "#000", href: "/client/catalog?brand=sony" },
  { name: "Nikon", color: "#000", href: "/client/catalog?brand=nikon" },
  { name: "Fujifilm", color: "#000", href: "/client/catalog?brand=fujifilm" },
  { name: "Panasonic", color: "#000", href: "/client/catalog?brand=panasonic" },
  { name: "Sigma", color: "#000", href: "/client/catalog?brand=sigma" },
  { name: "Tamron", color: "#000", href: "/client/catalog?brand=tamron" },
  { name: "DJI", color: "#000", href: "/client/catalog?brand=dji" },
];

// Services / Benefits
const services = [
  { icon: "🛡️", title: "Chính hãng 100%", desc: "Đảm bảo chất lượng" },
  { icon: "🔧", title: "Bảo hành 12-24 tháng", desc: "Tiêu chuẩn hãng" },
  { icon: "🚚", title: "Giao hàng nhanh", desc: "Miễn phí >2 triệu" },
  { icon: "💳", title: "Trả góp 0%", desc: "Lãi suất thấp" },
];

const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<ProductResponse[]>([]);
  const [newProducts, setNewProducts] = useState<ProductResponse[]>([]);
  const [saleProducts, setSaleProducts] = useState<ProductResponse[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Load banners
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setBannersLoading(true);
        const data = await bannerApi.getActiveBanners("HOME_HERO");
        setBanners(data);
      } catch (error) {
        console.error("Error loading banners:", error);
        setBanners([]);
      } finally {
        setBannersLoading(false);
      }
    };
    loadBanners();
  }, []);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const [featuredRes, newRes, saleRes] = await Promise.all([
          customerProductApi.getProducts({ page: 1, size: 8, status: "ACTIVE" }),
          customerProductApi.getProducts({ page: 1, size: 8, status: "ACTIVE" }),
          customerProductApi.getProducts({ page: 1, size: 4, status: "ACTIVE" }),
        ]);
        setFeaturedProducts(featuredRes.data || []);
        setNewProducts(newRes.data || []);
        setSaleProducts(saleRes.data?.slice(0, 4) || []);
      } catch (error) {
        console.error("Error loading products:", error);
        setFeaturedProducts([]);
        setNewProducts([]);
        setSaleProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleViewProduct = (product: ProductResponse) => {
    console.log("View product:", product.id);
  };

  // Tab items for brand sections
  const brandTabItems = cameraBrands.map((brand) => ({
    key: brand.name.toLowerCase(),
    label: brand.name,
    children: (
      <Row gutter={[16, 16]}>
        {productsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Col xs={12} sm={12} md={6} key={index}>
              <Skeleton.Image active className="w-full aspect-square" />
              <Skeleton active paragraph={{ rows: 2 }} />
            </Col>
          ))
        ) : featuredProducts.length > 0 ? (
          featuredProducts.slice(0, 4).map((product) => (
            <Col xs={12} sm={12} md={6} key={product.id}>
              <ProductCard product={product} onViewDetail={handleViewProduct} />
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty description="Chưa có sản phẩm" />
          </Col>
        )}
      </Row>
    ),
  }));

  return (
    <>
      {/* Hero Banner with Promo Strip */}
      <BannerCarousel
        banners={banners}
        loading={bannersLoading}
        onBannerClick={(linkUrl) => {
          if (linkUrl) {
            window.open(linkUrl, "_blank");
          }
        }}
      />

      {/* Category Shortcuts */}
      <section className="category-shortcuts">
        <div className="container mx-auto px-4">
          <div className="shortcuts-grid">
            {cameraCategories.map((category) => (
              <a key={category.key} href={category.href} className="shortcut-item">
                <div className="shortcut-icon">{category.icon}</div>
                <Text strong className="shortcut-name">{category.name}</Text>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Services Banner */}
      <section className="services-section">
        <div className="container mx-auto px-4">
          <Row gutter={[16, 16]} justify="center">
            {services.map((service, index) => (
              <Col xs={12} sm={6} key={index}>
                <div className="service-card">
                  <span className="service-icon">{service.icon}</span>
                  <div className="service-info">
                    <Text strong className="service-title">{service.title}</Text>
                    <Text type="secondary" className="service-desc">{service.desc}</Text>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="flash-sale-section">
        <div className="container mx-auto px-4">
          <div className="section-header-flash">
            <div className="flash-header-left">
              <FireOutlined className="flash-icon" />
              <Title level={3} className="flash-title">FLASH SALE</Title>
              <Tag color="red" className="countdown-tag">Kết thúc sau: 02:15:30</Tag>
            </div>
            <a href="/client/catalog?sale=true" className="view-all-link">
              Xem tất cả <ArrowRightOutlined />
            </a>
          </div>
          <Row gutter={[12, 12]}>
            {productsLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Col xs={12} sm={12} md={6} key={index}>
                  <Skeleton.Image active className="w-full aspect-square" />
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Col>
              ))
            ) : saleProducts.length > 0 ? (
              saleProducts.map((product) => (
                <Col xs={12} sm={12} md={6} key={product.id}>
                  <ProductCard product={product} onViewDetail={handleViewProduct} />
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Empty description="Chưa có sản phẩm giảm giá" />
              </Col>
            )}
          </Row>
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <div className="container mx-auto px-4">
          <div className="section-header">
            <div className="section-title-group">
              <ThunderboltOutlined className="section-icon" />
              <Title level={3} className="section-title">SẢN PHẨM NỔI BẬT</Title>
            </div>
            <a href="/client/catalog" className="view-all-link">
              Xem tất cả <ArrowRightOutlined />
            </a>
          </div>
          <Row gutter={[16, 16]}>
            {productsLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <Col xs={12} sm={12} md={8} lg={6} key={index}>
                  <Skeleton.Image active className="w-full aspect-square" />
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Col>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.slice(0, 8).map((product) => (
                <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
                  <ProductCard product={product} onViewDetail={handleViewProduct} />
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Empty description="Chưa có sản phẩm" />
              </Col>
            )}
          </Row>
        </div>
      </section>

      {/* Promo Banners */}
      <section className="promo-banners-section">
        <div className="container mx-auto px-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <a href="/client/catalog?brand=sony" className="promo-banner promo-banner-1">
                <div className="promo-banner-content">
                  <Text className="promo-tag">SONY ALPHA</Text>
                  <Title level={4} className="promo-title">Mirrorless Hotsale</Title>
                  <Text className="promo-desc">Giảm đến 15% + Quà tặng</Text>
                  <Button type="primary" className="promo-btn">Xem ngay</Button>
                </div>
                <div className="promo-banner-bg">📷</div>
              </a>
            </Col>
            <Col xs={24} md={12}>
              <a href="/client/catalog?brand=canon" className="promo-banner promo-banner-2">
                <div className="promo-banner-content">
                  <Text className="promo-tag">CANON EOS</Text>
                  <Title level={4} className="promo-title">R Series Mới</Title>
                  <Text className="promo-desc">Trả góp 0% + Tặng lens</Text>
                  <Button type="primary" className="promo-btn">Xem ngay</Button>
                </div>
                <div className="promo-banner-bg">📸</div>
              </a>
            </Col>
          </Row>
        </div>
      </section>

      {/* Products by Brand */}
      <section className="brand-products-section">
        <div className="container mx-auto px-4">
          <div className="section-header">
            <div className="section-title-group">
              <StarFilled className="section-icon" />
              <Title level={3} className="section-title">SẢN PHẨM THEO THƯƠNG HIỆU</Title>
            </div>
          </div>
          <Tabs items={brandTabItems} className="brand-tabs" />
        </div>
      </section>

      {/* New Products */}
      <section className="products-section bg-light">
        <div className="container mx-auto px-4">
          <div className="section-header">
            <div className="section-title-group">
              <ThunderboltOutlined className="section-icon new-icon" />
              <Title level={3} className="section-title">HÀNG MỚI VỀ</Title>
            </div>
            <a href="/client/catalog?new=true" className="view-all-link">
              Xem tất cả <ArrowRightOutlined />
            </a>
          </div>
          <Row gutter={[16, 16]}>
            {productsLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Col xs={12} sm={12} md={6} key={index}>
                  <Skeleton.Image active className="w-full aspect-square" />
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Col>
              ))
            ) : newProducts.length > 0 ? (
              newProducts.slice(0, 4).map((product) => (
                <Col xs={12} sm={12} md={6} key={product.id}>
                  <ProductCard product={product} onViewDetail={handleViewProduct} />
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Empty description="Chưa có sản phẩm mới" />
              </Col>
            )}
          </Row>
        </div>
      </section>

      {/* Brand Logos */}
      <section className="brand-logos-section">
        <div className="container mx-auto px-4">
          <div className="section-header centered">
            <Title level={3} className="section-title">THƯƠNG HIỆU NỔI TIẾNG</Title>
          </div>
          <div className="brand-logos-grid">
            {cameraBrands.map((brand) => (
              <a key={brand.name} href={brand.href} className="brand-logo-item">
                <div className="brand-logo-box">
                  <span className="brand-logo-text">{brand.name.charAt(0)}</span>
                </div>
                <Text strong className="brand-logo-name">{brand.name}</Text>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container mx-auto px-4">
          <div className="cta-content">
            <Title level={2} className="cta-title">Cần tư vấn chọn máy?</Title>
            <Text className="cta-desc">Đội ngũ chuyên viên kỹ thuật của HIKARI Camera sẵn sàng hỗ trợ bạn</Text>
            <div className="cta-buttons">
              <Button type="primary" size="large" className="cta-btn-primary">
                Liên hệ tư vấn
              </Button>
              <Button size="large" className="cta-btn-secondary">
                Xem danh mục
              </Button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* Section Styles */
        .products-section {
          padding: 48px 0;
        }

        .products-section.bg-light {
          background: #F9FAFB;
        }

        /* Category Shortcuts */
        .category-shortcuts {
          background: #fff;
          padding: 24px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .shortcuts-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        @media (min-width: 768px) {
          .shortcuts-grid {
            grid-template-columns: repeat(10, 1fr);
            gap: 8px;
          }
        }

        .shortcut-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 8px;
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.3s;
          background: #fff;
        }

        .shortcut-item:hover {
          background: #FFF5F5;
          transform: translateY(-4px);
        }

        .shortcut-icon {
          font-size: 28px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          border-radius: 12px;
        }

        .shortcut-item:hover .shortcut-icon {
          background: #D32F2F;
        }

        .shortcut-name {
          font-size: 12px;
          color: #333;
          text-align: center;
        }

        @media (max-width: 767px) {
          .shortcut-name {
            font-size: 10px;
          }

          .shortcut-icon {
            width: 40px;
            height: 40px;
            font-size: 22px;
          }
        }

        /* Services Section */
        .services-section {
          background: linear-gradient(180deg, #FFF5F5 0%, #fff 100%);
          padding: 32px 0;
        }

        .service-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.3s;
        }

        .service-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .service-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .service-info {
          flex: 1;
        }

        .service-title {
          display: block;
          font-size: 14px;
          color: #333;
          margin-bottom: 2px;
        }

        .service-desc {
          font-size: 12px;
        }

        /* Flash Sale Section */
        .flash-sale-section {
          padding: 32px 0;
          background: #fff;
        }

        .section-header-flash {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .flash-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .flash-icon {
          font-size: 28px;
          color: #D32F2F;
          animation: flashPulse 1s infinite;
        }

        @keyframes flashPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .flash-title {
          color: #D32F2F !important;
          margin: 0 !important;
          font-weight: 800 !important;
        }

        .countdown-tag {
          font-size: 14px;
          font-weight: 600;
          padding: 4px 12px;
        }

        /* Section Header */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .section-header.centered {
          flex-direction: column;
          text-align: center;
        }

        .section-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-icon {
          font-size: 24px;
          color: #D32F2F;
        }

        .section-icon.new-icon {
          color: #2196F3;
        }

        .section-title {
          color: #333 !important;
          margin: 0 !important;
          font-weight: 700 !important;
          font-size: 20px !important;
        }

        .view-all-link {
          color: #D32F2F;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .view-all-link:hover {
          gap: 8px;
        }

        /* Promo Banners */
        .promo-banners-section {
          padding: 32px 0;
        }

        .promo-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 32px;
          border-radius: 16px;
          text-decoration: none;
          min-height: 160px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .promo-banner:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .promo-banner-1 {
          background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
          color: #fff;
        }

        .promo-banner-2 {
          background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
          color: #fff;
        }

        .promo-banner-content {
          position: relative;
          z-index: 2;
        }

        .promo-tag {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .promo-title {
          color: #fff !important;
          margin: 0 0 4px 0 !important;
        }

        .promo-desc {
          color: rgba(255, 255, 255, 0.9) !important;
          font-size: 14px;
        }

        .promo-btn {
          margin-top: 16px !important;
          background: #fff !important;
          border: none !important;
          color: #333 !important;
          font-weight: 600;
        }

        .promo-banner-2 .promo-btn {
          color: #D32F2F !important;
        }

        .promo-banner-bg {
          font-size: 80px;
          opacity: 0.3;
          position: absolute;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
        }

        /* Brand Products Section */
        .brand-products-section {
          padding: 48px 0;
          background: #fff;
        }

        .brand-tabs :global(.ant-tabs-nav) {
          margin-bottom: 24px;
        }

        .brand-tabs :global(.ant-tabs-tab) {
          padding: 12px 20px;
          font-weight: 600;
        }

        .brand-tabs :global(.ant-tabs-tab-active) {
          color: #D32F2F;
        }

        .brand-tabs :global(.ant-tabs-ink-bar) {
          background: #D32F2F;
        }

        /* Brand Logos */
        .brand-logos-section {
          padding: 48px 0;
          background: #F9FAFB;
        }

        .brand-logos-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (min-width: 768px) {
          .brand-logos-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .brand-logos-grid {
            grid-template-columns: repeat(8, 1fr);
          }
        }

        .brand-logo-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px 16px;
          background: #fff;
          border-radius: 12px;
          text-decoration: none;
          border: 1px solid #f0f0f0;
          transition: all 0.3s;
        }

        .brand-logo-item:hover {
          border-color: #D32F2F;
          box-shadow: 0 4px 16px rgba(211, 47, 47, 0.1);
        }

        .brand-logo-box {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
          border-radius: 12px;
        }

        .brand-logo-text {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
        }

        .brand-logo-name {
          font-size: 13px;
          color: #333;
        }

        /* CTA Section */
        .cta-section {
          padding: 64px 0;
          background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
        }

        .cta-content {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-title {
          color: #fff !important;
          margin-bottom: 12px !important;
        }

        .cta-desc {
          color: rgba(255, 255, 255, 0.9) !important;
          font-size: 16px;
          display: block;
          margin-bottom: 24px;
        }

        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-btn-primary {
          background: #fff !important;
          color: #D32F2F !important;
          border: none !important;
          height: 48px !important;
          padding: 0 32px !important;
          font-weight: 600 !important;
        }

        .cta-btn-secondary {
          background: transparent !important;
          color: #fff !important;
          border: 2px solid #fff !important;
          height: 48px !important;
          padding: 0 32px !important;
          font-weight: 600 !important;
        }

        .cta-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .section-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .cta-buttons {
            flex-direction: column;
          }

          .promo-banner-bg {
            display: none;
          }

          .brand-logos-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </>
  );
};

export default HomePage;
