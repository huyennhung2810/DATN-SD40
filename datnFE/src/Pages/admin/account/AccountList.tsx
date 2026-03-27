import {
  CheckOutlined,
  EditOutlined,
  EyeOutlined,
  KeyOutlined,
  PlusOutlined,
  StopOutlined,
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
import { ACCOUNT_PROVIDERS, ACCOUNT_ROLES } from "../../../models/account";
import type { CommonStatus } from "../../../models/base";
import ResetPasswordModal from "./ResetPasswordModal";

const { Search } = Input;

const AccountList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params]);

  const handleSearch = (value: string) => {
    setParams({ ...params, keyword: value, page: 0 });
  };

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
      console.log("Cập nhật trạng thái thất bại", error);
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

  const getProviderLabel = (value: string) => {
    const provider = ACCOUNT_PROVIDERS.find((p) => p.value === value);
    return provider ? provider.label : value;
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) =>
        params.page! * params.size! + index + 1,
    },
    {
      title: "Mã tài khoản",
      dataIndex: "code",
      key: "code",
      ellipsis: true,
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
      render: (role: AccountRole) =>
        role === "ADMIN" ? (
          <Tag color="blue">Quản trị viên</Tag>
        ) : (
          <Tag color="green">Nhân viên</Tag>
        ),
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
          <Tag color="default">Không hoạt động</Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (createdDate: number) =>
        dayjs(createdDate).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "lastModifiedDate",
      key: "lastModifiedDate",
      render: (lastModifiedDate: number) =>
        lastModifiedDate
          ? dayjs(lastModifiedDate).format("DD/MM/YYYY HH:mm")
          : "-",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_: any, record: AccountResponse) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/accounts/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/accounts/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Đặt lại mật khẩu">
            <Button
              type="text"
              icon={<KeyOutlined />}
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
                icon={<CheckOutlined />}
                onClick={() => handleStatusChange(record.id, "ACTIVE")}
              />
            )}
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="solid-card" style={{ padding: "var(--spacing-lg)" }}>
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
            <Typography.Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              Quản lý tài khoản
            </Typography.Title>

            <Typography.Text type="secondary" style={{ fontSize: "13px" }}>
              Quản lý tài khoản hệ thống
            </Typography.Text>
          </div>
        </Space>
      </div>
      <Card
        title="Quản lý Tài khoản"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/accounts/create")}
          >
            Thêm Tài khoản
          </Button>
        }
      >
        <Space
          orientation="vertical"
          style={{ width: "100%", marginBottom: 16 }}
          size="middle"
        >
          <Space wrap>
            <Search
              placeholder="Tìm kiếm theo mã hoặc tên đăng nhập..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              style={{ width: 150 }}
              onChange={(value) =>
                setParams({ ...params, status: value, page: 0 })
              }
            >
              <Select.Option value="ACTIVE">Hoạt động</Select.Option>
              <Select.Option value="INACTIVE">Không hoạt động</Select.Option>
            </Select>
            <Select
              placeholder="Lọc theo vai trò"
              allowClear
              style={{ width: 150 }}
              onChange={(value) =>
                setParams({ ...params, role: value, page: 0 })
              }
            >
              {ACCOUNT_ROLES.map((role) => (
                <Select.Option key={role.value} value={role.value}>
                  {role.label}
                </Select.Option>
              ))}
            </Select>
          </Space>
        </Space>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            current: params.page! + 1,
            pageSize: params.size,
            total: totalElements,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} tài khoản`,
          }}
          onChange={handleTableChange}
        />
      </Card>
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
