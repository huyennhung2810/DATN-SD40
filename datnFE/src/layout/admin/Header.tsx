import {
  BarcodeOutlined,
  BellOutlined,
  CalendarOutlined,
  CameraOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  KeyOutlined,
  LineChartOutlined,
  LogoutOutlined,
  PictureOutlined,
  ScheduleOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Dropdown, Input, type MenuProps } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { authActions } from "../../redux/auth/authSlice";
import type { RootState } from "../../redux/store";

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
  "/admin/products": {
    title: "Sản phẩm",
    desc: "Quản lý danh mục máy ảnh",
    icon: <ShopOutlined />,
  },
  "/admin/product-categories": {
    title: "Loại sản phẩm",
    desc: "Quản lý loại sản phẩm",
    icon: <TagOutlined />,
  },
  "/admin/tech-spec": {
    title: "Thông số kỹ thuật",
    desc: "Quản lý thông số kỹ thuật của sản phẩm",
    icon: <SettingOutlined />,
  },
  "/products/product-detail": {
    title: "Sản phẩm chi tiết",
    desc: "Quản lý chi tiết sản phẩm",
    icon: <CameraOutlined />,
  },
  "/admin/banners": {
    title: "Banner",
    desc: "Quản lý banner hiển thị trên trang khách hàng",
    icon: <PictureOutlined />,
  },
  "/shiftManagement": {
    title: "Quản lý ca",
    desc: "Quản lý ca làm việc của nhân viên",
    icon: <ScheduleOutlined />,
  },
  "/serial": {
    title: "Serial",
    desc: "Quản lý số serial của sản phẩm",
    icon: <BarcodeOutlined />,
  },

  "/EChatAi": {
    title: "Hỗ trợ khách hàng",
    desc: "Trò chuyện và hỗ trợ khách hàng qua hệ thống chat nội bộ",
    icon: <CustomerServiceOutlined />,
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

  // Lấy thông tin người dùng hiện tại
  const { user } = useSelector((state: RootState) => state.auth);

  const defaultPageInfo = {
    title: "Hikari Admin",
    desc: "Chào mừng bạn quay lại hệ thống quản lý máy ảnh",
    icon: <ShopOutlined />,
  };

  // Tạo breadcrumb từ path
  const pathParts = currentPath.split("/").filter(Boolean);
  let breadcrumb: { title: string; icon?: React.ReactNode }[] = [];
  let accumulated = "";
  for (let i = 0; i < pathParts.length; i++) {
    accumulated += "/" + pathParts[i];
    const info = pageInfoMap[accumulated];
    if (info) {
      breadcrumb.push({ title: info.title, icon: info.icon });
    } else if (i === pathParts.length - 1) {
      // Nếu là phần cuối mà không có trong map, lấy tên từ url
      breadcrumb.push({
        title: decodeURIComponent(pathParts[i]).replace(/-/g, " "),
      });
    }
  }
  if (breadcrumb.length === 0)
    breadcrumb = [{ title: defaultPageInfo.title, icon: defaultPageInfo.icon }];

  //xử lý khi chọn menu
  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      dispatch(authActions.logout({ isAdmin: true }));
    } else if (key === "profile") {
      navigate("/profile");
    }
  };

  const handleSearch = (value: string) => {
    // TODO: implement search navigation or filtering
    console.log("Header search:", value);
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
        {breadcrumb.map((item, idx) => (
          <React.Fragment key={idx}>
            {idx === 0 && item.icon && (
              <span className="page-icon">{item.icon}</span>
            )}
            <span
              className="page-title"
              style={{
                fontWeight: idx === breadcrumb.length - 1 ? 600 : 400,
                fontSize: 18,
                marginRight: 4,
              }}
            >
              {item.title}
            </span>
            {idx < breadcrumb.length - 1 && (
              <span style={{ margin: "0 4px", color: "#aaa" }}>/</span>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="header-search">
        <Search
          placeholder="Tìm sản phẩm, đơn hàng..."
          allowClear
          className="header-search-input"
          onSearch={handleSearch}
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
