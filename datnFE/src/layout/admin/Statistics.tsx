import React, { useEffect } from "react";
import { statisticsActions } from "../../redux/statistics/statisticsSlice";
import { Row, Col } from "antd";
import { useAppDispatch } from "../../app/hook";
import StatisticFilter from "../../Pages/admin/statistics/StatisticsFilter";
import DashboardSummaryCards from "../../Pages/admin/statistics/DashboardSummaryCards";

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
      </Row>
    </div>
  );
};

export default StatisticsPage;
