import React from "react";
import { Card, Checkbox, Collapse, Button, Typography, Divider } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import PriceRangeFilter from "./PriceRangeFilter";

const { Text } = Typography;
const { Panel } = Collapse;

interface FilterOption {
  label: string;
  value: string;
}

interface FilterPanelProps {
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
  loading?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
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
}) => {
  const defaultFilters = [
    { key: "category", title: "Danh mục", options: categories, selected: selectedCategories, onChange: onCategoriesChange },
    { key: "sensor", title: "Loại cảm biến", options: sensorTypes, selected: selectedSensorTypes, onChange: onSensorTypesChange },
    { key: "mount", title: "Mount lens", options: lensMounts, selected: selectedLensMounts, onChange: onLensMountsChange },
    { key: "resolution", title: "Độ phân giải", options: resolutions, selected: selectedResolutions, onChange: onResolutionsChange },
  ];

  const handleReset = () => {
    onReset?.();
  };

  return (
    <Card className="filter-panel" size="small">
      <div className="flex items-center justify-between mb-4">
        <Text strong className="text-lg">
          Bộ lọc
        </Text>
        <Button
          icon={<RedoOutlined />}
          size="small"
          onClick={handleReset}
          type="text"
        >
          Đặt lại
        </Button>
      </div>

      <Divider className="my-3" />

      {/* Price Filter */}
      <div className="mb-4">
        <Text strong className="block mb-2">
          Khoảng giá
        </Text>
        <PriceRangeFilter
          minPrice={minPrice}
          maxPrice={maxPrice}
          onChange={onPriceChange || (() => {})}
          onReset={() => onPriceChange?.(undefined, undefined)}
        />
      </div>

      <Divider className="my-3" />

      {/* Other Filters */}
      <Collapse
        defaultActiveKey={["category"]}
        ghost
        className="filter-collapse"
      >
        {defaultFilters.map((filter) => (
          filter.options && filter.options.length > 0 && (
            <Panel header={filter.title} key={filter.key}>
              <Checkbox.Group
                options={filter.options.map((opt) => ({
                  label: opt.label,
                  value: opt.value,
                }))}
                value={filter.selected}
                onChange={(values) => filter.onChange?.(values as string[])}
                className="w-full"
              />
            </Panel>
          )
        ))}
      </Collapse>
    </Card>
  );
};

export default FilterPanel;

