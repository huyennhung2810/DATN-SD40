import React from "react";
import { Pagination, Select, Space, Typography } from "antd";

const { Text } = Typography;

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  loading?: boolean;
}

const CustomPagination: React.FC<PaginationProps> = ({
  current,
  pageSize,
  total,
  onChange,
  loading,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
      <Text type="secondary">
        Hiển thị {((current - 1) * pageSize) + 1} - {Math.min(current * pageSize, total)} của {total} sản phẩm
      </Text>
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        showSizeChanger
        pageSizeOptions={["8", "12", "24", "48"]}
        disabled={loading}
        showTotal={(total, range) => `${range[0]}-${range[1]} của ${total}`}
      />
    </div>
  );
};

interface SortSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options?: { label: string; value: string }[];
}

const SortSelect: React.FC<SortSelectProps> = ({
  value,
  onChange,
  options = [
    { label: "Mới nhất", value: "createdDate-desc" },
    { label: "Giá tăng dần", value: "price-asc" },
    { label: "Giá giảm dần", value: "price-desc" },
    { label: "Tên A-Z", value: "name-asc" },
  ],
}) => {
  return (
    <Space>
      <Text type="secondary">Sắp xếp:</Text>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        className="w-48"
        placeholder="Chọn sắp xếp"
      />
    </Space>
  );
};

export { CustomPagination, SortSelect };
export default CustomPagination;

