import React, { useState } from "react";
import { Tabs, Card, Typography } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import WorkSchedulePage from "../../Pages/admin/workSchedule/WorkSchedulePage";
import ShiftHistoryPage from "../../Pages/admin/shiftHandover/ShiftHistoryPage";
import ShiftTemplatePage from "../../Pages/admin/shiftTemplate/ShiftTemplatePage";

const { Title, Text } = Typography;

const ShiftManagementHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState("1");

  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <CalendarOutlined /> Phân lịch làm việc
        </span>
      ),
      children: <WorkSchedulePage />,
    },
    {
      key: "2",
      label: (
        <span>
          <ClockCircleOutlined /> Ca mẫu
        </span>
      ),
      children: <ShiftTemplatePage />,
    },
    {
      key: "3",
      label: (
        <span>
          <HistoryOutlined /> Lịch sử ca
        </span>
      ),
      children: <ShiftHistoryPage />,
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ marginBottom: "20px" }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          Trung Tâm Quản Lý Ca Trực
        </Title>
        <Text type="secondary">
          Quản lý toàn bộ quy trình từ thiết lập khung giờ, phân lịch nhân viên
          đến đối soát tiền mặt cuối ca.
        </Text>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="line"
          size="large"
          animated={{ inkBar: true, tabPane: true }}
          items={tabItems}
          destroyInactiveTabPane={false}
        />
      </Card>
    </div>
  );
};

export default ShiftManagementHub;
