import React, { useState, useEffect } from "react";
import { Input, Button, Badge, Drawer, List, Dropdown } from "antd";
import {
  ShoppingCartOutlined,
  SearchOutlined,
  UserOutlined,
  MenuOutlined,
  HeartOutlined,
  PhoneOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);

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

  const userMenuItems = [
    { key: "profile", label: "Tài khoản của tôi" },
    { key: "orders", label: "Đơn hàng của tôi" },
    { key: "wishlist", label: "Sản phẩm yêu thích" },
    { type: "divider" as const },
    { key: "login", label: "Đăng nhập" },
    { key: "register", label: "Đăng ký" },
  ];

  const mainNavItems = [
    { key: "may-anh", label: "Máy ảnh", href: "/client/catalog?category=may-anh" },
    { key: "ong-kinh", label: "Ống kính", href: "/client/catalog?category=ong-kinh" },
    { key: "may-quay", label: "Máy quay", href: "/client/catalog?category=may-quay" },
    { key: "gimbal", label: "Gimbal", href: "/client/catalog?category=gimbal" },
    { key: "phu-kien", label: "Phụ kiện", href: "/client/catalog?category=phu-kien" },
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
          <div
            className="header-logo"
            onClick={() => navigate("/client")}
          >
            <img
              src="/logo_hikari.png"
              alt="Hikari Camera"
              className="logo-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/150x50?text=HIKARI";
              }}
            />
          </div>

          {/* Search box - desktop */}
          <div className="hidden md:flex header-search">
            <div className="search-wrapper">
              <Input
                placeholder="Tìm kiếm máy ảnh, ống kính, phụ kiện..."
                allowClear
                size="large"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
                className="search-input"
                prefix={<SearchOutlined className="search-icon" />}
              />
              <Button
                type="primary"
                size="large"
                className="search-btn"
                onClick={() => handleSearch(searchValue)}
              >
                Tìm kiếm
              </Button>
            </div>
          </div>

          {/* Actions */}
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
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button type="text" className="header-icon-btn">
                <UserOutlined />
                <span className="hidden lg:inline action-text">Tài khoản</span>
              </Button>
            </Dropdown>

            {/* Cart */}
            <Badge count={0} showZero={false} className="cart-badge">
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                className="cart-btn"
                onClick={() => navigate("/client/cart")}
              >
                <span className="hidden lg:inline">Giỏ hàng</span>
              </Button>
            </Badge>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <div className={`mobile-search-overlay ${mobileSearchVisible ? "active" : ""}`}>
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
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/100x30?text=HIKARI";
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
            Giỏ hàng (0)
          </Button>
        </div>
      </Drawer>

      <style>{`
        .main-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #fff;
          transition: all 0.3s ease;
        }

        .main-header.scrolled {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 24px;
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
        }

        .logo-img {
          height: 44px;
          width: auto;
          object-fit: contain;
        }

        @media (max-width: 768px) {
          .logo-img {
            height: 36px;
          }
        }

        .header-search {
          flex: 1;
          max-width: 600px;
        }

        .search-wrapper {
          display: flex;
          width: 100%;
          gap: 0;
        }

        .search-input {
          border-radius: 12px 0 0 12px !important;
          border: 2px solid #e5e5e5 !important;
          border-right: none !important;
          background: #f9fafb;
          padding: 8px 16px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .search-input:hover,
        .search-input:focus {
          border-color: #D32F2F !important;
          background: #fff;
        }

        .search-input:focus {
          box-shadow: none !important;
        }

        .search-icon {
          color: #9ca3af;
        }

        .search-btn {
          border-radius: 0 12px 12px 0 !important;
          background: #1a1a1a !important;
          border: 2px solid #1a1a1a !important;
          padding: 0 24px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
        }

        .search-btn:hover {
          background: #333 !important;
          border-color: #333 !important;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #1a1a1a !important;
          font-weight: 500;
          height: 44px;
          padding: 0 14px;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .header-icon-btn:hover {
          background: #f5f5f5 !important;
          color: #D32F2F !important;
        }

        .action-text {
          font-size: 13px;
        }

        .cart-btn {
          background: #D32F2F !important;
          border: none !important;
          border-radius: 10px !important;
          font-weight: 600;
          height: 44px;
          padding: 0 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .cart-btn:hover {
          background: #b71c1c !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
        }

        .cart-badge .ant-badge-count {
          background: #1a1a1a;
          font-size: 10px;
          min-width: 18px;
          height: 18px;
          line-height: 18px;
        }

        /* Mobile Search Overlay */
        .mobile-search-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
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
          background: #fff;
          transform: translateY(-100%);
          transition: transform 0.3s;
        }

        .mobile-search-overlay.active .mobile-search-container {
          transform: translateY(0);
        }

        .mobile-search-input {
          flex: 1;
          height: 48px;
          border-radius: 12px !important;
          font-size: 16px;
        }

        .mobile-search-close {
          width: 48px;
          height: 48px;
          border-radius: 12px !important;
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

          .cart-btn {
            height: 40px;
            padding: 0 14px;
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
