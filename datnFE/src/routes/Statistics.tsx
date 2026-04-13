import React from "react";
import { Row, Col, Space, Typography } from "antd";

import StatisticFilter from "../Pages/admin/statistics/StatisticsFilter";
import DashboardSummaryCards from "../Pages/admin/statistics/DashboardSummaryCards";
import OrderStatusChart from "../Pages/admin/statistics/OrderStatusStat";
import RevenueChart from "../Pages/admin/statistics/RevenueChart";
import LowStockTable from "../Pages/admin/statistics/LowStockProduct";
import TopSelling from "../Pages/admin/statistics/TopSelling";
import GrowthChart from "../Pages/admin/statistics/GrowthStat";
import { LineChartOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const StatisticsPage: React.FC = () => {
  return (
    <div>
      <div
        className="solid-card"
        style={{ padding: "var(--spacing-lg)", marginBottom: 20 }}
      >
        <Space align="center" size={16}>
          <div
            style={{
              backgroundColor: "var(--color-primary-light)",
              padding: "12px",
              borderRadius: "var(--radius-md)",
            }}
          >
            <LineChartOutlined
              style={{
                fontSize: "24px",
                color: "var(--color-primary)",
              }}
            />
          </div>

          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              Thống kê & Báo cáo
            </Title>
            <Text type="secondary" style={{ fontSize: "13px" }}>
              Theo dõi doanh thu, đơn hàng và hiệu suất bán hàng
            </Text>
          </div>
        </Space>
      </div>

      <Row gutter={[20, 20]}>
        <Col span={24}>
          <DashboardSummaryCards />
        </Col>

        <Col span={24}>
          <StatisticFilter />
        </Col>

        <Col xs={24} lg={16}>
          <RevenueChart />
        </Col>

        <Col xs={24} lg={8}>
          <OrderStatusChart />
        </Col>

        <Col xs={24} lg={16}>
          <TopSelling />

          <div style={{ marginTop: 20 }}>
            <LowStockTable />
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <GrowthChart />
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsPage;
