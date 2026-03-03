import React from "react";
import { Card, Button, Tag, Typography } from "antd";
import { ShoppingCartOutlined, EyeOutlined } from "@ant-design/icons";
import type { ProductResponse } from "../../models/product";

const { Text, Title } = Typography;

interface ProductCardProps {
  product: ProductResponse;
  onViewDetail?: (product: ProductResponse) => void;
  onAddToCart?: (product: ProductResponse) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetail, onAddToCart }) => {
  // Check if product is new (created within 7 days)
  const isNew = product.createdDate 
    ? Date.now() - product.createdDate < 7 * 24 * 60 * 60 * 1000 
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
      // Navigate to product detail page (placeholder for now)
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

  return (
    <Card
      hoverable
      className="product-card h-full flex flex-col"
      cover={
        <div className="relative overflow-hidden aspect-square">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-product.png";
            }}
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isNew && (
              <Tag color="red" className="m-0 font-medium">
                MỚI
              </Tag>
            )}
            {product.price && product.price < 10000000 && (
              <Tag color="orange" className="m-0 font-medium">
                GIÁ TỐT
              </Tag>
            )}
          </div>
        </div>
      }
      onClick={handleViewDetail}
    >
      <div className="flex flex-col flex-grow">
        {/* Product Name */}
        <Title level={5} className="!mb-2 line-clamp-2 min-h-[2.8rem]" ellipsis={{ rows: 2 }}>
          {product.name}
        </Title>

        {/* Category */}
        {product.productCategoryName && (
          <Text type="secondary" className="text-xs mb-2 block">
            {product.productCategoryName}
          </Text>
        )}

        {/* Price */}
        <div className="mt-auto pt-2">
          <Text className="text-red-600 text-lg font-bold">
            {formatPrice(product.price)}
          </Text>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={handleViewDetail}
            className="flex-1 bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
            block
          >
            Xem chi tiết
          </Button>
          <Button
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            className="flex-shrink-0"
          />
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;

