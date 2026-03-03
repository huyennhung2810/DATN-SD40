import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Skeleton, Empty } from "antd";
import BannerCarousel from "../../components/customer/BannerCarousel";
import ProductCard from "../../components/customer/ProductCard";
import { bannerApi } from "../../api/customerApi";
import { customerProductApi } from "../../api/customerProductApi";
import type { BannerResponse } from "../../models/banner";
import type { ProductResponse } from "../../models/product";

const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  // State for banners
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  
  // State for featured products
  const [featuredProducts, setFeaturedProducts] = useState<ProductResponse[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Load banners
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setBannersLoading(true);
        const data = await bannerApi.getActiveBanners("HOME_TOP");
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

  // Load featured products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await customerProductApi.getProducts({
          page: 1,
          size: 8,
          status: "ACTIVE",
        });
        setFeaturedProducts(response.data || []);
      } catch (error) {
        console.error("Error loading products:", error);
        setFeaturedProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleViewProduct = (product: ProductResponse) => {
    // Navigate to product detail (placeholder for now)
    console.log("View product:", product.id);
  };

  return (
    <>
      {/* Banner Carousel */}
      <BannerCarousel
        banners={banners}
        loading={bannersLoading}
        onBannerClick={(linkUrl) => {
          if (linkUrl) {
            window.open(linkUrl, "_blank");
          }
        }}
      />

      {/* Featured Products Section */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Title level={3} className="!mb-1 text-red-600">
                Sản phẩm nổi bật
              </Title>
              <Text type="secondary">
                Những sản phẩm được khách hàng quan tâm nhất
              </Text>
            </div>
            <a 
              href="/client/catalog" 
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Xem tất cả →
            </a>
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <Row gutter={[16, 16]}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Col xs={12} sm={12} md={8} lg={6} key={index}>
                  <Skeleton.Image active className="w-full aspect-square" />
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Col>
              ))}
            </Row>
          ) : featuredProducts.length === 0 ? (
            <Empty 
              description="Chưa có sản phẩm nào" 
              className="py-12"
            />
          ) : (
            <Row gutter={[16, 16]}>
              {featuredProducts.map((product) => (
                <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
                  <ProductCard
                    product={product}
                    onViewDetail={handleViewProduct}
                  />
                </Col>
              ))}
            </Row>
          )}

          {/* View All Button */}
          <div className="text-center mt-8">
            <a 
              href="/client/catalog" 
              className="inline-block px-8 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Xem tất cả sản phẩm
            </a>
          </div>
        </div>
      </section>

      {/* Categories Section (Placeholder) */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <Title level={3} className="text-center !mb-8 text-red-600">
            Danh mục sản phẩm
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8}>
              <a 
                href="/client/catalog?category=may-anh" 
                className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="text-4xl mb-2">📷</div>
                <Text strong>Máy ảnh</Text>
              </a>
            </Col>
            <Col xs={12} sm={8}>
              <a 
                href="/client/catalog?category=lens" 
                className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="text-4xl mb-2">🔭</div>
                <Text strong>Ống kính</Text>
              </a>
            </Col>
            <Col xs={12} sm={8}>
              <a 
                href="/client/catalog?category=phu-kien" 
                className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="text-4xl mb-2">🎒</div>
                <Text strong>Phụ kiện</Text>
              </a>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
};

export default HomePage;

