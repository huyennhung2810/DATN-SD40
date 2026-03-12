import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Typography } from "antd";
import {
  CameraOutlined,
  TeamOutlined,
  GiftOutlined,
  LineChartOutlined,
  ShopOutlined,
  OrderedListOutlined,
  UsergroupAddOutlined,
  TagOutlined,
  CalendarOutlined,
  UserOutlined,
  ScheduleOutlined,
  SwapOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  PictureOutlined,
  KeyOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to get selected key - matches parent path for nested routes
  const getSelectedKey = () => {
    const path = location.pathname;
    // Check exact match first
    if (items.some((item: any) => item.key === path)) {
      return path;
    }
    // Check if path starts with any menu key
    for (const item of items) {
      if (item.children) {
        for (const child of item.children) {
          if (path.startsWith(child.key as string)) {
            return child.key;
          }
        }
      }
      if (item.key && path.startsWith(item.key as string)) {
        return item.key;
      }
    }
    return path;
  };

  const items = [
    {
      key: "/statistics",
      icon: <LineChartOutlined />,
      label: "Thống kê",
      style: { marginBottom: 4 },
    },
    {
      key: "/pos",
      icon: <ShopOutlined />,
      label: "Bán hàng tại quầy",
    },
    {
      key: "/orders",
      icon: <OrderedListOutlined />,
      label: "Quản lý đơn hàng",
    },
    {
      key: "/serial",
      icon: <TagOutlined />,
      label: "Quản lý Serial",
    },
    {
      key: "/product",
      icon: <CameraOutlined />,
      label: "Quản lý sản phẩm",
      children: [
        {
          key: "/admin/product-categories",
          icon: <TagOutlined />,
          label: "Loại sản phẩm",
        },
        { key: "/admin/products", icon: <CameraOutlined />, label: "Sản phẩm" },
        {
          key: "/admin/tech-spec",
          icon: <SettingOutlined />,
          label: "Thông số kỹ thuật",
        },
        {
          key: "/products/product-detail",
          icon: <CameraOutlined />,
          label: "Sản phẩm chi tiết",
        }
      ],
    },
    {
      key: "sub-account",
      icon: <UsergroupAddOutlined />,
      label: "Quản lý người dùng",
      children: [
        { key: "/customer", icon: <TeamOutlined />, label: "Khách hàng" },
        { key: "/employee", icon: <UserOutlined />, label: "Nhân viên" },
        { key: "/admin/accounts", icon: <KeyOutlined />, label: "Quản lý tài khoản" },
      ],
    },
    {
      key: "sub-voucher",
      icon: <GiftOutlined />,
      label: "Quản lý giảm giá",
      children: [
        { key: "/voucher", icon: <TagOutlined />, label: "Phiếu giảm giá" },
        {
          key: "/discount",
          icon: <CalendarOutlined />,
          label: "Đợt giảm giá",
        },
      ],
    },
    {
      key: "/admin/banners",
      icon: <PictureOutlined />,
      label: "Quản lý Banner",
    },
    {
      key: "/schedule",
      icon: <CalendarOutlined />,
      label: "Quản lý Lịch làm việc",
      children: [
        {
          key: "/work-schedule",
          icon: <ScheduleOutlined />,
          label: "Lịch làm việc",
        },
        {
          key: "/shift-handover",
          icon: <SwapOutlined />,
          label: "Giao ca",
        },
        {
          key: "/shift-template",
          icon: <ClockCircleOutlined />,
          label: "Quản lý ca làm việc",
        },
      ],
    },
  ];

  return (
    <div className="admin-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <CameraOutlined />
        </div>
        <div className="logo-text">
          <Text strong className="logo-title">HIKARI</Text>
          <Text className="logo-subtitle">Camera Admin</Text>
        </div>
      </div>

      {/* Menu */}
      <div className="sidebar-menu">
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          style={{
            borderRight: 0,
            background: "transparent",
          }}
          items={items}
          onClick={({ key }) => navigate(key)}
        />
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-version">
          <Text type="secondary">v1.0.0</Text>
        </div>
      </div>

      <style>{`
        .admin-sidebar {
          width: var(--sidebar-width);
          min-width: var(--sidebar-width);
          height: 100vh;
          position: sticky;
          top: 0;
          background: linear-gradient(180deg, #0A2540 0%, #0d2d52 100%);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Logo */
        .sidebar-logo {
          padding: 20px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0A84FF 0%, #0066CC 100%);
          border-radius: 10px;
          color: #fff;
          font-size: 20px;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          color: #fff;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 1px;
          line-height: 1.2;
        }

        .logo-subtitle {
          color: rgba(255, 255, 255, 0.5);
          font-size: 11px;
          letter-spacing: 0.5px;
        }

        /* Menu */
        .sidebar-menu {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 12px 12px;
        }

        .sidebar-menu::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-menu::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-menu::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .sidebar-menu .ant-menu {
          background: transparent;
          border: none;
        }

        .sidebar-menu .ant-menu-item,
        .sidebar-menu .ant-menu-submenu-title {
          color: rgba(255, 255, 255, 0.7);
          border-radius: 8px;
          margin: 2px 0;
          height: 40px;
          line-height: 40px;
        }

        .sidebar-menu .ant-menu-item:hover,
        .sidebar-menu .ant-menu-submenu-title:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        .sidebar-menu .ant-menu-item-selected {
          background: linear-gradient(90deg, rgba(10, 132, 255, 0.3) 0%, rgba(10, 132, 255, 0.1) 100%) !important;
          color: #fff !important;
        }

        .sidebar-menu .ant-menu-item-selected::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: #0A84FF;
          border-radius: 0 4px 4px 0;
        }

        .sidebar-menu .ant-menu-item .anticon,
        .sidebar-menu .ant-menu-submenu-title .anticon {
          font-size: 16px;
        }

        .sidebar-menu .ant-menu-submenu-arrow {
          color: rgba(255, 255, 255, 0.5);
        }

        .sidebar-menu .ant-menu-sub {
          background: transparent !important;
        }

        .sidebar-menu .ant-menu-submenu-selected > .ant-menu-submenu-title {
          color: #fff;
        }

        /* Footer */
        .sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .sidebar-version {
          text-align: center;
        }

        /* Override Ant Design variables */
        .admin-sidebar .ant-menu-light {
          background: transparent !important;
        }

        .admin-sidebar .ant-menu-item-icon {
          color: inherit !important;
        }

        .admin-sidebar .ant-menu-item-selected .ant-menu-item-icon {
          color: #0A84FF !important;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
