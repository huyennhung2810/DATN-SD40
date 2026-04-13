import React, { useState, useEffect } from "react";
import { Spin } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { customerProductApi } from "../../api/customerProductApi";
import type { ProductResponse } from "../../models/product";

interface TransformedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrls?: string[];
  categoryName?: string;
  brandName?: string;
  isNew?: boolean;
  isSale?: boolean;
}

interface Brand {
  id: string;
  name: string;
  label: string;
}

const BRANDS: Brand[] = [
  { id: "canon", name: "Canon", label: "Canon" },
  { id: "sony", name: "Sony", label: "Sony" },
  { id: "nikon", name: "Nikon", label: "Nikon" },
  { id: "fujifilm", name: "Fujifilm", label: "Fujifilm" },
];

const transformProduct = (product: ProductResponse): TransformedProduct => ({
  id: product.id,
  name: product.name,
  price: product.price ?? 0,
  originalPrice:
    product.hasActiveSaleCampaign && product.originalPrice != null
      ? product.originalPrice
      : undefined,
  imageUrls: product.imageUrls ?? [],
  categoryName: product.productCategoryName ?? "",
  brandName: product.brandName ?? "",
  isNew:
    product.createdDate &&
    Date.now() - product.createdDate < 30 * 24 * 60 * 60 * 1000,
  isSale: !!product.hasActiveSaleCampaign,
});

const BrandShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [activeBrand, setActiveBrand] = useState<string>("canon");
  const [products, setProducts] = useState<TransformedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchProducts = async (brandName: string) => {
    setLoadingProducts(true);
    try {
      const result = await customerProductApi.getProducts({
        page: 1,
        size: 8,
        status: "ACTIVE",
        idBrand: brandName,
      });
      const data = result?.data ?? [];
      setProducts(data.map(transformProduct));
    } catch (err) {
      console.error("Error fetching brand products:", err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch all brand labels on mount for the tab row
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await fetchProducts("canon");
      } catch (e) {
        // Swallow — BrandShowcase stays alive with empty state
        console.warn("BrandShowcase init failed:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleBrandChange = (brandId: string) => {
    setActiveBrand(brandId);
    fetchProducts(brandId);
  };

  return (
    <section className="hw-section" style={{ background: "var(--hw-bg)" }}>
      <div className="hw-container">
        <div className="hw-section-header">
          <div>
            <h2 className="hw-section-title">Thương hiệu nổi bật</h2>
            <p className="hw-section-subtitle">
              Khám phá sản phẩm theo thương hiệu máy ảnh hàng đầu
            </p>
          </div>
          <a href="/client/catalog" className="hw-section-link">
            Xem tất cả <RightOutlined />
          </a>
        </div>

        {/* Brand filter chips */}
        <div className="hw-brand-tabs">
          {BRANDS.map((brand) => (
            <button
              key={brand.id}
              className={`hw-brand-tab ${
                activeBrand === brand.id ? "hw-brand-tab--active" : ""
              }`}
              onClick={() => handleBrandChange(brand.id)}
            >
              {brand.label}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {loadingProducts ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin size="large" />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--hw-gray)" }}>
            Không có sản phẩm nào cho thương hiệu này.
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

                  <div className="hw-product-card__actions">
                    <button
                      className="hw-product-card__action-btn hw-product-card__action-btn--primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/client/product/${product.id}`);
                      }}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>

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

export default BrandShowcase;
