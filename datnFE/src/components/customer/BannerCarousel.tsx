import React, { useState } from "react";
import { Carousel, Skeleton, Button } from "antd";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";
import type { BannerResponse } from "../../models/banner";

interface BannerCarouselProps {
  banners: BannerResponse[];
  loading: boolean;
  onBannerClick?: (linkUrl?: string) => void;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners, loading, onBannerClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Default banners for fallback
  const defaultBanners: BannerResponse[] = [
    {
      id: "default-1",
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&h=600&fit=crop",
      title: "Sony Alpha A7 IV",
      description: "Hotsale tháng 3 - Giảm đến 15%",
      linkUrl: "/client/catalog?brand=sony&category=may-anh",
      buttonText: "Xem ngay",
      slot: "HOME_HERO",
      status: "ACTIVE",
      priority: 1,
    },
    {
      id: "default-2",
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=1920&h=600&fit=crop",
      title: "Canon EOS R6 Mark II",
      description: "Đỉnh cao nhiếp ảnh - Quà tặng triết khấu cao",
      linkUrl: "/client/catalog?brand=canon&category=may-anh",
      buttonText: "Khám phá ngay",
      slot: "HOME_HERO",
      status: "ACTIVE",
      priority: 2,
    },
    {
      id: "default-3",
      imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1920&h=600&fit=crop",
      title: "Ống kính Sony GM",
      description: "Trả góp 0% - Hỗ trợ kỹ thuật chuyên nghiệp",
      linkUrl: "/client/catalog?brand=sony&category=lens",
      buttonText: "Tìm hiểu thêm",
      slot: "HOME_HERO",
      status: "ACTIVE",
      priority: 3,
    },
  ];

  const displayBanners = banners && banners.length > 0 ? banners : defaultBanners;

  const handleBannerClick = (banner: BannerResponse) => {
    if (banner.linkUrl) {
      if (onBannerClick) {
        onBannerClick(banner.linkUrl);
      } else {
        window.open(banner.linkUrl, "_blank");
      }
    }
  };

  if (loading) {
    return (
      <div className="banner-skeleton">
        <Skeleton.Input active className="w-full h-[300px] md:h-[400px] lg:h-[500px]" />
      </div>
    );
  }

