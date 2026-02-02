import React, { useEffect } from "react";
import { statisticsActions } from "../../redux/statistics/statisticsSlice";
import { Row, Col } from "antd";
import { useAppDispatch } from "../../app/hook";
import EmployeeSalesTable from "../../Pages/admin/statistics/EmployeeSale";
import StatisticFilter from "../../Pages/admin/statistics/StatisticsFilter";
import OrderStatusPieChart from "../../Pages/admin/statistics/OrderStatusPieChart";
import DashboardSummaryCards from "../../Pages/admin/statistics/DashboardSummaryCards";
import TopSellingProductsTable from "../../Pages/admin/statistics/TopSellingProduct";

const StatisticsPage: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(statisticsActions.fetchData("MONTH"));
  }, [dispatch]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Row gutter={[16, 16]} className="mt-6">
        <Col span={24}>
          <DashboardSummaryCards />
        </Col>
        <Col span={24}>
          <StatisticFilter />
        </Col>
        <Col span={16}>
          <TopSellingProductsTable />
        </Col>
        <Col span={8}>
          <OrderStatusPieChart />
        </Col>
        <Col span={24}>
          <EmployeeSalesTable />
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsPage;
