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
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

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

  const basePath = "/" + currentPath.split("/").slice(1, 2).join("/");

  const currentPage = pageInfoMap[basePath] ||
    pageInfoMap[currentPath] || {
      title: "Tổng quan",
      desc: "Chào mừng bạn quay trở lại hệ thống quản lý",
      icon: <ShopOutlined />,
    };

  const items: MenuProps["items"] = [
    { key: "profile", label: "Hồ sơ cá nhân", icon: <UserOutlined /> },
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

  return (
    <header className="admin-header">
      {/* Page Info */}
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

      {/* Search */}
      <div className="header-search">
        <Search
          placeholder="Tìm kiếm..."
          allowClear
          className="header-search-input"
        />
      </div>

      {/* Actions */}
      <div className="header-actions">
        <Badge count={3} size="small">
          <Button
            type="text"
            icon={<BellOutlined />}
            className="header-action-btn"
          />
        </Badge>

        <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
          <div className="header-user">
            <Avatar icon={<UserOutlined />} className="header-avatar" />
            <div className="header-user-info">
              <div className="header-user-name">Admin</div>
              <div className="header-user-role">Quản trị viên</div>
            </div>
          </div>
        </Dropdown>
      </div>

      <style>{`
        .admin-header {
          height: var(--header-height);
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--color-border-secondary);
          background: #fff;
          position: sticky;
          top: 0;
          z-index: 100;
          flex-shrink: 0;
        }

        /* Page Info */
        .header-page-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .page-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0A84FF 0%, #0066CC 100%);
          border-radius: 10px;
          color: #fff;
          font-size: 18px;
        }

        .page-text {
          display: flex;
          flex-direction: column;
        }

        .page-title {
          margin: 0 !important;
          font-weight: 600 !important;
          font-size: 15px !important;
          color: var(--color-text-primary);
          line-height: 1.3;
        }

        .page-desc {
          font-size: 12px;
          color: var(--color-text-secondary) !important;
        }

        /* Search */
        .header-search {
          flex: 1;
          max-width: 400px;
          margin: 0 24px;
        }

        .header-search-input {
          width: 100%;
        }

        .header-search-input .ant-input {
          border-radius: 8px;
          background: var(--color-bg-spotlight);
        }

        .header-search-input .ant-input:hover,
        .header-search-input .ant-input:focus {
          border-color: #0A84FF;
        }

        /* Actions */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-action-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: var(--color-text-secondary);
        }

        .header-action-btn:hover {
          background: var(--color-bg-spotlight);
          color: #0A84FF;
        }

        /* User */
        .header-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .header-user:hover {
          background: var(--color-bg-spotlight);
        }

        .header-avatar {
          background: linear-gradient(135deg, #0A84FF 0%, #0066CC 100%);
        }

        .header-user-info {
          display: flex;
          flex-direction: column;
        }

        .header-user-name {
          font-weight: 600;
          font-size: 13px;
          color: var(--color-text-primary);
          line-height: 1.3;
        }

        .header-user-role {
          font-size: 11px;
          color: var(--color-text-secondary);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .header-search {
            display: none;
          }

          .header-user-info {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
