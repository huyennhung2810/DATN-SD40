import React from "react";
import { Table, Image, Typography, Card, Tag, ConfigProvider } from "antd";
import type { ColumnsType } from "antd/es/table";

const { Text, Title } = Typography;

interface TopSellingProductResponse {
  rank: number;
  id: string;
  productCode: string;
  productName: string;
  productImage: string;
  quantitySold: number;
  revenue: number;
  sellingPrice: number;
}

const TopSellingProductsTable: React.FC = () => {
  const dataSource: TopSellingProductResponse[] = [
    {
      rank: 1,
      id: "uuid-1",
      productCode: "EOS-R5",
      productName: "Canon EOS R5 Mirrorless Camera",
      productImage:
        "https://p-vn.canon/media/image/2020/07/08/6007e065790b4117ba9d73950d24e183_EOS+R5+Front+View+with+Lens.png",
      quantitySold: 25,
      revenue: 2375000000,
      sellingPrice: 95000000,
    },
    {
      rank: 2,
      id: "uuid-2",
      productCode: "RF-50-18",
      productName: "Lens Canon RF 50mm f/1.8 STM",
      productImage:
        "https://p-vn.canon/media/image/2021/02/02/766d62326771488c9df3709ed5376722_RF50mm+f1.8+STM+Front.png",
      quantitySold: 18,
      revenue: 88200000,
      sellingPrice: 4900000,
    },
  ];

  const columns: ColumnsType<TopSellingProductResponse> = [
    {
      title: "Hạng",
      dataIndex: "rank",
      key: "rank",
      width: 50,
      align: "center",
      render: (rank) => (
        <Tag
          color={rank === 1 ? "gold" : rank === 2 ? "silver" : "orange"}
          className="font-bold"
        >
          {rank}
        </Tag>
      ),
    },
    {
      title: "Ảnh",
      dataIndex: "productImage",
      key: "productImage",
      width: 50,
      render: (src) => (
        <Image src={src} width={50} className="rounded-md shadow-sm" />
      ),
    },
    {
      title: "Thông tin sản phẩm",
      key: "productInfo",
      width: 170,

      render: (_, record) => (
        <div>
          <Text strong style={{ display: "block" }}>
            {record.productName}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Mã: {record.productCode}
          </Text>
        </div>
      ),
    },
    {
      title: "Số lượng bán",
      dataIndex: "quantitySold",
      key: "quantitySold",
      align: "center",
      width: 150,

      sorter: (a, b) => a.quantitySold - b.quantitySold,
      render: (val) => <Text strong>{val}</Text>,
    },
    {
      title: "Giá bán hiện tại",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      render: (val) => <Text>{val.toLocaleString()} đ</Text>,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      align: "right",
      render: (val) => (
        <Text className="text-red-600 font-bold">{val.toLocaleString()} đ</Text>
      ),
    },
  ];

  return (
    <Card className="shadow-md border-none" style={{ borderRadius: "12px" }}>
      <div className="text-center mb-6">
        <Title
          level={4}
          style={{ color: "#fa541c", margin: 0, textTransform: "uppercase" }}
        >
          Danh sách sản phẩm bán chạy
        </Title>
        <div className="h-1 w-16 bg-orange-400 mx-auto mt-2 rounded-full"></div>
      </div>

      <ConfigProvider
        theme={{
          components: {
            Table: {
              headerBg: "#f73131",
              headerColor: "#ffffff",
            },
          },
        }}
      >
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={{ pageSize: 5 }}
          rowKey="id"
        />
      </ConfigProvider>
    </Card>
  );
};

export default TopSellingProductsTable;
