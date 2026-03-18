import React, { useState } from "react";
import { Button, Rate, message } from "antd";
import { ShoppingCartOutlined, HeartOutlined, EyeOutlined, CheckOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: {
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
  };
  onViewDetails?: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    message.success("Đã thêm vào giỏ hàng");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    message.success(isWishlisted ? "Đã bỏ khỏi yêu thích" : "Đã thêm vào yêu thích");
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    } else {
      navigate(`/client/product/${product.id}`);
    }
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewDetails}
    >
      <div className="product-image-container">
        {product.imageUrls && product.imageUrls.length > 0 ? (
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            className="product-image"
          />
        ) : (
          <div className="product-image-placeholder">
            <span>Chưa có hình ảnh</span>
          </div>
        )}

        {product.isNew && (
          <div className="product-badge new-badge">Mới</div>
        )}

        {product.isSale && (
          <div className="product-badge sale-badge">Sale</div>
        )}

        <div className={`product-actions ${isHovered ? "visible" : ""}`}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            className="action-btn view-btn"
            onClick={handleViewDetails}
          />
          <Button
            type="text"
            icon={isWishlisted ? <HeartOutlined style={{ color: "#D32F2F" }} /> : <HeartOutlined />}
            className={`action-btn wishlist-btn ${isWishlisted ? "active" : ""}`}
            onClick={handleWishlist}
          />
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            className="action-btn cart-btn"
            onClick={handleAddToCart}
          >
            Thêm
          </Button>
        </div>
      </div>

      <div className="product-info">
        <div className="product-category">{product.categoryName || "Máy ảnh"}</div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          <Rate disabled defaultValue={product.rating || 4} allowHalf className="product-rate" />
          <span className="rating-count">({product.reviewCount || 12})</span>
        </div>
        <div className="product-price">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="price-old">{formatPrice(product.originalPrice)}</span>
          )}
          <span className="price-current">{formatPrice(product.price)}</span>
        </div>
        <div className={`product-stock ${product.inStock !== false ? "in-stock" : "out-of-stock"}`}>
          <CheckOutlined />
          {product.inStock !== false ? " Còn hàng" : " Hết hàng"}
        </div>
      </div>

      <style>{`
        .product-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
          border-color: transparent;
        }

        .product-image-container {
          position: relative;
          aspect-ratio: 1;
          background: #f8f9fa;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 20px;
          transition: transform 0.4s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.05);
        }

        .product-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 14px;
        }

        .product-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          z-index: 2;
        }

        .new-badge {
          background: #1a1a1a;
          color: #fff;
        }

        .sale-badge {
          background: #D32F2F;
          color: #fff;
        }

        .product-actions {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
        }

        .product-actions.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .action-btn {
          height: 40px !important;
          padding: 0 14px !important;
          border-radius: 10px !important;
          font-size: 14px !important;
        }

        .view-btn,
        .wishlist-btn {
          background: #fff !important;
          color: #1a1a1a !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .view-btn:hover,
        .wishlist-btn:hover {
          background: #f5f5f5 !important;
          color: #D32F2F !important;
        }

        .cart-btn {
          background: #D32F2F !important;
          border: none !important;
          font-weight: 600;
        }

        .cart-btn:hover {
          background: #b71c1c !important;
        }

        .product-info {
          padding: 16px;
        }

        .product-category {
          font-size: 12px;
          color: #999;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .product-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 40px;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
        }

        .product-rate {
          font-size: 12px;
        }

        :global(.product-rate .ant-rate-star-full .anticon) {
          color: #fbbf24;
        }

        .rating-count {
          font-size: 12px;
          color: #999;
        }

        .product-price {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .price-old {
          font-size: 13px;
          color: #999;
          text-decoration: line-through;
        }

        .price-current {
          font-size: 18px;
          font-weight: 700;
          color: #D32F2F;
        }

        .product-stock {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }

        .in-stock {
          color: #10b981;
        }

        .out-of-stock {
          color: #999;
        }

        @media (max-width: 768px) {
          .product-actions {
            display: none;
          }

          .product-info {
            padding: 12px;
          }

          .price-current {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
