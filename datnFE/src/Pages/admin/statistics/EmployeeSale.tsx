import React from "react";
import { Table, Card, Typography, Tag, Avatar } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAppSelector } from "../../../app/hook";
import type { EmployeeSales } from "../../../models/statistics";

const { Title } = Typography;

const EmployeeSalesTable: React.FC = () => {
  const { employeeSales, loading } = useAppSelector(
    (state) => state.statistics,
  );

  // Định nghĩa cột với kiểu dữ liệu tường minh, không dùng any
  const columns: ColumnsType<EmployeeSales> = [
    {
      title: "Hạng",
      key: "rank",
      width: 80,
      render: (_: string, __: EmployeeSales, index: number) => {
        const rank = index + 1;
        if (rank === 1)
          return (
            <Tag color="gold" className="font-bold">
              #1
            </Tag>
          );
        if (rank === 2)
          return (
            <Tag color="silver" className="font-bold">
              #2
            </Tag>
          );
        if (rank === 3)
          return (
            <Tag color="orange" className="font-bold">
              #3
            </Tag>
          );
        return <span className="pl-2">{rank}</span>;
      },
    },
    {
      title: "Nhân viên",
      dataIndex: "employeeName",
      render: (record: EmployeeSales) => (
        <div className="flex items-center gap-3">
          <Avatar style={{ backgroundColor: "#f56a00" }}>
            {/* Thêm check an toàn để không bị lỗi charAt of undefined */}
            {record?.employeeName
              ? record.employeeName.charAt(0).toUpperCase()
              : "U"}
          </Avatar>
          <div>
            <div className="font-medium">
              {record.employeeName || record.employeeName || "Chưa có tên"}
            </div>{" "}
            <div className="text-xs text-gray-400">
              {record?.employeeCode || "---"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Đơn hàng",
      dataIndex: "totalOrders",
      sorter: (a, b) => a.totalOrders - b.totalOrders,
    },
    {
      title: "Doanh số",
      dataIndex: "totalRevenue",
      render: (value: number) => (
        <span className="font-semibold text-red-600">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(value)}
        </span>
      ),
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
    },
  ];

  return (
    <Card title={<Title level={4}>Hiệu suất bán hàng của nhân viên</Title>}>
      <Table
        columns={columns}
        dataSource={Array.isArray(employeeSales) ? employeeSales : []}
        rowKey="employeeId"
        loading={loading}
        pagination={{ pageSize: 5 }}
        locale={{ emptyText: "Không có dữ liệu nhân viên" }}
      />
    </Card>
  );
};

export default EmployeeSalesTable;
