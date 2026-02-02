import React from "react";
import { Card, Row, Col, Statistic, Skeleton, Typography } from "antd";
import {
  CalendarOutlined,
  CopyOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../../../app/hook";

const { Text } = Typography;

const DashboardSummaryCards: React.FC = () => {
  const { summary, loading } = useAppSelector((state) => state.statistics);

  if (loading || !summary) return <Skeleton active paragraph={{ rows: 3 }} />;

  const cardConfigs = [
    {
      title: "Hôm nay",
      color: "#008ca3",
      icon: <CalendarOutlined />,
      type: "TODAY",
    },
    {
      title: "Tuần này",
      color: "#fb6a51",
      icon: <CopyOutlined />,
      type: "WEEK",
    },
    {
      title: "Tháng này",
      color: "#3b82f6",
      icon: <FileTextOutlined />,
      type: "MONTH",
    },
    {
      title: "Năm nay",
      color: "#10b981",
      icon: <BarChartOutlined />,
      type: "YEAR",
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {cardConfigs.map((config) => (
        <Col xs={24} sm={12} lg={12} key={config.type}>
          <Card
            className="shadow-md border-none"
            style={{
              backgroundColor: config.color,
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            <div
              className="text-center mb-1"
              style={{ fontSize: "15px", opacity: 0.9 }}
            >
              {config.icon}
            </div>

            <div className="text-center mb-1">
              <Text
                style={{ color: "#fff", fontSize: "14px", fontWeight: 500 }}
              >
                {config.title}
              </Text>
            </div>

            <div className="text-center mb-4">
              <Statistic
                value={summary?.totalRevenue || 0}
                suffix={
                  <span style={{ color: "#fff", fontSize: "16px" }}>đ</span>
                }
              />
            </div>

            <Row
              gutter={4}
              className="text-center border-t border-white/20 pt-3 mt-2"
              style={{ fontSize: "11px" }}
            >
              <Col span={6}>
                <div>Sản phẩm</div>
                <div className="font-bold">{summary?.totalItemsSold || 0}</div>
              </Col>
              <Col span={6} className="border-l border-white/10">
                <div>Thành công</div>
                <div className="font-bold">{summary?.successCount || 0}</div>
              </Col>
              <Col span={6} className="border-l border-white/10">
                <div>Đơn hủy</div>
                <div className="font-bold">{summary?.canceledCount || 0}</div>
              </Col>
              <Col span={6} className="border-l border-white/10">
                <div>Đơn trả</div>
                <div className="font-bold">{summary?.returnedCount || 0}</div>
              </Col>
            </Row>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardSummaryCards;
