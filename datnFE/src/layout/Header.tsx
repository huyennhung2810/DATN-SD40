import React from "react";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Avatar,
  Typography,
  Space,
  Dropdown,
  message,
  type MenuProps,
  Breadcrumb,
} from "antd";
import { Link, useLocation } from "react-router-dom";

const { Text } = Typography;

const breadcrumbNameMap: Record<string, string> = {
  "/statitics": "Thống kê",
  "/products": "Sản phẩm",
  "/orders": "Quản lý Đơn hàng",
  "/customer": "Khách hàng",
  "/pos": "Bán hàng tại quầy",
  "/employee": "Nhân viên",
  "/chat": "Hỗ trợ khách hàng",
  "/vouchers": "Phiếu giảm giá",
  "/promitions": "Khuyến mãi",
};

const Header: React.FC = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split("/").filter((i) => i);

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    return {
      key: url,
      title: <Link to={url}>{breadcrumbNameMap[url] || "Chi tiết"}</Link>,
    };
  });

  const breadcrumbItems = [...extraBreadcrumbItems];

  const items: MenuProps["items"] = [
    {
      key: "profile",
      label: "Hồ sơ cá nhân",
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: "Cài đặt tài khoản",
      icon: <SettingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      message.success("Đã đăng xuất thành công!");
    } else {
      console.log(`Chuyển đến trang: ${key}`);
    }
  };

  return (
    <header
      style={{
        height: "64px",
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0",
        backgroundColor: "#fff",
        zIndex: 100,
      }}
    >
      <Breadcrumb
        items={breadcrumbItems}
        style={{ fontSize: "15px", fontWeight: 500 }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <Badge count={3} size="small" offset={[2, 2]}>
          <BellOutlined style={{ fontSize: "20px", cursor: "pointer" }} />
        </Badge>

        <Dropdown
          menu={{ items, onClick: handleMenuClick }}
          placement="bottomRight"
          arrow={{ pointAtCenter: true }}
          trigger={["click"]}
        >
          <Space
            size={12}
            style={{
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
            className="user-dropdown"
          >
            <Text strong style={{ fontSize: "14px" }}>
              Nhung
            </Text>
            <Avatar
              icon={<UserOutlined />}
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nhung"
              style={{ backgroundColor: "#1890ff" }}
            />
          </Space>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
