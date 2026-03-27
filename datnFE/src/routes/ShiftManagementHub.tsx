import {
  CalendarOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import { Card, Tabs, Typography } from "antd";
import React, { useState } from "react";
import ShiftHistoryPage from "../Pages/admin/shiftHandover/ShiftHistoryPage";
import ShiftTemplatePage from "../Pages/admin/shiftTemplate/ShiftTemplatePage";
import WorkSchedulePage from "../Pages/admin/workSchedule/WorkSchedulePage";

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
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>
      <div
        className="solid-card"
        style={{
          padding: "16px 20px",
          marginBottom: "16px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--color-primary-light)",
            padding: "12px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ScheduleOutlined
            style={{
              fontSize: "22px",
              color: "var(--color-primary)",
            }}
          />
        </div>

        <div>
          <Typography.Title level={4} style={{ margin: 0, fontWeight: 600 }}>
            Trung Tâm Quản Lý Ca Trực
          </Typography.Title>

          <Typography.Text type="secondary" style={{ fontSize: "13px" }}>
            Quản lý phân ca, ca mẫu và lịch sử ca làm việc của nhân viên
          </Typography.Text>
        </div>
      </div>

      <Card
        variant="borderless"
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
