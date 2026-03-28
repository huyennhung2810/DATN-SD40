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
  Descriptions,
} from "antd";
import {
  ShoppingCartOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  TruckOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { increaseCartCount } from "../../redux/cart/cartSlice";
import axiosClient from "../../api/axiosClient";

const { Title } = Typography;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [mainImage, setMainImage] = useState<string>("");

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/client/product/${id}`);
        const realProduct = response.data;
        setProduct(realProduct);
        if (realProduct.images && realProduct.images.length > 0) {
          setMainImage(realProduct.images[0]);
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

    const activeVariant = product.variants?.find(
      (v: any) => v.id === selectedVariantId,
    );
    const finalPrice = activeVariant
      ? (activeVariant.displayPrice ?? activeVariant.salePrice)
      : product.price;

    // Object này phải giống hệt cấu trúc CartItem ở trang Checkout
    const buyNowItem = {
      id: selectedVariantId,
      productName: product.name,
      variantName: activeVariant?.name, // Kiểm tra key này ở trang Checkout là variantName hay version
      imageUrl: mainImage,
      price: finalPrice,
      quantity: quantity,
    };

    navigate("/client/checkout", {
      state: {
        isBuyNow: true,
        checkoutItems: [buyNowItem],
      },
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading || !product) {
    return (
      <div className="hikari-loading">
        <Spin size="large" />
      </div>
    );
  }

  const activeVariant = product.variants?.find(
    (v: any) => v.id === selectedVariantId,
  );
  const displayPrice = activeVariant
    ? (activeVariant.displayPrice ?? activeVariant.salePrice)
    : (product.displayPrice ?? product.price);
  const displayOriginalPrice = activeVariant
    ? (activeVariant.originalPrice ?? activeVariant.salePrice)
    : product.originalPrice;
  const maxStock = activeVariant ? activeVariant.stock : 1;

  // LẤY TRỰC TIẾP TỪ BACKEND (Nếu BE chưa trả về hoặc sản phẩm ko có thông số thì dùng mảng rỗng)
  const specifications = product.specifications || [];

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
                  {product.images?.map((img: string, index: number) => (
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
                  {displayOriginalPrice &&
                  displayOriginalPrice !== displayPrice ? (
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
                    {product.variants?.map((variant: any) => {
                      const isOutOfStock = variant.stock <= 0;
                      const isSelected = selectedVariantId === variant.id;
                      return (
                        <div
                          key={variant.id}
                          className={`variant-btn ${isSelected ? "selected" : ""} ${isOutOfStock ? "disabled" : ""}`}
                          onClick={() =>
                            !isOutOfStock && setSelectedVariantId(variant.id)
                          }
                        >
                          <div className="variant-name">{variant.name}</div>
                          <div className="variant-stock">
                            {isOutOfStock
                              ? "Hết hàng"
                              : `Còn ${variant.stock} sp`}
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

          {/* ========================================= */}
          {/* KHU VỰC THÔNG SỐ KỸ THUẬT NẰM Ở ĐÂY */}
          {/* ========================================= */}
          {specifications.length > 0 && (
            <>
              <Divider style={{ marginTop: "40px" }} />
              <div className="specifications-section">
                <Title
                  level={4}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "20px",
                  }}
                >
                  <SettingOutlined /> Thông số kỹ thuật
                </Title>

                <Descriptions
                  bordered
                  column={1}
                  size="middle"
                  styles={{
                    label: {
                      width: "30%",
                      minWidth: "150px",
                      fontWeight: "600",
                      backgroundColor: "#fafafa",
                      color: "#555",
                    },
                    content: { backgroundColor: "#fff" },
                  }}
                >
                  {specifications.map((spec: any, index: number) => (
                    <Descriptions.Item key={index} label={spec.name}>
                      {spec.value}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        /* CSS CHUẨN KHÔNG CẦN TAILWIND */
        .hikari-loading { display: flex; justify-content: center; align-items: center; height: 60vh; }
        .hikari-product-detail { background-color: #f5f5f5; min-height: 100vh; padding-bottom: 50px; }
        .hikari-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .hikari-breadcrumb { margin-bottom: 20px; font-size: 14px; }
        
        .hikari-card { background: #fff; border-radius: 16px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        
        /* Cột Trái - Ảnh */
        .main-image-box { border: 1px solid #f0f0f0; border-radius: 12px; padding: 20px; text-align: center; height: 400px; display: flex; align-items: center; justify-content: center; background: #fff; }
        .main-image-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .thumbnail-list { display: flex; gap: 12px; margin-top: 16px; overflow-x: auto; padding-bottom: 5px; }
        .thumb-item { width: 80px; height: 80px; border: 2px solid #f0f0f0; border-radius: 8px; padding: 5px; cursor: pointer; transition: all 0.3s; flex-shrink: 0; }
        .thumb-item img { width: 100%; height: 100%; object-fit: contain; }
        .thumb-item:hover { border-color: #ffccc7; }
        .thumb-item.active { border-color: #D32F2F; }

        /* Cột Phải - Thông tin */
        .brand-tag { font-weight: 600; padding: 4px 10px; font-size: 13px; margin-bottom: 12px; }
        .product-title { margin-top: 0 !important; font-size: 28px !important; color: #1a1a1a; }
        .price-box { background: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .current-price { color: #D32F2F; font-size: 32px; font-weight: 700; }
        
        .section-label { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #333; }
        
        /* Phiên bản (Variants) */
        .variant-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .variant-btn { border: 2px solid #e8e8e8; border-radius: 8px; padding: 12px; text-align: center; cursor: pointer; transition: all 0.2s; background: #fff; }
        .variant-btn:hover:not(.disabled) { border-color: #ffccc7; }
        .variant-btn.selected { border-color: #D32F2F; background: #fff1f0; }
        .variant-btn.disabled { opacity: 0.5; cursor: not-allowed; background: #f5f5f5; }
        .variant-name { font-weight: 600; font-size: 14px; color: #333; margin-bottom: 4px; }
        .variant-stock { font-size: 12px; color: #888; }
        .variant-btn.selected .variant-name { color: #D32F2F; }

        /* Số lượng */
        .quantity-section { margin-bottom: 30px; display: flex; align-items: center; gap: 15px; }
        .qty-input { width: 100px; border-radius: 6px; }
        .stock-hint { color: #888; font-size: 14px; }

        /* Nút Mua */
        .action-buttons { display: flex; gap: 16px; margin-bottom: 30px; }
        .btn-add-cart { flex: 1; height: 54px; font-size: 16px; font-weight: 700; color: #D32F2F; border: 2px solid #D32F2F; border-radius: 10px; background: #fff; }
        .btn-add-cart:hover:not(:disabled) { background: #fff1f0 !important; color: #D32F2F !important; border-color: #D32F2F !important; }
        .btn-buy-now { flex: 1; height: 54px; font-size: 16px; font-weight: 700; background: #D32F2F; border: none; border-radius: 10px; }
        .btn-buy-now:hover:not(:disabled) { background: #b71c1c !important; }

        /* Cam kết */
        .commitments { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; border-top: 1px solid #f0f0f0; padding-top: 20px; }
        .commit-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #555; }
        .icon { font-size: 20px; }
        .icon.green { color: #52c41a; }
        .icon.blue { color: #1890ff; }

        /* Thông số kỹ thuật */
        .specifications-section { background: #fff; border-radius: 12px; padding: 10px 0; }

        @media (max-width: 768px) {
          .action-buttons { flex-direction: column; }
          .commitments { grid-template-columns: 1fr; }
          .main-image-box { height: 300px; }
          .current-price { font-size: 26px; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
