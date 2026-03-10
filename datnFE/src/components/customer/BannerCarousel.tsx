import React, { useEffect, useState } from "react";
import { Carousel } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import bannerApi from "../../api/bannerApi";
import type { BannerResponse } from "../../models/banner";

interface BannerCarouselProps {
  position?: string;
  autoPlay?: boolean;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ position = "HOME_HERO", autoPlay = true }) => {
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await bannerApi.getBannersByPosition(position);
        setBanners(data);
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, [position]);

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
    <div className="banner-carousel-wrapper" style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      <style>{`
        .banner-carousel-wrapper .slick-slider {
          height: 600px;
        }
        .banner-carousel-wrapper .slick-list {
          height: 100%;
        }
        .banner-carousel-wrapper .slick-track,
        .banner-carousel-wrapper .slick-slide > div {
          height: 100%;
        }
        .banner-carousel-wrapper .slick-prev,
        .banner-carousel-wrapper .slick-next {
          z-index: 10;
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.9) !important;
          border-radius: 50%;
          display: flex !important;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }
        .banner-carousel-wrapper .slick-prev:hover,
        .banner-carousel-wrapper .slick-next:hover {
          background: #fff !important;
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
        }
        .banner-carousel-wrapper .slick-prev {
          left: 30px !important;
        }
        .banner-carousel-wrapper .slick-next {
          right: 30px !important;
        }
        .banner-carousel-wrapper .slick-prev:before,
        .banner-carousel-wrapper .slick-next:before {
          color: #333;
          font-size: 18px;
        }
        .banner-carousel-wrapper .slick-dots {
          bottom: 30px !important;
        }
        .banner-carousel-wrapper .slick-dots li button {
          background: rgba(255, 255, 255, 0.6) !important;
          width: 12px !important;
          height: 12px !important;
          border-radius: 50%;
        }
        .banner-carousel-wrapper .slick-dots li.slick-active button {
          background: #fff !important;
          transform: scale(1.2);
        }
        .banner-slide {
          position: relative;
          height: 600px;
          overflow: hidden;
        }
        .banner-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s ease;
        }
        .banner-slide:hover .banner-image {
          transform: scale(1.05);
        }
        .banner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.6) 0%,
            rgba(0, 0, 0, 0.3) 50%,
            rgba(0, 0, 0, 0.1) 100%
          );
        }
        .banner-content {
          position: absolute;
          top: 50%;
          left: 8%;
          transform: translateY(-50%);
          max-width: 600px;
          color: #fff;
          z-index: 5;
        }
        .banner-title {
          font-size: 56px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 20px;
          text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.3);
          animation: slideInLeft 0.8s ease-out;
        }
        .banner-subtitle {
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 16px;
          opacity: 0.95;
          animation: slideInLeft 0.8s ease-out 0.2s both;
        }
        .banner-description {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 32px;
          opacity: 0.9;
          animation: slideInLeft 0.8s ease-out 0.4s both;
        }
        .banner-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 36px;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
          animation: slideInLeft 0.8s ease-out 0.6s both;
        }
        .banner-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.5);
        }
        .banner-button-arrow {
          transition: transform 0.3s ease;
        }
        .banner-button:hover .banner-button-arrow {
          transform: translateX(5px);
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @media (max-width: 768px) {
          .banner-carousel-wrapper .slick-slider {
            height: 400px;
          }
          .banner-slide {
            height: 400px;
          }
          .banner-content {
            left: 5%;
            right: 5%;
            max-width: none;
          }
          .banner-title {
            font-size: 32px;
          }
          .banner-subtitle {
            font-size: 18px;
          }
          .banner-description {
            font-size: 14px;
            margin-bottom: 20px;
          }
          .banner-button {
            padding: 12px 28px;
            font-size: 14px;
          }
        }
      `}</style>
      <Carousel
        autoplay={autoPlay}
        arrows
        prevArrow={<LeftOutlined />}
        nextArrow={<RightOutlined />}
        autoplaySpeed={5000}
        speed={800}
      >
        {banners.map((banner, index) => (
          <div key={banner.id}>
            <div
              className="banner-slide"
              style={{
                cursor: banner.linkUrl ? "pointer" : "default",
                backgroundColor: banner.backgroundColor || "#1a1a1a",
              }}
              onClick={() => handleLinkClick(banner)}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="banner-image"
              />
              <div className="banner-overlay" />
              <div className="banner-content">
                {banner.title && <h1 className="banner-title">{banner.title}</h1>}
                {banner.subtitle && <p className="banner-subtitle">{banner.subtitle}</p>}
                {banner.description && <p className="banner-description">{banner.description}</p>}
                {banner.buttonText && (
                  <button className="banner-button">
                    {banner.buttonText}
                    <span className="banner-button-arrow">→</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerCarousel;
