import React from "react";
import { Row, Col } from "antd";
import {
  SafetyCertificateOutlined,
  ToolOutlined,
  CarOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";

const services = [
  {
    id: "1",
    icon: <SafetyCertificateOutlined />,
    title: "Hàng chính hãng",
    description: "100% authentic products with official warranty"
  },
  {
    id: "2",
    icon: <ToolOutlined />,
    title: "Bảo hành uy tín",
    description: "Authorized service centers nationwide"
  },
  {
    id: "3",
    icon: <CarOutlined />,
    title: "Giao hàng toàn quốc",
    description: "Fast shipping to 63 provinces"
  },
  {
    id: "4",
    icon: <CustomerServiceOutlined />,
    title: "Hỗ trợ kỹ thuật",
    description: "Professional technical support 24/7"
  }
];

const PromotionSection: React.FC = () => {
  return (
    <section className="promotion-section">
      <div className="section-container">
        <Row gutter={[24, 24]}>
          {services.map((service) => (
            <Col xs={24} sm={12} md={6} key={service.id}>
              <div className="service-card">
                <div className="service-icon-wrapper">
                  <div className="service-icon">{service.icon}</div>
                </div>
                <div className="service-content">
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <style>{`
        .promotion-section {
          background: linear-gradient(180deg, #fff 0%, #f8f9fa 100%);
          padding: 48px 0;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
        }

        .section-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .service-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 24px;
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e5e5e5;
          transition: all 0.3s ease;
        }

        .service-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
          border-color: #D32F2F;
        }

        .service-icon-wrapper {
          flex-shrink: 0;
        }

        .service-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
          border-radius: 14px;
          font-size: 24px;
          color: #1a1a1a;
          transition: all 0.3s;
        }

        .service-card:hover .service-icon {
          background: #D32F2F;
          color: #fff;
          transform: scale(1.1);
        }

        .service-content {
          flex: 1;
        }

        .service-title {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 6px;
        }

        .service-description {
          font-size: 13px;
          color: #666;
          margin: 0;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .promotion-section {
            padding: 32px 0;
          }

          .section-container {
            padding: 0 16px;
          }

          .service-card {
            padding: 20px;
          }

          .service-icon {
            width: 48px;
            height: 48px;
            font-size: 20px;
            border-radius: 12px;
          }

          .service-title {
            font-size: 14px;
          }

          .service-description {
            font-size: 12px;
          }
        }
      `}</style>
    </section>
  );
};

export default PromotionSection;
