import React, { useEffect } from "react";
import { Card, Row, Col, Skeleton, Typography } from "antd";
import {
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BarChartOutlined,
  FieldTimeOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import { statisticsActions } from "../../../redux/statistics/statisticsSlice";

const { Text } = Typography;

// --- Helper Functions ---
const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const safeNum = (value: number | undefined | null) => {
  return value === undefined || value === null || isNaN(value) ? 0 : value;
};

interface StatCardProps {
  title: string;
  subTitle: string;
  revenue: number;
  growth: number;
  soldCount: number;
  orderCount: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  subTitle,
  revenue,
  growth,
  soldCount,
  orderCount,
  icon,
  color,
  bgColor,
}) => {
  const isPositive = growth >= 0;

  return (
    <Card
      className="border-none shadow-sm hover:shadow-md transition-all"
      style={{ borderRadius: "16px", height: "100%" }}
      styles={{ body: { padding: "20px" } }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            backgroundColor: bgColor,
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ color: color, fontSize: "22px", display: "flex" }}>
            {icon}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: "1.2",
          }}
        >
          <Text style={{ fontWeight: 500, fontSize: "17px", color: "#262626" }}>
            {title}
          </Text>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#f8fafc",
          borderRadius: "16px",
          padding: "20px 10px",
          textAlign: "center",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            color: "#222223",
            fontWeight: 600,
            fontSize: "22px",
            lineHeight: 1,
          }}
        >
          {formatCurrency(revenue)}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            marginTop: "12px",
          }}
        >
          <div style={{ fontSize: "13px", color: "#8c8c8c" }}>{subTitle}</div>

          <div
            style={{
              color: isPositive ? "#16a34a" : "#dc2626",
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "12px",
              fontWeight: 700,
              backgroundColor: isPositive ? "#dcfce7" : "#fee2e2",
              padding: "2px 8px",
              borderRadius: "6px",
            }}
          >
            {isPositive ? (
              <ArrowUpOutlined style={{ fontSize: "10px" }} />
            ) : (
              <ArrowDownOutlined style={{ fontSize: "10px" }} />
            )}
            <span>{Math.abs(growth)}%</span>
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #f0f0f0",
          paddingTop: "12px",
          display: "flex",
          justifyContent: "center",
          fontSize: "13px",
          color: "#595959",
        }}
      >
        <span>
          Sản phẩm đã bán:{" "}
          <span style={{ fontWeight: 700, color: "#262626" }}>{soldCount}</span>
        </span>
        <span style={{ margin: "0 8px", color: "#d9d9d9" }}>|</span>
        <span>
          Đơn hàng:{" "}
          <span style={{ fontWeight: 700, color: "#262626" }}>
            {orderCount}
          </span>
        </span>
      </div>
    </Card>
  );
};

const DashboardSummary: React.FC = () => {
  const dispatch = useAppDispatch();
  const { summary, loading } = useAppSelector((state) => state.statistics);

  useEffect(() => {
    dispatch(statisticsActions.fetchInitialData());
  }, [dispatch]);

  if (loading || !summary) return <Skeleton active paragraph={{ rows: 10 }} />;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12} lg={6}>
        <StatCard
          title="Hôm nay"
          subTitle="Hôm nay"
          revenue={safeNum(summary.revenueToday)}
          growth={0}
          soldCount={safeNum(summary.productsSoldToday)}
          orderCount={safeNum(summary.ordersToday)}
          icon={<FieldTimeOutlined />}
          color="#1890ff"
          bgColor="#e6f7ff"
        />
      </Col>

      <Col xs={24} md={12} lg={6}>
        <StatCard
          title="Tuần này"
          subTitle="Tuần này"
          revenue={safeNum(summary.revenueThisWeek)}
          growth={0}
          soldCount={safeNum(summary.productsSoldThisWeek)}
          orderCount={safeNum(summary.ordersThisWeek)}
          icon={<CalendarOutlined />}
          color="#722ed1"
          bgColor="#f9f0ff"
        />
      </Col>

      <Col xs={24} md={12} lg={6}>
        <StatCard
          title="Tháng này"
          subTitle="Tháng này"
          revenue={safeNum(summary.revenueThisMonth)}
          growth={safeNum(summary.growthPercentage)}
          soldCount={safeNum(summary.productsSoldThisMonth)}
          orderCount={safeNum(summary.ordersThisMonth)}
          icon={<BarChartOutlined />}
          color="#16a34a"
          bgColor="#dcfce7"
        />
      </Col>

      <Col xs={24} md={12} lg={6}>
        <StatCard
          title="Năm nay"
          subTitle="Năm nay"
          revenue={safeNum(summary.revenueThisYear)}
          growth={0}
          soldCount={safeNum(summary.productsSoldThisYear)}
          orderCount={safeNum(summary.ordersThisYear)}
          icon={<HistoryOutlined />}
          color="#0d9488"
          bgColor="#ccfbf1"
        />
      </Col>
    </Row>
  );
};

export default DashboardSummary;
