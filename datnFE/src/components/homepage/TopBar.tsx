import React from "react";
import {
  PhoneOutlined,
  RightOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

interface TopBarProps {
  news?: Array<{ id: string; text: string; link?: string }>;
}

const TopBar: React.FC<TopBarProps> = () => {
  const news = [
    { id: "1", text: "Ưu đãi Canon — trả góp 0% cho body & kit chọn lọc", link: "/client/catalog?brand=canon" },
    { id: "2", text: "Miễn phí vận chuyển toàn quốc đơn từ 2 triệu", link: "/client/catalog" },
    { id: "3", text: "Tư vấn chọn máy & ống kính Canon — hotline 1900 1909", link: "tel:19001909" },
  ];

  const tickerItems = [...news, ...news];

  const NewsLine = ({
    item,
  }: {
    item: (typeof news)[0];
  }) => {
    const inner = (
      <>
        <span>{item.text}</span>
        <RightOutlined className="shop-topbar-news-arrow" />
      </>
    );
    if (!item.link) {
      return (
        <span className="shop-topbar-news-link shop-topbar-news-link--static">
          {inner}
        </span>
      );
    }
    if (item.link.startsWith("tel:")) {
      return (
        <a href={item.link} className="shop-topbar-news-link">
          {inner}
        </a>
      );
    }
    return (
      <Link to={item.link} className="shop-topbar-news-link">
        {inner}
      </Link>
    );
  };

  return (
    <div className="shop-topbar">
      <div className="shop-topbar-inner">
        <span className="shop-topbar-badge">Hot News</span>

        <div className="shop-topbar-ticker-wrap">
          <div className="shop-topbar-ticker">
            {tickerItems.map((item, index) => (
              <NewsLine key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
        </div>

        <div className="shop-topbar-utils">
          <a href="tel:19001909" className="shop-topbar-icon-link" title="Hotline">
            <PhoneOutlined />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="shop-topbar-icon-link"
            title="Facebook"
          >
            <FacebookOutlined />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="shop-topbar-icon-link"
            title="YouTube"
          >
            <YoutubeOutlined />
          </a>
          <Link to="/login" className="shop-topbar-icon-link" title="Tài khoản">
            <UserOutlined />
          </Link>
        </div>
      </div>

      <style>{`
        .shop-topbar {
          background: #000;
          color: #fff;
          font-size: 13px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .shop-topbar-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          height: 38px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .shop-topbar-badge {
          flex-shrink: 0;
          background: #c62828;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 4px;
        }

        .shop-topbar-ticker-wrap {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          height: 100%;
          display: flex;
          align-items: center;
        }

        .shop-topbar-ticker {
          display: flex;
          gap: 48px;
          width: max-content;
          animation: shop-ticker 28s linear infinite;
        }

        .shop-topbar-news-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.88);
          text-decoration: none;
          white-space: nowrap;
          transition: color 0.2s;
        }

        .shop-topbar-news-link:hover {
          color: #ff8a80;
        }

        .shop-topbar-news-arrow {
          font-size: 10px;
          opacity: 0.55;
        }

        @keyframes shop-ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .shop-topbar-ticker-wrap:hover .shop-topbar-ticker {
          animation-play-state: paused;
        }

        .shop-topbar-utils {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .shop-topbar-icon-link {
          color: rgba(255, 255, 255, 0.75);
          font-size: 15px;
          transition: color 0.2s;
        }

        .shop-topbar-icon-link:hover {
          color: #fff;
        }

        @media (max-width: 768px) {
          .shop-topbar-inner {
            padding: 0 12px;
            height: 36px;
          }

          .shop-topbar-ticker-wrap {
            mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          }

          .shop-topbar-news-link span {
            max-width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .shop-topbar-utils {
            gap: 10px;
          }
        }

        @media (max-width: 480px) {
          .shop-topbar-badge {
            font-size: 10px;
            padding: 3px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default TopBar;
