import React from "react";
import { Row, Col } from "antd";

import StatisticFilter from "../../Pages/admin/statistics/StatisticsFilter";
import DashboardSummaryCards from "../../Pages/admin/statistics/DashboardSummaryCards";
import OrderStatusChart from "../../Pages/admin/statistics/OrderStatusStat";
import RevenueChart from "../../Pages/admin/statistics/RevenueChart";
import LowStockTable from "../../Pages/admin/statistics/LowStockProduct";
import TopSelling from "../../Pages/admin/statistics/TopSelling";
import GrowthChart from "../../Pages/admin/statistics/GrowthStat";

const StatisticsPage: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Row gutter={[24, 24]}>
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

          <div style={{ marginTop: 24 }}>
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
