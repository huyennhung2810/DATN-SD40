import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Input, Button, Badge, Drawer, List, Typography, Space } from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  HomeOutlined,
  CameraOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const ClientHeader: React.FC = () => {
  const location = useLocation();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const menuItems = [
    { key: "/client", icon: <HomeOutlined />, label: "Trang chủ" },
    { key: "/client/products", icon: <CameraOutlined />, label: "Sản phẩm" },
    { key: "/client/about", icon: <InfoCircleOutlined />, label: "Giới thiệu" },
    { key: "/client/contact", icon: <PhoneOutlined />, label: "Liên hệ" },
  ];

  const isActive = (key: string) => location.pathname === key;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backgroundColor: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* Top bar - màu đỏ */}
      <div
        style={{
          backgroundColor: "#ff4d4f",
          padding: "8px 0",
          color: "#fff",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 13 }}>
            Chào mừng đến với Hikari Camera - Chuyên máy ảnh chính hãng
          </Text>
          <Space size={16}>
            <Link to="/client/about" style={{ color: "#fff", fontSize: 13 }}>
              Giới thiệu
            </Link>
            <Link to="/client/contact" style={{ color: "#fff", fontSize: 13 }}>
              Liên hệ
            </Link>
          </Space>
        </div>
      </div>

      {/* Main header */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* Logo */}
        <Link to="/client" style={{ flexShrink: 0 }}>
          <img
            src="/logo_hikari.png"
            alt="Hikari Camera"
            height={50}
            style={{ objectFit: "contain" }}
          />
        </Link>

        {/* Search bar - ẩn trên mobile */}
        <div style={{ flex: 1, maxWidth: 500, display: { xs: "none", md: "block" } } as any}>
          <Input.Search
            placeholder="Tìm kiếm sản phẩm..."
            enterButton={<SearchOutlined />}
            size="large"
            style={{ borderRadius: 8 }}
          />
        </div>

        {/* Actions - ẩn trên mobile */}
        <Space size={24} className="header-actions" style={{ display: "flex", alignItems: "center" }}>
          <Badge count={0} showZero={false}>
            <Button
              type="text"
              icon={<ShoppingCartOutlined style={{ fontSize: 22, color: "#ff4d4f" }} />}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            />
          </Badge>
          <Button
            type="text"
            icon={<UserOutlined style={{ fontSize: 22, color: "#ff4d4f" }} />}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          />
        </Space>

        {/* Mobile menu button */}
        <Button
          type="text"
          icon={<MenuOutlined style={{ fontSize: 24 }} />}
          onClick={() => setMobileMenuVisible(true)}
          style={{ display: "none" }}
          className="mobile-menu-btn"
        />
      </div>

      {/* Navigation menu */}
      <div
        style={{
          backgroundColor: "#fff",
          borderTop: "1px solid #f0f0f0",
          display: "none",
        }}
        className="desktop-nav"
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 16px",
          }}
        >
          <List
            dataSource={menuItems}
            renderItem={(item) => (
              <List.Item
                style={{
                  display: "inline-block",
                  padding: "12px 20px",
                  cursor: "pointer",
                  borderBottom: isActive(item.key) ? "3px solid #ff4d4f" : "3px solid transparent",
                  transition: "all 0.3s",
                }}
              >
                <Link
                  to={item.key}
                  style={{
                    color: isActive(item.key) ? "#ff4d4f" : "#333",
                    fontWeight: isActive(item.key) ? 600 : 400,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </List.Item>
            )}
          />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className="mobile-nav"
        style={{
          backgroundColor: "#fff",
          borderTop: "1px solid #f0f0f0",
          padding: "8px 16px",
          display: "flex",
          overflowX: "auto",
          gap: 8,
        }}
      >
        {menuItems.map((item) => (
          <Link
            key={item.key}
            to={item.key}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              backgroundColor: isActive(item.key) ? "#ff4d4f" : "#f5f5f5",
              color: isActive(item.key) ? "#fff" : "#333",
              whiteSpace: "nowrap",
              fontSize: 14,
              fontWeight: isActive(item.key) ? 600 : 400,
            }}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </div>

      {/* Mobile Menu Drawer */}
      <Drawer
        title={
          <img
            src="/logo_hikari.png"
            alt="Hikari Camera"
            height={40}
            style={{ objectFit: "contain" }}
          />
        }
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
      >
        <div style={{ padding: "16px 0" }}>
          {/* Search in mobile */}
          <Input.Search
            placeholder="Tìm kiếm..."
            style={{ marginBottom: 16 }}
          />
          
          <List
            dataSource={menuItems}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "12px 16px",
                  backgroundColor: isActive(item.key) ? "#fff2f0" : "transparent",
                  borderLeft: isActive(item.key) ? "4px solid #ff4d4f" : "4px solid transparent",
                }}
              >
                <Link
                  to={item.key}
                  style={{
                    color: isActive(item.key) ? "#ff4d4f" : "#333",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                  }}
                  onClick={() => setMobileMenuVisible(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </List.Item>
            )}
          />
          
          <div style={{ marginTop: 24, padding: "0 16px" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button block icon={<UserOutlined />}>
                Đăng nhập
              </Button>
              <Button block icon={<ShoppingCartOutlined />}>
                Giỏ hàng (0)
              </Button>
            </Space>
          </div>
        </div>
      </Drawer>

      {/* CSS cho responsive */}
      <style>{`
        @media (min-width: 768px) {
          .mobile-nav, .mobile-menu-btn {
            display: none !important;
          }
          .desktop-nav {
            display: block !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-nav, .header-actions {
            display: none !important;
          }
          .mobile-nav, .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};

export default ClientHeader;

