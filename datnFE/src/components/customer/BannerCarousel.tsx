import React, { useEffect, useState } from "react";
import { Carousel, Skeleton, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import bannerApi from "../../api/bannerApi";
import { BannerPosition } from "../../models/banner";

interface BannerCarouselProps {
  position?: string;
  autoPlay?: boolean;
  onBannerClick?: (linkUrl: string | undefined) => void;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  position = BannerPosition.HOME_HERO,
  autoPlay = true,
  onBannerClick,
}) => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, [position]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await bannerApi.getActiveBanners(position);
      setBanners(data || []);
    } catch (error) {
      console.error("Error loading banners:", error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerClick = (banner: any) => {
    if (onBannerClick) {
      onBannerClick(banner.linkUrl);
    } else if (banner.linkUrl) {
      if (banner.linkTarget === "NEW_TAB") {
        window.open(banner.linkUrl, "_blank");
      } else {
        window.location.href = banner.linkUrl;
      }
    }
  };

  if (loading) {
    return (
      <div className="banner-carousel-skeleton">
        <Skeleton.Image active style={{ width: "100%", height: 400 }} />
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  if (banners.length === 1) {
    const banner = banners[0];
    return (
      <div
        className="banner-single"
        onClick={() => handleBannerClick(banner)}
        style={{ cursor: banner.linkUrl ? "pointer" : "default" }}
      >
        <img
          src={banner.mobileImageUrl || banner.imageUrl}
          alt={banner.title}
          className="banner-single-image"
        />
        {(banner.title || banner.subtitle || banner.buttonText) && (
          <div className="banner-single-content">
            {banner.title && <h2 className="banner-title">{banner.title}</h2>}
            {banner.subtitle && <p className="banner-subtitle">{banner.subtitle}</p>}
            {banner.buttonText && (
              <Button type="primary" className="banner-button">
                {banner.buttonText}
              </Button>
            )}
          </div>
        )}
        <style>{`
          .banner-single {
            position: relative;
            width: 100%;
            overflow: hidden;
          }
          .banner-single-image {
            width: 100%;
            height: auto;
            max-height: 500px;
            object-fit: cover;
            display: block;
          }
          .banner-single-content {
            position: absolute;
            bottom: 40px;
            left: 40px;
            color: #fff;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            z-index: 10;
          }
          .banner-title {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #fff;
          }
          .banner-subtitle {
            font-size: 18px;
            margin-bottom: 16px;
            color: rgba(255, 255, 255, 0.9);
          }
          .banner-button {
            margin-top: 12px;
          }
          @media (max-width: 768px) {
            .banner-single-content {
              bottom: 20px;
              left: 20px;
              right: 20px;
            }
            .banner-title {
              font-size: 24px;
            }
            .banner-subtitle {
              font-size: 14px;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="banner-carousel-wrapper">
      <Carousel
        autoplay={autoPlay}
        dots={{ className: "banner-dots" }}
        arrows
        prevArrow={<LeftOutlined />}
        nextArrow={<RightOutlined />}
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id || index}
            className="banner-slide"
            onClick={() => handleBannerClick(banner)}
            style={{ cursor: banner.linkUrl ? "pointer" : "default" }}
          >
            <picture>
              <source
                media="(max-width: 768px)"
                srcSet={banner.mobileImageUrl || banner.imageUrl}
              />
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="banner-slide-image"
              />
            </picture>
            {(banner.title || banner.subtitle || banner.buttonText) && (
              <div className="banner-slide-content">
                {banner.title && <h2 className="banner-title">{banner.title}</h2>}
                {banner.subtitle && <p className="banner-subtitle">{banner.subtitle}</p>}
                {banner.buttonText && (
                  <Button type="primary" size="large" className="banner-button">
                    {banner.buttonText}
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </Carousel>

      <style>{`
        .banner-carousel-wrapper {
          position: relative;
          width: 100%;
        }
        .banner-slide {
          position: relative;
          width: 100%;
          height: 400px;
          overflow: hidden;
        }
        .banner-slide-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .banner-slide-content {
          position: absolute;
          bottom: 60px;
          left: 60px;
          max-width: 500px;
          color: #fff;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          z-index: 10;
        }
        .banner-title {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 12px;
          color: #fff;
          line-height: 1.2;
        }
        .banner-subtitle {
          font-size: 18px;
          margin-bottom: 20px;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.5;
        }
        .banner-button {
          background: #D32F2F !important;
          border: none !important;
          font-weight: 600;
          height: 44px !important;
          padding: 0 32px !important;
        }
        .banner-button:hover {
          background: #B71C1C !important;
        }
        .banner-carousel-wrapper :global(.slick-arrow) {
          z-index: 20;
          background: rgba(0, 0, 0, 0.5);
          color: #fff;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .banner-carousel-wrapper :global(.slick-arrow:hover) {
          background: rgba(0, 0, 0, 0.8);
        }
        .banner-carousel-wrapper :global(.slick-prev) {
          left: 20px;
        }
        .banner-carousel-wrapper :global(.slick-next) {
          right: 20px;
        }
        .banner-carousel-wrapper :global(.slick-dots) {
          bottom: 20px;
        }
        .banner-carousel-wrapper :global(.slick-dots li button) {
          background: rgba(255, 255, 255, 0.6);
        }
        .banner-carousel-wrapper :global(.slick-dots li.slick-active button) {
          background: #fff;
        }
        @media (max-width: 768px) {
          .banner-slide {
            height: 250px;
          }
          .banner-slide-content {
            bottom: 30px;
            left: 20px;
            right: 20px;
            max-width: none;
          }
          .banner-title {
            font-size: 22px;
          }
          .banner-subtitle {
            font-size: 14px;
            margin-bottom: 12px;
          }
          .banner-button {
            height: 36px !important;
            padding: 0 20px !important;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default BannerCarousel;
