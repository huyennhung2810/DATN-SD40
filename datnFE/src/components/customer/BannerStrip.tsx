import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import bannerApi from "../../api/bannerApi";
import type { BannerResponse } from "../../models/banner";

interface BannerStripProps {
  position?: string;
  columns?: number;
}

const BannerStrip: React.FC<BannerStripProps> = ({ position = "HOME_TOP", columns = 4 }) => {
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await bannerApi.getBannersByPosition(position);
        setBanners(data.slice(0, columns));
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, [position, columns]);

  if (loading || banners.length === 0) {
    return null;
  }

  const handleLinkClick = (banner: BannerResponse) => {
    if (banner.linkUrl) {
      if (banner.linkTarget === "NEW_TAB") {
        window.open(banner.linkUrl, "_blank");
      } else {
        window.location.href = banner.linkUrl;
      }
    }
  };

  return (
    <div style={{ marginBottom: "32px" }}>
      <style>{`
        .banner-strip-item {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.4s ease;
        }
        .banner-strip-item:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        }
        .banner-strip-item:hover .banner-strip-image {
          transform: scale(1.1);
        }
        .banner-strip-item:hover .banner-strip-overlay {
          opacity: 0.8;
        }
        .banner-strip-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .banner-strip-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 60%);
          opacity: 0.6;
          transition: opacity 0.4s ease;
        }
        .banner-strip-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px;
          color: #fff;
          z-index: 2;
        }
        .banner-strip-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.3;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .banner-strip-subtitle {
          margin: 8px 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .banner-strip-button {
          margin-top: 12px;
          display: inline-block;
          padding: 8px 20px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 20px;
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
        }
        .banner-strip-item:hover .banner-strip-button {
          background: #fff;
          color: #333;
        }
      `}</style>
      <Row gutter={[20, 20]}>
        {banners.map((banner) => (
          <Col key={banner.id} xs={24} sm={12} md={24 / columns}>
            <div
              className="banner-strip-item"
              onClick={() => handleLinkClick(banner)}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="banner-strip-image"
                style={{
                  backgroundColor: banner.backgroundColor || "#f0f0f0",
                }}
              />
              <div className="banner-strip-overlay" />
              <div className="banner-strip-content">
                {banner.title && <h3 className="banner-strip-title">{banner.title}</h3>}
                {banner.subtitle && <p className="banner-strip-subtitle">{banner.subtitle}</p>}
                {banner.buttonText && <span className="banner-strip-button">{banner.buttonText}</span>}
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BannerStrip;
