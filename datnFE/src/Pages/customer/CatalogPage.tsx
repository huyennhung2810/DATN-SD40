import React, { useEffect, useState, useCallback } from "react";
import { Row, Col, Typography, Skeleton, Empty, Breadcrumb, Button, Space } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../../components/customer/ProductCard";
import FilterPanel from "../../components/customer/FilterPanel";
import FilterDrawer from "../../components/customer/FilterDrawer";
import { CustomPagination, SortSelect } from "../../components/customer/Pagination";
import BannerCarousel from "../../components/customer/BannerCarousel";
import { customerProductApi } from "../../api/customerProductApi";
import type { ProductResponse, ProductPageParams } from "../../models/product";
import type { ProductCategoryResponse } from "../../models/productCategory";

const { Title, Text } = Typography;

const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter states from URL
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialSize = parseInt(searchParams.get("size") || "12", 10);
  const initialSort = searchParams.get("sort") || searchParams.get("sortBy") ? 
    `${searchParams.get("sort") || searchParams.get("sortBy")}-${searchParams.get("orderBy") || "desc"}` : 
    "createdDate-desc";
  const initialMinPrice = searchParams.get("minPrice") || searchParams.get("min_price") ? 
    parseInt(searchParams.get("minPrice") || searchParams.get("min_price")!, 10) : undefined;
  const initialMaxPrice = searchParams.get("maxPrice") || searchParams.get("max_price") ? 
    parseInt(searchParams.get("maxPrice") || searchParams.get("max_price")!, 10) : undefined;
  const initialCategory = searchParams.get("category") || searchParams.get("idProductCategory") || undefined;
  const initialBrand = searchParams.get("idBrand") || undefined;
  const initialSearch = searchParams.get("q") || searchParams.get("search") || undefined;

  // State
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  // Categories from API
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Filter states
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [sort, setSort] = useState(initialSort);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrand ? [initialBrand] : []);
  const [selectedSensorTypes, setSelectedSensorTypes] = useState<string[]>([]);
  const [selectedLensMounts, setSelectedLensMounts] = useState<string[]>([]);
  const [selectedResolutions, setSelectedResolutions] = useState<string[]>([]);

  // Build query params
  const buildQueryParams = useCallback((): ProductPageParams => {
    const params: ProductPageParams = {
      page,
      size,
      status: "ACTIVE",
    };

    // Parse sort
    if (sort) {
      const [sortBy, orderBy] = sort.split("-");
      params.sortBy = sortBy;
      params.orderBy = orderBy;
    }

    // Price filters
    if (minPrice !== undefined) {
      params.minPrice = minPrice;
    }
    if (maxPrice !== undefined) {
      params.maxPrice = maxPrice;
    }

    // Category filter
    if (selectedCategories.length > 0) {
      params.idProductCategory = selectedCategories[0];
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      params.idBrand = selectedBrands[0];
    }

    // Search
    if (initialSearch) {
      params.name = initialSearch;
    }

    // TechSpec filters
    if (selectedSensorTypes.length > 0) {
      params.sensorType = selectedSensorTypes.join(",");
    }
    if (selectedLensMounts.length > 0) {
      params.lensMount = selectedLensMounts.join(",");
    }
    if (selectedResolutions.length > 0) {
      params.resolution = selectedResolutions.join(",");
    }

    return params;
  }, [page, size, sort, minPrice, maxPrice, selectedCategories, initialSearch, selectedSensorTypes, selectedLensMounts, selectedResolutions]);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const params = buildQueryParams();
        const response = await customerProductApi.getProducts(params);
        setProducts(response.data || []);
        setTotalElements(response.totalElements || 0);
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [buildQueryParams]);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await customerProductApi.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Sync URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("size", size.toString());
    params.set("sort", sort);
    
    if (minPrice !== undefined) {
      params.set("minPrice", minPrice.toString());
    }
    if (maxPrice !== undefined) {
      params.set("maxPrice", maxPrice.toString());
    }
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories[0]);
    }
    if (initialSearch) {
      params.set("q", initialSearch);
    }
    
    setSearchParams(params, { replace: true });
  }, [page, size, sort, minPrice, maxPrice, selectedCategories, initialSearch, setSearchParams]);

  // Handle filter changes
  const handlePageChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  const handlePriceChange = (min: number | undefined, max: number | undefined) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPage(1);
  };

  const handleResetFilters = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSelectedCategories([]);
    setSelectedSensorTypes([]);
    setSelectedLensMounts([]);
    setSelectedResolutions([]);
    setSort("createdDate-desc");
    setPage(1);
  };

  const handleViewProduct = (product: ProductResponse) => {
    console.log("View product:", product.id);
  };

  // Convert categories to filter options format
  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));

  // TechSpec filter options (can be loaded from API in future)
  const sensorTypes = [
    { label: "Full Frame", value: "Full Frame" },
    { label: "APS-C", value: "APS-C" },
    { label: "Micro 4/3", value: "Micro 4/3" },
  ];

  const lensMounts = [
    { label: "Canon EF", value: "Canon EF" },
    { label: "Canon RF", value: "Canon RF" },
    { label: "Nikon F", value: "Nikon F" },
    { label: "Nikon Z", value: "Nikon Z" },
    { label: "Sony E", value: "Sony E" },
    { label: "Sony A", value: "Sony A" },
  ];

  const resolutions = [
    { label: "24MP", value: "24MP" },
    { label: "30MP", value: "30MP" },
    { label: "45MP", value: "45MP" },
    { label: "50MP", value: "50MP" },
    { label: "61MP", value: "61MP" },
  ];

  return (
    <div className="customer-page">
      <BannerCarousel position="HOME_TOP" autoPlay={false} />
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto px-4">
          <Breadcrumb
            items={[
              { title: <a href="/client">Trang chủ</a> },
              { title: "Sản phẩm" },
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <Title level={3} className="!mb-1">
              Danh sách sản phẩm
            </Title>
            <Text type="secondary">
              {totalElements} sản phẩm
            </Text>
          </div>
          
          <Space>
            {/* Mobile filter button */}
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => setDrawerVisible(true)}
              className="md:hidden"
            >
              Lọc
            </Button>
            
            {/* Sort */}
            <SortSelect value={sort} onChange={handleSortChange} />
          </Space>
        </div>

        <Row gutter={24}>
          {/* Filter Sidebar - Desktop */}
          <Col xs={0} md={6} lg={5}>
            <div className="sticky top-24">
              {categoriesLoading ? (
                <Skeleton active paragraph={{ rows: 8 }} />
              ) : (
                <FilterPanel
                  categories={categoryOptions}
                  selectedCategories={selectedCategories}
                  onCategoriesChange={setSelectedCategories}
                  sensorTypes={sensorTypes}
                  selectedSensorTypes={selectedSensorTypes}
                  onSensorTypesChange={setSelectedSensorTypes}
                  lensMounts={lensMounts}
                  selectedLensMounts={selectedLensMounts}
                  onLensMountsChange={setSelectedLensMounts}
                  resolutions={resolutions}
                  selectedResolutions={selectedResolutions}
                  onResolutionsChange={setSelectedResolutions}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onPriceChange={handlePriceChange}
                  onReset={handleResetFilters}
                  loading={loading}
                />
              )}
            </div>
          </Col>

          {/* Product Grid */}
          <Col xs={24} md={18} lg={19}>
            {loading ? (
              <Row gutter={[16, 16]}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <Col xs={12} sm={12} md={8} lg={6} key={index}>
                    <Skeleton.Image active className="w-full aspect-square" />
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </Col>
                ))}
              </Row>
            ) : products.length === 0 ? (
              <Empty 
                description="Không tìm thấy sản phẩm nào" 
                className="py-12"
              >
                <Button type="primary" onClick={handleResetFilters}>
                  Xóa bộ lọc
                </Button>
              </Empty>
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  {products.map((product) => (
                    <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
                      <ProductCard
                        product={product}
                        onViewDetail={handleViewProduct}
                      />
                    </Col>
                  ))}
                </Row>
                
                {/* Pagination */}
                <CustomPagination
                  current={page}
                  pageSize={size}
                  total={totalElements}
                  onChange={handlePageChange}
                  loading={loading}
                />
              </>
            )}
          </Col>
        </Row>
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        categories={categoryOptions}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        sensorTypes={sensorTypes}
        selectedSensorTypes={selectedSensorTypes}
        onSensorTypesChange={setSelectedSensorTypes}
        lensMounts={lensMounts}
        selectedLensMounts={selectedLensMounts}
        onLensMountsChange={setSelectedLensMounts}
        resolutions={resolutions}
        selectedResolutions={selectedResolutions}
        onResolutionsChange={setSelectedResolutions}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceChange={handlePriceChange}
        onReset={handleResetFilters}
        onApply={() => setDrawerVisible(false)}
        loading={loading}
      />
    </div>
  );
};

export default CatalogPage;

