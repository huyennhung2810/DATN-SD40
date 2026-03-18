import React from "react";
import { Row, Col, Button } from "antd";
import { RightOutlined } from "@ant-design/icons";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrls?: string[];
  categoryName?: string;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isSale?: boolean;
  inStock?: boolean;
}

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  showViewAll?: boolean;
  viewAllLink?: string;
  backgroundColor?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  subtitle,
  products,
  showViewAll = true,
  viewAllLink = "/client/catalog",
  backgroundColor = "#f8f9fa"
}) => {
  return (
    <section className="product-section" style={{ backgroundColor }}>
      <div className="section-container">
        <div className="section-header">
          <div className="header-left">
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
          {showViewAll && (
            <a href={viewAllLink} className="view-all-link">
              Xem tất cả <RightOutlined />
            </a>
          )}
        </div>

        <Row gutter={[20, 20]} className="product-grid">
          {products.map((product) => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </div>

      <style>{`
        .product-section {
          padding: 60px 0;
        }

        .section-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e5e5;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .section-title {
          font-size: 28px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .section-subtitle {
          font-size: 15px;
          color: #666;
          margin: 0;
        }

        .view-all-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #D32F2F;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
        }

        .view-all-link:hover {
          gap: 10px;
        }

        .product-grid {
          margin-top: 0;
        }

        @media (max-width: 768px) {
          .product-section {
            padding: 40px 0;
          }

          .section-container {
            padding: 0 16px;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .section-title {
            font-size: 22px;
          }

          .view-all-link {
            font-size: 13px;
          }
        }
      `}</style>
    </section>
  );
};

export default ProductSection;
