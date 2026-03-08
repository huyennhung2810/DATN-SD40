import React from "react";
import { Card, Button, Tag, Typography, Tooltip } from "antd";
import { ShoppingCartOutlined, HeartOutlined, EyeOutlined, CheckCircleFilled } from "@ant-design/icons";
import type { ProductResponse } from "../../models/product";

const { Text, Title } = Typography;

interface ProductCardProps {
  product: ProductResponse;
  onViewDetail?: (product: ProductResponse) => void;
  onAddToCart?: (product: ProductResponse) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetail, onAddToCart }) => {
  // Check if product is new (created within 14 days)
  const isNew = product.createdDate
    ? Date.now() - product.createdDate < 14 * 24 * 60 * 60 * 1000
    : false;

  // Format price
  const formatPrice = (price?: number) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get primary image
  const primaryImage = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls[0]
    : "/placeholder-product.png";

  const handleViewDetail = () => {
    if (onViewDetail) {
      onViewDetail(product);
    } else {
      console.log("View product detail:", product.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      console.log("Add to cart:", product.id);
    }
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Add to wishlist:", product.id);
  };

  return (
    <Card
      hoverable
      className="product-card h-full flex flex-col"
      cover={
        <div className="relative overflow-hidden product-image-wrapper">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-product.png";
            }}
          />

          {/* Badges Row */}
          <div className="badges-row">
            {isNew && (
              <Tag color="blue" className="badge-new">
                MỚI
              </Tag>
            )}
            {product.price && product.price < 10000000 && (
              <Tag color="orange" className="badge-hot">
                GIÁ TỐT
              </Tag>
            )}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <Tooltip title="Yêu thích">
              <Button
                type="text"
                icon={<HeartOutlined />}
                className="quick-action-btn"
                onClick={handleAddToWishlist}
              />
            </Tooltip>
            <Tooltip title="Xem nhanh">
              <Button
                type="text"
                icon={<EyeOutlined />}
                className="quick-action-btn"
                onClick={handleViewDetail}
              />
            </Tooltip>
          </div>

          {/* Authenticity Badge */}
          <div className="authenticity-badge">
            <CheckCircleFilled /> Chính hãng
          </div>
        </div>
      }
      onClick={handleViewDetail}
    >
      <div className="flex flex-col flex-grow product-card-content">
        {/* Category */}
        {product.productCategoryName && (
          <Text type="secondary" className="product-category">
            {product.productCategoryName}
          </Text>
        )}

        {/* Product Name */}
        <Title level={5} className="!mb-2 product-name" ellipsis={{ rows: 2 }}>
          {product.name}
        </Title>

        {/* Tech Spec */}
        {product.techSpecName && (
          <Text type="secondary" className="product-specs">
            {product.techSpecName}
          </Text>
        )}

        {/* Price Section */}
        <div className="price-section mt-auto">
          <div className="sale-price">
            <Text strong className="price-value">
              {formatPrice(product.price)}
            </Text>
          </div>
        </div>

        {/* Status */}
        <div className="stock-status">
          {product.status === "ACTIVE" ? (
            <Text type="success" className="stock-available">
              Còn hàng
            </Text>
          ) : (
            <Text type="secondary" className="stock-out">
              Hết hàng
            </Text>
          )}
        </div>

        {/* Actions */}
        <div className="product-actions">
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            className="add-to-cart-btn"
            block
          >
            Thêm vào giỏ
          </Button>
        </div>
      </div>

      <style>{`
        .product-card {
          border-radius: 12px !important;
          overflow: hidden;
          border: 1px solid #f0f0f0 !important;
          transition: all 0.3s ease !important;
        }

        .product-card:hover {
          border-color: #D32F2F !important;
          box-shadow: 0 4px 20px rgba(211, 47, 47, 0.15) !important;
          transform: translateY(-4px);
        }

        .product-card :global(.ant-card-body) {
          padding: 16px;
        }

        /* Image Wrapper */
        .product-image-wrapper {
          aspect-ratio: 1;
          background: #fff;
          position: relative;
        }

        /* Badges Row */
        .badges-row {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 2;
        }

        .badge-new, .badge-hot {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
          margin: 0;
        }

        /* Quick Actions */
        .quick-actions {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 8px;
          opacity: 0;
          transition: all 0.3s ease;
          z-index: 2;
        }

        .product-card:hover .quick-actions {
          opacity: 1;
          right: 8px;
        }

        .quick-action-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.9) !important;
          border: 1px solid #e0e0e0 !important;
          color: #666 !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quick-action-btn:hover {
          background: #D32F2F !important;
          border-color: #D32F2F !important;
          color: #fff !important;
        }

        /* Authenticity Badge */
        .authenticity-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.9);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          color: #4CAF50;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 2;
        }

        /* Product Card Content */
        .product-card-content {
          padding-top: 4px;
        }

        .product-category {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          display: block;
        }

        .product-name {
          font-size: 14px;
          line-height: 1.4;
          min-height: 2.8rem;
          color: #333;
          font-weight: 600;
        }

        .product-specs {
          font-size: 12px;
          margin-bottom: 8px;
          display: block;
          line-height: 1.4;
        }

        /* Price Section */
        .price-section {
          margin-top: 8px;
          margin-bottom: 4px;
        }

        .sale-price {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .price-value {
          font-size: 18px;
          color: #D32F2F;
          font-weight: 700;
        }

        /* Stock Status */
        .stock-status {
          margin-bottom: 12px;
        }

        .stock-available {
          font-size: 12px;
        }

        .stock-out {
          font-size: 12px;
        }

        /* Actions */
        .product-actions {
          margin-top: auto;
        }

        .add-to-cart-btn {
          height: 40px !important;
          background: #D32F2F !important;
          border-color: #D32F2F !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
        }

        .add-to-cart-btn:hover {
          background: #C62828 !important;
          border-color: #C62828 !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .quick-actions {
            opacity: 1;
            right: 8px;
          }

          .product-name {
            font-size: 13px;
          }

          .price-value {
            font-size: 16px;
          }
        }
      `}</style>
    </Card>
  );
};

export default ProductCard;
