import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  InputNumber,
  Typography,
  Popconfirm,
  message,
  Spin,
  Divider,
  Modal,
} from "antd";
import { DeleteOutlined, ShoppingOutlined, LoginOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { setCartCount } from "../../redux/cart/cartSlice";
import axiosClient from "../../api/axiosClient";
import AuthModal from "../../components/auth/AuthModal";

const { Title, Text } = Typography;

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const fetchCartItems = async () => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.get(`/client/cart?customerId=${user.userId}`);
      const data = response.data;
      if (Array.isArray(data)) {
        setCartItems(data);
        dispatch(setCartCount(data.length));
      } else {
        setCartItems([]);
        dispatch(setCartCount(0));
      }
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
      message.error("Không thể tải giỏ hàng!");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const handleUpdateQuantity = async (productDetailId: string, newQuantity: number | null) => {
    if (!newQuantity || newQuantity < 1) return;
    try {
      await axiosClient.put(`/client/cart/update/${productDetailId}?quantity=${newQuantity}`);
      const updatedCart = cartItems.map((item) =>
        item.id === productDetailId ? { ...item, quantity: newQuantity } : item,
      );
      setCartItems(updatedCart);
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
    }
  };

  const handleDeleteItem = async (productDetailId: string) => {
    try {
      await axiosClient.delete(`/client/cart/remove/${productDetailId}`);
      const newCart = cartItems.filter((item) => item.id !== productDetailId);
      setCartItems(newCart);
      dispatch(setCartCount(newCart.length));
      setSelectedRowKeys((prev) => prev.filter((key) => key !== productDetailId));
      message.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const selectedCartItems = cartItems.filter((item) => selectedRowKeys.includes(item.id));

  const { totalOriginalPrice, totalDiscount, totalFinalPrice } = selectedCartItems.reduce(
    (acc, item) => {
      const qty = item.quantity || 1;
      const originalPrice = item.price || 0;
      const finalPrice = item.discountedPrice && item.discountedPrice < originalPrice ? item.discountedPrice : originalPrice;

      acc.totalOriginalPrice += originalPrice * qty;
      acc.totalFinalPrice += finalPrice * qty;
      acc.totalDiscount += (originalPrice - finalPrice) * qty;

      return acc;
    },
    { totalOriginalPrice: 0, totalDiscount: 0, totalFinalPrice: 0 },
  );

  const handleCheckout = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    navigate("/client/checkout", {
      state: { selectedCartItemIds: selectedRowKeys },
    });
  };

  const columns = [
    {
      title: "Sản phẩm",
      key: "product",
      width: "40%",
      render: (record: any) => {
        const displayImage =
          record.productDetail?.imageUrl || record.imageUrl || "https://via.placeholder.com/80";

        return (
          <div className="cart-product-col">
            <img
              src={displayImage}
              alt={record.productName}
              className="cart-product-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/80";
              }}
            />
            <div className="cart-product-info">
              <div className="cart-product-name">{record.productName || "Tên sản phẩm"}</div>
              <div className="cart-product-variant">
                {record.productDetail?.colorName} {record.productDetail?.sizeName} {record.version ? ` - ${record.version}` : ""}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: "20%",
      render: (price: number, record: any) => {
        const hasDiscount = record.discountedPrice && record.discountedPrice < price;

        if (hasDiscount) {
          return (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#D32F2F", fontWeight: "700", fontSize: "15px" }}>{formatPrice(record.discountedPrice)}</span>
              <span style={{ textDecoration: "line-through", color: "#8c8c8c", fontSize: "12px" }}>
                {formatPrice(price || 0)}
              </span>
            </div>
          );
        }
        return <span style={{ fontWeight: "500" }}>{formatPrice(price || 0)}</span>;
      },
    },
    {
      title: "Số lượng",
      key: "quantity",
      width: "15%",
      render: (record: any) => (
        <InputNumber
          min={1}
          max={record.stock || 99}
          value={record.quantity}
          onChange={(val) => handleUpdateQuantity(record.id, val)}
        />
      ),
    },
    {
      title: "Thành tiền",
      key: "total",
      width: "15%",
      render: (record: any) => {
        const finalPrice = record.discountedPrice && record.discountedPrice < record.price
          ? record.discountedPrice
          : record.price || 0;

        return (
          <span style={{ fontWeight: "700", color: "#D32F2F", fontSize: "16px" }}>
            {formatPrice(finalPrice * (record.quantity || 1))}
          </span>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: "10%",
      align: "center" as const,
      render: (record: any) => (
        <Popconfirm
          title="Xóa sản phẩm này?"
          onConfirm={() => handleDeleteItem(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedKeys);
    },
  };

  // Chưa đăng nhập -> hiển thị modal yêu cầu đăng nhập
  if (!isLoggedIn) {
    return (
      <div className="cart-page-wrapper">
        <div className="cart-container">
          <Title level={2} className="cart-page-title">Giỏ hàng của bạn</Title>

          <Alert
            message={
              <span>
                <LockOutlined style={{ marginRight: 8, color: "#ff4d4f" }} />
                <strong>Vui lòng đăng nhập để xem giỏ hàng</strong>
              </span>
            }
            description="Bạn cần đăng nhập để tiếp tục mua sắm và thanh toán."
            type="warning"
            showIcon
            style={{ marginBottom: 24, borderRadius: 12 }}
            action={
              <Button size="small" type="primary" onClick={() => setAuthModalOpen(true)}>
                Đăng nhập ngay
              </Button>
            }
          />

          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 16 }}>
            <LockOutlined style={{ fontSize: 64, color: "#d9d9d9", marginBottom: 16 }} />
            <Title level={4} style={{ color: "#666" }}>Giỏ hàng yêu cầu đăng nhập</Title>
            <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
              Đăng nhập để xem và quản lý giỏ hàng của bạn
            </Text>
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              onClick={() => setAuthModalOpen(true)}
              style={{ height: 48, fontWeight: 600 }}
            >
              Đăng nhập để tiếp tục
            </Button>
          </div>
        </div>

        <AuthModal
          open={authModalOpen}
          onClose={() => {
            setAuthModalOpen(false);
            navigate("/");
          }}
          onSuccess={() => {
            setAuthModalOpen(false);
            fetchCartItems();
          }}
        />
      </div>
    );
  }

  // Đã đăng nhập
  return (
    <div className="cart-page-wrapper">
      <div className="cart-container">
        <Title level={2} className="cart-page-title">
          Giỏ hàng của bạn
        </Title>

        {loading ? (
          <div className="text-center py-10">
            <Spin size="large" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="cart-empty-container">
            <img
              src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png"
              alt="Empty Cart"
              className="w-32 mx-auto mb-4 opacity-50"
            />
            <Title level={4}>Giỏ hàng trống</Title>
            <Text type="secondary">Bạn chưa có sản phẩm nào trong giỏ hàng.</Text>
            <Button type="primary" size="large" className="mt-4" onClick={() => navigate("/client/catalog")}>
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-table-section">
              <Table
                rowSelection={rowSelection}
                dataSource={cartItems}
                columns={columns}
                rowKey="id"
                pagination={false}
              />
            </div>

            <div className="cart-summary-section">
              <div className="summary-card">
                <Title level={4} className="summary-title">
                  Tổng đơn hàng
                </Title>
                <Text type="secondary">Đã chọn {selectedRowKeys.length} sản phẩm</Text>
                <Divider className="my-3" />

                <div className="summary-row">
                  <Text>Tổng tiền hàng:</Text>
                  <Text strong style={{ color: '#595959' }}>{formatPrice(totalOriginalPrice)}</Text>
                </div>

                {totalDiscount > 0 && (
                  <div className="summary-row">
                    <Text>Khuyến mãi giảm:</Text>
                    <Text strong style={{ color: '#ff4d4f' }}>- {formatPrice(totalDiscount)}</Text>
                  </div>
                )}

                <Divider className="my-3" />

                <div className="summary-row total-row">
                  <Text strong className="text-lg">Tổng thanh toán:</Text>
                  <Text strong className="text-2xl text-red-600">{formatPrice(totalFinalPrice)}</Text>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  className="checkout-btn"
                  onClick={handleCheckout}
                >
                  TIẾN HÀNH THANH TOÁN
                </Button>
                <Button
                  type="default"
                  size="large"
                  block
                  className="continue-btn mt-3"
                  onClick={() => navigate("/client/catalog")}
                >
                  Tiếp tục mua sắm
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .cart-page-wrapper { background: #f5f5f5; min-height: 80vh; padding: 40px 0; }
        .cart-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .cart-page-title { margin-bottom: 30px !important; }

        .cart-empty-container {
          text-align: center;
          background: #fff;
          padding: 60px 20px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .cart-layout { display: flex; gap: 30px; align-items: flex-start; }
        .cart-table-section { flex: 1; background: #fff; padding: 20px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; min-width: 0; }
        .cart-summary-section { width: 350px; flex-shrink: 0; position: sticky; top: 100px; }

        .cart-product-col { display: flex; align-items: center; gap: 15px; }
        .cart-product-img { width: 80px; height: 80px; object-fit: contain; border: 1px solid #f0f0f0; border-radius: 8px; padding: 4px; }
        .cart-product-name { font-weight: 600; font-size: 14px; color: #1a1a1a; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .cart-product-variant { font-size: 12px; color: #888; margin-top: 4px; }

        .summary-card { background: #fff; padding: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .summary-title { margin-bottom: 0 !important; }
        .summary-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .total-row { margin-top: 20px; }

        .checkout-btn { height: 50px; font-weight: bold; background: #D32F2F; border: none; }
        .checkout-btn:hover { background: #b71c1c !important; }
        .continue-btn { height: 50px; font-weight: 600; border-color: #d9d9d9; color: #555; }

        @media (max-width: 992px) {
          .cart-layout { flex-direction: column; }
          .cart-summary-section { width: 100%; position: static; }
        }
      `}</style>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          navigate("/");
        }}
        onSuccess={() => {
          setAuthModalOpen(false);
          fetchCartItems();
        }}
      />
    </div>
  );
};

export default CartPage;
