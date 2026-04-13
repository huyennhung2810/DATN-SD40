import {
  CheckOutlined,
  EditOutlined,
  EyeOutlined,
  KeyOutlined,
  PlusOutlined,
  StopOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Input,
  message,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Row,
  Col,
  Radio,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import accountApi from "../../../api/accountApi";
import type {
  AccountResponse,
  AccountRole,
  AccountSearchParams,
} from "../../../models/account";
import { ACCOUNT_PROVIDERS } from "../../../models/account";
import type { CommonStatus } from "../../../models/base";
import ResetPasswordModal from "./ResetPasswordModal";

const { Title, Text } = Typography;

const AccountList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  // State quản lý bộ lọc
  const [params, setParams] = useState<AccountSearchParams>({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
    role: undefined,
  });

  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<AccountResponse | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const searchParams: AccountSearchParams = {
        page: params.page || 0,
        size: params.size || 10,
      };

      if (params.keyword && params.keyword.trim()) {
        searchParams.keyword = params.keyword.trim();
      }
      if (params.status) {
        searchParams.status = params.status;
      }
      if (params.role) {
        searchParams.role = params.role;
      }

      const response = await accountApi.search(searchParams);
      setData(response.data || []);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      message.error("Lỗi khi tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleTableChange = (pagination: any) => {
    setParams({
      ...params,
      page: pagination.current - 1,
      size: pagination.pageSize,
    });
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await accountApi.updateStatus(id, status);
      message.success("Cập nhật trạng thái thành công");
      fetchData();
    } catch (error) {
      console.error("Cập nhật trạng thái thất bại", error);
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleResetPassword = (account: AccountResponse) => {
    setSelectedAccount(account);
    setResetPasswordVisible(true);
  };

  const handleResetPasswordSuccess = () => {
    setResetPasswordVisible(false);
    setSelectedAccount(null);
    message.success("Đặt lại mật khẩu thành công");
  };

  // Hàm xử lý khi bấm nút "Đặt lại bộ lọc"
  const handleResetFilters = () => {
    setParams({
      page: 0,
      size: 10,
      keyword: "",
      status: undefined,
      role: undefined,
    });
    message.success("Đã làm mới bộ lọc");
  };

  const getProviderLabel = (value: string) => {
    const provider = ACCOUNT_PROVIDERS.find((p) => p.value === value);
    return provider ? provider.label : value;
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) =>
        (params.page || 0) * (params.size || 10) + index + 1,
    },
    {
      title: "Mã tài khoản",
      dataIndex: "code",
      key: "code",
      ellipsis: true,
      render: (code: string) => <Text strong>{code}</Text>,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      ellipsis: true,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: AccountRole) => {
        // Đã sửa logic hiển thị vai trò để hỗ trợ cả Khách hàng
        switch (role) {
          case "ADMIN":
            return <Tag color="blue">Quản trị viên</Tag>;
          case "STAFF":
            return <Tag color="green">Nhân viên</Tag>;
          case "CUSTOMER":
            return <Tag color="orange">Khách hàng</Tag>;
          default:
            return <Tag>{role}</Tag>;
        }
      },
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "provider",
      key: "provider",
      render: (provider: string) => getProviderLabel(provider),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: CommonStatus) =>
        status === "ACTIVE" ? (
          <Tag color="success">Hoạt động</Tag>
        ) : (
          <Tag color="default">Ngưng hoạt động</Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (createdDate: number) =>
        createdDate ? dayjs(createdDate).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      align: "center" as const,
      render: (_: any, record: AccountResponse) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: "#1890ff" }} />}
              onClick={() => navigate(`/admin/accounts/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#fa8c16" }} />}
              onClick={() => navigate(`/admin/accounts/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Đặt lại mật khẩu">
            <Button
              type="text"
              icon={<KeyOutlined style={{ color: "#52c41a" }} />}
              onClick={() => handleResetPassword(record)}
            />
          </Tooltip>
          <Tooltip
            title={record.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}
          >
            {record.status === "ACTIVE" ? (
              <Button
                type="text"
                danger
                icon={<StopOutlined />}
                onClick={() => handleStatusChange(record.id, "INACTIVE")}
              />
            ) : (
              <Button
                type="text"
                icon={<CheckOutlined style={{ color: "#52c41a" }} />}
                onClick={() => handleStatusChange(record.id, "ACTIVE")}
              />
            )}
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>
      {/* Header */}
      <div
        className="solid-card"
        style={{
          padding: "16px var(--spacing-lg)",
          marginBottom: 16,
          background: "#fff",
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center" size={16}>
              <div
                style={{
                  backgroundColor: "var(--color-primary-light)",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <KeyOutlined
                  style={{ fontSize: "24px", color: "var(--color-primary)" }}
                />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                  Quản lý Tài khoản
                </Title>
                <Text type="secondary" style={{ fontSize: "13px" }}>
                  Quản lý thông tin và phân quyền người dùng hệ thống
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate("/admin/accounts/create")}
            >
              Thêm Tài khoản
            </Button>
          </Col>
        </Row>
      </div>

      {/* Bộ lọc tìm kiếm */}
      <Card variant="borderless" style={{ marginBottom: 16, borderRadius: 8 }}>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Space>
            <SearchOutlined style={{ fontSize: "18px", color: "#1890ff" }} />
            <Text strong style={{ fontSize: "16px" }}>
              Bộ lọc tìm kiếm
            </Text>
          </Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleResetFilters}
            style={{ borderRadius: 6 }}
          >
            Đặt lại bộ lọc
          </Button>
        </Row>

        <Row gutter={[24, 16]}>
          <Col xs={24} md={8}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Tìm kiếm chung
            </Text>
            <Input
              placeholder="Tên, mã khách hàng, SĐT..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              style={{ width: "100%" }}
              value={params.keyword}
              allowClear
              onChange={(e) =>
                setParams({ ...params, keyword: e.target.value, page: 0 })
              }
            />
          </Col>

          <Col xs={24} md={6}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Vai trò
            </Text>
            <Select
              placeholder="Chọn vai trò"
              allowClear
              style={{ width: "100%" }}
              value={params.role}
              onChange={(value) =>
                setParams({ ...params, role: value, page: 0 })
              }
              options={[
                { value: "ADMIN", label: "Quản trị viên" },
                { value: "STAFF", label: "Nhân viên" },
                { value: "CUSTOMER", label: "Khách hàng" },
              ]}
            />
          </Col>

          <Col xs={24} md={10}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Trạng thái
            </Text>
            <Radio.Group
              value={params.status || "ALL"}
              onChange={(e) =>
                setParams({
                  ...params,
                  status: e.target.value === "ALL" ? undefined : e.target.value,
                  page: 0,
                })
              }
            >
              <Radio value="ALL">Tất cả</Radio>
              <Radio value="ACTIVE">Hoạt động</Radio>
              <Radio value="INACTIVE">Ngưng</Radio>
            </Radio.Group>
          </Col>
        </Row>
      </Card>

      {/* Danh sách dữ liệu */}
      <Card variant="borderless" style={{ borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            current: (params.page || 0) + 1,
            pageSize: params.size,
            total: totalElements,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} tài khoản`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal đặt lại mật khẩu */}
      <ResetPasswordModal
        visible={resetPasswordVisible}
        account={selectedAccount}
        onClose={() => {
          setResetPasswordVisible(false);
          setSelectedAccount(null);
        }}
        onSuccess={handleResetPasswordSuccess}
      />
    </div>
  );
};

export default AccountList;
