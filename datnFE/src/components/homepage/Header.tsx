import {
  BellOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  FileSearchOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuOutlined,
  PhoneOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Dropdown,
  Empty,
  List,
  Popover,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useNotifications } from "../../app/useNotifications";
import { authActions } from "../../redux/auth/authSlice";
import { clearCartCount, setCartCount } from "../../redux/cart/cartSlice";
import {
  notificationActions,
  type AppNotification,
} from "../../redux/notification/notificationSlice";
import type { RootState } from "../../redux/store";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const dispatch = useDispatch();
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);
  const cartCount = useSelector((state: RootState) => state.cart.cartCount);
  const notifications = useSelector(
    (state: RootState) => state.notification.items,
  );
  const clientNotifs = notifications.filter((n) => n.type === "ORDER_STATUS");
  const unreadCount = clientNotifs.filter((n) => !n.read).length;

  // Subscribe to order status notifications for this customer
  const isCustomer = !!(
    isLoggedIn &&
    user?.userId &&
    user.roles?.includes("CUSTOMER")
  );
  useNotifications(`/topic/client/notifications/${user?.userId}`, isCustomer);

  const notifContent = (
    <div style={{ width: 300 }}>
      <div className="notif-header">
        <span style={{ fontWeight: 600, fontSize: 14 }}>
          Thông báo đơn hàng
        </span>
        {unreadCount > 0 && (
          <Button
            size="small"
            type="link"
            onClick={() => dispatch(notificationActions.markAllRead())}
          >
            Đã đọc tất cả
          </Button>
        )}
      </div>
      {clientNotifs.length === 0 ? (
        <Empty
          description="Chưa có thông báo"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: "16px 0" }}
        />
      ) : (
        <List
          dataSource={clientNotifs.slice(0, 15)}
          style={{ maxHeight: 380, overflowY: "auto" }}
          renderItem={(item: AppNotification) => (
            <List.Item
              key={item.id}
              className={`notif-item ${item.read ? "read" : "unread"}`}
              onClick={() => {
                dispatch(notificationActions.markRead(item.id));
                navigate("/client/orders");
                setNotifOpen(false);
              }}
            >
              <List.Item.Meta
                avatar={
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", fontSize: 18 }}
                  />
                }
                title={
                  <span
                    style={{ fontSize: 13, fontWeight: item.read ? 400 : 600 }}
                  >
                    {item.title}
                  </span>
                }
                description={
                  <div>
                    <div style={{ fontSize: 12, color: "#595959" }}>
                      {item.message}
                    </div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
                      <CheckCircleOutlined
                        style={{ marginRight: 4, opacity: 0.5 }}
                      />
                      {new Date(item.timestamp).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  useEffect(() => {
    if (user && user.userId && user.roles?.includes("CUSTOMER")) {
      axiosClient
        .get(`/client/cart?customerId=${user.userId}`)
        .then((response) => {
          const count = response.data.length;
          dispatch(setCartCount(count));
        })
        .catch((error) => console.error("Lỗi lấy số lượng giỏ hàng:", error));
    } else {
      dispatch(clearCartCount());
    }
  }, [user, dispatch]);

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case "logout":
        dispatch(authActions.logout({ isAdmin: false }));
        navigate("/client");
        break;
      case "profile":
        navigate("/client/profile");
        break;
      case "orders":
        navigate("/client/orders");
        break;
      case "login":
        navigate("/login");
        break;
      case "register":
        navigate("/register");
        break;
    }
  };

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/client/catalog?q=${encodeURIComponent(value)}`);
      setMobileSearchVisible(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userMenuItems = isLoggedIn
    ? [
        { key: "profile", label: "Tài khoản của tôi", icon: <UserOutlined /> },
        { type: "divider" as const },
        {
          key: "logout",
          label: "Đăng xuất",
          icon: <LogoutOutlined />,
          danger: true,
        },
      ]
    : [
        { key: "login", label: "Đăng nhập", icon: <LoginOutlined /> },
        { key: "register", label: "Đăng ký", icon: <UserOutlined /> },
      ];

  return (
    <>
      <header className={`main-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="header-top-wrapper">
          <div className="header-container">
            {/* Mobile menu button */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="lg:hidden header-icon-btn mobile-menu-btn"
              onClick={() => setMobileMenuVisible(true)}
            />

            {/* Logo */}
            <div className="header-logo" onClick={() => navigate("/client")}>
              <img
                src="/logo_hikari.png"
                alt="Hikari Camera"
                className="logo-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/160x50?text=HIKARI";
                }}
              />
            </div>

            {/* Search box - desktop */}
            <div className="header-search">
              <div className="search-wrapper">
                <SearchOutlined className="search-icon-prefix" />
                <input
                  type="text"
                  placeholder="Bạn đang tìm máy ảnh, ống kính nào?"
                  className="search-input-field"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch(searchValue);
                  }}
                />
                <button
                  type="button"
                  className="search-submit-btn"
                  onClick={() => handleSearch(searchValue)}
                >
                  Tìm kiếm
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="header-actions">
              {/* Mobile search button */}
              <Button
                type="text"
                icon={<SearchOutlined />}
                className="md:hidden mobile-search-trigger"
                onClick={() => setMobileSearchVisible(true)}
              />

              {/* Tra cứu đơn hàng & Phiếu giảm giá (Desktop Only) */}
              <div className="header-utilities hidden-on-mobile">
                <button
                  type="button"
                  className="utility-btn"
                  onClick={() => navigate("/client/orders")}
                >
                  <FileSearchOutlined /> Tra cứu đơn hàng
                </button>
                <button
                  type="button"
                  className="utility-btn"
                  onClick={() => navigate("/client/vouchers")}
                >
                  <TagOutlined /> Khuyến mãi
                </button>
              </div>

              <div className="header-divider hidden-on-mobile"></div>

              {/* Account */}
              <Dropdown
                menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <button type="button" className="action-btn">
                  {isLoggedIn ? (
                    <Avatar
                      size={28}
                      src={user?.image ?? user?.pictureUrl}
                      icon={
                        !(user?.image ?? user?.pictureUrl) && <UserOutlined />
                      }
                      style={{ backgroundColor: "#D32F2F" }}
                    />
                  ) : (
                    <div className="action-icon-wrapper">
                      <UserOutlined />
                    </div>
                  )}
                  <div className="action-text-wrapper hidden-on-tablet">
                    <span className="action-label">Tài khoản</span>
                    <span className="action-value">
                      {isLoggedIn
                        ? user?.fullName?.split(" ").pop()
                        : "Đăng nhập"}
                    </span>
                  </div>
                </button>
              </Dropdown>

              {/* Notification Bell */}
              {isCustomer && (
                <Popover
                  content={notifContent}
                  trigger="click"
                  open={notifOpen}
                  onOpenChange={setNotifOpen}
                  placement="bottomRight"
                >
                  <button type="button" className="action-btn">
                    <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                      <div className="action-icon-wrapper">
                        <BellOutlined />
                      </div>
                    </Badge>
                  </button>
                </Popover>
              )}

              {/* Cart */}
              <button
                type="button"
                className="action-btn cart-btn"
                onClick={() => navigate("/client/cart")}
              >
                <Badge count={cartCount} showZero offset={[-4, 4]}>
                  <div className="action-icon-wrapper">
                    <ShoppingCartOutlined />
                  </div>
                </Badge>
                <span className="cart-text hidden-on-tablet">Giỏ hàng</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {mobileSearchVisible && (
        <div className="mobile-search-overlay">
          <div className="mobile-search-bar">
            <SearchOutlined className="mobile-search-prefix" />
            <input
              type="text"
              autoFocus
              placeholder="Tìm kiếm sản phẩm..."
              className="mobile-search-field"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch(searchValue);
              }}
            />
            <button
              type="button"
              className="mobile-search-submit"
              onClick={() => handleSearch(searchValue)}
            >
              Tìm
            </button>
            <button
              type="button"
              className="mobile-search-close"
              onClick={() => setMobileSearchVisible(false)}
            >
              <CloseOutlined />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      <Drawer
        title={
          <img
            src="/logo_hikari.png"
            alt="Hikari"
            className="h-8"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/100x30?text=HIKARI";
            }}
          />
        }
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={300}
        className="mobile-menu-drawer"
      >
        {isLoggedIn ? (
          <div className="mobile-user-card">
            <Avatar
              size={48}
              src={user?.image ?? user?.pictureUrl}
              icon={!(user?.image ?? user?.pictureUrl) && <UserOutlined />}
              style={{ backgroundColor: "#D32F2F" }}
            />
            <div className="user-info">
              <h4>{user?.fullName}</h4>
              <p>{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="mobile-auth-grid">
            <Button
              type="primary"
              icon={<LoginOutlined />}
              block
              onClick={() => navigate("/login")}
            >
              Đăng nhập
            </Button>
            <Button
              icon={<UserOutlined />}
              block
              onClick={() => navigate("/register")}
            >
              Đăng ký
            </Button>
          </div>
        )}

        <div className="mobile-nav-list">
          <div className="nav-title">Hỗ trợ khách hàng</div>
          <a href="/client/orders" className="nav-item-link">
            <FileSearchOutlined /> Tra cứu đơn hàng
          </a>
          <a href="/client/vouchers" className="nav-item-link">
            <TagOutlined /> Phiếu giảm giá
          </a>
          <a href="tel:19001909" className="nav-item-link">
            <PhoneOutlined /> Gọi tư vấn (1900 1909)
          </a>
        </div>

        {isLoggedIn && (
          <Button
            icon={<LogoutOutlined />}
            danger
            block
            className="mt-4"
            onClick={() => {
              dispatch(authActions.logout({ isAdmin: false }));
              navigate("/client");
              setMobileMenuVisible(false);
            }}
          >
            Đăng xuất
          </Button>
        )}
      </Drawer>

      <style>{`
        /* Core Layout */
        .main-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: linear-gradient(180deg, #1b222c 0%, #12161c 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }
        .main-header.scrolled {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        .header-top-wrapper {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .header-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 32px;
        }

        /* Logo */
        .header-logo {
          cursor: pointer;
          flex-shrink: 0;
        }
        .logo-img {
          height: 40px;
          object-fit: contain;
        }

        /* Advanced Search Bar */
        .header-search {
          flex: 1;
          max-width: 600px;
          margin: 0 auto;
        }
        .search-wrapper {
          display: flex;
          align-items: center;
          background: #fff;
          border-radius: 24px;
          padding: 4px 4px 4px 16px;
          height: 44px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: box-shadow 0.2s;
        }
        .search-wrapper:focus-within {
          box-shadow: 0 0 0 2px rgba(198, 40, 40, 0.5);
        }
        .search-icon-prefix {
          color: #9ca3af;
          font-size: 16px;
        }
        .search-input-field {
          flex: 1;
          border: none;
          outline: none;
          padding: 0 12px;
          font-size: 14px;
          color: #1a1a1a;
          background: transparent;
        }
        .search-input-field::placeholder {
          color: #9ca3af;
        }
        .search-submit-btn {
          background: #c62828;
          color: #fff;
          border: none;
          border-radius: 20px;
          padding: 0 20px;
          height: 100%;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .search-submit-btn:hover {
          background: #b71c1c;
        }

        /* Action Area */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }
        .header-utilities {
          display: flex;
          gap: 16px;
        }
        .utility-btn {
          background: transparent;
          border: none;
          color: #a1a1aa;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s;
        }
        .utility-btn:hover {
          color: #fff;
        }
        .header-divider {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,0.15);
        }

        /* Profile & Cart Buttons */
        .action-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 6px 8px;
          border-radius: 8px;
          transition: background 0.2s;
          text-align: left;
        }
        .action-btn:hover {
          background: rgba(255,255,255,0.08);
        }
        .action-icon-wrapper {
          width: 36px;
          height: 36px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 18px;
        }
        .action-text-wrapper {
          display: flex;
          flex-direction: column;
        }
        .action-label {
          font-size: 11px;
          color: #a1a1aa;
          line-height: 1.2;
        }
        .action-value {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          line-height: 1.2;
          white-space: nowrap;
        }
        .cart-btn .action-icon-wrapper {
          background: #c62828;
        }
        .cart-btn .cart-text {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }

        /* Desktop Navigation */
        .header-nav-wrapper {
          background: transparent;
        }
        .desktop-nav {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          gap: 32px;
        }
        .desktop-nav-item {
          color: #d4d4d8;
          font-size: 14px;
          font-weight: 500;
          padding: 12px 0;
          text-decoration: none;
          position: relative;
          transition: color 0.2s;
        }
        .desktop-nav-item:hover {
          color: #fff;
        }
        .desktop-nav-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #c62828;
          transition: width 0.3s ease;
        }
        .desktop-nav-item:hover::after {
          width: 100%;
        }

        /* Notification Popover Styles */
        .notif-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 8px;
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 8px;
        }
        .notif-item {
          border-radius: 6px;
          padding: 10px;
          cursor: pointer;
          margin-bottom: 4px;
          transition: background 0.2s;
        }
        .notif-item.unread {
          background: #f0f8ff;
        }
        .notif-item:hover {
          background: #f5f5f5;
        }

        /* Mobile Adjustments */
        .mobile-search-trigger {
          color: #fff !important;
          font-size: 20px;
        }
        .mobile-user-card {
          display: flex;
          gap: 16px;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 16px;
        }
        .mobile-user-card h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        .mobile-user-card p {
          margin: 0;
          font-size: 13px;
          color: #666;
        }
        .mobile-auth-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 16px;
        }
        .mobile-nav-list {
          margin-bottom: 24px;
        }
        .nav-title {
          font-size: 12px;
          text-transform: uppercase;
          color: #999;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .nav-item-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          color: #333;
          font-size: 15px;
          text-decoration: none;
        }

        /* Mobile Search Overlay */
        .mobile-search-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1100;
          background: #1b222c;
          border-bottom: 2px solid #c62828;
          padding: 10px 16px;
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .mobile-search-bar {
          display: flex;
          align-items: center;
          background: #fff;
          border-radius: 24px;
          padding: 4px 4px 4px 14px;
          height: 44px;
          gap: 8px;
        }
        .mobile-search-prefix {
          color: #9ca3af;
          font-size: 16px;
          flex-shrink: 0;
        }
        .mobile-search-field {
          flex: 1;
          border: none;
          outline: none;
          font-size: 15px;
          color: #1a1a1a;
          background: transparent;
        }
        .mobile-search-field::placeholder { color: #9ca3af; }
        .mobile-search-submit {
          background: #c62828;
          color: #fff;
          border: none;
          border-radius: 20px;
          padding: 0 16px;
          height: 36px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .mobile-search-close {
          background: transparent;
          border: none;
          color: #6b7280;
          font-size: 16px;
          cursor: pointer;
          padding: 4px 8px;
          flex-shrink: 0;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .hidden-on-tablet { display: none !important; }
          .header-container { gap: 16px; }
          .search-wrapper { max-width: 400px; }
        }
        @media (max-width: 768px) {
          .hidden-on-mobile { display: none !important; }
          .header-search { display: none; }
          .mobile-menu-btn { display: flex !important; color: #fff !important; }
          .header-container { padding: 10px 16px; }
          .logo-img { height: 32px; }
          .action-icon-wrapper { width: 32px; height: 32px; font-size: 16px; }
          .action-btn { padding: 4px; }
        }
      `}</style>
    </>
  );
};

export default Header;