  return (
    <div className="hero-banner-container">
      <Carousel
        autoplay
        autoplaySpeed={5000}
        dots={{ className: "custom-dots" }}
        arrows
        prevArrow={<LeftOutlined />}
        nextArrow={<RightOutlined />}
        afterChange={(current) => setCurrentSlide(current)}
        className="hero-banner-carousel"
      >
        {displayBanners.map((banner, index) => (
          <div key={banner.id || index} className="banner-slide">
            <div
              className="banner-slide-inner"
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%), url(${banner.imageUrl})`,
              }}
            >
              {/* Content */}
              <div className="banner-content">
                <div className="container mx-auto">
                  <div className="banner-text-wrapper">
                    {/* Promo Tag */}
                    <div className="banner-promo-tag">
                      <span className="promo-icon">🔥</span>
                      <span className="promo-text">KHUYẾN MÃI</span>
                    </div>

                    {/* Title */}
                    <h1 className="banner-title">
                      {banner.title}
                    </h1>

                    {/* Description */}
                    {banner.description && (
                      <p className="banner-description">
                        {banner.description}
                      </p>
                    )}

                    {/* CTA Button */}
                    <Button
                      type="primary"
                      size="large"
                      className="banner-cta"
                      icon={<RightOutlined />}
                      iconPosition="end"
                      onClick={() => handleBannerClick(banner)}
                    >
                      {banner.buttonText || "Xem chi tiết"}
                    </Button>

                    {/* Trust Badges */}
                    <div className="trust-badges">
                      <div className="trust-badge">
                        <span className="trust-icon">✓</span>
                        <span>Chính hãng 100%</span>
                      </div>
                      <div className="trust-badge">
                        <span className="trust-icon">✓</span>
                        <span>Bảo hành chính hãng</span>
                      </div>
                      <div className="trust-badge">
                        <span className="trust-icon">✓</span>
                        <span>Giao hàng toàn quốc</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Custom Navigation Dots */}
      <div className="banner-navigation">
        <div className="banner-dots">
          {displayBanners.map((_, idx) => (
            <button
              key={idx}
              className={`banner-dot ${currentSlide === idx ? "active" : ""}`}
              onClick={() => setCurrentSlide(idx)}
            >
              <span className="dot-inner" />
            </button>
          ))}
        </div>
      </div>

      {/* Promo Strip */}
      <div className="promo-strip">
        <div className="container mx-auto">
          <div className="promo-strip-content">
            <div className="promo-item">
              <span className="promo-icon">📦</span>
              <span>Miễn phí vận chuyển đơn &gt; 2 triệu</span>
            </div>
            <div className="promo-divider">|</div>
            <div className="promo-item">
              <span className="promo-icon">💳</span>
              <span>Trả góp 0% lãi suất</span>
            </div>
            <div className="promo-divider">|</div>
            <div className="promo-item">
              <span className="promo-icon">🎁</span>
              <span>Quà tặng triết khấu cao</span>
            </div>
            <div className="promo-divider">|</div>
            <div className="promo-item">
              <span className="promo-icon">🛡️</span>
              <span>Bảo hành chính hãng 12-24 tháng</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Hero Banner Container */
        .hero-banner-container {
          position: relative;
          width: 100%;
          background: #f5f5f5;
        }

        /* Banner Slide */
        .banner-slide {
          height: 380px;
        }

        @media (min-width: 768px) {
          .banner-slide {
            height: 420px;
          }
        }

        @media (min-width: 1024px) {
          .banner-slide {
            height: 480px;
          }
        }

        .banner-slide-inner {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: center;
        }

        /* Content */
        .banner-content {
          position: relative;
          z-index: 10;
          width: 100%;
          padding: 20px 0;
        }

        .banner-text-wrapper {
          max-width: 600px;
          color: #fff;
          padding: 20px;
        }

        /* Promo Tag */
        .banner-promo-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(211, 47, 47, 0.9);
          padding: 8px 16px;
          border-radius: 4px;
          margin-bottom: 16px;
          animation: fadeInUp 0.5s ease forwards;
        }

        .banner-promo-tag .promo-icon {
          font-size: 16px;
        }

        .banner-promo-tag .promo-text {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        /* Title */
        .banner-title {
          font-size: 28px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 12px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          animation: fadeInUp 0.5s ease 0.1s forwards;
          opacity: 0;
          color: #fff;
        }

        @media (min-width: 768px) {
          .banner-title {
            font-size: 36px;
          }
        }

        @media (min-width: 1024px) {
          .banner-title {
            font-size: 42px;
          }
        }

        /* Description */
        .banner-description {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 20px;
          opacity: 0.95;
          animation: fadeInUp 0.5s ease 0.2s forwards;
          opacity: 0;
        }

        @media (min-width: 768px) {
          .banner-description {
            font-size: 18px;
          }
        }

        /* CTA Button */
        .banner-cta {
          height: 48px !important;
          padding: 0 28px !important;
          font-size: 15px !important;
          font-weight: 600 !important;
          background: #D32F2F !important;
          border: none !important;
          border-radius: 8px !important;
          animation: fadeInUp 0.5s ease 0.3s forwards;
          opacity: 0;
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px;
        }

        .banner-cta:hover {
          background: #C62828 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(211, 47, 47, 0.4);
        }

        /* Trust Badges */
        .trust-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 24px;
          animation: fadeInUp 0.5s ease 0.4s forwards;
          opacity: 0;
        }

        .trust-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.9);
        }

        .trust-icon {
          width: 18px;
          height: 18px;
          background: #4CAF50;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #fff;
        }

        /* Custom Dots */
        .hero-banner-container :global(.custom-dots) {
          display: none !important;
        }

        /* Custom Arrows */
        .hero-banner-container :global(.slick-arrow) {
          width: 48px !important;
          height: 48px !important;
          background: rgba(255, 255, 255, 0.9) !important;
          border: none !important;
          border-radius: 50% !important;
          z-index: 20;
          display: flex !important;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.3s;
        }

        .hero-banner-container:hover :global(.slick-arrow) {
          opacity: 1;
        }

        .hero-banner-container :global(.slick-arrow)::before) {
          color: #333 !important;
          font-size: 16px !important;
        }

        .hero-banner-container :global(.slick-prev) {
          left: 20px !important;
        }

        .hero-banner-container :global(.slick-next) {
          right: 20px !important;
        }

        .hero-banner-container :global(.slick-arrow:hover) {
          background: #fff !important;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        /* Navigation */
        .banner-navigation {
          position: absolute;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        @media (min-width: 768px) {
          .banner-navigation {
            bottom: 120px;
          }
        }

        .banner-dots {
          display: flex;
          gap: 8px;
        }

        .banner-dot {
          width: 32px;
          height: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.4);
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          padding: 0;
        }

        .banner-dot.active .dot-inner,
        .banner-dot.active {
          background: #D32F2F;
          width: 32px;
        }

        .banner-dot:hover {
          background: rgba(255, 255, 255, 0.7);
        }

        /* Promo Strip */
        .promo-strip {
          background: linear-gradient(90deg, #D32F2F 0%, #E53935 50%, #D32F2F 100%);
          padding: 12px 0;
        }

        .promo-strip-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .promo-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
        }

        .promo-icon {
          font-size: 16px;
        }

        .promo-divider {
          color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
          .promo-strip-content {
            gap: 8px;
          }

          .promo-divider {
            display: none;
          }

          .promo-item {
            font-size: 11px;
            flex: 0 0 auto;
          }

          .promo-strip {
            padding: 10px 0;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Skeleton */
        .banner-skeleton {
          width: 100%;
          height: 380px;
          background: #f5f5f5;
        }

        @media (min-width: 768px) {
          .banner-skeleton {
            height: 420px;
          }
        }

        @media (min-width: 1024px) {
          .banner-skeleton {
            height: 480px;
          }
        }
      `}</style>
    </div>
  );
};

export default BannerCarousel;
