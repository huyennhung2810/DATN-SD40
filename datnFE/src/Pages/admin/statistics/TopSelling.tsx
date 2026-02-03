import React from "react";
import { Table, Typography, Image, Tag, Card } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TopSellingProduct } from "../../../models/statistics";

const { Text } = Typography;

interface Props {
  data: TopSellingProduct[];
  loading: boolean;
}

const TopProductTable: React.FC<Props> = ({ data, loading }) => {
  // Helper render STT đẹp hơn
  const renderIndex = (index: number) => {
    const rank = index + 1;
    let bgColor = "#f0f0f0";
    let color = "#595959";

    if (rank === 1) {
      bgColor = "#FFD700";
      color = "#fff";
    } // Vàng
    else if (rank === 2) {
      bgColor = "#C0C0C0";
      color = "#fff";
    } // Bạc
    else if (rank === 3) {
      bgColor = "#CD7F32";
      color = "#fff";
    } // Đồng

    return (
      <div
        style={{
          backgroundColor: bgColor,
          color: color,
          width: 24,
          height: 24,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: 12,
          margin: "0 auto",
          boxShadow: rank <= 3 ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
        }}
      >
        {rank}
      </div>
    );
  };

  const columns: ColumnsType<TopSellingProduct> = [
    {
      title: "#",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => renderIndex(index),
    },
    {
      title: "Sản phẩm",
      key: "product",
      width: 300,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Image
            src={record.imageUrl || "error"}
            fallback="https://via.placeholder.com/40x40?text=No+Img" // Ảnh thế thân khi lỗi
            width={40}
            height={40}
            style={{
              borderRadius: 6,
              objectFit: "cover",
              border: "1px solid #f0f0f0",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong style={{ fontSize: 14 }}>
              {record.name}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.category || "Chưa phân loại"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Phân loại",
      dataIndex: "version",
      key: "version",
      render: (ver) =>
        ver ? <Tag color="blue">{ver}</Tag> : <Text disabled>--</Text>,
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      align: "right",
      sorter: (a, b) => a.price - b.price,
      render: (price) => <Text>{price?.toLocaleString("vi-VN")} đ</Text>,
    },
    {
      title: "Đã bán",
      dataIndex: "soldCount",
      key: "soldCount",
      align: "center",
      sorter: (a, b) => a.soldCount - b.soldCount,
      render: (count) => (
        <Tag color="green" style={{ fontWeight: "bold", fontSize: 13 }}>
          {count}
        </Tag>
      ),
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      align: "right",
      width: 150,
      sorter: (a, b) => a.revenue - b.revenue,
      render: (rev) => (
        <Text style={{ color: "#13c2c2", fontWeight: 700 }}>
          {rev?.toLocaleString("vi-VN")} đ
        </Text>
      ),
    },
  ];

  return (
    <Card
      title={
        <span style={{ fontWeight: 700 }}>Chi tiết Top Sản Phẩm Bán Chạy</span>
      }
      bordered={false} // Thay cho variant="borderless" để an toàn hơn
      style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      styles={{ header: { borderBottom: "1px solid #f0f0f0" } }}
    >
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng ${total} sản phẩm`, // Hiển thị tổng số
          showSizeChanger: false, // Ẩn nút chọn số lượng/trang cho gọn
        }}
      />
    </Card>
  );
};

export default TopProductTable;
