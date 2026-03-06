import React, { useState } from "react";
import { Input, Button, Badge, Typography, Drawer, List, Dropdown } from "antd";
import {
  ShoppingCartOutlined,
  SearchOutlined,
  UserOutlined,
  MenuOutlined,
  HeartOutlined,
  RightOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GiftOutlined,
  TruckOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

interface CustomerHeaderProps {
  onMenuClick?: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const handleSearch = (value: string) => {
    navigate(`/client/catalog?q=${encodeURIComponent(value)}`);
  };

  // Top bar utilities
  const utilityItems = [
    { key: "hotline", label: "Hotline", value: "1900 1909", icon: <PhoneOutlined /> },
    { key: "showroom", label: "Cửa hàng", value: "Xem bản đồ", icon: <EnvironmentOutlined /> },
    { key: "warranty", label: "Bảo hành", value: "Tra cứu BH", icon: <SafetyCertificateOutlined /> },
    { key: "shipping", label: "Vận chuyển", value: "Free 30km", icon: <TruckOutlined /> },
  ];

  // Main navigation
  const mainNavItems = [
    { key: "may-anh", label: "Máy ảnh", href: "/client/catalog?category=may-anh" },
    { key: "ong-kinh", label: "Ống kính", href: "/client/catalog?category=ong-kinh" },
    { key: "action-cam", label: "Action Cam", href: "/client/catalog?category=action-cam" },
    { key: "gimbal", label: "Gimbal", href: "/client/catalog?category=gimbal" },
    { key: "tripod", label: "Tripod", href: "/client/catalog?category=tripod" },
    { key: "flash", label: "Flash", href: "/client/catalog?category=flash" },
    { key: "micro", label: "Micro", href: "/client/catalog?category=micro" },
    { key: "phu-kien", label: "Phụ kiện", href: "/client/catalog?category=phu-kien" },
    { key: "hang-moi", label: "Hàng mới", href: "/client/catalog?new=true" },
    { key: "khuyen-mai", label: "Khuyến mãi", href: "/client/catalog?sale=true" },
  ];

  // Mega menu categories
  const megaMenuCategories = [
    {
      title: "Máy ảnh",
      icon: "📷",
      items: [
        { name: "Mirrorless", href: "/client/catalog?category=may-anh-mirrorless" },
        { name: "DSLR", href: "/client/catalog?category=may-anh-dslr" },
        { name: "Compact", href: "/client/catalog?category=may-anh-compact" },
        { name: "Cinema", href: "/client/catalog?category=may-anh-cinema" },
      ],
    },
    {
      title: "Ống kính",
      icon: "🔭",
      items: [
        { name: "Canon RF/RF-S", href: "/client/catalog?brand=canon&category=lens" },
        { name: "Sony E-mount", href: "/client/catalog?brand=sony&category=lens" },
        { name: "Nikon Z", href: "/client/catalog?brand=nikon&category=lens" },
        { name: "Fujifilm X", href: "/client/catalog?brand=fujifilm&category=lens" },
        { name: "Sigma Art", href: "/client/catalog?brand=sigma&category=lens" },
        { name: "Tamron", href: "/client/catalog?brand=tamron&category=lens" },
      ],
    },
    {
      title: "Phụ kiện",
      icon: "🎒",
      items: [
        { name: "Thẻ nhớ", href: "/client/catalog?category=the-nho" },
        { name: "Pin & Sạc", href: "/client/catalog?category=pin-sac" },
        { name: "Túi & Balo", href: "/client/catalog?category=tui-balo" },
        { name: "Kính lọc", href: "/client/catalog?category=kinh-loc" },
        { name: "Tripod", href: "/client/catalog?category=tripod" },
        { name: "Gimbal", href: "/client/catalog?category=gimbal" },
      ],
    },
    {
      title: "Thiết bị quay",
      icon: "🎥",
      items: [
        { name: "Action Cam", href: "/client/catalog?category=action-cam" },
        { name: "Drone", href: "/client/catalog?category=drone" },
        { name: "Gimbal", href: "/client/catalog?category=gimbal" },
        { name: "Microphone", href: "/client/catalog?category=micro" },
      ],
    },
  ];

  const userMenuItems = [
    { key: "profile", label: "Tài khoản của tôi" },
    { key: "orders", label: "Đơn hàng của tôi" },
    { key: "wishlist", label: "Sản phẩm yêu thích" },
    { type: "divider" as const },
    { key: "logout", label: "Đăng xuất", danger: true },
  ];

  return (
    <>
      <header className="customer-header">
        {/* Top Utility Bar */}
        <div className="header-top-bar">
          <div className="container mx-auto">
            <div className="flex items-center justify-between h-9">
              <div className="flex items-center gap-6">
                {utilityItems.slice(0, 3).map((item) => (
                  <a key={item.key} href="#" className="top-bar-item">
                    <span className="top-bar-icon">{item.icon}</span>
                    <span className="top-bar-label">{item.label}:</span>
                    <span className="top-bar-value">{item.value}</span>
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {utilityItems.slice(3).map((item) => (
                  <a key={item.key} href="#" className="top-bar-item">
                    <span className="top-bar-icon">{item.icon}</span>
                    <span className="top-bar-value">{item.value}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="header-main">
          <div className="container mx-auto">
            <div className="flex items-center justify-between h-16 md:h-20 gap-4">
              {/* Mobile menu button */}
              <Button
                type="text"
                icon={<MenuOutlined />}
                className="lg:hidden header-icon-btn"
                onClick={() => setMobileMenuVisible(true)}
              />

              {/* Logo */}
              <div
                className="flex-shrink-0 cursor-pointer flex items-center gap-2"
                onClick={() => navigate("/client")}
              >
                <div className="logo-wrapper">
                  <img
                    src="/logo_hikari.png"
                    alt="Hikari Camera"
                    className="h-10 md:h-12"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/150x50?text=HIKARI";
                    }}
                  />
                </div>
              </div>

              {/* Search box - desktop */}
              <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
                <div className="search-wrapper">
                  <Input
                    placeholder="Tìm kiếm máy ảnh, ống kính, phụ kiện..."
                    allowClear
                    size="large"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
                    className="search-input"
                    prefix={<SearchOutlined className="text-gray-400" />}
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
              <div className="flex items-center gap-1 md:gap-2">
                {/* Mobile search button */}
                <Button
                  type="text"
                  icon={<SearchOutlined />}
                  className="md:hidden header-icon-btn"
                  onClick={() => navigate("/client/catalog")}
                />

                {/* Wishlist */}
                <Button
                  type="text"
                  icon={<HeartOutlined />}
                  className="header-icon-btn hidden sm:flex"
                >
                  <span className="hidden lg:inline text-sm">Yêu thích</span>
                </Button>

                {/* User */}
                <Dropdown
                  menu={{ items: userMenuItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button type="text" className="header-icon-btn">
                    <UserOutlined />
                    <span className="hidden lg:inline text-sm ml-1">Tài khoản</span>
                  </Button>
                </Dropdown>

                {/* Cart */}
                <Badge count={0} showZero={false} className="cart-badge">
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    className="cart-btn"
                  >
                    <span className="hidden lg:inline">Giỏ hàng</span>
                  </Button>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - desktop */}
        <nav className="header-nav hidden lg:block">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              {/* Category Menu with Mega */}
              <div className="category-menu">
                <Button type="text" className="category-menu-btn">
                  <MenuOutlined />
                  <span className="ml-2">Danh mục</span>
                  <RightOutlined className="ml-2 text-xs opacity-70" />
                </Button>
                <div className="category-dropdown">
                  <div className="mega-menu-grid">
                    {megaMenuCategories.map((cat) => (
                      <div key={cat.title} className="mega-menu-column">
                        <div className="mega-menu-title">
                          <span className="mega-menu-icon">{cat.icon}</span>
                          <span>{cat.title}</span>
                        </div>
                        <ul className="mega-menu-list">
                          {cat.items.map((item) => (
                            <li key={item.name}>
                              <a href={item.href} className="mega-menu-link">
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <div className="mega-menu-column mega-menu-promos">
                      <div className="promo-box">
                        <GiftOutlined className="promo-icon" />
                        <Text strong>Khuyến mãi đặc biệt</Text>
                        <Text type="secondary" className="text-xs block mt-1">
                          Giảm giá lên đến 30%
                        </Text>
                        <Button type="link" size="small" className="mt-2 p-0 text-red-500">
                          Xem chi tiết <RightOutlined />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Menu */}
              <div className="flex items-center gap-0">
                {mainNavItems.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    className="nav-link"
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              {/* Hotline */}
              <div className="flex items-center gap-2 text-white">
                <PhoneOutlined className="text-sm" />
                <a href="tel:19001909" className="font-semibold hover:text-white/90 text-sm">
                  1900 1909
                </a>
              </div>
            </div>
          </div>
        </nav>
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
        <div className="mobile-utilities mb-4 pb-4 border-b">
          <div className="grid grid-cols-2 gap-2">
            <a href="tel:19001909" className="mobile-utility-item">
              <PhoneOutlined /> Gọi tư vấn
            </a>
            <a href="#" className="mobile-utility-item">
              <EnvironmentOutlined /> Cửa hàng
            </a>
            <a href="#" className="mobile-utility-item">
              <TruckOutlined /> Vận chuyển
            </a>
            <a href="#" className="mobile-utility-item">
              <SafetyCertificateOutlined /> Bảo hành
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

        <div className="mt-4 pt-4 border-t">
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            block
            className="!bg-red-600 !border-red-600 h-12"
          >
            Giỏ hàng (0)
          </Button>
        </div>
      </Drawer>

      <style>{`
        /* Header Styles */
        .customer-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .customer-header .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
        }

        /* Top Bar */
        .header-top-bar {
          background: linear-gradient(90deg, #D32F2F 0%, #E53935 50%, #D32F2F 100%);
          height: 36px;
          font-size: 12px;
        }

        .top-bar-item {
          display: flex;
          align-items: center;
          gap: 4px;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          transition: all 0.2s;
        }

        .top-bar-item:hover {
          color: #fff;
        }

        .top-bar-icon {
          font-size: 11px;
        }

        .top-bar-label {
          color: rgba(255, 255, 255, 0.7);
        }

        .top-bar-value {
          font-weight: 600;
        }

        /* Main Header */
        .header-main {
          background: #fff;
          border-bottom: 1px solid #f0f0f0;
        }

        .logo-wrapper {
          display: flex;
          align-items: center;
        }

        .logo-wrapper img {
          object-fit: contain;
        }

        /* Search */
        .search-wrapper {
          display: flex;
          width: 100%;
          gap: 0;
        }

        .search-input {
          border-radius: 8px 0 0 8px !important;
          border-color: #E0E0E0 !important;
          flex: 1;
        }

        .search-input:focus {
          border-color: #D32F2F !important;
          box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.1) !important;
        }

        .search-btn {
          border-radius: 0 8px 8px 0 !important;
          background: #D32F2F !important;
          border-color: #D32F2F !important;
          padding: 0 24px;
          font-weight: 600;
        }

        .search-btn:hover {
          background: #C62828 !important;
          border-color: #C62828 !important;
        }

        /* Header Buttons */
        .header-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: #374151 !important;
          font-weight: 500;
          height: 40px;
          border-radius: 8px;
        }

        .header-icon-btn:hover {
          background: #FEF2F2 !important;
          color: #D32F2F !important;
        }

        .cart-btn {
          background: #D32F2F !important;
          border-color: #D32F2F !important;
          border-radius: 8px !important;
          font-weight: 600;
          height: 40px;
          padding: 0 16px;
        }

        .cart-btn:hover {
          background: #C62828 !important;
          border-color: #C62828 !important;
        }

        .cart-badge .ant-badge-count {
          background: #D32F2F;
        }

        /* Navigation */
        .header-nav {
          background: #fff;
          height: 44px;
          border-bottom: 2px solid #D32F2F;
        }

        /* Category Menu */
        .category-menu {
          position: relative;
          height: 44px;
        }

        .category-menu-btn {
          color: #333 !important;
          font-weight: 600;
          height: 44px;
          padding: 0 16px;
          background: #f5f5f5;
          border-radius: 0;
          font-size: 14px;
        }

        .category-menu-btn:hover {
          background: #eee !important;
        }

        .category-dropdown {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 100;
          min-width: 800px;
          background: #fff;
          border-radius: 0 8px 8px 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          overflow: hidden;
        }

        .category-menu:hover .category-dropdown {
          display: block;
        }

        .mega-menu-grid {
          display: flex;
          padding: 16px;
          gap: 24px;
        }

        .mega-menu-column {
          flex: 1;
          min-width: 160px;
        }

        .mega-menu-promos {
          flex: 0 0 200px;
        }

        .mega-menu-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #D32F2F;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 8px;
        }

        .mega-menu-icon {
          font-size: 18px;
        }

        .mega-menu-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .mega-menu-list li {
          margin-bottom: 6px;
        }

        .mega-menu-link {
          color: #555;
          text-decoration: none;
          font-size: 13px;
          transition: all 0.2s;
          display: block;
          padding: 4px 0;
        }

        .mega-menu-link:hover {
          color: #D32F2F;
          padding-left: 4px;
        }

        .promo-box {
          background: linear-gradient(135deg, #FFF5F5 0%, #FFEBEE 100%);
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #FFCDD2;
        }

        .promo-icon {
          font-size: 32px;
          color: #D32F2F;
          margin-bottom: 8px;
        }

        /* Nav Links */
        .nav-link {
          display: inline-flex;
          align-items: center;
          padding: 12px 14px;
          color: #333;
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s;
          position: relative;
          white-space: nowrap;
        }

        .nav-link:hover {
          background: #FEF2F2;
          color: #D32F2F;
        }

        /* Mobile Menu */
        .mobile-menu-drawer .ant-drawer-header {
          border-bottom: 1px solid #E5E5EA;
        }

        .mobile-nav-link {
          display: block;
          padding: 12px 0;
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          font-size: 15px;
        }

        .mobile-nav-link:hover {
          color: #D32F2F;
        }

        .mobile-utility-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f5f5f5;
          border-radius: 8px;
          color: #333;
          font-size: 13px;
          text-decoration: none;
          justify-content: center;
        }

        .mobile-utility-item:hover {
          background: #eee;
        }

        /* Responsive */
        @media (max-width: 1023px) {
          .header-main {
            height: auto;
            padding: 12px 0;
          }
        }
      `}</style>
    </>
  );
};

export default CustomerHeader;
