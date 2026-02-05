import React, { useMemo } from "react";
import { Table, Card, Typography, Tag, Empty, Avatar } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAppSelector } from "../../../app/hook";
import type { LowStockProduct } from "../../../models/statistics";
import { PictureOutlined, WarningOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const LowStockTable: React.FC = () => {
  const { lowStock, loading } = useAppSelector((state) => state.statistics);

  const dataSource = useMemo(() => lowStock || [], [lowStock]);

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
      width: 100,
      align: "center",
      render: (url) => (
        <Avatar
          shape="square"
          size={35}
          src={url}
          icon={<PictureOutlined style={{ fontSize: 18, color: "#bfbfbf" }} />}
          style={{
            borderRadius: 8,
            border: "1px solid #f0f0f0",
            backgroundColor: "#fafafa",
            objectFit: "cover",
          }}
          onError={() => true}
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "#fff1f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ff4d4f",
            }}
          >
            <WarningOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Sản phẩm sắp hết hàng
            </Title>
          </div>
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
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          size="middle"
          bordered={false}
        />
      )}
    </Card>
  );
};

export default LowStockTable;
