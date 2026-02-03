import React, { useMemo } from "react";
import { Card, Typography, Spin } from "antd";
import {
  BarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../../../app/hook";

const { Text } = Typography;

const GrowthChart: React.FC = () => {
  const { growthStat, loading } = useAppSelector((state) => state.statistics);

  const data = useMemo(() => growthStat || [], [growthStat]);

  return (
    <Card
      variant="borderless"
      style={{
        backgroundColor: "#1f1f1f",
        borderRadius: "8px",
        color: "#fff",
        height: "100%",
        overflow: "hidden",
      }}
      styles={{ body: { padding: "12px" } }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          padding: "0 8px",
        }}
      >
        <Text strong style={{ color: "#fff", fontSize: 16 }}>
          Tốc độ tăng trưởng của cửa hàng
        </Text>
        <SyncOutlined
          style={{ color: "#e67e22", cursor: "pointer" }}
          spin={loading}
        />
      </div>

      {loading && data.length === 0 ? (
        <div style={{ textAlign: "center", padding: 20 }}>
          <Spin />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {data.map((item, index) => {
            const isPositive = item.growth >= 0;
            const color = isPositive ? "#2ecc71" : "#e74c3c";

            return (
              <div
                key={index}
                style={{
                  backgroundColor: "#000",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                {/* Cột 1: Label & Icon */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flex: 1,
                  }}
                >
                  <BarChartOutlined style={{ color: "#fff", fontSize: 14 }} />
                  <Text style={{ color: "#fff", fontSize: 13 }}>
                    {item.label}
                  </Text>
                </div>

                {/* Cột 2: Giá trị */}
                <div style={{ flex: 1, textAlign: "center" }}>
                  <Text strong style={{ color: "#fff", fontSize: 14 }}>
                    {item.isCurrency
                      ? item.value.toLocaleString("vi-VN") + " đ"
                      : item.value.toLocaleString("vi-VN")}
                  </Text>
                </div>

                {/* Cột 3: % Tăng trưởng */}
                <div
                  style={{
                    width: 80,
                    textAlign: "right",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {isPositive ? (
                    <ArrowUpOutlined style={{ color }} />
                  ) : (
                    <ArrowDownOutlined style={{ color }} />
                  )}
                  <Text style={{ color, fontSize: 14, fontWeight: "bold" }}>
                    {Math.abs(item.growth).toFixed(2)}%
                  </Text>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default GrowthChart;
