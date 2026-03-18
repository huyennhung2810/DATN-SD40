import React, { useState, useEffect } from "react";
import { Row, Col, Empty } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { customerProductApi } from "../../api/customerProductApi";
import type { BrandResponse } from "../../models/brand";

interface Brand {
  id: string;
  name: string;
  logo: string;
}

// Default brands in case API fails
const defaultBrands: Brand[] = [
  { id: "1", name: "Canon", logo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=80" },
  { id: "2", name: "Sony", logo: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=200&q=80" },
  { id: "3", name: "Nikon", logo: "https://images.unsplash.com/photo-1606986628213-9d1c1d17c12d?w=200&q=80" },
  { id: "4", name: "Fujifilm", logo: "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=200&q=80" },
  { id: "5", name: "Panasonic", logo: "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=200&q=80" },
  { id: "6", name: "Olympus", logo: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=200&q=80" },
  { id: "7", name: "Pentax", logo: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&q=80" },
  { id: "8", name: "Leica", logo: "https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=200&q=80" },
];

const FeaturedBrands: React.FC = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>(defaultBrands);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await customerProductApi.getBrands();
        if (data && data.length > 0) {
          const mappedBrands: Brand[] = data.map((brand: BrandResponse) => ({
            id: brand.id,
            name: brand.name,
            logo: brand.description 
              ? `https://source.unsplash.com/featured/?camera,${brand.name.toLowerCase()}` 
              : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=80",
          }));
          setBrands(mappedBrands);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return (
    <section className="featured-brands">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Thương hiệu nổi bật</h2>
          <p className="section-subtitle">Các hãng máy ảnh hàng đầu</p>
        </div>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <LoadingOutlined style={{ fontSize: 32, color: "#D32F2F" }} spin />
          </div>
        ) : brands.length === 0 ? (
          <Empty description="Không có thương hiệu nào" />
        ) : (
          <Row gutter={[16, 16]}>
            {brands.map((brand) => (
              <Col xs={12} sm={8} md={6} lg={3} key={brand.id}>
                <a 
                  href={`/client/catalog?idBrand=${brand.id}`} 
                  className="brand-card"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/client/catalog?idBrand=${brand.id}`);
                  }}
                >
                  <div className="brand-logo-wrapper">
                    <img src={brand.logo} alt={brand.name} className="brand-logo" />
                  </div>
                  <span className="brand-name">{brand.name}</span>
                </a>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <style>{`
        .featured-brands {
          background: #fff;
          padding: 60px 0;
        }

        .section-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 28px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 8px;
        }

        .section-subtitle {
          font-size: 15px;
          color: #666;
          margin: 0;
        }

        .brand-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px 16px;
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e5e5e5;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .brand-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
          border-color: #D32F2F;
        }

        .brand-logo-wrapper {
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-logo {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          filter: grayscale(100%);
          opacity: 0.6;
          transition: all 0.3s;
        }

        .brand-card:hover .brand-logo {
          filter: grayscale(0%);
          opacity: 1;
        }

        .brand-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
        }

        @media (max-width: 768px) {
          .featured-brands {
            padding: 40px 0;
          }

          .section-container {
            padding: 0 16px;
          }

          .section-header {
            margin-bottom: 24px;
          }

          .section-title {
            font-size: 22px;
          }

          .brand-card {
            padding: 16px 12px;
          }

          .brand-logo-wrapper {
            height: 36px;
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturedBrands;
