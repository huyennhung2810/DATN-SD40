import React, { useMemo, useState } from "react";
import { Card, Empty, Typography } from "antd";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAppSelector } from "../../../app/hook";

const { Title } = Typography;

const PRIMARY_COLOR = "#00b96b";
const BAR_COLOR = "rgba(0, 185, 107, 0.65)";
const GRID_COLOR = "#f5f5f5";
const TEXT_COLOR = "#8c8c8c";

const formatYAxis = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

interface ChartMouseEvent {
  isTooltipActive?: boolean;
  activeTooltipIndex?: number | string | null;
  activeLabel?: string | number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number | string }[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length > 0) {
    const value = payload[0].value;
    return (
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          padding: "12px 16px",
          border: "1px solid #e8e8e8",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          minWidth: "160px",
        }}
      >
        <p
          style={{
            margin: 0,
            color: TEXT_COLOR,
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          {`Thời gian: ${label}`}
        </p>
        <p
          style={{
            margin: "6px 0 0 0",
            color: PRIMARY_COLOR,
            fontSize: "20px",
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
          <span
            style={{
              fontSize: "14px",
              color: TEXT_COLOR,
              fontWeight: 400,
              marginLeft: 4,
            }}
          >
            đ
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const RevenueChart: React.FC = () => {
  const { revenueData, loading } = useAppSelector((state) => state.statistics);
  const chartData = useMemo(() => revenueData || [], [revenueData]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onMouseMove = (state: ChartMouseEvent | null) => {
    if (state?.isTooltipActive) {
      setActiveIndex((state.activeTooltipIndex as number) ?? null);
    } else {
      setActiveIndex(null);
    }
  };

  return (
    <Card
      bordered={false}
      className="shadow-sm"
      style={{ borderRadius: "16px", height: "100%", overflow: "hidden" }}
      styles={{
        header: { borderBottom: "none", padding: "24px 24px 0 24px" },
        body: { padding: "24px" },
      }}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title
              level={5}
              style={{ margin: 0, fontWeight: 700, fontSize: "18px" }}
            >
              Thống kê doanh thu
            </Title>
          </div>
        </div>
      }
    >
      <div style={{ width: "100%", height: 350, minHeight: 350 }}>
        {loading || chartData.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có dữ liệu doanh thu"
            />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 0, left: 0, bottom: 30 }}
              onMouseMove={onMouseMove}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={GRID_COLOR}
              />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: TEXT_COLOR, fontSize: 12, fontWeight: 500 }}
                dy={15}
                minTickGap={20}
                height={60}
                tickMargin={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYAxis}
                tick={{ fill: TEXT_COLOR, fontSize: 12 }}
                width={60}
              />

              <Tooltip content={<CustomTooltip />} cursor={false} />

              <Bar
                dataKey="revenue"
                barSize={36}
                radius={[6, 6, 0, 0]}
                fill={BAR_COLOR}
              >
                {chartData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === activeIndex ? PRIMARY_COLOR : BAR_COLOR}
                    style={{ transition: "all 0.3s ease" }}
                  />
                ))}
              </Bar>

              {/* <Line
                type="monotone" 
                dataKey="revenue"
                stroke={LINE_COLOR}
                strokeWidth={3}
                dot={false} 
                activeDot={{
                  r: 6,
                  stroke: "#fff",
                  strokeWidth: 3,
                  fill: LINE_COLOR,
                }}
              /> */}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default RevenueChart;
