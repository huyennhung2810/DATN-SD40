import React, { useState, useEffect, useMemo } from "react";
import { Button, Carousel } from "antd";
import { ArrowRightOutlined, LoadingOutlined } from "@ant-design/icons";
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
}

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [sideBanners, setSideBanners] = useState<HeroSlide[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const allBanners = await bannerApi.getAllActiveBanners();

        // Backend already filters blank imageUrl in BannerCacheServiceImpl.
        // Defensive frontend filter: only include banners with a non-empty imageUrl.
        const validBanners = (allBanners ?? []).filter(
          (b: BannerResponse) =>
            b.imageUrl != null && b.imageUrl.trim() !== ""
        );

        if (validBanners.length === 0) {
          setLoading(false);
          return;
        }

        // First banner(s) become hero carousel slides (max 3)
        const heroSlides: HeroSlide[] = validBanners
          .slice(0, 3)
          .map((banner: BannerResponse) => ({
            id: banner.id,
            image: banner.imageUrl,
            title: banner.title ?? "",
            subtitle: banner.subtitle ?? "",
            description: banner.description ?? "",
            ctaText: banner.buttonText ?? "Xem ngay",
            ctaLink: banner.linkUrl ?? "/client/catalog",
          }));

        setSlides(heroSlides);

        // Remaining banners become side promo cards
        const sidePromos: HeroSlide[] = validBanners
          .slice(3)
          .map((banner: BannerResponse) => ({
            id: banner.id,
            image: banner.imageUrl,
            title: banner.title ?? "",
            subtitle: banner.subtitle ?? "",
            description: banner.description ?? "",
            ctaText: banner.buttonText ?? "Xem ngay",
            ctaLink: banner.linkUrl ?? "/client/catalog",
          }));

        setSideBanners(sidePromos);
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const removeSideBanner = (id: string) => {
    setSideBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const removeHeroSlide = (id: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
  };

  // Determine CSS Grid modifier based on number of side banners:
  // --full: no side banners → full-width carousel
  // --1-side: 1 side banner → narrow side column
  // --2-side: 2+ side banners → standard layout
  const gridModifier = useMemo(() => {
    if (sideBanners.length === 0) return "hw-hero-grid--full";
    if (sideBanners.length === 1) return "hw-hero-grid--1-side";
    return "hw-hero-grid--2-side";
  }, [sideBanners.length]);

  if (loading) {
    return (
      <section className="hw-hero-section">
        <div className="hw-container">
          <div style={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LoadingOutlined style={{ fontSize: 40, color: "#D32F2F" }} spin />
          </div>
        </div>
      </section>
    );
  }

  // No banners at all — show a full-width placeholder so the page doesn't go blank
  if (slides.length === 0) {
    return (
      <section className="hw-hero-section">
        <div className="hw-container">
          <div
            className="hw-hero-carousel-wrap"
            style={{ height: 480, background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
              <p style={{ fontSize: 16, marginBottom: 4 }}>Chưa có banner nào được kích hoạt</p>
              <p style={{ fontSize: 13 }}>Vui lòng thêm banner từ trang quản trị</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hw-hero-section">
      <div className="hw-container">
        <div className={`hw-hero-grid ${gridModifier}`}>
          {/* Main carousel */}
          <div className="hw-hero-carousel-wrap">
            <Carousel
              autoplay
              autoplaySpeed={6000}
              dots={{ className: "hw-hero-dots" }}
              arrows={false}
            >
              {slides.map((slide) => (
                <div key={slide.id} className="hw-hero-slide">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="hw-hero-img"
                    onError={() => removeHeroSlide(slide.id)}
                  />
                  <div className="hw-hero-overlay" />
                  <div className="hw-hero-content">
                    {slide.subtitle && (
                      <div className="hw-hero-badge">{slide.subtitle}</div>
                    )}
                    <h1 className="hw-hero-title">{slide.title}</h1>
                    {slide.description && (
                      <p className="hw-hero-desc">{slide.description}</p>
                    )}
                    <div className="hw-hero-cta">
                      <Button
                        type="primary"
                        size="large"
                        className="hw-hero-btn hw-hero-btn--primary"
                        onClick={() => navigate(slide.ctaLink)}
                      >
                        {slide.ctaText}
                        <ArrowRightOutlined />
                      </Button>
                      <Button
                        type="default"
                        size="large"
                        className="hw-hero-btn hw-hero-btn--ghost"
                        onClick={() => navigate("/client/catalog")}
                      >
                        Xem tất cả
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>

          {/* Side promo banners — auto-reflows when empty */}
          {sideBanners.length > 0 && (
            <div className="hw-hero-promo-stack">
              {sideBanners.map((banner) => (
                <a
                  key={banner.id}
                  href={banner.ctaLink}
                  className="hw-hero-promo-item"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(banner.ctaLink);
                  }}
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="hw-hero-promo-img"
                    loading="lazy"
                    onError={() => removeSideBanner(banner.id)}
                  />
                  <div className="hw-hero-promo-overlay">
                    {banner.title && (
                      <span className="hw-hero-promo-title">{banner.title}</span>
                    )}
                    {banner.subtitle && (
                      <span className="hw-hero-promo-subtitle">
                        {banner.subtitle}
                        <ArrowRightOutlined style={{ fontSize: 10 }} />
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .hw-hero-section {
          background: var(--hw-bg);
          padding: 20px 0 0;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
