import React, { useMemo } from "react";
import { Card, Empty, Typography } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAppSelector } from "../../../app/hook";

const { Text } = Typography;

// Cấu hình màu sắc
const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ xác nhận", color: "#FFC107" },
  CONFIRMED: { label: "Đã xác nhận", color: "#0D6EFD" },
  PACKAGING: { label: "Đang đóng gói", color: "#17A2B8" },
  SHIPPING: { label: "Đang vận chuyển", color: "#6F42C1" },
  DELIVERY_FAILED: { label: "Giao hàng thất bại", color: "#E74C3C" },
  COMPLETED: { label: "Đã hoàn thành", color: "#198754" },
  CANCELED: { label: "Đã huỷ", color: "#DC3545" },
  RETURNED: { label: "Đã trả hàng", color: "#FD7E14" },
};

const OrderStatusChart: React.FC = () => {
  const { orderStatus, loading } = useAppSelector((state) => state.statistics);

  const { chartData, totalOrders } = useMemo(() => {
    if (!orderStatus || orderStatus.length === 0)
      return { chartData: [], totalOrders: 0 };

    const data = orderStatus.map((item) => {
      const config = ORDER_STATUS_CONFIG[item.status] || {
        label: item.status,
        color: "#6c757d",
      };
      return { name: config.label, value: item.count, color: config.color };
    });

    const filteredData = data.filter((item) => item.value > 0);
    const total = filteredData.reduce((sum, item) => sum + item.value, 0);
    return { chartData: filteredData, totalOrders: total };
  }, [orderStatus]);

  return (
    <Card
      title={<Text strong>Trạng thái đơn hàng</Text>}
      className="shadow-sm"
      style={{ borderRadius: "10px", height: "100%" }}
      styles={{ body: { padding: "10px" } }}
    >
      <div style={{ width: "100%", height: 350, minHeight: 350, minWidth: 0 }}>
        {loading || chartData.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Empty description={loading ? "Đang tải..." : "Chưa có dữ liệu"} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                // innerRadius={60}
                // outerRadius={100}
                // paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number | undefined) => {
                  const val = value ?? 0;
                  const percent =
                    totalOrders > 0
                      ? ((val / totalOrders) * 100).toFixed(1)
                      : "0";
                  return [`${val} đơn (${percent}%)`, "Số lượng"];
                }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
                itemStyle={{ fontWeight: 600, color: "#555" }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default OrderStatusChart;
