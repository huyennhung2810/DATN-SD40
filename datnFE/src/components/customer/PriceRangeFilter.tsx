import React, { useState, useEffect } from "react";
import { InputNumber, Slider, Button, Space, Typography } from "antd";
import { RedoOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onChange: (min: number | undefined, max: number | undefined) => void;
  onReset?: () => void;
  minLimit?: number;
  maxLimit?: number;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  minPrice,
  maxPrice,
  onChange,
  onReset,
  minLimit = 0,
  maxLimit = 100000000,
}) => {
  const [localMin, setLocalMin] = useState<number | undefined>(minPrice);
  const [localMax, setLocalMax] = useState<number | undefined>(maxPrice);

  // Quick price ranges (in VND)
  const quickRanges = [
    { label: "Dưới 10 triệu", min: 0, max: 10000000 },
    { label: "10 - 20 triệu", min: 10000000, max: 20000000 },
    { label: "20 - 50 triệu", min: 20000000, max: 50000000 },
    { label: "50 - 100 triệu", min: 50000000, max: 100000000 },
    { label: "Trên 100 triệu", min: 100000000, max: undefined },
  ];

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSliderChange = (values: [number, number]) => {
    setLocalMin(values[0]);
    setLocalMax(values[1]);
  };

  const handleSliderAfterChange = (values: [number, number]) => {
    onChange(values[0], values[1]);
  };

  const handleInputChange = (type: "min" | "max", value: number | null) => {
    const newValue = value || undefined;
    if (type === "min") {
      setLocalMin(newValue);
    } else {
      setLocalMax(newValue);
    }
  };

  const handleApply = () => {
    onChange(localMin, localMax);
  };

  const handleReset = () => {
    setLocalMin(undefined);
    setLocalMax(undefined);
    onReset?.();
  };

  const handleQuickRangeClick = (min: number | undefined, max: number | undefined) => {
    setLocalMin(min);
    setLocalMax(max);
    onChange(min, max);
  };

  return (
    <div className="price-range-filter">
      {/* Quick chips */}
      <div className="mb-4">
        <Text type="secondary" className="text-xs block mb-2">
          Chọn nhanh:
        </Text>
        <div className="flex flex-wrap gap-1">
          {quickRanges.map((range, index) => (
            <Button
              key={index}
              size="small"
              type={
                localMin === range.min && localMax === range.max
                  ? "primary"
                  : "default"
              }
              className={
                localMin === range.min && localMax === range.max
                  ? "!bg-red-600 !border-red-600"
                  : ""
              }
              onClick={() => handleQuickRangeClick(range.min, range.max)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Slider */}
      <div className="mb-4 px-1">
        <Slider
          range
          min={minLimit}
          max={maxLimit}
          value={[localMin || minLimit, localMax || maxLimit]}
          onChange={(val) => handleSliderChange(val as [number, number])}
          onChangeComplete={(val) => handleSliderAfterChange(val as [number, number])}
          tooltip={{
            formatter: (value) => (value ? formatPrice(value) : ""),
          }}
        />
      </div>

      {/* Input fields */}
      <div className="flex items-center gap-2 mb-4">
        <InputNumber
          placeholder="Từ"
          value={localMin}
          onChange={(value) => handleInputChange("min", value)}
          min={minLimit}
          max={localMax}
          className="flex-1"
          formatter={(value) =>
            value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
          }
          parser={(value) => value?.replace(/,/g, "") as unknown as number}
        />
        <Text>-</Text>
        <InputNumber
          placeholder="Đến"
          value={localMax}
          onChange={(value) => handleInputChange("max", value)}
          min={localMin}
          max={maxLimit}
          className="flex-1"
          formatter={(value) =>
            value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
          }
          parser={(value) => value?.replace(/,/g, "") as unknown as number}
        />
      </div>

      {/* Action buttons */}
      <Space className="w-full">
        <Button
          type="primary"
          onClick={handleApply}
          className="!bg-red-600 !border-red-600 hover:!bg-red-700 hover:!border-red-700 flex-1"
        >
          Áp dụng
        </Button>
        <Button icon={<RedoOutlined />} onClick={handleReset} />
      </Space>
    </div>
  );
};

export default PriceRangeFilter;

