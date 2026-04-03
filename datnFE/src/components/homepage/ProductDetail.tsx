import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Row,
  Col,
  Button,
  InputNumber,
  Typography,
  Tag,
  Divider,
  Breadcrumb,
  message,
  Spin,
} from "antd";
import {
  ShoppingCartOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  TruckOutlined,
  SettingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { increaseCartCount } from "../../redux/cart/cartSlice";
import axiosClient from "../../api/axiosClient";
import type {
  CnProductResponse,
  DynamicSpecGroup,
  ProductVariantResponse,
  RelatedProductResponse,
} from "../../models/productVariant";

const { Title } = Typography;

// ============================================================
// Map label tiếng Việt cho fixed specs
// ============================================================
const FIXED_SPEC_KEYS = [
  "sensorType",
  "lensMount",
  "resolution",
  "iso",
  "processor",
  "imageFormat",
  "videoFormat",
] as const;

const FIXED_SPEC_LABELS: Record<(typeof FIXED_SPEC_KEYS)[number], string> = {
  sensorType: "Loại cảm biến",
  lensMount: "Ngàm ống kính",
  resolution: "Độ phân giải",
  iso: "ISO",
  processor: "Bộ xử lý ảnh",
  imageFormat: "Định dạng ảnh",
  videoFormat: "Định dạng video",
};

function formatPrice(
  price: number | string | bigint | undefined | null,
): string {
  if (price == null || price === "") return "Liên hệ";
  const n = typeof price === "number" ? price : Number(price);
  if (Number.isNaN(n)) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

/** API client trả `stock`; một số API khác trả `quantity`. */
function variantStock(v: ProductVariantResponse): number {
  const s = v.stock ?? v.quantity;
  if (typeof s === "number" && !Number.isNaN(s)) return s;
  return 0;
}

/** API client trả `name` (CnVariantResponse); admin có thể trả `version`. */
function variantDisplayName(v: ProductVariantResponse): string {
  return (v.name ?? v.version ?? "").trim() || "Phiên bản";
}

function hasFixedSpecValue(fixed?: Record<string, unknown> | null): boolean {
  if (!fixed) return false;
  return FIXED_SPEC_KEYS.some((key) => {
    const val = fixed[key];
    return val != null && val !== "";
  });
}

function isFixedSpecEmpty(fixed?: Record<string, unknown> | null): boolean {
  return !hasFixedSpecValue(fixed);
}

function hasAnyDynamicSpec(groups?: DynamicSpecGroup[]): boolean {
  if (!groups || groups.length === 0) return false;
  return groups.some((g) => g.items && g.items.length > 0);
}

function hasAnySpec(techSpec?: CnProductResponse["techSpec"]): boolean {
  if (!techSpec) return false;
  return !isFixedSpecEmpty(techSpec.fixedSpecs as Record<string, unknown> | null) || hasAnyDynamicSpec(techSpec.dynamicSpecs);
}

function legacySpecifications(product: CnProductResponse) {
  const list = product.specifications;
  if (!Array.isArray(list)) return [];
  return list.filter(
    (s) =>
      s?.name &&
      String(s.name).trim() !== "" &&
      s.value != null &&
      String(s.value).trim() !== "",
  );
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<CnProductResponse | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [mainImage, setMainImage] = useState<string>("");
  const [relatedProducts, setRelatedProducts] = useState<RelatedProductResponse[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/client/product/${id}`);
        const data: CnProductResponse = response.data;
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]);
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", error);
        message.error("Không thể tải thông tin sản phẩm. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProductDetail();
  }, [id, user?.userId]);

  // Fetch related products after product data is available
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!id) return;
      setRelatedLoading(true);
      try {
        const response = await axiosClient.get(`/client/product/${id}/related`, {
          params: { size: 8 },
        });
        setRelatedProducts(response.data || []);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm liên quan:", error);
        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    };
    if (id && !loading) {
      fetchRelatedProducts();
    }
  }, [id, loading]);

  const handleAddToCart = async () => {
    if (!user || !user.userId) {
      message.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!selectedVariantId) {
      message.error("Vui lòng chọn phiên bản bạn muốn mua!");
      return;
    }

    try {
      const payload = {
        productDetailId: selectedVariantId,
        quantity: quantity,
      };
      await axiosClient.post(
        `/client/cart/add?customerId=${user.userId}`,
        payload,
      );
      message.success("Đã thêm sản phẩm vào giỏ hàng!");
      for (let i = 0; i < quantity; i++) {
        dispatch(increaseCartCount());
      }
    } catch (error: any) {
      console.error("Lỗi thêm giỏ hàng:", error);
      const errorMessage =
        error.response?.data || "Có lỗi xảy ra, vui lòng thử lại!";
      message.error(errorMessage);
    }
  };

  const handleCheckout = () => {
    if (!user || !user.userId) {
      message.warning("Vui lòng đăng nhập để mua hàng!");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!selectedVariantId) {
      message.error("Vui lòng chọn phiên bản bạn muốn mua!");
      return;
    }

    const activeVariant = product?.variants?.find(
      (v) => v.id === selectedVariantId,
    );
    const unitOriginal = activeVariant
      ? Number(activeVariant.originalPrice ?? activeVariant.salePrice ?? 0)
      : Number(product?.originalPrice ?? product?.displayPrice ?? 0);
    const unitAfterCampaign = activeVariant
      ? Number(activeVariant.displayPrice ?? activeVariant.salePrice ?? 0)
      : Number(product?.displayPrice ?? 0);

    const buyNowItem = {
      id: selectedVariantId,
      productDetailId: selectedVariantId,
      productName: product?.name,
      variantName: activeVariant
        ? variantDisplayName(activeVariant)
        : undefined,
      imageUrl: mainImage,
      price: unitOriginal,
      discountedPrice: unitAfterCampaign,
      quantity: quantity,
    };

    navigate("/client/checkout", {
      state: {
        isBuyNow: true,
        checkoutItems: [buyNowItem],
      },
    });
  };

  if (loading || !product) {
    return (
      <div className="hikari-loading">
        <Spin size="large" />
      </div>
    );
  }

  const activeVariant = product.variants?.find(
    (v) => v.id === selectedVariantId,
  );
  const displayPrice = activeVariant
    ? activeVariant.displayPrice ?? activeVariant.salePrice
    : product.displayPrice;
  const displayOriginalPrice = activeVariant
    ? activeVariant.originalPrice ?? activeVariant.salePrice
    : product.originalPrice;
  const maxStock = activeVariant ? variantStock(activeVariant) : 1;

  // ============================================================
  // SECTION: THÔNG SỐ KỸ THUẬT
  // ============================================================
  const techSpec = product.techSpec;
  const fixedSpecs = techSpec?.fixedSpecs;
  const dynamicGroups = techSpec?.dynamicSpecs;
  const legacySpecRows = legacySpecifications(product);
  const hasStructuredSpec = hasAnySpec(techSpec);
  const showTechSpec = hasStructuredSpec || legacySpecRows.length > 0;

  // Lấy các fixed spec có dữ liệu
  const fixedEntries = fixedSpecs
    ? FIXED_SPEC_KEYS.map((key) => ({
        label: FIXED_SPEC_LABELS[key],
        value: (fixedSpecs as Record<string, unknown>)[key] as string | null,
      })).filter((item) => item.value != null && item.value !== "")
    : [];

  return (
    <div className="hikari-product-detail">
      <div className="hikari-container">
        <Breadcrumb
          className="hikari-breadcrumb"
          items={[
            {
              title: (
                <a href="/client">
                  <HomeOutlined />
                </a>
              ),
            },
            { title: <a href="/client/catalog">Máy ảnh</a> },
            { title: product.name },
          ]}
        />

        <div className="hikari-card">
          <Row gutter={[40, 40]}>
            {/* CỘT TRÁI: ẢNH SẢN PHẨM */}
            <Col xs={24} md={10} lg={10}>
              <div className="image-showcase">
                <div className="main-image-box">
                  <img
                    src={mainImage || "https://via.placeholder.com/400"}
                    alt={product.name}
                  />
                </div>
                <div className="thumbnail-list">
                  {product.images?.map((img, index) => (
                    <div
                      key={index}
                      className={`thumb-item ${mainImage === img ? "active" : ""}`}
                      onClick={() => setMainImage(img)}
                    >
                      <img src={img} alt="" />
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            {/* CỘT PHẢI: THÔNG TIN SẢN PHẨM */}
            <Col xs={24} md={14} lg={14}>
              <div className="product-info">
                <Tag color="#D32F2F" className="brand-tag">
                  Chính Hãng 100%
                </Tag>
                <Title level={2} className="product-title">
                  {product.name}
                </Title>

                <div className="price-box">
                  {displayOriginalPrice && displayOriginalPrice !== displayPrice ? (
                    <>
                      <span className="current-price">
                        {formatPrice(displayPrice)}
                      </span>
                      <span
                        className="original-price"
                        style={{
                          textDecoration: "line-through",
                          marginLeft: 12,
                          color: "#999",
                        }}
                      >
                        {formatPrice(displayOriginalPrice)}
                      </span>
                    </>
                  ) : (
                    <span className="current-price">
                      {formatPrice(displayPrice)}
                    </span>
                  )}
                </div>

                <Divider />

                {/* Chọn phiên bản */}
                <div className="variant-section">
                  <div className="section-label">Chọn phiên bản:</div>
                  <div className="variant-grid">
                    {product.variants?.map((variant) => {
                      const stock = variantStock(variant);
                      const isOutOfStock = stock <= 0;
                      const isSelected = selectedVariantId === variant.id;
                      return (
                        <div
                          key={variant.id}
                          className={`variant-btn ${isSelected ? "selected" : ""} ${isOutOfStock ? "disabled" : ""}`}
                          onClick={() =>
                            !isOutOfStock && setSelectedVariantId(variant.id)
                          }
                        >
                          <div className="variant-name">
                            {variantDisplayName(variant)}
                          </div>
                          <div className="variant-stock">
                            {isOutOfStock
                              ? "Hết hàng"
                              : `Còn ${stock} sp`}
                          </div>
                          {variant.hasActiveSaleCampaign ? (
                            <div className="variant-price">
                              <span
                                style={{ color: "#ff4d4f", fontWeight: 600 }}
                              >
                                {formatPrice(
                                  variant.displayPrice ?? variant.salePrice,
                                )}
                              </span>
                              <span
                                style={{
                                  textDecoration: "line-through",
                                  marginLeft: 6,
                                  fontSize: 12,
                                  color: "#999",
                                }}
                              >
                                {formatPrice(
                                  variant.originalPrice ?? variant.salePrice,
                                )}
                              </span>
                            </div>
                          ) : (
                            <div
                              className="variant-price"
                              style={{ fontWeight: 600 }}
                            >
                              {formatPrice(
                                variant.displayPrice ?? variant.salePrice,
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chọn số lượng */}
                <div className="quantity-section">
                  <div className="section-label">Số lượng:</div>
                  <InputNumber
                    min={1}
                    max={maxStock}
                    value={quantity}
                    onChange={(val) => setQuantity(val || 1)}
                    size="large"
                    disabled={!selectedVariantId || maxStock <= 0}
                    className="qty-input"
                  />
                  <span className="stock-hint">
                    {selectedVariantId && maxStock > 0
                      ? `(Kho còn ${maxStock})`
                      : ""}
                  </span>
                </div>

                {/* Nút hành động */}
                <div className="action-buttons">
                  <Button
                    className="btn-add-cart"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    disabled={!selectedVariantId || maxStock <= 0}
                  >
                    THÊM VÀO GIỎ HÀNG
                  </Button>
                  <Button
                    type="primary"
                    className="btn-buy-now"
                    disabled={!selectedVariantId || maxStock <= 0}
                    onClick={handleCheckout}
                  >
                    MUA NGAY
                  </Button>
                </div>

                <div className="commitments">
                  <div className="commit-item">
                    <SafetyCertificateOutlined className="icon green" /> Bảo
                    hành chính hãng 24 tháng
                  </div>
                  <div className="commit-item">
                    <TruckOutlined className="icon blue" /> Miễn phí vận chuyển
                    toàn quốc
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* ============================================================ */}
        {/* THÔNG SỐ KỸ THUẬT — nằm bên dưới card chính */}
        {/* ============================================================ */}
        {showTechSpec ? (
          <div className="hikari-card tech-spec-card">
            <Title
              level={4}
              className="tech-spec-title"
            >
              <SettingOutlined /> Thông số kỹ thuật
            </Title>

            <div className="tech-spec-content">
              {hasStructuredSpec && (
                <>
                  {fixedEntries.length > 0 && (
                    <div className="spec-group">
                      <div className="spec-group-header">Thông số cơ bản</div>
                      <div className="spec-table">
                        {fixedEntries.map(({ label, value }) => (
                          <div key={label} className="spec-row">
                            <span className="spec-label">{label}</span>
                            <span className="spec-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dynamicGroups?.map((group) => {
                    if (!group.items || group.items.length === 0) return null;
                    return (
                      <div key={group.groupId} className="spec-group">
                        <div className="spec-group-header">{group.groupName}</div>
                        <div className="spec-table">
                          {group.items.map((item) => {
                            const raw = item.value;
                            if (
                              raw == null ||
                              String(raw).trim() === ""
                            ) {
                              return null;
                            }
                            const u = item.unit?.trim();
                            const vStr = String(raw);
                            const displayVal =
                              u && !vStr.includes(u) ? `${vStr} ${u}` : vStr;
                            return (
                              <div key={item.definitionId} className="spec-row">
                                <span className="spec-label">
                                  {item.definitionName}
                                </span>
                                <span className="spec-value">{displayVal}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {!hasStructuredSpec && legacySpecRows.length > 0 && (
                <div className="spec-group">
                  <div className="spec-group-header">Thông số kỹ thuật</div>
                  <div className="spec-table">
                    {legacySpecRows.map((spec, idx) => (
                      <div key={`${spec.name}-${idx}`} className="spec-row">
                        <span className="spec-label">{spec.name}</span>
                        <span className="spec-value">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hikari-card tech-spec-card">
            <div className="tech-spec-empty">
              Sản phẩm đang được cập nhật thông số kỹ thuật
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SẢN PHẨM LIÊN QUAN */}
        {/* ============================================================ */}
        {(relatedLoading || relatedProducts.length > 0) && (
          <div className="hikari-card related-products-card">
            <Title level={4} className="related-products-title">
              <AppstoreOutlined /> Sản phẩm liên quan
            </Title>

            {relatedLoading ? (
              <div className="related-loading">
                <Row gutter={[16, 16]}>
                  {[1, 2, 3, 4].map((i) => (
                    <Col xs={12} sm={12} md={6} key={i}>
                      <div className="related-skeleton">
                        <div className="skeleton-img" />
                        <div className="skeleton-text" />
                        <div className="skeleton-text short" />
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {relatedProducts.map((item) => (
                  <Col xs={12} sm={12} md={6} key={item.productId}>
                    <div
                      className="related-card"
                      onClick={() => navigate(`/client/product/${item.productId}`)}
                    >
                      {item.hasActiveSaleCampaign && item.discountPercent && (
                        <span className="related-badge-sale">
                          -{Math.round(Number(item.discountPercent))}%
                        </span>
                      )}
                      <div className="related-card-img">
                        <img
                          src={item.thumbnail || "https://via.placeholder.com/200"}
                          alt={item.productName}
                        />
                      </div>
                      <div className="related-card-body">
                        <div className="related-card-brand">{item.brand}</div>
                        <div className="related-card-name" title={item.productName}>
                          {item.productName}
                        </div>
                        <div className="related-card-price">
                          {item.hasActiveSaleCampaign && item.originalPrice && (
                            <span className="price-original">
                              {formatPrice(Number(item.originalPrice))}
                            </span>
                          )}
                          <span className="price-current">
                            {formatPrice(Number(item.displayPrice))}
                          </span>
                        </div>
                        {item.matchReasons && item.matchReasons.length > 0 && (
                          <div className="related-card-reason">
                            {item.matchReasons[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        )}
      </div>

      <style>{`
        /* ===== BASE ===== */
        .hikari-loading { display: flex; justify-content: center; align-items: center; height: 60vh; }
        .hikari-product-detail { background-color: #f5f5f5; min-height: 100vh; padding-bottom: 50px; }
        .hikari-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .hikari-breadcrumb { margin-bottom: 20px; font-size: 14px; }
        .hikari-card { background: #fff; border-radius: 16px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 24px; }

        /* ===== ẢNH SẢN PHẨM ===== */
        .main-image-box { border: 1px solid #f0f0f0; border-radius: 12px; padding: 20px; text-align: center; height: 400px; display: flex; align-items: center; justify-content: center; background: #fff; }
        .main-image-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .thumbnail-list { display: flex; gap: 12px; margin-top: 16px; overflow-x: auto; padding-bottom: 5px; }
        .thumb-item { width: 80px; height: 80px; border: 2px solid #f0f0f0; border-radius: 8px; padding: 5px; cursor: pointer; transition: all 0.3s; flex-shrink: 0; }
        .thumb-item img { width: 100%; height: 100%; object-fit: contain; }
        .thumb-item:hover { border-color: #ffccc7; }
        .thumb-item.active { border-color: #D32F2F; }

        /* ===== THÔNG TIN SẢN PHẨM ===== */
        .brand-tag { font-weight: 600; padding: 4px 10px; font-size: 13px; margin-bottom: 12px; }
        .product-title { margin-top: 0 !important; font-size: 28px !important; color: #1a1a1a; }
        .price-box { background: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .current-price { color: #D32F2F; font-size: 32px; font-weight: 700; }
        .section-label { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #333; }

        /* ===== PHIÊN BẢN ===== */
        .variant-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .variant-btn { border: 2px solid #e8e8e8; border-radius: 8px; padding: 12px; text-align: center; cursor: pointer; transition: all 0.2s; background: #fff; }
        .variant-btn:hover:not(.disabled) { border-color: #ffccc7; }
        .variant-btn.selected { border-color: #D32F2F; background: #fff1f0; }
        .variant-btn.disabled { opacity: 0.5; cursor: not-allowed; background: #f5f5f5; }
        .variant-name { font-weight: 600; font-size: 14px; color: #333; margin-bottom: 4px; }
        .variant-stock { font-size: 12px; color: #888; }
        .variant-btn.selected .variant-name { color: #D32F2F; }

        /* ===== SỐ LƯỢNG ===== */
        .quantity-section { margin-bottom: 30px; display: flex; align-items: center; gap: 15px; }
        .qty-input { width: 100px; border-radius: 6px; }
        .stock-hint { color: #888; font-size: 14px; }

        /* ===== NÚT MUA ===== */
        .action-buttons { display: flex; gap: 16px; margin-bottom: 30px; }
        .btn-add-cart { flex: 1; height: 54px; font-size: 16px; font-weight: 700; color: #D32F2F; border: 2px solid #D32F2F; border-radius: 10px; background: #fff; }
        .btn-add-cart:hover:not(:disabled) { background: #fff1f0 !important; color: #D32F2F !important; border-color: #D32F2F !important; }
        .btn-buy-now { flex: 1; height: 54px; font-size: 16px; font-weight: 700; background: #D32F2F; border: none; border-radius: 10px; }
        .btn-buy-now:hover:not(:disabled) { background: #b71c1c !important; }

        /* ===== CAM KẾT ===== */
        .commitments { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; border-top: 1px solid #f0f0f0; padding-top: 20px; }
        .commit-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #555; }
        .icon { font-size: 20px; }
        .icon.green { color: #52c41a; }
        .icon.blue { color: #1890ff; }

        /* ============================================================ */
        /* ===== THÔNG SỐ KỸ THUẬT — GROUPED LAYOUT ===== */
        /* ============================================================ */
        .tech-spec-card { padding: 24px 30px; }

        .tech-spec-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px !important;
          font-size: 18px !important;
          color: #1a1a1a;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }

        .tech-spec-content {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Nhóm thông số */
        .spec-group {
          margin-bottom: 8px;
        }

        .spec-group-header {
          font-size: 14px;
          font-weight: 700;
          color: #D32F2F;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 10px 0 8px;
          border-bottom: 1px solid #fce4e4;
          margin-bottom: 0;
        }

        /* Bảng spec bên trong mỗi nhóm */
        .spec-table {
          display: flex;
          flex-direction: column;
        }

        /* Dòng spec */
        .spec-row {
          display: flex;
          align-items: flex-start;
          padding: 10px 0;
          border-bottom: 1px solid #fafafa;
          gap: 20px;
        }

        .spec-row:last-child {
          border-bottom: none;
        }

        .spec-label {
          width: 220px;
          min-width: 180px;
          color: #555;
          font-size: 14px;
          line-height: 1.5;
          flex-shrink: 0;
        }

        .spec-value {
          flex: 1;
          color: #1a1a1a;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.5;
          word-break: break-word;
        }

        /* ===== TRẠNG THÁI TRỐNG ===== */
        .tech-spec-empty {
          text-align: center;
          padding: 32px 20px;
          color: #999;
          font-size: 15px;
          font-style: italic;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .action-buttons { flex-direction: column; }
          .commitments { grid-template-columns: 1fr; }
          .main-image-box { height: 300px; }
          .current-price { font-size: 26px; }
          .product-title { font-size: 22px !important; }

          /* Tech spec mobile */
          .spec-row { flex-direction: column; gap: 4px; padding: 10px 0; }
          .spec-label { width: 100%; font-size: 13px; color: #777; }
          .spec-value { width: 100%; font-size: 14px; }
          .spec-group-header { font-size: 13px; }
        }

        @media (max-width: 480px) {
          .hikari-card { padding: 16px; }
          .tech-spec-card { padding: 16px; }
          .variant-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
        }

        /* ============================================================ */
        /* ===== SẢN PHẨM LIÊN QUAN ===== */
        /* ============================================================ */
        .related-products-card { padding: 24px 30px; }

        .related-products-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px !important;
          font-size: 18px !important;
          color: #1a1a1a;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }

        /* Related product card */
        .related-card {
          border: 1px solid #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.25s ease;
          background: #fff;
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .related-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.10);
          border-color: #ffccc7;
        }

        .related-badge-sale {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #D32F2F;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          z-index: 1;
        }

        .related-card-img {
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
          background: #fafafa;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
        }

        .related-card-img img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }

        .related-card:hover .related-card-img img {
          transform: scale(1.05);
        }

        .related-card-body {
          padding: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .related-card-brand {
          font-size: 12px;
          color: #888;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .related-card-name {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.4;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          min-height: 36px;
        }

        .related-card-price {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .related-card-price .price-current {
          font-size: 15px;
          font-weight: 700;
          color: #D32F2F;
        }

        .related-card-price .price-original {
          font-size: 12px;
          color: #999;
          text-decoration: line-through;
        }

        .related-card-reason {
          margin-top: 6px;
          font-size: 11px;
          color: #666;
          background: #f5f5f5;
          border-radius: 4px;
          padding: 3px 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-style: italic;
        }

        /* Loading skeleton */
        .related-skeleton {
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #f0f0f0;
          background: #fff;
        }

        .skeleton-img {
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-text {
          height: 14px;
          margin: 12px 12px 4px;
          border-radius: 4px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-text.short { width: 60%; margin-bottom: 12px; }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Mobile adjustments for related products */
        @media (max-width: 768px) {
          .related-products-card { padding: 16px; }
          .related-card-name { font-size: 12px; }
          .related-card-price .price-current { font-size: 14px; }
          .related-card-reason { font-size: 10px; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
