import React from "react";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  LineChartOutlined,
  CameraOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  TeamOutlined,
  TagOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Avatar,
  Typography,
  Space,
  Dropdown,
  type MenuProps,
  Button,
} from "antd";
import { useLocation } from "react-router-dom";

const { Text, Title } = Typography;

const pageInfoMap: Record<
  string,
  { title: string; desc: string; icon: React.ReactNode }
> = {
  "/statistics": {
    title: "Thống kê",
    desc: "Xem và quản lý các số liệu thống kê về doanh thu, đơn hàng và hiệu suất nhân viên",
    icon: <LineChartOutlined />,
  },
  "/product": {
    title: "Quản lý Sản phẩm",
    desc: "Quản lý danh mục máy ảnh, ống kính và phụ kiện Canon",
    icon: <CameraOutlined />,
  },
  "/orders": {
    title: "Quản lý Đơn hàng",
    desc: "Theo dõi trạng thái đơn hàng và lịch sử giao dịch",
    icon: <ShoppingCartOutlined />,
  },
  "/customer": {
    title: "Quản lý Khách hàng",
    desc: "Xem và quản lý thông tin khách hàng thân thiết",
    icon: <TeamOutlined />,
  },
  "/employee": {
    title: "Quản lý Nhân viên",
    desc: "Xem và quản lý hồ sơ, hiệu suất nhân viên",
    icon: <UserOutlined />,
  },
  "/pos": {
    title: "Bán hàng tại quầy",
    desc: "Hệ thống thanh toán nhanh tại cửa hàng",
    icon: <ShopOutlined />,
  },
  "/voucher": {
    title: "Quản lý Phiếu giảm giá",
    desc: "Thiết lập các mã giảm giá và chương trình tri ân",
    icon: <TagOutlined />,
  },
  "/promotion": {
    title: "Quản lý Đợt giảm giá",
    desc: "Quản lý các đợt giảm giá theo sự kiện",
    icon: <CalendarOutlined />,
  },
};

const Header: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const currentPage = pageInfoMap[currentPath] || {
    title: "Tổng quan",
    desc: "Chào mừng bạn quay trở lại hệ thống quản lý",
    icon: <ShopOutlined />,
  };

  const items: MenuProps["items"] = [
    { key: "profile", label: "Hồ sơ cá nhân", icon: <UserOutlined /> },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <header
      style={{
        height: "60px",
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0",
        backgroundColor: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <Space size="middle" align="center">
        <div
          style={{
            padding: "10px",
            backgroundColor: "#f8c0c0",
            borderRadius: "8px",
            color: "#ff1818",
            fontSize: "22px",
            display: "flex",
          }}
        >
          {currentPage.icon}
        </div>
        <div>
          <Title
            level={4}
            style={{ margin: 0, fontWeight: 600, fontSize: "18px" }}
          >
            {currentPage.title}
          </Title>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {currentPage.desc}
          </Text>
        </div>
      </Space>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Badge count={3} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: "20px" }} />}
          />
        </Badge>

        <Dropdown menu={{ items }} trigger={["click"]}>
          <Space
            style={{
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "8px",
            }}
            className="hover:bg-gray-50 transition-all"
          >
            <div style={{ textAlign: "right", lineHeight: "1.2" }}>
              <div style={{ fontWeight: 600, fontSize: "14px" }}>Nhung</div>
              <Text type="secondary" style={{ fontSize: "11px" }}>
                Quản trị viên
              </Text>
            </div>
            <Avatar
              icon={<UserOutlined />}
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nhung"
              style={{ border: "2px solid #e6f7ff" }}
            />
          </Space>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
