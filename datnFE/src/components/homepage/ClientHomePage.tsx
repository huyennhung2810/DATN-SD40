import React, { useState, useEffect, useCallback } from "react";
import { Spin } from "antd";
import {
  Navigation,
  HeroSection,
  FeaturedCategories,
  ProductSection,
  PromotionSection,
  BlogPreview,
} from "./index";
import { customerProductApi } from "../../api/customerProductApi";
import type { ProductResponse } from "../../models/product";

interface CardProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrls?: string[];
  categoryName?: string;
  brandName?: string;
  isNew?: boolean;
  isSale?: boolean;
}

/**
 * Maps backend ProductResponse → card-friendly shape.
 * Pricing is driven entirely by backend fields:
 *   - price            → display price (after discount, or original)
 *   - originalPrice    → shown only when hasActiveSaleCampaign = true
 *   - hasActiveSaleCampaign → drives the "Giảm giá" badge
 */
const toCard = (p: ProductResponse): CardProduct => ({
  id: p.id,
  name: p.name,
  price: p.price ?? 0,
  originalPrice:
    p.hasActiveSaleCampaign && p.originalPrice != null
      ? p.originalPrice
      : undefined,
  imageUrls: p.imageUrls ?? [],
  categoryName: p.productCategoryName ?? "",
  brandName: p.brandName ?? "",
  isNew:
    !!p.createdDate && Date.now() - p.createdDate < 30 * 24 * 60 * 60 * 1000,
  isSale: !!p.hasActiveSaleCampaign,
});

const ClientHomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [newProducts, setNewProducts] = useState<CardProduct[]>([]);
  const [saleProducts, setSaleProducts] = useState<CardProduct[]>([]);
  const [allProducts, setAllProducts] = useState<CardProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchHomepageData = useCallback(async () => {
    try {
      // Parallel fetches: all products + newest products
      const [allRes, newRes] = await Promise.all([
        customerProductApi.getProducts({ page: 1, size: 24, status: "ACTIVE" }),
        customerProductApi.getProducts({
          page: 1,
          size: 24,
          status: "ACTIVE",
          sortBy: "createdDate",
          orderBy: "desc",
        }),
      ]);

      const all = (allRes?.data ?? []).map(toCard);
      const newest = (newRes?.data ?? []).map(toCard);

      setAllProducts(all);
      setNewProducts(newest.slice(0, 8));

      // Sale products: only those with an active campaign confirmed by backend
      const sales = all.filter((p) => p.isSale);
      setSaleProducts(sales.slice(0, 8));
    } catch (err) {
      console.error("Error fetching homepage products:", err);
      setError("Không thể tải dữ liệu sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomepageData();
  }, [fetchHomepageData]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="hw-homepage">
      <Navigation />
      <HeroSection />

      <main>
        {/* 1. Featured Categories */}
        <FeaturedCategories />

        {/* 2. Sản phẩm mới */}
        <ProductSection
          title="Sản phẩm mới"
          subtitle="Những sản phẩm mới nhất"
          products={
            newProducts.length > 0 ? newProducts : allProducts.slice(0, 8)
          }
          viewAllLink="/client/catalog?sortBy=createdDate&orderBy=desc"
        />

        {/* 3. Khuyến mãi hot — only renders when backend confirms active campaign */}
        {saleProducts.length > 0 && (
          <ProductSection
            title="Khuyến mãi hot"
            subtitle="Giảm giá sốc — Limited time"
            products={saleProducts}
            viewAllLink="/client/catalog?hasActiveSale=true"
            backgroundAlt
          />
        )}

        {/* 4. Gợi ý cho nhiếp ảnh gia */}
        <ProductSection
          title="Gợi ý cho nhiếp ảnh gia"
          subtitle="Lựa chọn hoàn hảo cho creative"
          products={allProducts.slice(0, 8)}
          backgroundAlt
        />

        {/* 5. Tin tức & Blog */}
        <BlogPreview />

        {/* 6. Dịch vụ */}
        <PromotionSection />
      </main>
    </div>
  );
};

export default ClientHomePage;
