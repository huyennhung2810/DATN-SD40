import React, { useMemo } from "react";
import { Table, Card, Typography, Image, Tag, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAppSelector } from "../../../app/hook";
import type { LowStockProduct } from "../../../models/statistics";

const { Title, Text } = Typography;

const LowStockTable: React.FC = () => {
  const { lowStock, loading } = useAppSelector((state) => state.statistics);

  const dataSource = useMemo(() => lowStock || [], [lowStock]);

  // --- CẤU HÌNH CỘT (COLUMNS) ---
  const columns: ColumnsType<LowStockProduct> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => <Text strong>{index + 1}</Text>,
    },
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 80,
      align: "center",
      render: (url: string) => (
        <Image
          src={url || "https://via.placeholder.com/50"} // Ảnh mặc định nếu null
          alt="product"
          width={40}
          height={40}
          style={{ borderRadius: "6px", objectFit: "cover" }}
          preview={false} // Tắt preview nếu muốn giống dashboard tĩnh
        />
      ),
    },
    {
      title: "Tên Sản Phẩm",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <Text strong style={{ color: "#262626" }}>
          {name}
        </Text>
      ),
    },
    {
      title: "Giá Bán",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price: number) => (
        <Text type="secondary">{price.toLocaleString("vi-VN")} đ</Text>
      ),
    },
    {
      title: "Số lượng còn",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 120,
      render: (quantity: number) => {
        // Logic màu sắc: Hết hàng (0) -> Đỏ, Sắp hết (<5) -> Cam
        const color = quantity === 0 ? "red" : "orange";
        return (
          <Tag color={color} style={{ fontWeight: "bold", padding: "0 10px" }}>
            {quantity}
          </Tag>
        );
      },
    },
  ];

  return (
    <Card
      variant="borderless"
      className="shadow-sm"
      style={{ borderRadius: "16px", height: "100%", overflow: "hidden" }}
      styles={{
        header: { borderBottom: "none", padding: "24px 24px 0 24px" },
        body: { padding: "10px 24px 24px 24px" },
      }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Icon cảnh báo */}
          <span style={{ fontSize: 20 }}>⚠️</span>
          <Title
            level={5}
            style={{ margin: 0, fontWeight: 700, fontSize: "18px" }}
          >
            Sản phẩm sắp hết hàng
          </Title>
        </div>
      }
    >
      {loading ? (
        <Table loading columns={columns} dataSource={[]} pagination={false} />
      ) : dataSource.length === 0 ? (
        <Empty description="Kho hàng dồi dào, không có sản phẩm sắp hết" />
      ) : (
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          pagination={{ pageSize: 5, hideOnSinglePage: true }} // Phân trang nhỏ gọn
          size="middle" // Kích thước dòng vừa phải
          bordered={false} // Bỏ viền dọc table cho hiện đại
        />
      )}
    </Card>
  );
};

export default LowStockTable;
