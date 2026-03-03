import React from "react";
import { Drawer, Button, Space, Typography } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import FilterPanel from "./FilterPanel";

const { Text } = Typography;

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDrawerProps {
  visible: boolean;
  onClose: () => void;
  // Categories
  categories?: FilterOption[];
  selectedCategories?: string[];
  onCategoriesChange?: (values: string[]) => void;
  // TechSpec filters
  sensorTypes?: FilterOption[];
  selectedSensorTypes?: string[];
  onSensorTypesChange?: (values: string[]) => void;
  lensMounts?: FilterOption[];
  selectedLensMounts?: string[];
  onLensMountsChange?: (values: string[]) => void;
  resolutions?: FilterOption[];
  selectedResolutions?: string[];
  onResolutionsChange?: (values: string[]) => void;
  // Price filter
  minPrice?: number;
  maxPrice?: number;
  onPriceChange?: (min: number | undefined, max: number | undefined) => void;
  // Actions
  onReset?: () => void;
  onApply?: () => void;
  loading?: boolean;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  visible,
  onClose,
  categories,
  selectedCategories = [],
  onCategoriesChange,
  sensorTypes,
  selectedSensorTypes = [],
  onSensorTypesChange,
  lensMounts,
  selectedLensMounts = [],
  onLensMountsChange,
  resolutions,
  selectedResolutions = [],
  onResolutionsChange,
  minPrice,
  maxPrice,
  onPriceChange,
  onReset,
  onApply,
  loading,
}) => {
  // Calculate active filter count
  const activeFilterCount = 
    (selectedCategories?.length || 0) +
    (selectedSensorTypes?.length || 0) +
    (selectedLensMounts?.length || 0) +
    (selectedResolutions?.length || 0) +
    (minPrice || maxPrice ? 1 : 0);

  return (
    <>
      {/* Mobile filter button */}
      <Button
        className="md:hidden"
        icon={<FilterOutlined />}
        onClick={() => {}}
      >
        Lọc {activeFilterCount > 0 && `(${activeFilterCount})`}
      </Button>

      {/* Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <Text strong>Bộ lọc</Text>
            {activeFilterCount > 0 && (
              <Text type="secondary">
                {activeFilterCount} bộ lọc đang chọn
              </Text>
            )}
          </div>
        }
        placement="bottom"
        onClose={onClose}
        open={visible}
        height="85vh"
        className="filter-drawer"
        extra={
          <Space>
            <Button onClick={onReset}>Đặt lại</Button>
            <Button
              type="primary"
              onClick={onApply}
              className="!bg-red-600 !border-red-600"
            >
              Áp dụng
            </Button>
          </Space>
        }
      >
        <FilterPanel
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoriesChange={onCategoriesChange}
          sensorTypes={sensorTypes}
          selectedSensorTypes={selectedSensorTypes}
          onSensorTypesChange={onSensorTypesChange}
          lensMounts={lensMounts}
          selectedLensMounts={selectedLensMounts}
          onLensMountsChange={onLensMountsChange}
          resolutions={resolutions}
          selectedResolutions={selectedResolutions}
          onResolutionsChange={onResolutionsChange}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={onPriceChange}
          onReset={onReset}
          loading={loading}
        />
      </Drawer>
    </>
  );
};

export default FilterDrawer;

