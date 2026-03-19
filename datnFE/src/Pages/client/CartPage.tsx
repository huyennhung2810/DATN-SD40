import React, { useState, useEffect } from "react";
import { Table, Button, InputNumber, Typography, Popconfirm, message, Spin, Divider } from "antd";
import { DeleteOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { setCartCount } from "../../redux/cart/cartSlice"; // Cập nhật lại tổng số loại SP trên Header
import axiosClient from "../../api/axiosClient";

const { Title, Text } = Typography;

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const fetchCartItems = async () => {
    if (!user || !user.userId) return;
    setLoading(true);
    try {
      const response = await axiosClient.get(`/client/cart?customerId=${user.userId}`);
      
      // KIỂM TRA ĐẢM BẢO DATA LÀ MỘT MẢNG (ARRAY)
      const data = response.data;
      if (Array.isArray(data)) {
        setCartItems(data);
        dispatch(setCartCount(data.length));
      } else {
        // Nếu BE trả về null hoặc chuỗi chữ, gán tạm mảng rỗng để không bị sập
        console.warn("API không trả về một mảng:", data);
        setCartItems([]);
        dispatch(setCartCount(0));
      }
      
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
      message.error("Không thể tải giỏ hàng!");
      setCartItems([]); // Gặp lỗi cũng gán mảng rỗng
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

 // 2. CẬP NHẬT SỐ LƯỢNG (Gọi API Update)
  const handleUpdateQuantity = async (cartDetailId: string, newQuantity: number | null) => {
    if (!newQuantity || newQuantity < 1) return;
    try {
      // Đã mở khóa gọi API Backend
      await axiosClient.put(`/client/cart/update/${cartDetailId}?quantity=${newQuantity}`);
      
      // Cập nhật State ở FE để nhìn thấy thay đổi ngay lập tức
      const updatedCart = cartItems.map(item => 
        item.id === cartDetailId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedCart);
      message.success("Đã cập nhật số lượng");
    } catch (error) {
      message.error("Lỗi cập nhật số lượng!");
    }
  };

  // 3. XÓA SẢN PHẨM KHỎI GIỎ (Gọi API Delete)
  const handleDeleteItem = async (cartDetailId: string) => {
    try {
      // Đã mở khóa gọi API Backend
      await axiosClient.delete(`/client/cart/remove/${cartDetailId}`);
      
      // Xóa ở FE và cập nhật lại số đếm trên Header
      const newCart = cartItems.filter(item => item.id !== cartDetailId);
      setCartItems(newCart);
      dispatch(setCartCount(newCart.length)); 
      message.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      message.error("Lỗi khi xóa sản phẩm!");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

// Tính tổng tiền giỏ hàng (Chống sập nếu cartItems bị undefined)
  const totalPrice = (cartItems || []).reduce((sum, item) => sum + ((item?.price || 0) * (item?.quantity || 0)), 0);

  // Cấu hình các cột cho Bảng Giỏ Hàng
  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (record: any) => (
        <div className="cart-product-col">
          <img 
            src={record.imageUrl || "https://via.placeholder.com/80"} 
            alt={record.productName} 
            className="cart-product-img"
          />
          <div className="cart-product-info">
            <div className="cart-product-name">{record.productName || "Tên sản phẩm"}</div>
            <div className="cart-product-variant">{record.variantName || "Phân loại"}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <span className="cart-price">{formatPrice(price || 0)}</span>,
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (record: any) => (
        <InputNumber 
          min={1} 
          max={record.stock || 99} // Tồn kho tối đa
          value={record.quantity} 
          onChange={(val) => handleUpdateQuantity(record.id, val)}
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (record: any) => (
        <span className="cart-total-price">{formatPrice((record.price || 0) * (record.quantity || 1))}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: any) => (
        <Popconfirm
          title="Xóa sản phẩm này?"
          description="Bạn có chắc chắn muốn xóa khỏi giỏ hàng?"
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

  if (!user || !user.userId) {
    return (
      <div className="cart-empty-container">
        <ShoppingOutlined className="empty-icon" />
        <Title level={3}>Bạn chưa đăng nhập!</Title>
        <Text type="secondary">Vui lòng đăng nhập để xem giỏ hàng của bạn.</Text>
        <Button type="primary" size="large" className="mt-4" onClick={() => navigate('/login')}>Đăng nhập ngay</Button>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <div className="cart-container">
        <Title level={2} className="cart-page-title">Giỏ hàng của bạn</Title>

        {loading ? (
          <div className="text-center py-10"><Spin size="large" /></div>
        ) : cartItems.length === 0 ? (
          <div className="cart-empty-container">
            <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" alt="Empty Cart" className="w-32 mx-auto mb-4 opacity-50" />
            <Title level={4}>Giỏ hàng trống</Title>
            <Text type="secondary">Bạn chưa có sản phẩm nào trong giỏ hàng.</Text>
            <Button type="primary" size="large" className="mt-4" onClick={() => navigate('/client/catalog')}>
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-table-section">
              <Table 
                dataSource={cartItems} 
                columns={columns} 
                rowKey="id" 
                pagination={false}
                scroll={{ x: 800 }} // Cuộn ngang trên mobile
              />
            </div>
            <div className="cart-summary-section">
              <div className="summary-card">
                <Title level={4} className="summary-title">Tổng đơn hàng</Title>
                <Divider className="my-3" />
                <div className="summary-row">
                  <Text>Tạm tính:</Text>
                  <Text strong>{formatPrice(totalPrice)}</Text>
                </div>
                <div className="summary-row">
                  <Text>Phí vận chuyển:</Text>
                  <Text type="success">Miễn phí</Text>
                </div>
                <Divider className="my-3" />
                <div className="summary-row total-row">
                  <Text strong className="text-lg">Tổng cộng:</Text>
                  <Text strong className="text-2xl text-red-600">{formatPrice(totalPrice)}</Text>
                </div>
                <Text type="secondary" className="text-xs text-right block mb-4">(Đã bao gồm VAT)</Text>
                <Button 
                  type="primary" 
                  size="large" 
                  block 
                  className="checkout-btn"
                  onClick={() => navigate('/client/checkout')}
                >
                  TIẾN HÀNH THANH TOÁN
                </Button>
                <Button 
                  type="default" 
                  size="large" 
                  block 
                  className="continue-btn mt-3"
                  onClick={() => navigate('/client/catalog')}
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
        .cart-table-section { flex: 1; background: #fff; padding: 20px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; }
        .cart-summary-section { width: 350px; flex-shrink: 0; position: sticky; top: 100px; }
        
        /* Table Styles */
        .cart-product-col { display: flex; align-items: center; gap: 15px; }
        .cart-product-img { width: 80px; height: 80px; object-fit: contain; border: 1px solid #f0f0f0; border-radius: 8px; padding: 4px; }
        .cart-product-name { font-weight: 600; font-size: 14px; color: #1a1a1a; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .cart-product-variant { font-size: 12px; color: #888; margin-top: 4px; }
        .cart-price { font-weight: 500; }
        .cart-total-price { font-weight: 700; color: #D32F2F; }

        /* Summary Card */
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