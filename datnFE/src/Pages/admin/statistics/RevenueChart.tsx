import React, { useMemo } from "react";
import { Card, Empty, Typography, Skeleton } from "antd";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAppSelector } from "../../../app/hook";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

const { Title } = Typography;

const PRIMARY_COLOR = "#00b96b";
const STROKE_COLOR = "#00b96b";
const GRID_COLOR = "#f0f0f0";
const TEXT_COLOR = "#8c8c8c";

type ViewType = "TODAY" | "WEEK" | "MONTH" | "YEAR" | "CUSTOM";

interface PayloadItem {
  value: number | string;
  name?: string;
  color?: string;
  dataKey?: string;
  payload?: unknown;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: PayloadItem[];
  label?: string;
  viewType: ViewType;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  viewType,
}) => {
  if (active && payload && payload.length > 0) {
    const value = Number(payload[0].value);

    let title = "";

    if (viewType === "TODAY") {
      title = `${label} - Hôm nay`;
    } else {
      const dateObj = dayjs(label);
      if (viewType === "WEEK") {
        let dayName = dateObj.format("dddd");
        dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        title = `${dayName}, ${dateObj.format("DD/MM")}`;
      } else if (viewType === "YEAR") {
        title = `Tháng ${dateObj.format("MM/YYYY")}`;
      } else {
        let dayName = dateObj.format("dddd");
        dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        title = `${dayName}, ${dateObj.format("DD/MM/YYYY")}`;
      }
    }

    return (
      <div
        style={{
          backgroundColor: "#fff",
          padding: "12px 16px",
          border: "none",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          minWidth: "150px",
          textAlign: "left",
        }}
      >
        <div
          style={{
            color: "#595959",
            fontSize: "14px",
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          {title}
        </div>
        <div>
          <span style={{ fontSize: "12px", color: "#8c8c8c" }}>
            Doanh thu:{" "}
          </span>
          <span
            style={{ color: PRIMARY_COLOR, fontSize: "16px", fontWeight: 700 }}
          >
            {value.toLocaleString("vi-VN")}{" "}
            <span
              style={{
                fontSize: 12,
                fontWeight: 400,
                textDecoration: "underline",
              }}
            >
              đ
            </span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const RevenueChart: React.FC = () => {
  const { revenueData, loading } = useAppSelector((state) => state.statistics);

  // Xử lý dữ liệu đầu vào
  const chartData = useMemo(() => {
    if (!revenueData) return [];
    const processedData = [...revenueData].map((item) => ({
      ...item,
      revenue: item.revenue || 0,
    }));

    if (processedData.length > 0 && processedData[0].date.length === 5) {
      return processedData.sort((a, b) => a.date.localeCompare(b.date));
    }

    return processedData.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  }, [revenueData]);

  // Logic tự động phát hiện loại View
  const currentViewType: ViewType = useMemo(() => {
    if (chartData.length === 0) return "MONTH";

    // Kiem tra format dữ liệu
    const sampleDate = chartData[0].date; // Ví dụ: "09:00" hoặc "2024-02-05"

    // Nếu chuỗi ngày ngắn (độ dài 5 ký tự dạng HH:mm) -> Là chế độ xem HÔM NAY
    if (sampleDate.length === 5 && sampleDate.includes(":")) {
      return "TODAY";
    }

    const firstDate = dayjs(chartData[0].date);
    const lastDate = dayjs(chartData[chartData.length - 1].date);
    const diffDays = lastDate.diff(firstDate, "day");

    if (diffDays <= 7 && chartData.length <= 8) return "WEEK";
    if (chartData.length === 12 && diffDays > 300) return "YEAR";

    return "MONTH";
  }, [chartData]);

  const formatYAxis = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const formatXAxis = (dateStr: string) => {
    if (currentViewType === "TODAY") return dateStr;

    const date = dayjs(dateStr);
    if (currentViewType === "WEEK") {
      const dayIndex = date.day();
      if (dayIndex === 0) return "CN";
      return `T${dayIndex + 1}`;
    }
    if (currentViewType === "YEAR") {
      return `T${date.format("M")}`;
    }
    return date.format("DD");
  };

  const xAxisInterval = useMemo(() => {
    if (currentViewType === "TODAY") return 2;
    if (currentViewType === "WEEK") return 0;
    if (currentViewType === "YEAR") return 0;
    return "preserveStartEnd";
  }, [currentViewType]);

  return (
    <Card
      className="shadow-sm border-none"
      style={{ borderRadius: "16px", height: "100%", overflow: "hidden" }}
      styles={{
        header: { borderBottom: "none", padding: "24px 24px 0 24px" },
        body: { padding: "10px 24px 24px 0px" },
      }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Title level={5} style={{ margin: 0, fontSize: 18 }}>
            Biểu Đồ Doanh Thu
          </Title>
        </div>
      }
    >
      <div style={{ width: "100%", height: 350 }}>
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : chartData.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Empty
              description="Chưa có dữ liệu"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={PRIMARY_COLOR}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={PRIMARY_COLOR}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={GRID_COLOR}
              />

              <XAxis
                dataKey="date"
                axisLine={{ stroke: "#d9d9d9" }}
                tickLine={false}
                tickFormatter={formatXAxis}
                tick={{ fill: "#595959", fontSize: 12 }}
                dy={10}
                interval={xAxisInterval}
                minTickGap={15}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYAxis}
                tick={{ fill: TEXT_COLOR, fontSize: 12 }}
                width={60}
              />

              <Tooltip
                content={<CustomTooltip viewType={currentViewType} />}
                cursor={{ stroke: "#00b96b", strokeDasharray: "3 3" }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke={STROKE_COLOR}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{
                  r: 6,
                  stroke: "#fff",
                  strokeWidth: 2,
                  fill: PRIMARY_COLOR,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default RevenueChart;
