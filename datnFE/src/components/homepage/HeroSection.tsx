import React, { useState, useEffect } from "react";
import { Button, Carousel } from "antd";
import { RightOutlined, ArrowRightOutlined, LoadingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import bannerApi from "../../api/bannerApi";
import type { BannerResponse } from "../../models/banner";

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  highlight?: string;
}

// Default slides in case API fails
const defaultHeroSlides: HeroSlide[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80",
    title: "Sony Alpha A7 IV",
    subtitle: "Hybrid Full-Frame Master",
    description: "Trải nghiệm chất lượng hình ảnh đỉnh cao với cảm biến 33MP và khả năng quay video 4K 60fps",
    ctaText: "Khám phá ngay",
    ctaLink: "/client/catalog?brand=sony",
    highlight: "Giảm 15%"
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80",
    title: "Canon EOS R5",
    subtitle: "Mirrorless Professional",
    description: "Độ phân giải 45MP, quay video 8K RAW, hệ thống chống rung 8-stop IBIS",
    ctaText: "Xem chi tiết",
    ctaLink: "/client/catalog?brand=canon",
    highlight: "Mới nhất"
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=1200&q=80",
    title: "Nikon Z8",
    subtitle: "Flagship Performance",
    description: "Cảm biến 45.7MP stacked CMOS, AF mạnh mẽ, thân máy nhỏ gọn chống bụi chống ẩm",
    ctaText: "Đặt hàng",
    ctaLink: "/client/catalog?brand=nikon",
    highlight: "Hotseller"
  }
];

