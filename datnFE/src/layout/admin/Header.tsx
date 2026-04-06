import {
  BarcodeOutlined,
  BellOutlined,
  CalendarOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  IdcardOutlined,
  KeyOutlined,
  LineChartOutlined,
  LogoutOutlined,
  MailOutlined,
  PhoneOutlined,
  PictureOutlined,
  ScheduleOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  SwapOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Dropdown, Input, Spin, Tag, Popover, Empty, Tooltip } from "antd";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { authActions } from "../../redux/auth/authSlice";
import type { RootState } from "../../redux/store";
import { getEmployeeById } from "../../api/employeeApi";
import type { EmployeeResponse } from "../../models/employee";
import { notificationActions, type AppNotification, type NotificationType } from "../../redux/notification/notificationSlice";
import { useNotifications } from "../../app/useNotifications";

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
    title: "Đơn hàng online",
    desc: "Xác nhận và vận hành đơn đặt trên website",
    icon: <ShoppingCartOutlined />,
  },
  "/invoices": {
    title: "Quản lý hóa đơn",
    desc: "Tra cứu hóa đơn online và tại quầy",
    icon: <FileTextOutlined />,
  },
  "/admin/invoices": {
    title: "Chi tiết hóa đơn",
    desc: "Xem chứng từ bán hàng",
    icon: <FileTextOutlined />,
  },
  "/admin/orders": {
    title: "Chi tiết đơn online",
    desc: "Vận hành đơn hàng online",
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

  const [employee, setEmployee] = useState<EmployeeResponse | null>(null);
  const [loadingEmployee] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = useSelector(
    (state: RootState) => state.notification.items
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Subscribe to admin WebSocket notifications
  useNotifications("/topic/admin/notifications", !!user?.userId);

  useEffect(() => {
    if (!user?.userId) return;
    let cancelled = false;
    getEmployeeById(user.userId)
      .then((data) => {
        if (!cancelled) setEmployee(data);
      })
      .catch(() => {
        /* silent */
      });
    return () => {
      cancelled = true;
    };
  }, [user?.userId]);

  const avatarSrc =
    employee?.employeeImage ?? user?.image ?? user?.pictureUrl ?? undefined;

  // Notification helpers
  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case "NEW_ORDER":     return <ShoppingOutlined style={{ color: "#1890ff" }} />;
      case "ORDER_STATUS":  return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "CHAT_REQUEST":  return <CustomerServiceOutlined style={{ color: "#fa8c16" }} />;
      case "SHIFT_ALERT":   return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
    }
  };

  const notifContent = (
    <div style={{ width: 340 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0 8px" }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Thông báo</span>
        {unreadCount > 0 && (
          <Button size="small" type="link" onClick={() => dispatch(notificationActions.markAllRead())}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <Empty description="Chưa có thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: "16px 0" }} />
      ) : (
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {notifications.slice(0, 20).map((item: AppNotification) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                background: item.read ? "transparent" : "#e6f4ff",
                borderRadius: 6,
                padding: "8px 10px",
                cursor: item.refCode ? "pointer" : "default",
                marginBottom: 4,
              }}
              onClick={() => {
                dispatch(notificationActions.markRead(item.id));
                if (item.type === "NEW_ORDER" || item.type === "ORDER_STATUS") {
                  navigate("/orders");
                } else if (item.type === "CHAT_REQUEST") {
                  navigate("/EChatAi");
                } else if (item.type === "SHIFT_ALERT") {
                  navigate("/shift-handover");
                }
                setNotifOpen(false);
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{getNotifIcon(item.type)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: item.read ? 400 : 600 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "#595959", marginBottom: 2 }}>{item.message}</div>
                <div style={{ fontSize: 11, color: "#aaa" }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {new Date(item.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {notifications.length > 0 && (
        <div style={{ textAlign: "center", borderTop: "1px solid #f0f0f0", paddingTop: 8, marginTop: 4 }}>
          <Button size="small" type="link" danger onClick={() => dispatch(notificationActions.clear())}>
            Xóa tất cả
          </Button>
        </div>
      )}
    </div>
  );

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


  const handleSearch = (value: string) => {
    console.log("Header search:", value);
  };

  const profileDropdown = (
    <div className="profile-dropdown-card">
      {/* Banner */}
      <div className="profile-dropdown-banner" />

      {/* Avatar + info */}
      <div className="profile-dropdown-body">
        {loadingEmployee ? (
          <Spin size="small" style={{ margin: "8px auto", display: "block" }} />
        ) : (
          <>
            <Avatar
              size={64}
              src={avatarSrc}
              icon={!avatarSrc ? <UserOutlined /> : undefined}
              className="profile-dropdown-avatar"
            />
            <div className="profile-dropdown-name">
              {employee?.name ?? user?.fullName ?? "Admin"}
            </div>
            <Tag
              color={employee?.account?.role === "ADMIN" ? "purple" : "blue"}
              style={{ marginBottom: 12 }}
            >
              {employee?.account?.role === "ADMIN"
                ? "Quản trị viên"
                : "Nhân viên"}
            </Tag>

            <div className="profile-dropdown-details">
              {employee?.code && (
                <div className="profile-detail-row">
                  <IdcardOutlined />
                  <span>{employee.code}</span>
                </div>
              )}
              {(employee?.email ?? user?.email) && (
                <div className="profile-detail-row">
                  <MailOutlined />
                  <span>{employee?.email ?? user?.email}</span>
                </div>
              )}
              {employee?.phoneNumber && (
                <div className="profile-detail-row">
                  <PhoneOutlined />
                  <span>{employee.phoneNumber}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="profile-dropdown-footer">
        <button
          className="profile-footer-btn"
          onClick={() => navigate("/profile")}
        >
          <UserOutlined /> Hồ sơ cá nhân
        </button>
        <button
          className="profile-footer-btn profile-footer-btn--danger"
          onClick={() => dispatch(authActions.logout({ isAdmin: true }))}
        >
          <LogoutOutlined /> Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <>
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
          <Tooltip title="Thông báo">
            <Popover
              content={notifContent}
              trigger="click"
              placement="bottomRight"
              open={notifOpen}
              onOpenChange={setNotifOpen}
              overlayStyle={{ padding: 0 }}
              styles={{ body: { padding: "12px 16px", minWidth: 340 } }}
            >
              <Badge count={unreadCount} size="small" offset={[-2, 4]}>
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className="header-action-btn"
                />
              </Badge>
            </Popover>
          </Tooltip>

          <Dropdown
            popupRender={() => profileDropdown}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="header-user">
              <Avatar
                src={avatarSrc}
                icon={!avatarSrc && <UserOutlined />}
                className="header-avatar"
              />
              <div className="header-user-info">
                <div className="header-user-name">
                  {employee?.name ?? user?.fullName ?? "Admin"}
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

          /* ===== Profile Dropdown Card ===== */
          .profile-dropdown-card {
            width: 280px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 6px 24px rgba(0,0,0,0.12);
            overflow: hidden;
            border: 1px solid #f0f0f0;
          }

          .profile-dropdown-banner {
            height: 56px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          }

          .profile-dropdown-body {
            padding: 0 20px 16px;
            margin-top: -32px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .profile-dropdown-avatar {
            border: 3px solid #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            background: #1890ff;
            margin-bottom: 8px;
          }

          .profile-dropdown-name {
            font-weight: 700;
            font-size: 15px;
            color: #1f2937;
            margin-bottom: 4px;
            word-break: break-word;
          }

          .profile-dropdown-details {
            width: 100%;
            margin-top: 4px;
            display: flex;
            flex-direction: column;
            gap: 5px;
          }

          .profile-detail-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: #6b7280;
            padding: 4px 8px;
            background: #f9fafb;
            border-radius: 6px;
            overflow: hidden;
          }

          .profile-detail-row span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .profile-dropdown-footer {
            border-top: 1px solid #f3f4f6;
            display: flex;
          }

          .profile-footer-btn {
            flex: 1;
            padding: 11px 0;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            color: #4b5563;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: background 0.15s, color 0.15s;
          }

          .profile-footer-btn:hover {
            background: #f3f4f6;
            color: #1890ff;
          }

          .profile-footer-btn--danger {
            border-left: 1px solid #f3f4f6;
          }

          .profile-footer-btn--danger:hover {
            background: #fff1f2;
            color: #dc2626;
          }
        `}</style>
      </header>
    </>
  );
};

export default Header;
