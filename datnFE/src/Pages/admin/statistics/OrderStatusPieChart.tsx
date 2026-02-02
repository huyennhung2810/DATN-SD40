import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { Card, Typography, Row, Col } from "antd";
import { useAppSelector } from "../../../app/hook";

const { Title } = Typography;

interface OrderStatusData {
  label: string;
  orderCount: number;
  color: string;
}

const DEFAULT_STATUSES = [
  { label: "Chờ xử lý", color: "#FFC107" },
  { label: "Đã xác nhận", color: "#0D6EFD" },
  { label: "Đang vận chuyển", color: "#6F42C1" },
  { label: "Đã hoàn thành", color: "#198754" },
  { label: "Đã huỷ", color: "#DC3545" },
  { label: "Đã trả hàng", color: "#FD7E14" },
  { label: "Không xác định", color: "#000000" },
];

const OrderStatusPieChart: React.FC = () => {
  const { orderStatus, loading } = useAppSelector((state) => state.statistics);

  const finalData: OrderStatusData[] = DEFAULT_STATUSES.map((status) => {
    const apiStatus = orderStatus?.find((item) => item.label === status.label);
    return {
      label: status.label,
      orderCount: apiStatus ? apiStatus.orderCount : 0,
      color: status.color,
    };
  });

  const totalOrders = finalData.reduce((sum, item) => sum + item.orderCount, 0);

  const renderLegendContent = () => {
    return (
      <div style={{ marginTop: "10px", padding: "0 10px" }}>
        <Row gutter={[16, 8]}>
          {finalData.map((item, index) => {
            const percent =
              totalOrders > 0
                ? ((item.orderCount / totalOrders) * 100).toFixed(2)
                : "0.00";
            return (
              <Col span={12} key={index}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      backgroundColor: item.color,
                      borderRadius: "3px",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#595959",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}:{" "}
                    <span style={{ fontWeight: "bold" }}>{percent}%</span>
                  </span>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  return (
    <Card
      title={<Title level={4}>Biểu đồ trạng thái</Title>}
      loading={loading}
      className="h-full shadow-md border-none"
      style={{ borderRadius: "12px" }}
    >
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={finalData.filter((item) => item.orderCount > 0)}
              cx="50%"
              cy="40%"
              outerRadius={110}
              dataKey="orderCount"
              nameKey="label"
              stroke="none"
              animationDuration={1000}
            >
              {finalData
                .filter((item) => item.orderCount > 0)
                .map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
            </Pie>
            <Tooltip
              formatter={(value: number | string | undefined) => {
                const numValue =
                  typeof value === "string" ? parseFloat(value) : (value ?? 0);
                return [`${numValue} đơn hàng`, "Số lượng"];
              }}
            />
            <Legend content={renderLegendContent()} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default OrderStatusPieChart;
