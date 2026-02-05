import React, { useState, useEffect } from "react";
import {
  Radio,
  Card,
  Space,
  DatePicker,
  Button,
  Typography,
  Row,
  Col,
  Skeleton,
  message,
  Divider,
  Popconfirm,
} from "antd";
import type { RadioChangeEvent } from "antd";
import {
  FileExcelOutlined,
  DollarCircleOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import { statisticsActions } from "../../../redux/statistics/statisticsSlice";
import { TimeRangeType } from "../../../models/statistics";
import type { Dayjs } from "dayjs";
import statisticsApi from "../../../api/statisticsApi";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

interface StatItemProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ title, value, icon, color }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "0 12px",
    }}
  >
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: `${color}15`,
        color: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 24,
      }}
    >
      {icon}
    </div>
    <div>
      <Text type="secondary" style={{ fontSize: 13 }}>
        {title}
      </Text>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#262626",
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

const StatisticFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filteredStat, loading } = useAppSelector((state) => state.statistics);
  const [_exporting, setExporting] = useState(false);
  const [filterParams, _setFilterParams] = useState<{
    startDate?: number;
    endDate?: number;
  }>({
    startDate: undefined,
    endDate: undefined,
  });

  const [filterType, setFilterType] = useState<TimeRangeType>(
    TimeRangeType.THIS_MONTH,
  );

  useEffect(() => {
    dispatch(statisticsActions.fetchInitialData());
    dispatch(
      statisticsActions.fetchDashboardData({ type: TimeRangeType.THIS_MONTH }),
    );
  }, [dispatch]);

  const handleRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null,
    _dateStrings: [string, string],
  ) => {
    if (dates && dates[0] && dates[1]) {
      dispatch(
        statisticsActions.fetchDashboardData({
          type: TimeRangeType.CUSTOM,
          startDate: dates[0].valueOf(),
          endDate: dates[1].valueOf(),
        }),
      );
    }
  };

  const handleRadioChange = (e: RadioChangeEvent) => {
    const value = e.target.value as TimeRangeType;
    setFilterType(value);
    if (value !== TimeRangeType.CUSTOM) {
      dispatch(statisticsActions.fetchDashboardData({ type: value }));
    }
  };

  const handleExportAll = async () => {
    try {
      setExporting(true);

      let startDateForExport = filterParams.startDate;
      let endDateForExport = filterParams.endDate;

      const now = dayjs();

      switch (filterType) {
        case TimeRangeType.TODAY:
          startDateForExport = now.startOf("day").valueOf();
          endDateForExport = now.endOf("day").valueOf();
          break;
        case TimeRangeType.THIS_WEEK:
          startDateForExport = now.startOf("week").valueOf();
          endDateForExport = now.endOf("week").valueOf();
          break;
        case TimeRangeType.THIS_MONTH:
          startDateForExport = now.startOf("month").valueOf();
          endDateForExport = now.endOf("month").valueOf();
          break;
        case TimeRangeType.THIS_YEAR:
          startDateForExport = now.startOf("year").valueOf();
          endDateForExport = now.endOf("year").valueOf();
          break;
        case TimeRangeType.CUSTOM:
          if (!startDateForExport || !endDateForExport) {
            message.warning("Vui lòng chọn khoảng thời gian trước khi xuất!");
            setExporting(false);
            return;
          }
          break;
        default:
          break;
      }

      const response = await statisticsApi.exportAll(
        startDateForExport,
        endDateForExport,
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const dateName =
        filterType === TimeRangeType.CUSTOM
          ? "TuyChinh"
          : dayjs(startDateForExport).format("DD-MM-YYYY");

      link.setAttribute("download", `BaoCao_${dateName}.xlsx`);

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
      message.success("Đã tải xuống file excel báo cáo!");
    } catch (error) {
      console.log(error);
      message.error("Có lỗi khi xuất file!");
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (value: number | undefined): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  return (
    <Card
      className="shadow-sm border-none"
      styles={{ body: { padding: "20px 24px" } }}
      style={{ borderRadius: 12 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "#fff1f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ff4d4f",
            }}
          >
            <FilterOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Bộ lọc
            </Title>
          </div>
        </div>

        <Space
          size="small"
          wrap
          style={{ justifyContent: "flex-end", flex: 1 }}
        >
          <Radio.Group
            value={filterType}
            buttonStyle="solid"
            onChange={handleRadioChange}
            disabled={loading}
            className="custom-radio-red"
          >
            <Radio.Button value={TimeRangeType.TODAY}>Hôm nay</Radio.Button>
            <Radio.Button value={TimeRangeType.THIS_WEEK}>
              Tuần này
            </Radio.Button>
            <Radio.Button value={TimeRangeType.THIS_MONTH}>
              Tháng này
            </Radio.Button>
            <Radio.Button value={TimeRangeType.THIS_YEAR}>Năm nay</Radio.Button>
            <Radio.Button value={TimeRangeType.CUSTOM}>Tùy chỉnh</Radio.Button>
          </Radio.Group>

          {filterType === TimeRangeType.CUSTOM && (
            <RangePicker
              onChange={handleRangeChange}
              placeholder={["Bắt đầu", "Kết thúc"]}
              style={{ width: 230 }}
              format="DD/MM/YYYY"
              allowClear={false}
            />
          )}

          <Popconfirm
            title="Xác nhận xuất excel"
            description="Bạn có chắc chắn muốn tải xuống file Excel?"
            onConfirm={handleExportAll}
            okText="Đồng ý"
            cancelText="Hủy"
            placement="bottomRight"
          >
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              style={{ background: "#31bd70", borderColor: "#31bd70" }}
              loading={_exporting}
            >
              Xuất Excel
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Divider style={{ margin: "20px 0" }} />

      {loading && !filteredStat ? (
        <Skeleton active paragraph={{ rows: 1 }} />
      ) : (
        <Row gutter={[24, 24]} align="middle" justify="space-between">
          <Col xs={24} md={8}>
            <StatItem
              title="Tổng doanh thu"
              value={formatCurrency(filteredStat?.totalRevenue)}
              icon={<DollarCircleOutlined />}
              color="#1890ff"
            />
          </Col>

          <Col
            xs={0}
            md={0}
            style={{ borderRight: "1px solid #f0f0f0", height: 40 }}
          />

          <Col xs={24} md={8}>
            <StatItem
              title="Tổng đơn hàng"
              value={filteredStat?.totalOrders || 0}
              icon={<ShoppingCartOutlined />}
              color="#722ed1"
            />
          </Col>

          <Col
            xs={0}
            md={0}
            style={{ borderRight: "1px solid #f0f0f0", height: 40 }}
          />

          <Col xs={24} md={8}>
            <StatItem
              title="Sản phẩm đã bán"
              value={filteredStat?.totalProductsSold || 0}
              icon={<ShopOutlined />}
              color="#52c41a"
            />
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default StatisticFilter;
