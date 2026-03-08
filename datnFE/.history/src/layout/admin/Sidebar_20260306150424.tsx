import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "antd";
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
  BgColorsOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { key: "/statistics", icon: <LineChartOutlined />, label: "Thống kê" },
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
        },
        {
          key: "/products/color",
          icon: <BgColorsOutlined />,
          label: "Màu sắc",
        },
        {
          key: "/products/storage-capacity",
          icon: <DatabaseOutlined />,
          label: "Dung lượng",
        },
      ],
    },
    {
      key: "/admin/banner",
      icon: <AppstoreOutlined />,
      label: "Quản lý Banner",
    },

    {
      key: "sub-account",
      icon: <UsergroupAddOutlined />,
      label: "Quản lý người dùng",
      children: [
        { key: "/customer", icon: <TeamOutlined />, label: "Khách hàng" },
        { key: "/employee", icon: <UserOutlined />, label: "Nhân viên" },
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

    // {
    //   key: "/chat",
    //   icon: <MessageOutlined />,
    //   label: "Hỗ trợ khách hàng",
    // },
  ];

  return (
    <div
      style={{
        width: 240,
        minWidth: 240,
        height: "100vh",
        position: "sticky",
        top: 0,
        borderRight: "1px solid #eee",
        backgroundColor: "#fff",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "10px", textAlign: "center" }}>
        <img src="/logo_hikari.png" alt="Logo" width={80} />{" "}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ borderRight: 0 }}
        items={items}
        onClick={({ key }) => navigate(key)}
      />
    </div>
  );
};

export default Sidebar;
