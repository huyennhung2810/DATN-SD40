import React, { useMemo } from "react";
import { Card, Empty, Typography, Row, Col } from "antd";
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

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface LegendEntry {
  value?: string;
  color?: string;
  payload?: unknown;
}
interface CustomLegendProps {
  payload?: readonly LegendEntry[];
}

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

    const data: ChartDataItem[] = orderStatus.map((item) => {
      const config = ORDER_STATUS_CONFIG[item.status] || {
        label: item.status,
        color: "#6c757d",
      };
      return { name: config.label, value: item.count, color: config.color };
    });

    const total = data.reduce((sum, item) => sum + item.value, 0);
    return { chartData: data, totalOrders: total };
  }, [orderStatus]);

  const renderCustomLegend = (props: CustomLegendProps) => {
    const { payload } = props;

    if (!payload) return null;

    return (
      <Row gutter={[8, 8]} style={{ paddingTop: 16, fontSize: 12 }}>
        {payload.map((entry, index) => {
          const dataItem = (entry.payload as ChartDataItem) || {};

          const countValue = dataItem.value ?? 0;
          const label = entry.value ?? "";

          const percent =
            totalOrders > 0
              ? ((countValue / totalOrders) * 100).toFixed(2)
              : "0.00";

          const formattedPercent = Number(percent).toLocaleString("vi-VN", {
            maximumFractionDigits: 2,
          });

          return (
            <Col
              span={12}
              key={`item-${index}`}
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: entry.color,
                  marginRight: 8,
                  flexShrink: 0,
                }}
              />
              <Text ellipsis title={`${label} - ${formattedPercent}%`}>
                {label} - {formattedPercent}%
              </Text>
            </Col>
          );
        })}
      </Row>
    );
  };

  const tooltipFormatter = (
    value: number | string | Array<number | string> | undefined,
  ) => {
    const valNum = Number(value || 0);
    const percent =
      totalOrders > 0 ? ((valNum / totalOrders) * 100).toFixed(1) : "0";
    return [`${valNum} đơn (${percent}%)`, "Số lượng"] as [string, string];
  };

  return (
    <Card
      title={<Text strong>Trạng thái đơn hàng</Text>}
      className="shadow-sm"
      style={{ borderRadius: "10px", height: "100%" }}
      styles={{ body: { padding: "10px" } }}
    >
      <div style={{ width: "100%", height: 400, minHeight: 400, minWidth: 0 }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Empty description="Đang tải..." />
          </div>
        ) : chartData.length === 0 || totalOrders === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Empty description="Chưa có dữ liệu" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                dataKey="value"
                outerRadius={110}
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
                formatter={tooltipFormatter}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
                itemStyle={{ fontWeight: 600, color: "#555" }}
              />

              <Legend
                content={renderCustomLegend}
                verticalAlign="bottom"
                wrapperStyle={{ width: "100%" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default OrderStatusChart;
