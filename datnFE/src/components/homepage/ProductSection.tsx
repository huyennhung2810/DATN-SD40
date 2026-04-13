import React from "react";
import { RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrls?: string[];
  categoryName?: string;
  brandName?: string;
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
  backgroundAlt?: boolean; // alternates bg between sections
}

const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  subtitle,
  products,
  showViewAll = true,
  viewAllLink = "/client/catalog",
  backgroundColor,
  backgroundAlt = false,
}) => {
  const navigate = useNavigate();
  const bg = backgroundColor ?? (backgroundAlt ? "var(--hw-bg-white)" : "var(--hw-bg)");

  return (
    <section className="hw-section" style={{ background: bg }}>
      <div className="hw-container">
        {/* Section header — uses shared design system class */}
        <div className="hw-section-header">
          <div>
            <h2 className="hw-section-title">{title}</h2>
            {subtitle && <p className="hw-section-subtitle">{subtitle}</p>}
          </div>
          {showViewAll && (
            <a href={viewAllLink} className="hw-section-link">
              Xem tất cả <RightOutlined />
            </a>
          )}
        </div>

        {/* Product grid */}
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--hw-gray)" }}>
            Không có sản phẩm nào.
          </div>
        ) : (
          <div className="hw-product-grid">
            {products.map((product) => (
              <a
                key={product.id}
                href={`/client/product/${product.id}`}
                className="hw-product-card"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/client/product/${product.id}`);
                }}
              >
                {/* Image */}
                <div className="hw-product-card__img-wrap">
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="hw-product-card__img"
                    />
                  ) : (
                    <div className="hw-product-card__img-placeholder">
                      Chưa có hình ảnh
                    </div>
                  )}

                  {/* Badges */}
                  {product.isNew && (
                    <div className="hw-product-card__badge hw-product-card__badge--new">
                      Mới
                    </div>
                  )}
                  {product.isSale && (
                    <div className="hw-product-card__badge hw-product-card__badge--sale">
                      Giảm giá
                    </div>
                  )}

                  {/* Hover action bar */}
                  <div className="hw-product-card__actions">
                    <button
                      className="hw-product-card__action-btn hw-product-card__action-btn--ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/client/product/${product.id}`);
                      }}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="hw-product-card__info">
                  <div className="hw-product-card__category">
                    {product.categoryName || "Máy ảnh"}
                  </div>
                  <div className="hw-product-card__name">{product.name}</div>
                  <div className="hw-product-card__price-row">
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <>
                        <span className="hw-product-card__price-old">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            maximumFractionDigits: 0,
                          }).format(product.originalPrice)}
                        </span>
                        <span className="hw-product-card__price-current">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            maximumFractionDigits: 0,
                          }).format(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="hw-product-card__price-current">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                          maximumFractionDigits: 0,
                        }).format(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
