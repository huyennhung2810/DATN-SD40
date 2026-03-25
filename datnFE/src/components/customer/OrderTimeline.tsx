import React from "react";
import { Steps, Tooltip } from "antd";
import type { CustomerOrderHistoryResponse } from "../../models/customerOrder";
import dayjs from "dayjs";

interface OrderTimelineProps {
  timeline: CustomerOrderHistoryResponse[];
}

const STATUS_ORDER = [
  "CHO_XAC_NHAN",
  "DA_XAC_NHAN",
  "CHO_GIAO",
  "DANG_GIAO",
  "HOAN_THANH",
  "DA_HUY",
];

const STATUS_ICONS: Record<string, string> = {
  CHO_XAC_NHAN: "📋",
  DA_XAC_NHAN: "✅",
  CHO_GIAO: "📦",
  DANG_GIAO: "🚚",
  HOAN_THANH: "🎉",
  DA_HUY: "❌",
};

const OrderTimeline: React.FC<OrderTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: "#9CA3AF", fontSize: 14 }}>
        Chưa có lịch sử trạng thái
      </div>
    );
  }

  // Build ordered steps from timeline
  const orderedSteps = STATUS_ORDER
    .map(status => timeline.find(t => t.status === status))
    .filter(Boolean) as CustomerOrderHistoryResponse[];

  const currentIndex = orderedSteps.findIndex(t => t.isCurrent);

  return (
    <div style={{ padding: "0 8px" }}>
      <Steps
        direction="vertical"
        size="small"
        current={currentIndex >= 0 ? currentIndex : orderedSteps.length - 1}
        items={orderedSteps.map((step, index) => {
          const isCancelled = step.status === "DA_HUY";
          const isCompleted = step.isCompleted;
          const isCurrent = step.isCurrent;

          let status: "wait" | "process" | "finish" | "error" = "wait";
          if (isCancelled) status = "error";
          else if (isCurrent) status = "process";
          else if (isCompleted || index < currentIndex) status = "finish";

          const formattedTime = step.timestamp
            ? dayjs(step.timestamp).format("DD/MM/YYYY HH:mm")
            : null;

          return {
            status,
            title: (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>{STATUS_ICONS[step.status] || "📌"}</span>
                <span style={{
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCancelled ? "#991B1B" : isCurrent ? "#D32F2F" : "#374151",
                }}>
                  {step.statusLabel}
                </span>
              </div>
            ),
            description: (
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                {formattedTime && (
                  <div style={{ marginBottom: step.note ? 2 : 0 }}>
                    {formattedTime}
                  </div>
                )}
                {step.performedBy && (
                  <div style={{ color: "#9CA3AF" }}>
                    Bởi: {step.performedBy}
                  </div>
                )}
                {step.note && (
                  <Tooltip title={step.note}>
                    <div style={{
                      marginTop: 4,
                      color: "#4B5563",
                      fontStyle: "italic",
                      fontSize: 12,
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {step.note}
                    </div>
                  </Tooltip>
                )}
              </div>
            ),
          };
        })}
      />
    </div>
  );
};

export default OrderTimeline;
