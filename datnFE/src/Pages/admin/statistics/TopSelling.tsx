import React from "react";
import { Card, Table, Avatar, Typography, Tag } from "antd";
import { FireOutlined, PictureOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAppSelector } from "../../../app/hook";
import type { TopSellingProduct } from "../../../models/statistics";

const { Title, Text } = Typography;

const TopSelling: React.FC = () => {
  const { topSelling, loading } = useAppSelector((state) => state.statistics);

  // Helper: Format tiền tệ
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  // Cấu hình các cột cho bảng
  const columns: ColumnsType<TopSellingProduct> = [
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
      render: (name) => (
        <Text strong style={{ color: "#262626", fontSize: 14 }}>
          {name}
        </Text>
      ),
    },
    {
      title: "Giá Bán",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price) => (
        <Text style={{ fontWeight: 500, color: "#595959" }}>
          {formatCurrency(price)}
        </Text>
      ),
    },
    {
      title: "Doanh Số",
      dataIndex: "soldCount",
      key: "soldCount",
      align: "center",
      width: 120,
      render: (count) => (
        <Tag
          color="volcano"
          style={{ fontSize: 14, padding: "4px 10px", fontWeight: 700 }}
        >
          {count}
        </Tag>
      ),
    },
  ];

  return (
    <Card
      variant="borderless"
      className="shadow-sm"
      style={{ borderRadius: "16px", height: "420px", overflow: "hidden" }}
      styles={{
        header: { borderBottom: "none", padding: "24px 24px 0 24px" },
        body: { padding: "12px 24px 24px 24px" },
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
            <FireOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              TOP Sản Phẩm Bán Chạy
            </Title>
          </div>
        </div>
      }
    >
      <Table
        columns={columns}
        dataSource={topSelling}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
        locale={{ emptyText: "Chưa có dữ liệu bán hàng" }}
        scroll={{ x: 600 }}
      />
    </Card>
  );
};

export default TopSelling;
