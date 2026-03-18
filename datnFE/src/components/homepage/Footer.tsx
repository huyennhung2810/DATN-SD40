import React from "react";
import { Row, Col, Input, Button } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const categories = [
    { name: "Máy ảnh Mirrorless", href: "/client/catalog?category=mirrorless" },
    { name: "Máy ảnh DSLR", href: "/client/catalog?category=dslr" },
    { name: "Ống kính", href: "/client/catalog?category=lens" },
    { name: "Action Camera", href: "/client/catalog?category=action-cam" },
    { name: "Gimbal", href: "/client/catalog?category=gimbal" },
    { name: "Phụ kiện", href: "/client/catalog?category=accessories" },
  ];

  const policies = [
    { name: "Chính sách bảo hành", href: "/policy/warranty" },
    { name: "Chính sách đổi trả", href: "/policy/return" },
    { name: "Chính sách vận chuyển", href: "/policy/shipping" },
    { name: "Chính sách bảo mật", href: "/policy/privacy" },
    { name: "Điều khoản dịch vụ", href: "/policy/terms" },
  ];

  const supports = [
    { name: "Hướng dẫn mua hàng", href: "/guide/buy" },
    { name: "Hướng dẫn thanh toán", href: "/guide/payment" },
    { name: "Hướng dẫn trả góp", href: "/guide/installment" },
    { name: "Kiểm tra đơn hàng", href: "/order/track" },
    { name: "Liên hệ", href: "/client/contact" },
  ];

  const brands = [
    { name: "Canon", href: "/client/catalog?brand=canon" },
    { name: "Sony", href: "/client/catalog?brand=sony" },
    { name: "Nikon", href: "/client/catalog?brand=nikon" },
    { name: "Fujifilm", href: "/client/catalog?brand=fujifilm" },
    { name: "Sigma", href: "/client/catalog?brand=sigma" },
    { name: "DJI", href: "/client/catalog?brand=dji" },
  ];

  return (
    <footer className="main-footer">
      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h3>Đăng ký nhận tin</h3>
              <p>Nhận thông tin khuyến mãi và tin tức mới nhất</p>
            </div>
            <div className="newsletter-form">
              <Input
                placeholder="Nhập email của bạn"
                prefix={<MailOutlined />}
                className="newsletter-input"
              />
              <Button type="primary" icon={<SendOutlined />} className="newsletter-btn">
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <Row gutter={[40, 40]}>
            {/* Company Info */}
            <Col xs={24} sm={24} md={8} lg={6}>
              <div className="footer-column">
                <div className="footer-logo">
                  <img
                    src="/logo_hikari.png"
                    alt="Hikari Camera"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/150x50?text=HIKARI";
                    }}
                  />
                </div>
                <p className="footer-about">
                  HIKARI Camera - Địa chỉ mua sắm máy ảnh, ống kính và phụ kiện nhiếp ảnh uy tín hàng đầu Việt Nam.
                </p>
                <div className="footer-contact-list">
                  <div className="contact-item">
                    <EnvironmentOutlined className="contact-icon" />
                    <span>123 Nguyễn Trãi, Q.1, TP.HCM</span>
                  </div>
                  <div className="contact-item">
                    <PhoneOutlined className="contact-icon" />
                    <a href="tel:19001909">1900 1909</a>
                  </div>
                  <div className="contact-item">
                    <MailOutlined className="contact-icon" />
                    <a href="mailto:contact@hikaricamera.vn">contact@hikaricamera.vn</a>
                  </div>
                  <div className="contact-item">
                    <ClockCircleOutlined className="contact-icon" />
                    <span>8:00 - 21:00 (T2 - CN)</span>
                  </div>
                </div>
                <div className="footer-social">
                  <a href="https://facebook.com/hikaricamera" className="social-link" target="_blank" rel="noopener noreferrer">
                    <FacebookOutlined />
                  </a>
                  <a href="https://instagram.com/hikaricamera" className="social-link" target="_blank" rel="noopener noreferrer">
                    <InstagramOutlined />
                  </a>
                  <a href="https://youtube.com/hikaricamera" className="social-link" target="_blank" rel="noopener noreferrer">
                    <YoutubeOutlined />
                  </a>
                </div>
              </div>
            </Col>

            {/* Categories */}
            <Col xs={12} sm={6} md={4} lg={3}>
              <div className="footer-column">
                <h4 className="footer-title">Danh mục</h4>
                <ul className="footer-links">
                  {categories.map((item, index) => (
                    <li key={index}>
                      <Link to={item.href}>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Brands */}
            <Col xs={12} sm={6} md={4} lg={3}>
              <div className="footer-column">
                <h4 className="footer-title">Thương hiệu</h4>
                <ul className="footer-links">
                  {brands.map((item, index) => (
                    <li key={index}>
                      <Link to={item.href}>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Policies */}
            <Col xs={12} sm={6} md={4} lg={3}>
              <div className="footer-column">
                <h4 className="footer-title">Chính sách</h4>
                <ul className="footer-links">
                  {policies.map((item, index) => (
                    <li key={index}>
                      <Link to={item.href}>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Support */}
            <Col xs={12} sm={6} md={4} lg={9}>
              <div className="footer-column">
                <h4 className="footer-title">Hỗ trợ</h4>
                <ul className="footer-links">
                  {supports.map((item, index) => (
                    <li key={index}>
                      <Link to={item.href}>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="bottom-content">
            <div className="copyright">
              <p>&copy; {currentYear} <strong>HIKARI Camera</strong>. All rights reserved.</p>
            </div>
            <div className="payment-methods">
              <span>Phương thức thanh toán:</span>
              <div className="payment-icons">
                <span className="payment-icon">Visa</span>
                <span className="payment-icon">MasterCard</span>
                <span className="payment-icon">ATM</span>
                <span className="payment-icon">MoMo</span>
                <span className="payment-icon">VNPay</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .main-footer {
          background: #1a1a1a;
          color: #fff;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Newsletter */
        .footer-newsletter {
          background: linear-gradient(135deg, #D32F2F 0%, #b71c1c 100%);
          padding: 32px 0;
        }

        .newsletter-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }

        .newsletter-text h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 4px;
          color: #fff;
        }

        .newsletter-text p {
          font-size: 14px;
          margin: 0;
          color: rgba(255, 255, 255, 0.8);
        }

        .newsletter-form {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .newsletter-input {
          width: 300px;
          height: 48px;
          border-radius: 12px !important;
          border: none !important;
          padding: 0 16px;
        }

        .newsletter-btn {
          height: 48px;
          padding: 0 24px;
          background: #1a1a1a !important;
          border: none !important;
          border-radius: 12px !important;
          font-weight: 600;
        }

        .newsletter-btn:hover {
          background: #333 !important;
        }

        /* Main Footer */
        .footer-main {
          padding: 60px 0 40px;
        }

        .footer-column {
          height: 100%;
        }

        .footer-logo {
          margin-bottom: 20px;
        }

        .footer-logo img {
          height: 44px;
          width: auto;
        }

        .footer-about {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .footer-contact-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .footer-contact-list .contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }

        .footer-contact-list .contact-icon {
          color: #D32F2F;
          font-size: 14px;
        }

        .footer-contact-list a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-contact-list a:hover {
          color: #D32F2F;
        }

        .footer-social {
          display: flex;
          gap: 12px;
        }

        .social-link {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 18px;
          transition: all 0.3s;
        }

        .social-link:hover {
          background: #D32F2F;
          transform: translateY(-2px);
        }

        .footer-title {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #D32F2F;
          display: inline-block;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 12px;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 14px;
          transition: all 0.2s;
        }

        .footer-links a:hover {
          color: #D32F2F;
          padding-left: 6px;
        }

        /* Bottom Bar */
        .footer-bottom {
          background: #111;
          padding: 20px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .bottom-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .copyright p {
          margin: 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        .copyright strong {
          color: #fff;
        }

        .payment-methods {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .payment-methods span {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        .payment-icons {
          display: flex;
          gap: 8px;
        }

        .payment-icon {
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.8);
        }

        /* Responsive */
        @media (max-width: 992px) {
          .newsletter-content {
            flex-direction: column;
            text-align: center;
          }

          .newsletter-form {
            width: 100%;
            flex-direction: column;
          }

          .newsletter-input {
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .footer-main {
            padding: 40px 0 32px;
          }

          .footer-column {
            margin-bottom: 24px;
          }

          .bottom-content {
            flex-direction: column;
            text-align: center;
          }

          .payment-methods {
            flex-direction: column;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
