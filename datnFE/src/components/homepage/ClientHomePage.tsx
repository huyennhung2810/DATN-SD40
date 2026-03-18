import React, { useState, useEffect } from "react";
import { Spin } from "antd";
import {
  TopBar,
  Header,
  Navigation,
  HeroSection,
  FeaturedCategories,
  ProductSection,
  PromotionSection,
  FeaturedBrands,
  BlogPreview,
  Footer,
} from "./index";
import { customerProductApi } from "../../api/customerProductApi";
import type { ProductResponse } from "../../models/product";

// Transform API product to display format
const transformProduct = (product: ProductResponse) => ({
  id: product.id,
  name: product.name,
  price: product.price || 0,
  originalPrice: product.price ? Math.floor(product.price * 1.1) : undefined,
  imageUrls: product.imageUrls || [],
  categoryName: product.productCategoryName || "",
  brandName: product.brandName || "",
  rating: 4.5 + Math.random() * 0.5, // Random rating 4.5-5.0
  reviewCount: Math.floor(Math.random() * 200) + 10,
  isNew: product.createdDate && Date.now() - product.createdDate < 30 * 24 * 60 * 60 * 1000,
  isSale: product.price ? product.price < 50000000 : false,
  inStock: true,
});

const ClientHomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<ProductResponse[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [saleProducts, setSaleProducts] = useState<any[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch products with different parameters
        const [allRes, newRes] = await Promise.all([
          customerProductApi.getProducts({ page: 1, size: 20, status: "ACTIVE" }),
          customerProductApi.getProducts({ page: 1, size: 20, status: "ACTIVE", sortBy: "createdDate", orderBy: "desc" }),
        ]);

        const allProductsData = allRes?.data || [];
        const newProductsData = newRes?.data || [];

        setAllProducts(allProductsData);
        setNewProducts(newProductsData.slice(0, 6).map(transformProduct));
        
        // Mark products under 50M as sale
        const saleProds = allProductsData
          .filter(p => p.price && p.price < 50000000)
          .slice(0, 6)
          .map(transformProduct);
        saleProds.forEach(p => p.isSale = true);
        setSaleProducts(saleProds);

        // Use first 4 products as bestsellers (in real app would use actual sales data)
        setBestSellerProducts(allProductsData.slice(0, 4).map(transformProduct));

      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Không thể tải dữ liệu sản phẩm");
        // Still set empty arrays to prevent crash
        setAllProducts([]);
        setNewProducts([]);
        setSaleProducts([]);
        setBestSellerProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        background: "#f8f9fa"
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="homepage">
      <TopBar />
      <Header />
      <Navigation />
      
      <main>
        <HeroSection />
        <FeaturedCategories />
        
        <ProductSection
          title="Sản phẩm mới"
          subtitle="Những sản phẩm mới nhất"
          products={newProducts.length > 0 ? newProducts : allProducts.slice(0, 6).map(transformProduct)}
          viewAllLink="/client/catalog?sortBy=createdDate&orderBy=desc"
        />
        
        <PromotionSection />
        
        <ProductSection
          title="Sản phẩm bán chạy"
          subtitle="Top sản phẩm được yêu thích nhất"
          products={bestSellerProducts.length > 0 ? bestSellerProducts : allProducts.slice(0, 4).map(transformProduct)}
          viewAllLink="/client/catalog?sortBy=price&orderBy=asc"
          backgroundColor="#fff"
        />
        
        <FeaturedBrands />
        
        <ProductSection
          title="Khuyến mãi hot"
          subtitle="Giảm giá sốc - Limited time"
          products={saleProducts.length > 0 ? saleProducts : allProducts.filter(p => p.price && p.price < 50000000).slice(0, 6).map(transformProduct)}
          viewAllLink="/client/catalog?maxPrice=50000000"
          backgroundColor="#f8f9fa"
        />
        
        <ProductSection
          title="Gợi ý cho nhiếp ảnh gia"
          subtitle="Lựa chọn hoàn hảo cho creative"
          products={allProducts.slice(0, 4).map(transformProduct)}
          viewAllLink="/client/catalog"
          backgroundColor="#fff"
        />
        
        <BlogPreview />
      </main>
      
      <Footer />

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .homepage {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .homepage main {
          flex: 1;
        }

        /* Global scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #999;
        }

        /* Selection color */
        ::selection {
          background: #D32F2F;
          color: #fff;
        }
      `}</style>
    </div>
  );
};

export default ClientHomePage;
