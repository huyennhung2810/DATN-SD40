import React, { useState, useEffect } from "react";
import { CameraOutlined, AimOutlined, VideoCameraOutlined, ThunderboltOutlined, FireOutlined, GiftOutlined, RightOutlined, LoadingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { customerProductApi } from "../../api/customerProductApi";
import type { ProductCategoryResponse } from "../../models/productCategory";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  image: string;
  productCount: number;
}

// Default categories in case API fails
const defaultCategories: Category[] = [
  {
    id: "may-anh",
    name: "Máy ảnh",
    icon: <CameraOutlined />,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
    productCount: 120
  },
  {
    id: "ong-kinh",
    name: "Ống kính",
    icon: <AimOutlined />,
    image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400&q=80",
    productCount: 85
  },
  {
    id: "may-quay",
    name: "Máy quay",
    icon: <VideoCameraOutlined />,
    image: "https://images.unsplash.com/photo-1585399000684-d2f72660f092?w=400&q=80",
    productCount: 45
  },
  {
    id: "gimbal",
    name: "Gimbal",
    icon: <ThunderboltOutlined />,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
    productCount: 32
  },
  {
    id: "den-flash",
    name: "Đèn flash",
    icon: <FireOutlined />,
    image: "https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=400&q=80",
    productCount: 28
  },
  {
    id: "phu-kien",
    name: "Phụ kiện",
    icon: <GiftOutlined />,
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80",
    productCount: 200
  }
];

// Map category names to icons and images
const categoryIcons: Record<string, React.ReactNode> = {
  "Máy ảnh DSLR": <CameraOutlined />,
  "Máy ảnh Mirrorless": <CameraOutlined />,
  "Máy ảnh Compact": <CameraOutlined />,
  "Máy quay phim": <VideoCameraOutlined />,
  "Ống kính": <AimOutlined />,
  "Phụ kiện": <GiftOutlined />,
};

const categoryImages: Record<string, string> = {
  "Máy ảnh DSLR": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
  "Máy ảnh Mirrorless": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80",
  "Máy ảnh Compact": "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=400&q=80",
  "Máy quay phim": "https://images.unsplash.com/photo-1585399000684-d2f72660f092?w=400&q=80",
  "Ống kính": "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400&q=80",
  "Phụ kiện": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80",
};

const FeaturedCategories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await customerProductApi.getCategories();
        if (data && data.length > 0) {
          const mappedCategories: Category[] = data.map((cat: ProductCategoryResponse) => ({
            id: cat.id,
            name: cat.name,
            icon: categoryIcons[cat.name] || <CameraOutlined />,
            image: categoryImages[cat.name] || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
            productCount: Math.floor(Math.random() * 50) + 10, // Random count for display
          }));
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="featured-categories">
      <div className="section-container">
        <div className="categories-grid">
          {loading ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
              <LoadingOutlined style={{ fontSize: 32, color: "#D32F2F" }} spin />
            </div>
          ) : (
            categories.map((category) => (
              <a
                key={category.id}
                href={`/client/catalog?category=${category.id}`}
                className="category-card"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/client/catalog?idProductCategory=${category.id}`);
                }}
              >
                <div className="category-image-wrapper">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="category-image"
                  />
                  <div className="category-overlay" />
                </div>
                <div className="category-content">
                  <div className="category-icon">{category.icon}</div>
                  <h3 className="category-name">{category.name}</h3>
                  <span className="category-count">
                    {category.productCount} sản phẩm
                  </span>
                </div>
                <div className="category-arrow">
                  <RightOutlined />
                </div>
              </a>
            ))
          )}
        </div>
      </div>

      <style>{`
        .featured-categories {
          padding: 40px 0;
          background: #fff;
        }

        .section-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 20px;
        }

        .category-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          aspect-ratio: 1;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .category-image-wrapper {
          position: absolute;
          inset: 0;
        }

        .category-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }

        .category-card:hover .category-image {
          transform: scale(1.1);
        }

        .category-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.75) 0%,
            rgba(0, 0, 0, 0.2) 50%,
            rgba(0, 0, 0, 0.1) 100%
          );
        }

        .category-content {
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
          z-index: 1;
        }

        .category-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          border-radius: 14px;
          font-size: 24px;
          color: #fff;
          margin-bottom: 12px;
          transition: all 0.3s;
        }

        .category-card:hover .category-icon {
          background: #D32F2F;
          transform: scale(1.1);
        }

        .category-name {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 6px;
        }

        .category-count {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.75);
        }

        .category-arrow {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          border-radius: 10px;
          color: #fff;
          font-size: 12px;
          opacity: 0;
          transform: translateX(-8px);
          transition: all 0.3s;
        }

        .category-card:hover .category-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        @media (max-width: 1200px) {
          .categories-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .featured-categories {
            padding: 24px 0;
          }

          .section-container {
            padding: 0 16px;
          }

          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .category-icon {
            width: 44px;
            height: 44px;
            font-size: 20px;
            border-radius: 12px;
          }

          .category-name {
            font-size: 13px;
          }

          .category-count {
            font-size: 11px;
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturedCategories;