const defaultPromoBanners = [
  {
    id: "p1",
    image: "https://images.unsplash.com/photo-1508614999368-9260051292e5?w=600&q=80",
    title: "Ống kính Sony G",
    subtitle: "Giảm đến 20%",
    link: "/client/catalog?category=lens&brand=sony"
  },
  {
    id: "p2",
    image: "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=600&q=80",
    title: "Phụ kiện Canon",
    subtitle: "Quà tặng hấp dẫn",
    link: "/client/catalog?category=accessories&brand=canon"
  }
];

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [promoBanners, setPromoBanners] = useState(defaultPromoBanners);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const banners = await bannerApi.getAllActiveBanners();
        
        if (banners && banners.length > 0) {
          // Transform banners to hero slides
          const slides: HeroSlide[] = banners.slice(0, 3).map((banner: BannerResponse) => ({
            id: banner.id,
            image: banner.imageUrl,
            title: banner.title,
            subtitle: banner.subtitle || "",
            description: banner.description || "",
            ctaText: banner.buttonText || "Xem ngay",
            ctaLink: banner.linkUrl || "/client/catalog",
            highlight: undefined
          }));
          
          setHeroSlides(slides);
          
          // Use remaining banners as promo banners if available
          if (banners.length > 3) {
            const promos = banners.slice(3, 5).map((banner: BannerResponse) => ({
              id: banner.id,
              image: banner.imageUrl,
              title: banner.title,
              subtitle: banner.subtitle || "",
              link: banner.linkUrl || "/client/catalog"
            }));
            setPromoBanners(promos);
          }
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        // Keep default slides on error - no need to do anything
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return (
      <section className="hero-section">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
          <LoadingOutlined style={{ fontSize: 40, color: '#D32F2F' }} spin />
        </div>
      </section>
    );
  }

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-main">
          <Carousel
            autoplay
            autoplaySpeed={6000}
            dots={{ className: "hero-dots" }}
            arrows={false}
          >
            {heroSlides.map((slide) => (
              <div key={slide.id} className="hero-slide">
                <div className="hero-image-wrapper">
                  <img src={slide.image} alt={slide.title} className="hero-image" />
                  <div className="hero-overlay" />
                </div>
                <div className="hero-content">
                  <div className="hero-badge">{slide.subtitle}</div>
                  <h1 className="hero-title">{slide.title}</h1>
                  <p className="hero-description">{slide.description}</p>
                  <div className="hero-cta">
                    <Button
                      type="primary"
                      size="large"
                      className="hero-btn-primary"
                      onClick={() => navigate(slide.ctaLink)}
                    >
                      {slide.ctaText}
                      <ArrowRightOutlined />
                    </Button>
                    <Button
                      type="default"
                      size="large"
                      className="hero-btn-secondary"
                      onClick={() => navigate("/client/catalog")}
                    >
                      Xem tất cả
                    </Button>
                  </div>
                  {slide.highlight && (
                    <div className="hero-highlight">{slide.highlight}</div>
                  )}
                </div>
              </div>
            ))}
          </Carousel>
        </div>

        <div className="hero-promo">
          {promoBanners.map((banner) => (
            <a
              key={banner.id}
              href={banner.link}
              className="promo-banner"
            >
              <img src={banner.image} alt={banner.title} className="promo-image" />
              <div className="promo-content">
                <span className="promo-title">{banner.title}</span>
                <span className="promo-subtitle">
                  {banner.subtitle}
                  <RightOutlined className="promo-arrow" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        .hero-section {
          background: #f8f9fa;
          padding: 0;
        }

        .hero-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
        }

        .hero-main {
          border-radius: 16px;
          overflow: hidden;
        }

        .hero-slide {
          position: relative;
          height: 480px;
        }

        .hero-image-wrapper {
          position: absolute;
          inset: 0;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.7) 0%,
            rgba(0, 0, 0, 0.3) 50%,
            transparent 100%
          );
        }

        .hero-content {
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px;
          max-width: 560px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 16px;
          width: fit-content;
        }

        .hero-title {
          font-size: 42px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 12px;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }

        .hero-description {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.85);
          margin: 0 0 28px;
          line-height: 1.6;
        }

        .hero-cta {
          display: flex;
          gap: 12px;
        }

        .hero-btn-primary {
          height: 48px;
          padding: 0 28px;
          background: #D32F2F !important;
          border: none !important;
          border-radius: 12px !important;
          font-weight: 600;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .hero-btn-primary:hover {
          background: #b71c1c !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(211, 47, 47, 0.35);
        }

        .hero-btn-secondary {
          height: 48px;
          padding: 0 28px;
          background: rgba(255, 255, 255, 0.15) !important;
          border: 2px solid rgba(255, 255, 255, 0.3) !important;
          border-radius: 12px !important;
          color: #fff !important;
          font-weight: 600;
          font-size: 15px;
          backdrop-filter: blur(8px);
          transition: all 0.3s;
        }

        .hero-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.25) !important;
          border-color: #fff !important;
        }

        .hero-highlight {
          position: absolute;
          top: 24px;
          right: 24px;
          padding: 8px 16px;
          background: #D32F2F;
          border-radius: 8px;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
        }

        /* Promo Banners */
        .hero-promo {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .promo-banner {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          display: block;
          text-decoration: none;
          aspect-ratio: 1;
        }

        .promo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }

        .promo-banner:hover .promo-image {
          transform: scale(1.05);
        }

        .promo-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 24px;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
        }

        .promo-title {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 4px;
        }

        .promo-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .promo-arrow {
          font-size: 10px;
        }

        /* Custom Dots */
        :global(.hero-dots) {
          bottom: 24px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
        }

        :global(.hero-dots li) {
          margin: 0 4px !important;
        }

        :global(.hero-dots li button) {
          width: 10px !important;
          height: 10px !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.5) !important;
          border: none !important;
        }

        :global(.hero-dots li.slick-active button) {
          background: #fff !important;
          width: 24px !important;
          border-radius: 10px !important;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .hero-container {
            grid-template-columns: 1fr;
          }

          .hero-promo {
            flex-direction: row;
          }

          .promo-banner {
            aspect-ratio: 2 / 1;
          }
        }

        @media (max-width: 768px) {
          .hero-container {
            padding: 16px;
            gap: 16px;
          }

          .hero-slide {
            height: 400px;
          }

          .hero-content {
            padding: 32px;
          }

          .hero-title {
            font-size: 28px;
          }

          .hero-description {
            font-size: 14px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .hero-cta {
            flex-direction: column;
          }

          .hero-btn-primary,
          .hero-btn-secondary {
            width: 100%;
            justify-content: center;
          }

          .hero-promo {
            flex-direction: column;
          }

          .promo-banner {
            aspect-ratio: 16 / 9;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
