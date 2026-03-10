import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import { CloseOutlined, RightOutlined } from "@ant-design/icons";
import bannerApi from "../../api/bannerApi";
import type { BannerResponse } from "../../models/banner";

interface BannerPopupProps {
  position?: string;
}

const BannerPopup: React.FC<BannerPopupProps> = ({ position = "POPUP" }) => {
  const [banner, setBanner] = useState<BannerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sessionKey = `popup_banner_${position}_shown`;
    const hasShown = sessionStorage.getItem(sessionKey);

    if (!hasShown) {
      fetchBanner(sessionKey);
    } else {
      setLoading(false);
    }
  }, [position]);

  const fetchBanner = async (sessionKey: string) => {
    try {
      const data = await bannerApi.getBannersByPosition(position);
      if (data.length > 0) {
        setBanner(data[0]);
        setVisible(true);
        sessionStorage.setItem(sessionKey, "true");
      }
    } catch (error) {
      console.error("Error fetching popup banner:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = () => {
    if (banner?.linkUrl) {
      if (banner.linkTarget === "NEW_TAB") {
        window.open(banner.linkUrl, "_blank");
      } else {
        window.location.href = banner.linkUrl;
      }
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  if (loading || !banner) {
    return null;
  }

  return (
    <>
      <style>{`
        .banner-popup-modal .ant-modal-content {
          overflow: hidden;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .banner-popup-modal .ant-modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .banner-popup-modal .ant-modal-close:hover {
          background: #fff;
          transform: rotate(90deg);
        }
        .banner-popup-image-container {
          position: relative;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .banner-popup-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .banner-popup-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 100%);
        }
        .banner-popup-content {
          position: relative;
          z-index: 5;
          padding: 40px;
          text-align: center;
          color: #fff;
          max-width: 500px;
        }
        .banner-popup-title {
          font-size: 36px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 16px;
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          animation: popupSlideUp 0.6s ease-out;
        }
        .banner-popup-subtitle {
          font-size: 20px;
          font-weight: 500;
          margin-bottom: 12px;
          opacity: 0.95;
          animation: popupSlideUp 0.6s ease-out 0.1s both;
        }
        .banner-popup-description {
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 28px;
          opacity: 0.9;
          animation: popupSlideUp 0.6s ease-out 0.2s both;
        }
        .banner-popup-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
          animation: popupSlideUp 0.6s ease-out 0.3s both;
        }
        .banner-popup-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(255, 107, 53, 0.5);
        }
        .banner-popup-button-arrow {
          transition: transform 0.3s ease;
        }
        .banner-popup-button:hover .banner-popup-button-arrow {
          transform: translateX(5px);
        }
        @keyframes popupSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 576px) {
          .banner-popup-image-container {
            min-height: 350px;
          }
          .banner-popup-content {
            padding: 30px 20px;
          }
          .banner-popup-title {
            font-size: 28px;
          }
          .banner-popup-subtitle {
            font-size: 16px;
          }
          .banner-popup-description {
            font-size: 14px;
          }
        }
      `}</style>
      <Modal
        className="banner-popup-modal"
        open={visible}
        onCancel={handleCancel}
        footer={null}
        centered
        width={650}
        closable={false}
      >
        <div className="banner-popup-image-container">
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="banner-popup-image"
          />
          <div className="banner-popup-overlay" />
          <div className="banner-popup-content" onClick={handleLinkClick}>
            {banner.title && <h1 className="banner-popup-title">{banner.title}</h1>}
            {banner.subtitle && <p className="banner-popup-subtitle">{banner.subtitle}</p>}
            {banner.description && <p className="banner-popup-description">{banner.description}</p>}
            {banner.buttonText && (
              <button className="banner-popup-button">
                {banner.buttonText}
                <span className="banner-popup-button-arrow">→</span>
              </button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BannerPopup;
