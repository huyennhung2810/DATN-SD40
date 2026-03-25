import React, { useState, useEffect } from "react";
import {
  CameraOutlined,
  AimOutlined,
  VideoCameraOutlined,
  ThunderboltOutlined,
  FireOutlined,
  GiftOutlined,
  RightOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { customerProductApi } from "../../api/customerProductApi";
import type { ProductCategoryResponse } from "../../models/productCategory";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  image: string;
}

// Default categories as fallback when API is unavailable or returns nothing
const defaultCategories: Category[] = [
  { id: "may-anh", name: "Máy ảnh", icon: <CameraOutlined />, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80" },
  { id: "ong-kinh", name: "Ống kính", icon: <AimOutlined />, image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400&q=80" },
  { id: "may-quay", name: "Máy quay", icon: <VideoCameraOutlined />, image: "https://images.unsplash.com/photo-1585399000684-d2f72660f092?w=400&q=80" },
  { id: "gimbal", name: "Gimbal", icon: <ThunderboltOutlined />, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80" },
  { id: "den-flash", name: "Đèn flash", icon: <FireOutlined />, image: "https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=400&q=80" },
  { id: "phu-kien", name: "Phụ kiện", icon: <GiftOutlined />, image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80" },
];

// Map category names to icons and images when fetched from the API
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
          const mapped: Category[] = data.slice(0, 6).map((cat: ProductCategoryResponse) => ({
            id: cat.id,
            name: cat.name,
            icon: categoryIcons[cat.name] || <CameraOutlined />,
            image: categoryImages[cat.name] || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
          }));
          setCategories(mapped);
        }
      } catch (error) {
        // Swallow all errors — defaults remain, component stays alive
        console.warn("Using default categories — API unavailable:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="hw-section" style={{ background: "var(--hw-bg-white)" }}>
      <div className="hw-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <LoadingOutlined style={{ fontSize: 32, color: "#D32F2F" }} spin />
          </div>
        ) : (
          <div className="hw-category-grid">
            {categories.map((category) => (
              <a
                key={category.id}
                className="hw-category-card"
                onClick={() => navigate(`/client/catalog?idProductCategory=${category.id}`)}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="hw-category-card__img"
                />
                <div className="hw-category-card__overlay" />
                <div className="hw-category-card__content">
                  <div className="hw-category-card__icon">{category.icon}</div>
                  <h3 className="hw-category-card__name">{category.name}</h3>
                </div>
                <div className="hw-category-card__arrow">
                  <RightOutlined />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCategories;
