import React from "react";
import { PhoneOutlined, RightOutlined } from "@ant-design/icons";

interface TopBarProps {
  news?: Array<{ id: string; text: string; link?: string }>;
}

const TopBar: React.FC<TopBarProps> = () => {
  const news = [
    { id: "1", text: "🎉 Giảm giá lên đến 30% các dòng Sony Alpha tháng này!", link: "/client/catalog?sale=true" },
    { id: "2", text: "📷 Canon EOS R5 giảm 5 triệu - Limited time!", link: "/client/catalog?brand=canon" },
    { id: "3", text: "🚚 Miễn phí vận chuyển toàn quốc đơn hàng từ 2 triệu", link: "/client/catalog" },
  ];

  return (
    <div className="top-bar">
      <div className="top-bar-container">
        {/* Hotline Section */}
        <div className="top-bar-hotline">
          <PhoneOutlined className="hotline-icon" />
          <span className="hotline-text">Hotline:</span>
          <a href="tel:19001909" className="hotline-number">1900 1909</a>
        </div>

        {/* News Ticker */}
        <div className="top-bar-news">
          <div className="news-ticker">
            {news.map((item, index) => (
              <a
                key={item.id}
                href={item.link || "#"}
                className="news-item"
                style={{ animationDelay: `${index * 5}s` }}
              >
                <span className="news-text">{item.text}</span>
                <RightOutlined className="news-arrow" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .top-bar {
          background: linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
          height: 40px;
          font-size: 13px;
          position: relative;
          overflow: hidden;
        }

        .top-bar-container {
          max-width: 1400px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
        }

        .top-bar-hotline {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          padding-right: 24px;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hotline-icon {
          color: #D32F2F;
          font-size: 14px;
        }

        .hotline-text {
          color: rgba(255, 255, 255, 0.6);
        }

        .hotline-number {
          color: #fff;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .hotline-number:hover {
          color: #D32F2F;
        }

        .top-bar-news {
          flex: 1;
          overflow: hidden;
          margin-left: 24px;
        }

        .news-ticker {
          display: flex;
          gap: 32px;
          animation: ticker 20s linear infinite;
        }

        .news-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .news-item:hover {
          color: #D32F2F;
        }

        .news-item:hover .news-arrow {
          transform: translateX(4px);
        }

        .news-arrow {
          font-size: 10px;
          opacity: 0.6;
          transition: transform 0.2s;
        }

        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 768px) {
          .top-bar-container {
            padding: 0 16px;
          }

          .top-bar-hotline {
            padding-right: 16px;
          }

          .hotline-text {
            display: none;
          }

          .top-bar-news {
            margin-left: 12px;
          }

          .news-text {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        @media (max-width: 480px) {
          .top-bar {
            height: 36px;
            font-size: 12px;
          }

          .news-ticker {
            gap: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default TopBar;
