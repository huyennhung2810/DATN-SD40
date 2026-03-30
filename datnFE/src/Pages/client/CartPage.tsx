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
} from "antd";
import { DeleteOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { setCartCount } from "../../redux/cart/cartSlice";
import axiosClient from "../../api/axiosClient";

const { Title, Text } = Typography;

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchCartItems = async () => {
    if (!user || !user.userId) return;
    setLoading(true);
    try {
      const response = await axiosClient.get(
        `/client/cart?customerId=${user.userId}`,
      );
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

  const handleUpdateQuantity = async (
    cartDetailId: string,
    newQuantity: number | null,
  ) => {
    if (!newQuantity || newQuantity < 1) return;
    try {
      await axiosClient.put(
        `/client/cart/update/${cartDetailId}?quantity=${newQuantity}`,
      );
      const updatedCart = cartItems.map((item) =>
        item.id === cartDetailId ? { ...item, quantity: newQuantity } : item,
      );
      setCartItems(updatedCart);
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
    }
  };

  const handleDeleteItem = async (cartDetailId: string) => {
    try {
      await axiosClient.delete(`/client/cart/remove/${cartDetailId}`);
      const newCart = cartItems.filter((item) => item.id !== cartDetailId);
      setCartItems(newCart);
      dispatch(setCartCount(newCart.length));

      setSelectedRowKeys((prev) => prev.filter((key) => key !== cartDetailId));
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

  // ==========================================
  // LOGIC TÍNH TOÁN TIỀN ĐƯỢC CẬP NHẬT TẠI ĐÂY
  // ==========================================
  const selectedCartItems = cartItems.filter((item) =>
    selectedRowKeys.includes(item.id),
  );

  const { totalOriginalPrice, totalDiscount, totalFinalPrice } = selectedCartItems.reduce(
    (acc, item) => {
      const qty = item.quantity || 1;
      const originalPrice = item.price || 0;
      
      // Xác định giá trị thực tế sau khi giảm (nếu có)
      const finalPrice =
        item.discountedPrice && item.discountedPrice < originalPrice
          ? item.discountedPrice
          : originalPrice;

      // Cộng dồn các giá trị
      acc.totalOriginalPrice += originalPrice * qty;
      acc.totalFinalPrice += finalPrice * qty;
      acc.totalDiscount += (originalPrice - finalPrice) * qty;

      return acc;
    },
    { totalOriginalPrice: 0, totalDiscount: 0, totalFinalPrice: 0 }
  );

  const handleCheckout = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
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
      // LOGIC LẤY ẢNH:
      // 1. Ưu tiên ảnh của chính phiên bản (SPCT) nếu có
      // 2. Nếu không có, lấy ảnh chung của sản phẩm (imageUrl)
      // 3. Cuối cùng là ảnh placeholder
      const displayImage = 
        record.productDetail?.imageUrl || 
        record.imageUrl || 
        "https://via.placeholder.com/80";

      return (
        <div className="cart-product-col">
          <img
            src={displayImage} 
            alt={record.productName}
            className="cart-product-img"
            // Thêm xử lý nếu ảnh lỗi
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/80";
            }}
          />
          <div className="cart-product-info">
            <div className="cart-product-name">
              {record.productName || "Tên sản phẩm"}
            </div>
            {/* Hiển thị chi tiết phiên bản (màu sắc, kích cỡ...) từ SPCT */}
            <div className="cart-product-variant">
              {record.productDetail?.colorName} {record.productDetail?.sizeName} 
              {record.version ? ` - ${record.version}` : ""}
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
        // KIỂM TRA: Nếu có giá giảm và giá giảm nhỏ hơn giá gốc
        const hasDiscount = record.discountedPrice && record.discountedPrice < price;
        
        if (hasDiscount) {
          return (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* GIÁ ĐÃ GIẢM - HIỂN THỊ MÀU ĐỎ ĐẬM */}
              <span
                style={{ color: "#D32F2F", fontWeight: "700", fontSize: "15px" }}
              >
                {formatPrice(record.discountedPrice)}
              </span>
              {/* GIÁ GỐC - GẠCH NGANG */}
              <span
                style={{
                  textDecoration: "line-through",
                  color: "#8c8c8c",
                  fontSize: "12px",
                }}
              >
                {formatPrice(price || 0)}
              </span>
            </div>
          );
        }
        // NẾU KHÔNG GIẢM GIÁ - HIỂN THỊ BÌNH THƯỜNG
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
        // Lấy giá thực tế để tính tổng (ưu tiên giá giảm)
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
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  if (!user || !user.userId) {
    return (
      <div className="cart-empty-container">
        <ShoppingOutlined className="empty-icon" />
        <Title level={3}>Bạn chưa đăng nhập!</Title>
        <Text type="secondary">
          Vui lòng đăng nhập để xem giỏ hàng của bạn.
        </Text>
        <Button
          type="primary"
          size="large"
          className="mt-4"
          onClick={() =>
            navigate("/login", { state: { from: "/client/cart" } })
          }
        >
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

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
            <Text type="secondary">
              Bạn chưa có sản phẩm nào trong giỏ hàng.
            </Text>
            <Button
              type="primary"
              size="large"
              className="mt-4"
              onClick={() => navigate("/client/catalog")}
            >
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
            
            {/* ========================================== */}
            {/* GIAO DIỆN SUMMARY ĐƯỢC CẬP NHẬT TẠI ĐÂY */}
            {/* ========================================== */}
            <div className="cart-summary-section">
              <div className="summary-card">
                <Title level={4} className="summary-title">
                  Tổng đơn hàng
                </Title>
                <Text type="secondary">
                  Đã chọn {selectedRowKeys.length} sản phẩm
                </Text>
                <Divider className="my-3" />
                
                {/* 1. Tổng tiền gốc */}
                <div className="summary-row">
                  <Text>Tổng tiền hàng:</Text>
                  <Text strong style={{ color: '#595959' }}>{formatPrice(totalOriginalPrice)}</Text>
                </div>
                
                {/* 2. Tiền được giảm (Chỉ hiển thị nếu lớn hơn 0) */}
                {totalDiscount > 0 && (
                  <div className="summary-row">
                    <Text>Khuyến mãi giảm:</Text>
                    <Text strong style={{ color: '#ff4d4f' }}>
                      - {formatPrice(totalDiscount)}
                    </Text>
                  </div>
                )}
                
                <Divider className="my-3" />
                
                {/* 3. Tổng thanh toán cuối cùng */}
                <div className="summary-row total-row">
                  <Text strong className="text-lg">
                    Tổng thanh toán:
                  </Text>
                  <Text strong className="text-2xl text-red-600">
                    {formatPrice(totalFinalPrice)}
                  </Text>
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
        
        .cart-empty-container { text-align: center; background: #fff; padding: 60px 20px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .empty-icon { font-size: 64px; color: #ccc; margin-bottom: 20px; }

        .cart-layout { display: flex; gap: 30px; align-items: flex-start; }
        .cart-table-section { flex: 1; background: #fff; padding: 20px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; min-width: 0; }
        .cart-summary-section { width: 350px; flex-shrink: 0; position: sticky; top: 100px; }
        
        .cart-product-col { display: flex; align-items: center; gap: 15px; }
        .cart-product-img { width: 80px; height: 80px; object-fit: contain; border: 1px solid #f0f0f0; border-radius: 8px; padding: 4px; }
        .cart-product-name { font-weight: 600; font-size: 14px; color: #1a1a1a; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .cart-product-variant { font-size: 12px; color: #888; margin-top: 4px; }
        .cart-price { font-weight: 500; }
        .cart-total-price { font-weight: 700; color: #D32F2F; }

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
    </div>
  );
};

export default CartPage;