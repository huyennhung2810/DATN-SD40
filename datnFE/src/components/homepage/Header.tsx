import React, { useState, useEffect } from "react";
import { Input, Button, Badge, Drawer, List, Dropdown, Avatar } from "antd";
import {
  ShoppingCartOutlined,
  SearchOutlined,
  UserOutlined,
  MenuOutlined,
  HeartOutlined,
  PhoneOutlined,
  CloseOutlined,
  LogoutOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../redux/store";
import { setCartCount, clearCartCount } from "../../redux/cart/cartSlice";
import axiosClient from "../../api/axiosClient"; // Nơi bạn cấu hình Axios gọi API
import { useSelector, useDispatch } from "react-redux";
import { authActions } from "../../redux/auth/authSlice";
interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  // === THÊM ĐOẠN CODE REDUX & CALL API NÀY VÀO ĐÂY ===
  const dispatch = useDispatch();
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);
  const cartCount = useSelector((state: RootState) => state.cart.cartCount);

  useEffect(() => {
    if (user && user.userId && user.roles?.includes("CUSTOMER")) {
      // Gọi API lấy giỏ hàng ngay khi có user đăng nhập (chỉ dành cho CUSTOMER)
      axiosClient
        .get(`/client/cart?customerId=${user.userId}`)
        .then((response) => {
          const cartItems = response.data;
          // Hiển thị số lượng "Loại sản phẩm" (Mỗi mặt hàng là 1)
          const count = cartItems.length;
          dispatch(setCartCount(count));
        })
        .catch((error) => {
          console.error("Lỗi lấy số lượng giỏ hàng:", error);
        });
    } else {
      // Chưa đăng nhập hoặc không phải CUSTOMER thì reset số 0
      dispatch(clearCartCount());
    }
  }, [user, dispatch]);
  // ====================================================

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      dispatch(authActions.logout({ isAdmin: false }));
      navigate("/client");
    } else if (key === "profile") {
      navigate("/client/profile");
    } else if (key === "orders") {
      navigate("/client/orders");
    } else if (key === "login") {
      navigate("/login");
    } else if (key === "register") {
      navigate("/register");
    }
  };

  const handleSearch = (value: string) => {
    navigate(`/client/catalog?q=${encodeURIComponent(value)}`);
    setMobileSearchVisible(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userMenuItems = isLoggedIn
    ? [
        { key: "profile", label: "Tài khoản của tôi", icon: <UserOutlined /> },
        {
          key: "orders",
          label: "Đơn hàng của tôi",
          icon: <ShoppingCartOutlined />,
        },
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

  const mainNavItems = [
    {
      key: "may-anh-canon",
      label: "Máy ảnh Canon",
      href: "/client/catalog?brand=canon&category=may-anh",
    },
    {
      key: "ong-kinh",
      label: "Ống kính",
      href: "/client/catalog?category=ong-kinh",
    },
    {
      key: "den-flash",
      label: "Đèn flash",
      href: "/client/catalog?category=den-flash",
    },
    {
      key: "phu-kien",
      label: "Phụ kiện",
      href: "/client/catalog?category=phu-kien",
    },
    { key: "tin-tuc", label: "Tin tức", href: "/client/news" },
  ];

  return (
    <>
      <header className={`main-header ${isScrolled ? "scrolled" : ""}`}>
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
                  "https://via.placeholder.com/150x50?text=HIKARI";
              }}
            />
          </div>

          {/* Search box - desktop */}
          <div className="hidden md:flex header-search">
            <Input
              placeholder="Tìm kiếm"
              allowClear
              size="large"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={(e) =>
                handleSearch((e.target as HTMLInputElement).value)
              }
              className="hdr-search-input"
              suffix={
                <SearchOutlined
                  className="hdr-search-suffix"
                  onClick={() => handleSearch(searchValue)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      handleSearch(searchValue);
                    }
                  }}
                />
              }
            />
          </div>

          {/* Actions — căn phải: yêu thích, tài khoản, giỏ hàng */}
          <div className="header-actions">
            {/* Mobile search button */}
            <Button
              type="text"
              icon={<SearchOutlined />}
              className="md:hidden header-icon-btn"
              onClick={() => setMobileSearchVisible(true)}
            />

            {/* Wishlist */}
            <Button
              type="text"
              icon={<HeartOutlined />}
              className="header-icon-btn hidden sm:flex"
              onClick={() => navigate("/client/wishlist")}
            >
              <span className="hidden lg:inline action-text">Yêu thích</span>
            </Button>

            {/* User */}
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              trigger={["click"]}
              placement="bottomRight"
            >
              {isLoggedIn ? (
                <Button type="text" className="header-icon-btn">
                  <Avatar
                    size={28}
                    src={user?.image ?? user?.pictureUrl}
                    icon={!(user?.image ?? user?.pictureUrl) && <UserOutlined />}
                    style={{ backgroundColor: "#D32F2F" }}
                  />
                  <span className="hidden lg:inline action-text">
                    {user?.fullName?.split(" ").pop()}
                  </span>
                </Button>
              ) : (
                <Button type="text" className="header-icon-btn">
                  <UserOutlined />
                  <span className="hidden lg:inline action-text">
                    Tài khoản
                  </span>
                </Button>
              )}
            </Dropdown>

            {/* Cart — chỉ icon + badge */}
            <button
              type="button"
              className="hdr-cart-btn"
              onClick={() => navigate("/client/cart")}
              aria-label="Giỏ hàng"
            >
              <Badge
                count={cartCount}
                showZero
                offset={[-2, 2]}
                className="hdr-cart-badge"
              >
                <ShoppingCartOutlined className="hdr-cart-icon" />
              </Badge>
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <div
          className={`mobile-search-overlay ${mobileSearchVisible ? "active" : ""}`}
        >
          <div className="mobile-search-container">
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={() => handleSearch(searchValue)}
              autoFocus
              className="mobile-search-input"
            />
            <Button
              type="text"
              icon={<CloseOutlined />}
              className="mobile-search-close"
              onClick={() => setMobileSearchVisible(false)}
            />
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <img
              src="/logo_hikari.png"
              alt="Hikari"
              className="h-8"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/100x30?text=HIKARI";
              }}
            />
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={320}
        className="mobile-menu-drawer"
      >
        <div className="mobile-search mb-4">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={() => {
              handleSearch(searchValue);
              setMobileMenuVisible(false);
            }}
          />
        </div>

        {/* Mobile auth section */}
        {isLoggedIn ? (
          <div className="mobile-user-section mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                size={44}
                src={user?.image ?? user?.pictureUrl}
                icon={!(user?.image ?? user?.pictureUrl) && <UserOutlined />}
                style={{ backgroundColor: "#D32F2F" }}
              />
              <div>
                <div className="font-semibold text-gray-800">
                  {user?.fullName}
                </div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                icon={<UserOutlined />}
                block
                onClick={() => {
                  navigate("/client/profile");
                  setMobileMenuVisible(false);
                }}
              >
                Tài khoản
              </Button>
              <Button
                icon={<LogoutOutlined />}
                danger
                block
                onClick={() => {
                  dispatch(authActions.logout({ isAdmin: false }));
                  navigate("/client");
                  setMobileMenuVisible(false);
                }}
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        ) : (
          <div className="mobile-auth-section mb-4 pb-4 border-b border-gray-100">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="primary"
                icon={<LoginOutlined />}
                block
                onClick={() => {
                  navigate("/login");
                  setMobileMenuVisible(false);
                }}
              >
                Đăng nhập
              </Button>
              <Button
                icon={<UserOutlined />}
                block
                onClick={() => {
                  navigate("/register");
                  setMobileMenuVisible(false);
                }}
              >
                Đăng ký
              </Button>
            </div>
          </div>
        )}

        {/* Mobile utility links */}
        <div className="mobile-utilities mb-4 pb-4 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            <a href="tel:19001909" className="mobile-utility-item">
              <PhoneOutlined /> Gọi tư vấn
            </a>
            <a href="/client/wishlist" className="mobile-utility-item">
              <HeartOutlined /> Yêu thích
            </a>
          </div>
        </div>

        <List
          dataSource={mainNavItems}
          renderItem={(item) => (
            <List.Item className="!px-0">
              <a
                href={item.href}
                className="mobile-nav-link"
                onClick={() => setMobileMenuVisible(false)}
              >
                {item.label}
              </a>
            </List.Item>
          )}
        />

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            block
            className="!bg-red-600 !border-red-600 h-12"
            onClick={() => {
              navigate("/client/cart");
              setMobileMenuVisible(false);
            }}
          >
            Giỏ hàng ({cartCount}) {/* Thay số 0 bằng biến cartCount */}
          </Button>
        </div>
      </Drawer>

      <style>{`
        .main-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          /* Nền xanh-than sẫm: tương phản tốt với logo đỏ, vẫn hòa với UI tối */
          background: linear-gradient(180deg, #1b222c 0%, #12161c 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          transition: box-shadow 0.3s ease;
        }

        .main-header.scrolled {
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .mobile-menu-btn {
          display: none !important;
        }

        @media (max-width: 1023px) {
          .mobile-menu-btn {
            display: flex !important;
          }
        }

        .header-logo {
          flex-shrink: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .logo-img {
          height: 44px;
          width: auto;
          max-height: 48px;
          object-fit: contain;
        }

        @media (max-width: 768px) {
          .logo-img {
            height: 34px;
          }
        }

        .header-search {
          flex: 1;
          min-width: 0;
          max-width: 720px;
        }

        .hdr-search-input {
          border-radius: 4px !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          background: rgba(30, 36, 46, 0.85) !important;
          color: #f3f4f6 !important;
          font-size: 14px;
        }

        .hdr-search-input input::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }

        .hdr-search-input:hover,
        .hdr-search-input-focused {
          border-color: rgba(255, 255, 255, 0.22) !important;
        }

        .hdr-search-input.ant-input-affix-wrapper-focused {
          border-color: #c62828 !important;
          box-shadow: 0 0 0 1px rgba(198, 40, 40, 0.35) !important;
        }

        .hdr-search-suffix {
          color: rgba(255, 255, 255, 0.65);
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
        }

        .hdr-search-suffix:hover {
          color: #fff;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
          flex-shrink: 0;
        }

        .header-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.88) !important;
          font-weight: 500;
          height: 44px;
          padding: 0 12px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .header-icon-btn:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          color: #fff !important;
        }

        .action-text {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.88);
        }

        .hdr-cart-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          padding: 0;
          margin: 0;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 4px;
          background: transparent;
          color: #fff;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }

        .hdr-cart-btn:hover {
          border-color: rgba(255, 255, 255, 0.55);
          background: rgba(255, 255, 255, 0.08);
        }

        .hdr-cart-icon {
          font-size: 22px;
          color: #fff;
        }

        .hdr-cart-badge .ant-badge-count {
          background: #c62828 !important;
          color: #fff !important;
          font-size: 11px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          line-height: 18px;
          box-shadow: 0 0 0 1px #12161c;
        }

        @media (max-width: 768px) {
          .hdr-cart-btn {
            width: 40px;
            height: 40px;
          }
        }

        /* Mobile Search Overlay */
        .mobile-search-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.55);
          z-index: 1001;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s;
        }

        .mobile-search-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        .mobile-search-container {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #1b222c;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          transform: translateY(-100%);
          transition: transform 0.3s;
        }

        .mobile-search-overlay.active .mobile-search-container {
          transform: translateY(0);
        }

        .mobile-search-input {
          flex: 1;
          height: 48px;
          border-radius: 4px !important;
          font-size: 16px;
          background: rgba(30, 36, 46, 0.9) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #fff !important;
        }

        .mobile-search-input input::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }

        .mobile-search-close {
          width: 48px;
          height: 48px;
          border-radius: 8px !important;
          color: #fff !important;
        }

        .mobile-search-close:hover {
          background: rgba(255, 255, 255, 0.08) !important;
        }

        /* Mobile Menu Styles */
        .mobile-menu-drawer .ant-drawer-header {
          border-bottom: 1px solid #e5e5ea;
        }

        .mobile-nav-link {
          display: block;
          padding: 14px 0;
          color: #1a1a1a;
          text-decoration: none;
          font-weight: 500;
          font-size: 15px;
          transition: color 0.2s;
        }

        .mobile-nav-link:hover {
          color: #D32F2F;
        }

        .mobile-utility-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 10px;
          color: #4b5563;
          font-size: 13px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .mobile-utility-item:hover {
          background: #f3f4f6;
          color: #D32F2F;
        }

        @media (max-width: 768px) {
          .header-container {
            padding: 10px 16px;
            gap: 12px;
          }

          .header-actions {
            gap: 4px;
          }

          .header-icon-btn {
            height: 40px;
            padding: 0 10px;
          }

          .mobile-search-overlay {
            display: block;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
