import React from "react";
import { Typography, Row, Col, Input, Button } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  SendOutlined,
  CarOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Text, Title } = Typography;

const CustomerFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const categories = [
    {
      name: "Máy ảnh Mirrorless",
      href: "/client/catalog?category=may-anh-mirrorless",
    },
    { name: "Máy ảnh DSLR", href: "/client/catalog?category=may-anh-dslr" },
    { name: "Ống kính", href: "/client/catalog?category=ong-kinh" },
    { name: "Action Camera", href: "/client/catalog?category=action-cam" },
    { name: "Gimbal", href: "/client/catalog?category=gimbal" },
    { name: "Tripod", href: "/client/catalog?category=tripod" },
  ];

  const brands = [
    { name: "Canon", href: "/client/catalog?brand=canon" },
    { name: "Sony", href: "/client/catalog?brand=sony" },
    { name: "Nikon", href: "/client/catalog?brand=nikon" },
    { name: "Fujifilm", href: "/client/catalog?brand=fujifilm" },
    { name: "Panasonic", href: "/client/catalog?brand=panasonic" },
    { name: "Sigma", href: "/client/catalog?brand=sigma" },
    { name: "Tamron", href: "/client/catalog?brand=tamron" },
    { name: "DJI", href: "/client/catalog?brand=dji" },
    { name: "GoPro", href: "/client/catalog?brand=gopro" },
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
    { name: "Tuyển dụng", href: "/careers" },
    { name: "Liên hệ", href: "/client/contact" },
  ];

  const services = [
    {
      icon: <SafetyCertificateOutlined />,
      title: "Hàng chính hãng",
      desc: "100% authentic",
    },
    { icon: <SyncOutlined />, title: "Đổi trả dễ dàng", desc: "Trong 7 ngày" },
    { icon: <CarOutlined />, title: "Giao hàng nhanh", desc: "Toàn quốc" },
    {
      icon: <CustomerServiceOutlined />,
      title: "Hỗ trợ 24/7",
      desc: "Tư vấn chuyên nghiệp",
    },
  ];

  return (
    <footer className="customer-footer">
      {/* Services Banner */}
      <div className="footer-services">
        <div className="container mx-auto px-4">
          <Row gutter={[24, 16]} justify="center">
            {services.map((service, index) => (
              <Col xs={12} sm={12} md={6} key={index}>
                <div className="service-item">
                  <div className="service-icon">{service.icon}</div>
                  <div className="service-content">
                    <Text strong className="service-title">
                      {service.title}
                    </Text>
                    <Text type="secondary" className="service-desc">
                      {service.desc}
                    </Text>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container mx-auto px-4">
          <Row gutter={[32, 32]}>
            {/* Company Info & Newsletter */}
            <Col xs={24} sm={24} md={8} lg={6}>
              <div className="footer-section">
                <div className="footer-logo">
                  <img
                    src="/logo_hikari.png"
                    alt="Hikari Camera"
                    className="footer-logo-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/150x50?text=HIKARI";
                    }}
                  />
                </div>
                <Text className="footer-about-text">
                  HIKARI Camera - Địa chỉ mua sắm máy ảnh, ống kính và phụ kiện
                  nhiếp ảnh uy tín hàng đầu Việt Nam.
                </Text>

                {/* Contact Info */}
                <div className="footer-contact">
                  <div className="contact-item">
                    <EnvironmentOutlined className="contact-icon" />
                    <div>
                      <Text type="secondary" className="contact-label">
                        Địa chỉ:
                      </Text>
                      <Text className="contact-text">
                        Trường Cao đẳng FPT Polytechnic, Trịnh Văn Bô, Nam Từ
                        Liêm, Hà Nội
                      </Text>
                    </div>
                  </div>
                  <div className="contact-item">
                    <PhoneOutlined className="contact-icon" />
                    <div>
                      <Text type="secondary" className="contact-label">
                        Hotline:
                      </Text>
                      <a href="tel:19001909" className="contact-link">
                        1900 1909
                      </a>
                    </div>
                  </div>
                  <div className="contact-item">
                    <MailOutlined className="contact-icon" />
                    <div>
                      <Text type="secondary" className="contact-label">
                        Email:
                      </Text>
                      <a
                        href="mailto:contact@hikaricamera.vn"
                        className="contact-link"
                      >
                        contact@hikaricamera.vn
                      </a>
                    </div>
                  </div>
                  <div className="contact-item">
                    <ClockCircleOutlined className="contact-icon" />
                    <div>
                      <Text type="secondary" className="contact-label">
                        Giờ mở cửa:
                      </Text>
                      <Text className="contact-text">
                        8:00 - 21:00 (T2 - CN)
                      </Text>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="footer-social">
                  <a
                    href="https://facebook.com/hikaricamera"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    <FacebookOutlined />
                  </a>
                  <a
                    href="https://instagram.com/hikaricamera"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    <InstagramOutlined />
                  </a>
                  <a
                    href="https://youtube.com/hikaricamera"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    <YoutubeOutlined />
                  </a>
                </div>
              </div>
            </Col>

            {/* Categories */}
            <Col xs={12} sm={6} md={4} lg={3}>
              <div className="footer-section">
                <Title level={5} className="footer-title">
                  Danh mục
                </Title>
                <ul className="footer-links">
                  {categories.map((item, index) => (
                    <li key={index}>
                      <Link to={item.href} className="footer-link">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Brands */}
            <Col xs={12} sm={6} md={4} lg={3}>
              <div className="footer-section">
                <Title level={5} className="footer-title">
                  Thương hiệu
                </Title>
                <ul className="footer-links">
                  {brands.map((item, index) => (
                    <li key={index}>
                      <Link to={item.href} className="footer-link">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Policies */}
            <Col xs={12} sm={6} md={4} lg={3}>
              <div className="footer-section">
                <Title level={5} className="footer-title">
                  Chính sách
                </Title>
                <ul className="footer-links">
                  {policies.map((item, index) => (
                    <li key={index}>
                      <Link to={item.href} className="footer-link">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Support & Newsletter */}
            <Col xs={24} sm={6} md={4} lg={9}>
              <div className="footer-section">
                <Title level={5} className="footer-title">
                  Hỗ trợ khách hàng
                </Title>
                <ul className="footer-links">
                  {supports.map((item, index) => (
                    <li key={index}>
                      <Link to={item.href} className="footer-link">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Newsletter */}
                <div className="newsletter-section">
                  <Title level={5} className="footer-title mt-6">
                    Đăng ký nhận tin
                  </Title>
                  <Text type="secondary" className="newsletter-desc">
                    Nhận thông tin khuyến mãi mới nhất
                  </Text>
                  <div className="newsletter-form">
                    <Input
                      placeholder="Nhập email của bạn"
                      className="newsletter-input"
                      prefix={<MailOutlined />}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      className="newsletter-btn"
                    >
                      Đăng ký
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Payment Methods */}
          <div className="payment-section">
            <Text className="payment-title">Phương thức thanh toán:</Text>
            <div className="payment-icons">
              <span className="payment-icon">Visa</span>
              <span className="payment-icon">MasterCard</span>
              <span className="payment-icon">JCB</span>
              <span className="payment-icon">ATM</span>
              <span className="payment-icon">MoMo</span>
              <span className="payment-icon">ZaloPay</span>
              <span className="payment-icon">VNPay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container mx-auto px-4">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              <Text className="copyright-text">
                © {currentYear} <strong>HIKARI Camera</strong>. All rights
                reserved.
              </Text>
              <div className="footer-badges mt-2">
                <img
                  src="https://images.dmca.com/Protected/Approved/123456.png"
                  alt="DMCA"
                  height="20"
                  className="mr-2"
                />
                <img
                  src="https://www.google.com/safebrowsing/static/safebrowsing-gen.png"
                  alt="Google Safe Browsing"
                  height="20"
                />
              </div>
            </div>
            <div className="footer-stats">
              <Text type="secondary" className="text-xs">
                Đang truy cập: <strong>1,234</strong> | Tổng sản phẩm:{" "}
                <strong>500+</strong>
              </Text>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Footer Styles */
        .customer-footer {
          background: #fff;
          color: #333;
          margin-top: auto;
          border-top: 1px solid #eee;
        }

        .customer-footer .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
        }

        /* Services Banner */
        .footer-services {
          background: linear-gradient(180deg, #FFF5F5 0%, #fff 100%);
          padding: 24px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .service-item flex;
          align {
          display:-items: center;
          gap: 12px;
          padding: 8px 16px;
        }

        .service-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border-radius: 50%;
          font-size: 20px;
          color: #D32F2F;
          box-shadow: 0 2px 8px rgba(211, 47, 47, 0.15);
        }

        .service-content {
          flex: 1;
        }

        .service-title {
          display: block;
          font-size: 14px;
          color: #333;
          line-height: 1.3;
        }

        .service-desc {
          font-size: 12px;
        }

        /* Main Footer */
        .footer-main {
          background: #fafafa;
          padding: 40px 0 24px;
        }

        .footer-section {
          height: 100%;
        }

        /* Logo */
        .footer-logo {
          margin-bottom: 16px;
        }

        .footer-logo-img {
          height: 40px;
          object-fit: contain;
        }

        .footer-about-text {
          color: #666 !important;
          font-size: 13px;
          line-height: 1.6;
          display: block;
          margin-bottom: 20px;
        }

        /* Contact Info */
        .footer-contact {
          margin-bottom: 20px;
        }

        .contact-item {
          display: flex;
          gap: 10px;
          margin-bottom: 12px;
        }

        .contact-icon {
          color: #D32F2F;
          font-size: 14px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .contact-label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1px;
        }

        .contact-text {
          color: #555 !important;
          font-size: 13px;
          display: block;
        }

        .contact-link {
          color: #D32F2F !important;
          font-size: 13px;
          font-weight: 600;
        }

        .contact-link:hover {
          color: #B71C1C !important;
        }

        /* Social Links */
        .footer-social {
          display: flex;
          gap: 10px;
        }

        .social-link {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          color: #666;
          font-size: 16px;
          transition: all 0.3s;
        }

        .social-link:hover {
          background: #D32F2F;
          border-color: #D32F2F;
          color: #fff;
          transform: translateY(-2px);
        }

        /* Footer Titles */
        .footer-title {
          color: #333 !important;
          font-weight: 700 !important;
          margin-bottom: 16px !important;
          font-size: 15px !important;
          position: relative;
          padding-bottom: 8px;
        }

        .footer-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 30px;
          height: 2px;
          background: #D32F2F;
          border-radius: 2px;
        }

        /* Footer Links */
        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 8px;
        }

        .footer-link {
          color: #666 !important;
          font-size: 13px;
          transition: all 0.2s;
          display: inline-block;
          text-decoration: none;
        }

        .footer-link:hover {
          color: #D32F2F !important;
          transform: translateX(4px);
        }

        /* Newsletter */
        .newsletter-desc {
          display: block;
          font-size: 12px;
          margin-bottom: 12px;
        }

        .newsletter-form {
          display: flex;
          gap: 8px;
        }

        .newsletter-input {
          flex: 1;
          border-radius: 8px !important;
        }

        .newsletter-btn {
          background: #D32F2F !important;
          border-color: #D32F2F !important;
          border-radius: 8px !important;
          font-weight: 600;
        }

        .newsletter-btn:hover {
          background: #C62828 !important;
          border-color: #C62828 !important;
        }

        /* Payment Section */
        .payment-section {
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .payment-title {
          color: #999 !important;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .payment-icons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .payment-icon {
          padding: 4px 12px;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 11px;
          color: #666;
          font-weight: 500;
        }

        /* Bottom Bar */
        .footer-bottom {
          background: #333;
          padding: 16px 0;
        }

        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .copyright-text {
          color: rgba(255, 255, 255, 0.7) !important;
          font-size: 13px;
        }

        .footer-badges {
          display: flex;
          align-items: center;
        }

        .footer-badges img {
          opacity: 0.7;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .footer-main {
            padding: 24px 0 16px;
          }

          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
          }

          .newsletter-form {
            flex-direction: column;
          }

          .payment-section {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default CustomerFooter;
