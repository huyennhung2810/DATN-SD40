import React from "react";
import { Modal, Card, Row, Col, Tag, Typography, Spin, Empty, Button } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import type { ProductVariantResponse } from "../../models/productVariant";

const { Text, Title } = Typography;

interface ProductVariantsModalProps {
  open: boolean;
  onClose: () => void;
  variants: ProductVariantResponse[];
  loading: boolean;
  productName: string;
  onSelectVariant?: (variant: ProductVariantResponse) => void;
}

const formatPrice = (price?: number) => {
  if (!price) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const ProductVariantsModal: React.FC<ProductVariantsModalProps> = ({
  open,
  onClose,
  variants,
  loading,
  productName,
  onSelectVariant,
}) => {
  return (
    <Modal
      title={
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Chọn phiên bản sản phẩm
          </Title>
          <Text type="secondary">{productName}</Text>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      ) : variants.length === 0 ? (
        <Empty description="Sản phẩm này chưa có biến thể nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {variants.map((variant) => (
            <Col xs={24} sm={12} md={8} key={variant.id}>
              <Card
                hoverable
                className="variant-card"
                cover={
                  <div
                    style={{
                      height: 180,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f5f5f5",
                      position: "relative",
                    }}
                  >
                    {variant.imageUrl ? (
                      <img
                        src={variant.imageUrl}
                        alt={`${variant.colorName} - ${variant.storageCapacityName}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          padding: 16,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                        }}
                      >
                        <Text type="secondary">Chưa có ảnh</Text>
                      </div>
                    )}
                  </div>
                }
              >
                <Card.Meta
                  title={
                    <div>
                      <Text strong style={{ fontSize: 14 }}>
                        {variant.version || `${variant.colorName} - ${variant.storageCapacityName}`}
                      </Text>
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <Tag color="blue">{variant.colorName}</Tag>
                        <Tag color="green">{variant.storageCapacityName}</Tag>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Text strong style={{ fontSize: 16, color: "#ff4d4f" }}>
                          {formatPrice(variant.salePrice)}
                        </Text>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <Text type={variant.quantity > 0 ? "success" : "secondary"}>
                          {variant.quantity > 0 ? `Còn ${variant.quantity} máy` : "Hết hàng"}
                        </Text>
                      </div>
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        block
                        disabled={variant.quantity <= 0 || variant.status !== "ACTIVE"}
                        style={{ marginTop: 12 }}
                        onClick={() => onSelectVariant?.(variant)}
                      >
                        Chọn
                      </Button>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <style>{`
        .variant-card {
          border-radius: 12px !important;
          overflow: hidden;
          border: 1px solid #f0f0f0 !important;
          transition: all 0.3s ease !important;
        }

        .variant-card:hover {
          border-color: #D32F2F !important;
          box-shadow: 0 4px 20px rgba(211, 47, 47, 0.15) !important;
        }
      `}</style>
    </Modal>
  );
};

export default ProductVariantsModal;
