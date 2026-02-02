import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, Typography, Spin } from "antd";
import { useAppSelector } from "../../../app/hook";

const { Title } = Typography;

const DailyOrdersChart: React.FC = () => {
  const { dailyOrders, loading } = useAppSelector((state) => state.statistics);

  console.log("Dữ liệu thực tế trong Store:", dailyOrders);
  if (loading) {
    return (
      <Card
        className="h-[400px] flex items-center justify-center"
        variant="borderless"
      >
        <Spin tip="Đang tải dữ liệu biểu đồ...">
          {/* Thêm div trống để Spin hoạt động đúng pattern nest */}
          <div style={{ padding: "50px" }} />
        </Spin>
      </Card>
    );
  }

  const safeData = Array.isArray(dailyOrders) ? dailyOrders : [];

  return (
    <Card title={<Title level={4}>Biến động đơn hàng</Title>}>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={safeData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              name="Số lượng đơn hàng"
              type="monotone"
              dataKey="total"
              stroke="#ff0000"
              strokeWidth={3}
              dot={{ r: 4, fill: "#ff0000" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default DailyOrdersChart;
