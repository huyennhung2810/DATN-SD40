import React, { useEffect, useState } from "react";
import { Carousel, Skeleton } from "antd";
import type { BannerResponse } from "../../models/banner";

interface BannerCarouselProps {
  banners: BannerResponse[];
  loading: boolean;
  onBannerClick?: (linkUrl?: string) => void;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners, loading, onBannerClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Auto-play logic handled by AntD Carousel
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[300px] md:h-[400px] lg:h-[500px]">
        <Skeleton.Input active className="w-full h-full" />
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400">Không có banner nào</div>
      </div>
    );
  }

  const handleBannerClick = (banner: BannerResponse) => {
    if (onBannerClick) {
      onBannerClick(banner.linkUrl);
    } else if (banner.linkUrl) {
      window.open(banner.linkUrl, "_blank");
    }
  };

  return (
    <div className="relative w-full">
      <Carousel
        autoplay
        autoplaySpeed={5000}
        dots={{ className: "custom-dots" }}
        afterChange={(current) => setCurrentSlide(current)}
        className="banner-carousel"
      >
        {banners.map((banner, index) => (
          <div key={banner.id} className="cursor-pointer" onClick={() => handleBannerClick(banner)}>
            <div
              className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-cover bg-center relative"
              style={{
                backgroundImage: `url(${banner.imageUrl})`,
              }}
            >
              {/* Overlay gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
              
              {/* Banner content */}
              <div className="absolute bottom-10 left-10 md:left-20 max-w-lg">
                {banner.title && (
                  <h2 className="text-white text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                    {banner.title}
                  </h2>
                )}
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Custom dots for mobile */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-2 mt-4 md:hidden">
          {banners.map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === idx ? "bg-red-600 w-4" : "bg-gray-300"
              }`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;

