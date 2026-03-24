import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  Input,
  Space,
  Tag,
  Typography,
  Tooltip,
  Row,
  Col,
  Select,
  DatePicker,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  StopOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";

import {
  fetchVouchersRequest,
  stopVoucherRequest,
} from "../../../redux/Voucher/voucherSlice";
import type { RootState, AppDispatch } from "../../../redux/store";
import type { Voucher } from "../../../models/Voucher";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const VoucherList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Đảm bảo lấy đúng dữ liệu từ Slice đã hoàn thiện
  const { list, loading, totalElements } = useSelector(
    (state: RootState) => state.voucher,
  );

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="default">Buộc dừng</Tag>;
      case 1:
        return <Tag color="blue">Sắp diễn ra</Tag>;
      case 2:
        return <Tag color="success">Đang diễn ra</Tag>;
      case 3:
        return <Tag color="error">Đã kết thúc</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  const [params, setParams] = useState({
    page: 0,
    size: 10,
    keyword: "",
    status: null as number | null,
    voucherType: null as string | null,
    startDate: null as number | null,
    endDate: null as number | null,
  });
  const handleReset = () => {
    setParams({
      page: 0,
      size: 10,
      keyword: "",
      status: null,
      voucherType: null,
      startDate: null,
      endDate: null,
    });
  };
  const handleStopVoucher = (id: string) => {
    // Gửi yêu cầu lên Saga
    dispatch(stopVoucherRequest(id));
  };
  useEffect(() => {
    dispatch(fetchVouchersRequest(params));
  }, [dispatch, params]);

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center" as const,
      // Tính số thứ tự dựa trên trang hiện tại: (page * size) + index + 1
      render: (_: any, __: any, index: number) =>
        params.page * params.size + index + 1,
    },
    {
      title: "Mã Voucher",
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
      title: "Giá trị giảm",
      key: "discountValue",
      render: (_: any, record: Voucher) => {
        const isPercent = record.discountUnit === "PERCENT";
        return (
          <Text strong style={{ color: "#f5222d" }}>
            {record.discountValue?.toLocaleString("vi-VN")}
            {isPercent ? " %" : " đ"}
          </Text>
        );
      },
    },
    {
      title: "Đối tượng",
      dataIndex: "voucherType",
      key: "voucherType",
      align: "center" as const,
      render: (type: "INDIVIDUAL" | "ALL") => (
        <Tag color={type === "INDIVIDUAL" ? "purple" : "geekblue"}>
          {type === "INDIVIDUAL" ? "Cá nhân " : "Tất cả "}
        </Tag>
      ),
    },

    {
      title: "Thời hạn",
      key: "duration",
      render: (_: any, record: Voucher) => (
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {dayjs(record.startDate).format("DD/MM/YYYY")} -{" "}
          {dayjs(record.endDate).format("DD/MM/YYYY")}
        </Text>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
    },
    {
      title: "Người cập nhật",
      dataIndex: "lastModifiedBy",
      key: "lastModifiedBy",
      align: "center" as const,
      render: (text: string) => (
        <Tag icon={<UserOutlined />}>{text || "N/A"}</Tag>
      ),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 250, // Thêm độ rộng tối thiểu để không bị nhảy hàng hay mất chữ
      render: (status: number, record: any) => (
        <Space size="small">
          {" "}
          {/* Dùng size="small" để tiết kiệm diện tích */}
          {getStatusTag(status)}
          {status === 2 && (
            <Popconfirm
              title="Buộc dừng voucher này?"
              onConfirm={() => handleStopVoucher(record.id)}
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
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center" as const,
      render: (_: any, record: Voucher) => (
        <Tooltip title="Chỉnh sửa">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#1890ff" }} />}
            onClick={() => navigate(`/voucher/edit/${record.id}`)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <div
        className="solid-card"
        style={{ padding: "var(--spacing-lg)", marginBottom: "12px" }}
      >
        <Space align="center" size={16}>
          <div
            style={{
              backgroundColor: "var(--color-primary-light)",
              padding: "12px",
              borderRadius: "var(--radius-md)",
            }}
          >
            <TagOutlined
              style={{ fontSize: "24px", color: "var(--color-primary)" }}
            />
          </div>

          <div>
            <Typography.Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              Quản lý voucher
            </Typography.Title>

            <Typography.Text type="secondary" style={{ fontSize: "13px" }}>
              Quản lý chương trình khuyến mãi và mã giảm giá
            </Typography.Text>
          </div>
        </Space>
      </div>
      <Card
        variant="borderless"
        style={{
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Space direction="vertical" size={0}>
            <Text type="secondary">Phát hành và theo dõi mã giảm giá</Text>
          </Space>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate("/voucher/create")}
            style={{ borderRadius: "8px" }}
          >
            Tạo Voucher mới
          </Button>
        </div>

        <Card
          style={{ marginBottom: 16, backgroundColor: "#fafafa" }}
          size="small"
          variant="borderless"
        >
          <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} md={6}>
              <Text strong style={{ fontSize: "12px" }}>
                Tìm kiếm
              </Text>
              <Input
                placeholder="Mã hoặc tên voucher..."
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

            <Col xs={12} md={4}>
              <Text strong style={{ fontSize: "12px" }}>
                Đối tượng
              </Text>
              <Select
                style={{ width: "100%" }}
                placeholder="Tất cả"
                allowClear
                value={params.voucherType}
                onChange={(val) =>
                  setParams({ ...params, voucherType: val, page: 0 })
                }
              >
                <Select.Option value="ALL">Tất cả</Select.Option>
                <Select.Option value="INDIVIDUAL">Cá nhân</Select.Option>
              </Select>
            </Col>

            <Col xs={24} md={6}>
              <Text strong style={{ fontSize: "12px" }}>
                Khoảng ngày (Bắt đầu - Kết thúc)
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

            {/* Cột chứa nút bấm nằm cùng hàng */}
            <Col xs={24} md={4}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                >
                  Làm mới
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

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

export default VoucherList;
