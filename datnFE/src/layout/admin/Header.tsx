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
  ScheduleOutlined,
  SwapOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  BarcodeOutlined,
  PictureOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Avatar,
  Typography,
  Dropdown,
  Input,
  type MenuProps,
  Button,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { authActions } from "../../redux/auth/authSlice";

const { Text, Title } = Typography;
const { Search } = Input;

const pageInfoMap: Record<
  string,
  { title: string; desc: string; icon: React.ReactNode }
> = {
  "/statistics": {
    title: "Thống kê",
    desc: "Xem và quản lý các số liệu thống kê",
    icon: <LineChartOutlined />,
  },
  "/product": {
    title: "Sản phẩm",
    desc: "Quản lý danh mục máy ảnh",
    icon: <CameraOutlined />,
  },
  "/serial": {
    title: "Serial",
    desc: "Quản lý số serial của sản phẩm",
    icon: <BarcodeOutlined />,
  },
  "/orders": {
    title: "Đơn hàng",
    desc: "Theo dõi trạng thái đơn hàng và lịch sử giao dịch",
    icon: <ShoppingCartOutlined />,
  },
  "/customer": {
    title: "Khách hàng",
    desc: "Xem và quản lý thông tin khách hàng",
    icon: <TeamOutlined />,
  },
  "/employee": {
    title: "Nhân viên",
    desc: "Xem và quản lý hồ sơ, hiệu suất nhân viên",
    icon: <UserOutlined />,
  },
  "/pos": {
    title: "Bán hàng tại quầy",
    desc: "Hệ thống thanh toán nhanh tại cửa hàng",
    icon: <ShopOutlined />,
  },
  "/voucher": {
    title: "Phiếu giảm giá",
    desc: "Thiết lập các mã giảm giá và chương trình tri ân",
    icon: <TagOutlined />,
  },
  "/discount": {
    title: "Đợt giảm giá",
    desc: "Quản lý các đợt giảm giá theo sự kiện",
    icon: <CalendarOutlined />,
  },
  "/work-schedule": {
    title: "Lịch làm việc",
    desc: "Quản lý lịch làm việc của nhân viên",
    icon: <ScheduleOutlined />,
  },
  "/shift-handover": {
    title: "Giao ca",
    desc: "Quản lý các ca làm việc và chuyển ca giữa nhân viên",
    icon: <SwapOutlined />,
  },
  "/shift-template": {
    title: "Quản lý ca",
    desc: "Tạo và quản lý các ca làm việc định kỳ",
    icon: <ClockCircleOutlined />,
  },
  "/admin/banner": {
    title: "Quản lý Banner",
    desc: "Quản lý banner hiển thị trên trang khách hàng",
    icon: <PictureOutlined />,
  },
  "/admin/accounts": {
    title: "Quản lý tài khoản",
    desc: "Quản lý tài khoản admin và nhân viên",
    icon: <KeyOutlined />,
  },
};

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentPath = location.pathname;

  //Laấyn  tuống ttiser hiện tại
  const { user } = useSelector((state: RootState) => state.auth);

  //lấy tt trang hiện tại
  const basePath = "/" + currentPath.split("/").slice(1, 2).join("/");
  const currentPage = pageInfoMap[currentPath] ||
    pageInfoMap[basePath] || {
      title: "Hikari Admin",
      desc: "Chào mừng bạn quay lại hệ thống quản lý máy ảnh",
      icon: <ShopOutlined />,
    };

  //xử lý khi chọn menu
  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      dispatch(authActions.logout({ isAdmin: true }));
    } else if (key === "profile") {
      navigate("/profile");
    }
  };

  const menuItems: MenuProps["items"] = [
    { key: "profile", label: "Hồ sơ cá nhân", icon: <UserOutlined /> },
    { key: "settings", label: "Cài đặt tài khoản", icon: <SettingOutlined /> },
    { type: "divider" },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <header className="admin-header">
      <div className="header-page-info">
        <div className="page-icon">{currentPage.icon}</div>
        <div className="page-text">
          <Title level={5} className="page-title">
            {currentPage.title}
          </Title>
          <Text type="secondary" className="page-desc">
            {currentPage.desc}
          </Text>
        </div>
      </div>

      <div className="header-search">
        <Search
          placeholder="Tìm sản phẩm, đơn hàng..."
          allowClear
          className="header-search-input"
        />
      </div>

      <div className="header-actions">
        <Badge count={5} size="small" offset={[-2, 4]}>
          <Button
            type="text"
            icon={<BellOutlined />}
            className="header-action-btn"
          />
        </Badge>

        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <div className="header-user">
            <Avatar
              src={user?.pictureUrl}
              icon={!user?.pictureUrl && <UserOutlined />}
              className="header-avatar"
            />
            <div className="header-user-info">
              <div className="header-user-name">
                {user?.fullName || "Admin"}
              </div>
              <div className="header-user-role">
                {user?.roles?.[0] === "ADMIN" ? "Quản trị viên" : "Nhân viên"}
              </div>
            </div>
          </div>
        </Dropdown>
      </div>

      <style>{`
        .admin-header {
          height: 64px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f0f0f0;
          background: #fff;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 4px rgba(0,21,41,.08);
        }

        .header-page-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 250px;
        }

        .page-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
          border-radius: 8px;
          color: #fff;
          font-size: 18px;
        }

        .page-title {
          margin: 0 !important;
          font-size: 15px !important;
          font-weight: 600 !important;
        }

        .page-desc {
          font-size: 11px;
          display: block;
          margin-top: -2px;
        }

        .header-search {
          flex: 1;
          max-width: 350px;
          margin: 0 20px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-action-btn {
          font-size: 18px;
          color: #595959;
        }

        .header-user {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .header-user:hover {
          background: #f5f5f5;
        }

        .header-avatar {
          border: 1px solid #e8e8e8;
          background: #1890ff;
        }

        .header-user-name {
          font-weight: 600;
          font-size: 13px;
          color: #262626;
        }

        .header-user-role {
          font-size: 11px;
          color: #8c8c8c;
        }

        @media (max-width: 992px) {
          .header-search, .page-desc {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
