import React, { useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Skeleton,
  Typography,
  Progress,
  Tag,
  Empty,
  Avatar,
} from "antd";
import {
  DollarCircleOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import { statisticsActions } from "../../../redux/statistics/statisticsSlice";

const { Text } = Typography;

// Helper 1: Format tiền tệ an toàn
const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// Helper 2: Tính toán an toàn, tránh NaN
const safeNum = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) return 0;
  return value;
};

// Helper 3: Tính % an toàn
const safePercent = (value: number | undefined | null) => {
  const val = safeNum(value);
  return Number(val.toFixed(1));
};

const DashboardSummary: React.FC = () => {
  const dispatch = useAppDispatch();
  const { summary, loading } = useAppSelector((state) => state.statistics);

  console.log("Dữ liệu Summary trong Component:", summary);

  useEffect(() => {
    dispatch(statisticsActions.fetchData("THIS_MONTH"));
  }, [dispatch]);

  if (loading || !summary) return <Skeleton active paragraph={{ rows: 10 }} />;

  const growthPercentage = safeNum(summary.growthPercentage);
  const isGrowthPositive = growthPercentage >= 0;
  const growthBg = isGrowthPositive ? "#0ea5e9" : "#fecaca";

  const totalCustomers = safeNum(summary.totalCustomers);
  const newCustomers = safeNum(summary.newCustomersThisMonth);
  const returningCustomers = Math.max(0, totalCustomers - newCustomers);

  // Tính tỷ lệ KH cũ
  const retentionRate =
    totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

  // Tính giá trị trung bình đơn hàng
  const avgOrderValue =
    safeNum(summary.totalOrders) > 0
      ? safeNum(summary.revenueThisYear) / safeNum(summary.totalOrders)
      : 0;

  return (
    <Row gutter={[16, 16]}>
      {/* Doanh thu */}
      <Col xs={24} md={12} lg={6}>
        <Card
          className="border-none shadow-sm"
          style={{ borderRadius: "10px", height: "100%" }}
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
                backgroundColor: "#f0fdf4",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <DollarCircleOutlined
                style={{ color: "#52c41a", fontSize: "22px" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: "1.2",
              }}
            >
              <Text
                style={{ fontWeight: 700, fontSize: "17px", color: "#262626" }}
              >
                Doanh Thu
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: "12px", marginTop: "2px" }}
              >
                Tổng quan doanh thu
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
                color: "#22c55e",
                fontWeight: 800,
                fontSize: "22px",
                lineHeight: 1,
              }}
            >
              {formatCurrency(summary.revenueThisMonth)}
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#8c8c8c",
                margin: "8px 0 12px",
              }}
            >
              Doanh thu tháng này
            </div>

            <div
              style={{
                backgroundColor: growthBg,
                color: isGrowthPositive ? "#fff" : "#dc2626",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 12px",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            >
              {isGrowthPositive ? (
                <ArrowUpOutlined style={{ fontSize: "12px" }} />
              ) : (
                <ArrowDownOutlined style={{ fontSize: "12px" }} />
              )}
              <span>{Math.abs(growthPercentage)}%</span>
              <span
                style={{
                  fontSize: "11px",
                  opacity: 0.9,
                  marginLeft: "4px",
                  color: isGrowthPositive ? "#fff" : "#7f1d1d",
                }}
              >
                so với tháng trước
              </span>
            </div>
          </div>

          <Row gutter={12} style={{ marginBottom: "16px" }}>
            <Col span={12}>
              <div
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: "12px",
                  padding: "12px 8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "13px" }}>
                  {formatCurrency(summary.revenueToday)}
                </div>
                <div style={{ fontSize: "11px", color: "#bfbfbf" }}>
                  Hôm nay
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: "12px",
                  padding: "12px 8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "13px" }}>
                  {formatCurrency(summary.revenueThisWeek)}
                </div>
                <div style={{ fontSize: "11px", color: "#bfbfbf" }}>
                  Tuần này
                </div>
              </div>
            </Col>
          </Row>

          <div
            style={{
              backgroundColor: "#f0fdf4",
              borderRadius: "12px",
              padding: "14px",
              textAlign: "center",
            }}
          >
            <div
              style={{ color: "#10b981", fontWeight: 800, fontSize: "18px" }}
            >
              {formatCurrency(summary.revenueThisYear)}
            </div>
            <div style={{ fontSize: "12px", color: "#4ade80" }}>
              Doanh thu năm nay
            </div>
          </div>
        </Card>
      </Col>

      {/* ======================= CARD 2: ĐƠN HÀNG ======================= */}
      <Col xs={24} md={12} lg={6}>
        <Card
          className="border-none shadow-sm"
          style={{ borderRadius: "10px", height: "100%" }}
          styles={{ body: { padding: "20px" } }}
        >
          {/* Header */}
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
                backgroundColor: "#eff6ff",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShoppingCartOutlined
                style={{ color: "#3b82f6", fontSize: "22px" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: "1.2",
              }}
            >
              <Text
                style={{ fontWeight: 700, fontSize: "17px", color: "#262626" }}
              >
                Đơn Hàng
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: "12px", marginTop: "2px" }}
              >
                Tình trạng đơn hàng
              </Text>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: "16px",
              padding: "16px 10px",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                color: "#3b82f6",
                fontWeight: 800,
                fontSize: "28px",
                lineHeight: 1,
              }}
            >
              {safeNum(summary.totalOrders)}
            </div>
            <div
              style={{ fontSize: "13px", color: "#8c8c8c", marginTop: "8px" }}
            >
              Tổng số đơn hàng
            </div>
          </div>

          <div style={{ marginBottom: "20px", padding: "0 4px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "8px",
              }}
            >
              <Text
                style={{ fontSize: "12px", fontWeight: 500, color: "#595959" }}
              >
                Tỷ lệ hoàn thành
              </Text>
              <Tag
                color={
                  safeNum(summary.completionRate) > 50 ? "success" : "warning"
                }
                style={{
                  borderRadius: "6px",
                  margin: 0,
                  fontSize: "11px",
                  border: "none",
                }}
              >
                {safePercent(summary.completionRate)}%
              </Tag>
            </div>
            <Progress
              percent={safePercent(summary.completionRate)}
              showInfo={false}
              strokeColor="#10b981"
              size="small"
              railColor="#f1f5f9"
            />
          </div>

          <div
            className="space-y-2"
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            {[
              {
                label: "Chờ xác nhận",
                value: safeNum(summary.pendingCount),
                icon: <ClockCircleOutlined />,
                color: "#eab308",
                bg: "#fefce8",
              },
              {
                label: "Đang xử lý",
                value: safeNum(summary.processingCount),
                icon: <SyncOutlined spin />,
                color: "#3b82f6",
                bg: "#eff6ff",
              },
              {
                label: "Hoàn thành",
                value: safeNum(summary.completedCount),
                icon: <CheckCircleOutlined />,
                color: "#10b981",
                bg: "#f0fdf4",
              },
              {
                label: "Đã hủy / Lỗi",
                value: safeNum(summary.cancelledCount),
                icon: <CloseCircleOutlined />,
                color: "#ef4444",
                bg: "#fef2f2",
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: item.bg,
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                }}
              >
                <span
                  style={{
                    color: "#595959",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ color: item.color }}>{item.icon}</span>{" "}
                  {item.label}
                </span>
                <span style={{ fontWeight: 700, color: item.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <Row gutter={12} style={{ marginTop: "16px" }}>
            <Col span={12}>
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  borderRadius: "12px",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#10b981",
                    fontWeight: 700,
                    fontSize: "15px",
                  }}
                >
                  {safeNum(summary.completedCount)}
                </div>
                <div style={{ fontSize: "11px", color: "#4ade80" }}>
                  Thành công
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  borderRadius: "12px",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#ef4444",
                    fontWeight: 700,
                    fontSize: "15px",
                  }}
                >
                  {safeNum(summary.cancelledCount)}
                </div>
                <div style={{ fontSize: "11px", color: "#f87171" }}>Đã hủy</div>
              </div>
            </Col>
          </Row>
        </Card>
      </Col>

      {/* ======================= CARD 3: SẢN PHẨM ======================= */}
      <Col xs={24} md={12} lg={6}>
        <Card
          className="border-none shadow-sm"
          style={{ borderRadius: "10px", height: "100%" }}
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
                backgroundColor: "#f5f3ff",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <InboxOutlined style={{ color: "#8b5cf6", fontSize: "22px" }} />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: "1.2",
              }}
            >
              <Text
                style={{ fontWeight: 700, fontSize: "17px", color: "#262626" }}
              >
                Sản Phẩm
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: "12px", marginTop: "2px" }}
              >
                Quản lý kho hàng
              </Text>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: "16px",
              padding: "16px 10px",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                color: "#8b5cf6",
                fontWeight: 800,
                fontSize: "28px",
                lineHeight: 1,
              }}
            >
              {safeNum(summary.totalProducts)}
            </div>
            <div
              style={{ fontSize: "13px", color: "#8c8c8c", marginTop: "8px" }}
            >
              Tổng số sản phẩm
            </div>
          </div>

          <div
            style={{
              border: "1px solid #f0f0f0",
              borderRadius: "12px",
              padding: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div>
              <div
                style={{ fontSize: "13px", fontWeight: 600, color: "#262626" }}
              >
                Sắp hết hàng
              </div>
              <div style={{ fontSize: "11px", color: "#bfbfbf" }}>
                SL dưới 10
              </div>
            </div>
            <div
              style={{
                backgroundColor:
                  safeNum(summary.lowStockCount) > 0 ? "#ef4444" : "#22c55e",
                color: "#fff",
                borderRadius: "50%",
                width: "22px",
                height: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {safeNum(summary.lowStockCount)}
            </div>
          </div>

          <Text
            strong
            style={{
              fontSize: "13px",
              display: "block",
              marginBottom: "12px",
              color: "#262626",
            }}
          >
            Top bán chạy tháng này
          </Text>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            {summary.topSellingProducts &&
            summary.topSellingProducts.length > 0 ? (
              summary.topSellingProducts.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #f0f0f0",
                    borderRadius: "12px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        color:
                          index === 0
                            ? "#faad14"
                            : index === 1
                              ? "#bfbfbf"
                              : "#cd7f32",
                        fontWeight: 700,
                        fontSize: "14px",
                        width: "14px",
                      }}
                    >
                      {index + 1}
                    </span>
                    <Avatar
                      src={
                        item.imageUrl ||
                        "https://via.placeholder.com/50x50?text=No+Img"
                      }
                      size="small"
                      shape="square"
                      onError={() => true}
                    />
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#595959",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "120px",
                      }}
                      title={item.name}
                    >
                      {item.name}
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#f0fdf4",
                      color: "#16a34a",
                      padding: "2px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {item.soldCount}
                  </div>
                </div>
              ))
            ) : (
              <Empty
                description="Chưa có dữ liệu"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>

          <Row gutter={12}>
            <Col span={12}>
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  borderRadius: "12px",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#10b981",
                    fontWeight: 700,
                    fontSize: "15px",
                  }}
                >
                  {Math.max(
                    0,
                    safeNum(summary.totalProducts) -
                      safeNum(summary.lowStockCount),
                  )}
                </div>
                <div style={{ fontSize: "11px", color: "#4ade80" }}>
                  Đủ hàng
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div
                style={{
                  backgroundColor: "#fff7ed",
                  borderRadius: "12px",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#f97316",
                    fontWeight: 700,
                    fontSize: "15px",
                  }}
                >
                  {safeNum(summary.lowStockCount)}
                </div>
                <div style={{ fontSize: "11px", color: "#fb923c" }}>
                  Cần nhập
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </Col>

      {/* ======================= CARD 4: KHÁCH HÀNG ======================= */}
      <Col xs={24} md={12} lg={6}>
        <Card
          className="border-none shadow-sm"
          style={{ borderRadius: "10px", height: "100%" }}
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
                backgroundColor: "#f0fdfa",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <UserOutlined style={{ color: "#0d9488", fontSize: "22px" }} />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: "1.2",
              }}
            >
              <Text
                style={{ fontWeight: 700, fontSize: "17px", color: "#262626" }}
              >
                Khách Hàng
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: "12px", marginTop: "2px" }}
              >
                Thông tin khách hàng
              </Text>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: "16px",
              padding: "16px 10px",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                color: "#0d9488",
                fontWeight: 800,
                fontSize: "28px",
                lineHeight: 1,
              }}
            >
              {totalCustomers}
            </div>
            <div
              style={{ fontSize: "13px", color: "#8c8c8c", marginTop: "8px" }}
            >
              Tổng số khách hàng
            </div>
          </div>

          <div
            style={{
              border: "1px solid #f0f0f0",
              borderRadius: "12px",
              padding: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <div
                style={{ fontSize: "13px", fontWeight: 600, color: "#262626" }}
              >
                Khách hàng mới
              </div>
              <div style={{ fontSize: "11px", color: "#bfbfbf" }}>
                Đăng ký tháng này
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#0ea5e9",
                color: "#fff",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {newCustomers}
            </div>
          </div>

          <div style={{ marginBottom: "20px", padding: "0 4px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "8px",
              }}
            >
              <Text
                style={{ fontSize: "12px", fontWeight: 500, color: "#595959" }}
              >
                Tỷ lệ KH quay lại
              </Text>
              <Tag
                color="blue"
                style={{
                  borderRadius: "6px",
                  margin: 0,
                  fontSize: "11px",
                  border: "none",
                }}
              >
                {safePercent(retentionRate)}%
              </Tag>
            </div>
            <Progress
              percent={safePercent(retentionRate)}
              showInfo={false}
              strokeColor="#0ea5e9"
              size="small"
              railColor="#f1f5f9"
            />
          </div>

          <div
            style={{
              backgroundColor: "#f0fdf4",
              borderRadius: "16px",
              padding: "14px",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            <div
              style={{ color: "#10b981", fontWeight: 800, fontSize: "18px" }}
            >
              {formatCurrency(avgOrderValue)}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#10b981",
                margin: "4px 0 8px",
              }}
            >
              Giá trị TB / Đơn hàng
            </div>
            <div
              style={{
                display: "inline-block",
                backgroundColor: "#0ea5e9",
                color: "#fff",
                padding: "2px 12px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              Trung bình
            </div>
          </div>

          <Row gutter={12}>
            <Col span={12}>
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  borderRadius: "12px",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#10b981",
                    fontWeight: 700,
                    fontSize: "16px",
                  }}
                >
                  {returningCustomers}
                </div>
                <div style={{ fontSize: "11px", color: "#4ade80" }}>
                  Khách cũ
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  borderRadius: "12px",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#3b82f6",
                    fontWeight: 700,
                    fontSize: "16px",
                  }}
                >
                  {newCustomers}
                </div>
                <div style={{ fontSize: "11px", color: "#60a5fa" }}>
                  Khách mới
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardSummary;
