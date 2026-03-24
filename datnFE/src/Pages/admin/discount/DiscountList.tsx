import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  Input,
  Space,
  Tag,
  Typography,
  Select,
  DatePicker,
  Modal, // Thêm Modal
  Col,
  Row,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  StopOutlined, // Thêm icon Stop
  ExclamationCircleOutlined, // Thêm icon Cảnh báo
  EditOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";

// Import thêm action changeStatusDiscountRequest
import {
  fetchDiscountsRequest,
  changeStatusDiscountRequest,
} from "../../../redux/discount/discountSlice";

import type { RootState, AppDispatch } from "../../../redux/store";
import type { Discount } from "../../../models/Discount";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const DiscountList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { list, loading, totalElements } = useSelector(
    (state: RootState) => state.discount,
  );

  const [params, setParams] = useState({
    page: 0,
    size: 10,
    keyword: "",
    status: null as number | null,
    startDate: null as number | null,
    endDate: null as number | null,
  });

  // --- 1. THÊM HÀM XỬ LÝ DỪNG (QUAN TRỌNG) ---
  const confirmStop = (id: string) => {
    Modal.confirm({
      title: "Xác nhận dừng chương trình",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn dừng đợt giảm giá này ngay lập tức?",
      okText: "Dừng ngay",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        // Gọi action Saga để đổi trạng thái
        dispatch(changeStatusDiscountRequest(id));
      },
    });
  };

  const handleReset = () => {
    setParams({
      page: 0,
      size: 10,
      keyword: "",
      status: null,
      startDate: null,
      endDate: null,
    });
  };

  useEffect(() => {
    dispatch(fetchDiscountsRequest(params));
  }, [dispatch, params]);

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) =>
        params.page * params.size + index + 1,
    },
    {
      title: "Mã giảm giá",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Tên chương trình",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Mức giảm",
      dataIndex: "discountPercent",
      key: "discountPercent",
      align: "center" as const,
      render: (val: number) => (
        <Text strong style={{ color: "#f5222d" }}>
          {val}%
        </Text>
      ),
    },
    {
      title: "Thời gian áp dụng",
      key: "duration",
      width: 200,
      render: (_: any, record: Discount) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: "12px" }}>
            BĐ:{" "}
            {record.startDate
              ? dayjs(record.startDate).format("DD/MM/YYYY")
              : ""}
          </Text>
          <Text style={{ fontSize: "12px" }} type="secondary">
            KT:{" "}
            {record.endDate ? dayjs(record.endDate).format("DD/MM/YYYY") : ""}
          </Text>
        </Space>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 250,
      render: (status: number, record: Discount) => {
        let color = "default";
        let text = "Không xác định";

        switch (status) {
          case 1:
            color = "orange";
            text = "Sắp diễn ra";
            break;
          case 2:
            color = "green";
            text = "Đang diễn ra";
            break;
          case 3:
            color = "red";
            text = "Đã kết thúc";
            break;
          case 0:
            color = "gray";
            text = "Buộc dừng";
            break;
        }

        return (
          <Space size="small">
            <Tag color={color}>{text}</Tag>

            {(status === 1 || status === 2) && (
              <Popconfirm
                title="Buộc dừng đợt giảm giá này?"
                onConfirm={() => confirmStop(record.id)}
                okText="Dừng"
                cancelText="Hủy"
              >
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<StopOutlined />}
                >
                  Buộc dừng
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },

    {
      title: "Hành động",
      key: "action",
      align: "center" as const,
      render: (_: any, record: Discount) => (
        <Tooltip title="Chỉnh sửa">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#1890ff" }} />}
            onClick={() => navigate(`/discount/edit/${record.id}`)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <div
        className="solid-card"
        style={{
          padding: "var(--spacing-lg)",
          marginBottom: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space align="center" size={16}>
          <div
            style={{
              backgroundColor: "var(--color-primary-light)",
              padding: "12px",
              borderRadius: "var(--radius-md)",
            }}
          >
            <CalendarOutlined
              style={{ fontSize: "24px", color: "var(--color-primary)" }}
            />
          </div>

          <div>
            <Typography.Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              Quản lý đợt giảm giá
            </Typography.Title>

            <Typography.Text type="secondary" style={{ fontSize: "13px" }}>
              Cấu hình và theo dõi chương trình khuyến mãi sản phẩm
            </Typography.Text>
          </div>
        </Space>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/discount/create")}
          style={{
            borderRadius: "20px",
            height: "38px",
            fontSize: "14px",
          }}
        >
          Tạo đợt giảm giá mới
        </Button>
      </div>
      <Card
        bordered={false}
        style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
      >
        <Card
          style={{ marginBottom: 16, backgroundColor: "#fafafa" }}
          size="small"
          bordered={false}
        >
          <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} md={8}>
              <Text strong style={{ fontSize: "12px" }}>
                Tìm kiếm
              </Text>
              <Input
                placeholder="Mã hoặc tên chương trình..."
                prefix={<SearchOutlined />}
                allowClear
                value={params.keyword}
                onChange={(e) =>
                  setParams({ ...params, keyword: e.target.value, page: 0 })
                }
              />
            </Col>

            <Col xs={12} md={4}>
              <Text strong style={{ fontSize: "12px" }}>
                Trạng thái
              </Text>
              <Select
                style={{ width: "100%" }}
                placeholder="Tất cả"
                allowClear
                value={params.status}
                onChange={(val) =>
                  setParams({ ...params, status: val, page: 0 })
                }
              >
                <Select.Option value={1}>Sắp diễn ra</Select.Option>
                <Select.Option value={2}>Đang diễn ra</Select.Option>
                <Select.Option value={3}>Đã kết thúc</Select.Option>
                <Select.Option value={0}>Buộc dừng</Select.Option>
              </Select>
            </Col>

            <Col xs={24} md={8}>
              <Text strong style={{ fontSize: "12px" }}>
                Khoảng ngày
              </Text>
              <RangePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                value={
                  params.startDate && params.endDate
                    ? [dayjs(params.startDate), dayjs(params.endDate)]
                    : null
                }
                onChange={(dates) => {
                  setParams({
                    ...params,
                    page: 0,
                    startDate: dates?.[0]
                      ? dates[0].startOf("day").valueOf()
                      : null,
                    endDate: dates?.[1]
                      ? dates[1].endOf("day").valueOf()
                      : null,
                  });
                }}
              />
            </Col>

            <Col xs={24} md={4}>
              <Button
                style={{ width: "100%" }}
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                Làm mới
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={loading}
          pagination={{
            total: totalElements,
            current: params.page + 1,
            pageSize: params.size,
            onChange: (page, size) =>
              setParams({ ...params, page: page - 1, size }),
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
          }}
        />
      </Card>
    </div>
  );
};

export default DiscountList;
