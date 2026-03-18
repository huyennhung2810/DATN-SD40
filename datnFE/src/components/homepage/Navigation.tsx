import React, { useState } from "react";
import { Button, Dropdown } from "antd";
import {
  MenuOutlined,
  RightOutlined,
  CameraOutlined,
  AimOutlined,
  VideoCameraOutlined,
  ThunderboltOutlined,
  GiftOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const mainNavItems = [
    { key: "may-anh", label: "Máy ảnh", href: "/client/catalog?category=may-anh" },
    { key: "ong-kinh", label: "Ống kính", href: "/client/catalog?category=ong-kinh" },
    { key: "may-quay", label: "Máy quay", href: "/client/catalog?category=may-quay" },
    { key: "gimbal", label: "Gimbal", href: "/client/catalog?category=gimbal" },
    { key: "den-flash", label: "Đèn flash", href: "/client/catalog?category=den-flash" },
    { key: "phu-kien", label: "Phụ kiện", href: "/client/catalog?category=phu-kien" },
    { key: "tin-tuc", label: "Tin tức", href: "/client/news" },
  ];

  const megaMenuData = {
    "may-anh": {
      title: "Máy ảnh",
      icon: <CameraOutlined />,
      categories: [
        {
          name: "Theo loại",
          items: [
            { name: "Mirrorless", href: "/client/catalog?type=mirrorless" },
            { name: "DSLR", href: "/client/catalog?type=dslr" },
            { name: "Compact", href: "/client/catalog?type=compact" },
            { name: "Medium Format", href: "/client/catalog?type=medium-format" },
          ],
        },
        {
          name: "Theo hãng",
          items: [
            { name: "Canon", href: "/client/catalog?brand=canon" },
            { name: "Sony", href: "/client/catalog?brand=sony" },
            { name: "Nikon", href: "/client/catalog?brand=nikon" },
            { name: "Fujifilm", href: "/client/catalog?brand=fujifilm" },
          ],
        },
      ],
    },
    "ong-kinh": {
      title: "Ống kính",
      icon: <AimOutlined />,
      categories: [
        {
          name: "Theo ngàm",
          items: [
            { name: "Canon RF/RF-S", href: "/client/catalog?brand=canon&mount=rf" },
            { name: "Sony E-mount", href: "/client/catalog?brand=sony&mount=e" },
            { name: "Nikon Z", href: "/client/catalog?brand=nikon&mount=z" },
            { name: "Fujifilm X", href: "/client/catalog?brand=fujifilm&mount=x" },
          ],
        },
        {
          name: "Theo tiêu cự",
          items: [
            { name: "Wide Angle", href: "/client/catalog?focal=wide" },
            { name: "Standard", href: "/client/catalog?focal=standard" },
            { name: "Telephoto", href: "/client/catalog?focal=telephoto" },
            { name: "Prime", href: "/client/catalog?focal=prime" },
          ],
        },
      ],
    },
    "may-quay": {
      title: "Máy quay",
      icon: <VideoCameraOutlined />,
      categories: [
        {
          name: "Loại máy",
          items: [
            { name: "Action Cam", href: "/client/catalog?category=action-cam" },
            { name: "Camcorder", href: "/client/catalog?category=camcorder" },
            { name: "Cinema", href: "/client/catalog?category=cinema" },
            { name: "Drone", href: "/client/catalog?category=drone" },
          ],
        },
        {
          name: "Thương hiệu",
          items: [
            { name: "Sony", href: "/client/catalog?brand=sony&category=cam" },
            { name: "Canon", href: "/client/catalog?brand=canon&category=cam" },
            { name: "DJI", href: "/client/catalog?brand=dji" },
            { name: "GoPro", href: "/client/catalog?brand=gopro" },
          ],
        },
      ],
    },
    "gimbal": {
      title: "Gimbal",
      icon: <ThunderboltOutlined />,
      categories: [
        {
          name: "Loại gimbal",
          items: [
            { name: "Handheld", href: "/client/catalog?category=gimbal-handheld" },
            { name: "Wearable", href: "/client/catalog?category=gimbal-wearable" },
            { name: "Combo", href: "/client/catalog?category=gimbal-combo" },
          ],
        },
        {
          name: "Thương hiệu",
          items: [
            { name: "DJI", href: "/client/catalog?brand=dji&category=gimbal" },
            { name: "Zhiyun", href: "/client/catalog?brand=zhiyun" },
            { name: "FeiyuTech", href: "/client/catalog?brand=feiyu" },
          ],
        },
      ],
    },
    "phu-kien": {
      title: "Phụ kiện",
      icon: <GiftOutlined />,
      categories: [
        {
          name: "Lưu trữ",
          items: [
            { name: "Thẻ nhớ", href: "/client/catalog?category=memory" },
            { name: "Ổ cứng", href: "/client/catalog?category=hard-drive" },
          ],
        },
        {
          name: "Năng lượng",
          items: [
            { name: "Pin & Sạc", href: "/client/catalog?category=battery" },
            { name: "Pin sạc dự phòng", href: "/client/catalog?category=power-bank" },
          ],
        },
        {
          name: "Bảo vệ",
          items: [
            { name: "Túi & Balo", href: "/client/catalog?category=bag" },
            { name: "Kính lọc", href: "/client/catalog?category=filter" },
            { name: "Tripod", href: "/client/catalog?category=tripod" },
          ],
        },
      ],
    },
  };

  const renderMegaMenu = (menuKey: string) => {
    const menuData = megaMenuData[menuKey as keyof typeof megaMenuData];
    if (!menuData) return null;

    return (
      <div className="mega-menu">
        <div className="mega-menu-content">
          <div className="mega-menu-header">
            <span className="mega-menu-icon">{menuData.icon}</span>
            <span className="mega-menu-title">{menuData.title}</span>
          </div>
          <div className="mega-menu-grid">
            {menuData.categories.map((category, idx) => (
              <div key={idx} className="mega-menu-column">
                <div className="mega-menu-category">{category.name}</div>
                <ul className="mega-menu-list">
                  {category.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <a href={item.href} className="mega-menu-link">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mega-menu-promo">
            <div className="promo-card">
              <GiftOutlined className="promo-icon" />
              <div className="promo-text">
                <strong>Khuyến mãi đặc biệt</strong>
                <span>Giảm giá lên đến 30%</span>
              </div>
              <a href="/client/catalog?sale=true" className="promo-link">
                Xem ngay <RightOutlined />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        {/* Category Menu */}
        <div className="category-menu-wrapper">
          <Button
            type="text"
            className="category-menu-btn"
            onMouseEnter={() => setActiveMenu("category")}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <MenuOutlined />
            <span>Danh mục</span>
            <RightOutlined className="menu-arrow" />
          </Button>
          {activeMenu === "category" && (
            <div
              className="category-dropdown"
              onMouseEnter={() => setActiveMenu("category")}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <div className="category-list">
                {[
                  { key: "may-anh", icon: <CameraOutlined />, name: "Máy ảnh", count: 120 },
                  { key: "ong-kinh", icon: <AimOutlined />, name: "Ống kính", count: 85 },
                  { key: "may-quay", icon: <VideoCameraOutlined />, name: "Máy quay", count: 45 },
                  { key: "gimbal", icon: <ThunderboltOutlined />, name: "Gimbal", count: 32 },
                  { key: "den-flash", icon: <GiftOutlined />, name: "Đèn flash", count: 28 },
                  { key: "phu-kien", icon: <GiftOutlined />, name: "Phụ kiện", count: 200 },
                ].map((cat) => (
                  <div
                    key={cat.key}
                    className={`category-item ${activeMenu === cat.key ? "active" : ""}`}
                    onMouseEnter={() => setActiveMenu(cat.key)}
                  >
                    <a href={`/client/catalog?category=${cat.key}`} className="category-link">
                      <span className="category-icon">{cat.icon}</span>
                      <span className="category-name">{cat.name}</span>
                      <span className="category-count">{cat.count}</span>
                    </a>
                    <RightOutlined className="category-arrow" />
                  </div>
                ))}
              </div>
              {renderMegaMenu("may-anh")}
            </div>
          )}
        </div>

        {/* Main Nav Links */}
        <div className="nav-links">
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
        <div className="nav-hotline">
          <PhoneOutlined />
          <a href="tel:19001909">1900 1909</a>
        </div>
      </div>

      <style>{`
        .main-navigation {
          background: #fff;
          border-bottom: 1px solid #e5e5e5;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          height: 52px;
          gap: 8px;
        }

        /* Category Menu */
        .category-menu-wrapper {
          position: relative;
        }

        .category-menu-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 44px;
          padding: 0 18px;
          background: #1a1a1a !important;
          color: #fff !important;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
        }

        .category-menu-btn:hover {
          background: #333 !important;
        }

        .menu-arrow {
          font-size: 10px;
          opacity: 0.7;
        }

        .category-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          display: flex;
          background: #fff;
          border-radius: 0 12px 12px 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          z-index: 100;
          min-width: 900px;
          overflow: hidden;
        }

        .category-list {
          width: 280px;
          background: #fafafa;
          padding: 12px;
          flex-shrink: 0;
        }

        .category-item {
          position: relative;
          border-radius: 8px;
          margin-bottom: 4px;
        }

        .category-item:last-child {
          margin-bottom: 0;
        }

        .category-item:hover,
        .category-item.active {
          background: #fff;
        }

        .category-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          color: #1a1a1a;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .category-icon {
          font-size: 18px;
          color: #666;
        }

        .category-item:hover .category-icon,
        .category-item.active .category-icon {
          color: #D32F2F;
        }

        .category-count {
          margin-left: auto;
          font-size: 12px;
          color: #999;
          font-weight: 400;
        }

        .category-arrow {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 10px;
          color: #ccc;
        }

        .category-item:hover .category-arrow {
          color: #D32F2F;
        }

        /* Mega Menu */
        .mega-menu {
          flex: 1;
          padding: 20px 24px;
          background: #fff;
          border-left: 1px solid #f0f0f0;
        }

        .mega-menu-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .mega-menu-icon {
          font-size: 20px;
          color: #D32F2F;
        }

        .mega-menu-title {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .mega-menu-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px 40px;
        }

        .mega-menu-category {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .mega-menu-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .mega-menu-list li {
          margin-bottom: 8px;
        }

        .mega-menu-link {
          color: #666;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.2s;
          display: inline-block;
        }

        .mega-menu-link:hover {
          color: #D32F2F;
          transform: translateX(4px);
        }

        .mega-menu-promo {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }

        .promo-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #fff5f5 0%, #ffebee 100%);
          border-radius: 10px;
          border: 1px solid #ffcdd2;
        }

        .promo-icon {
          font-size: 28px;
          color: #D32F2F;
        }

        .promo-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .promo-text strong {
          font-size: 14px;
          color: #1a1a1a;
        }

        .promo-text span {
          font-size: 13px;
          color: #D32F2F;
        }

        .promo-link {
          color: #D32F2F;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .promo-link:hover {
          text-decoration: underline;
        }

        /* Nav Links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .nav-link {
          display: inline-flex;
          align-items: center;
          padding: 10px 16px;
          color: #1a1a1a;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background: #f5f5f5;
          color: #D32F2F;
        }

        /* Hotline */
        .nav-hotline {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #f5f5f5;
          border-radius: 10px;
          font-size: 14px;
          color: #1a1a1a;
        }

        .nav-hotline a {
          color: #D32F2F;
          font-weight: 700;
          text-decoration: none;
        }

        .nav-hotline a:hover {
          text-decoration: underline;
        }

        @media (max-width: 1023px) {
          .main-navigation {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
