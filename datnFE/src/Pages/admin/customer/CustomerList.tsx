import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Select,
  Radio,
  Button,
  Table,
  Pagination,
  Space,
  Tooltip,
  Typography,
  Tag,
  notification,
  Avatar,
  Switch,
  Popconfirm,
  Modal,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  FileExcelOutlined,
  SyncOutlined,
  EditOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import type { RootState } from "../../../redux/store";
import type {
  CustomerPageParams,
  CustomerResponse,
} from "../../../models/customer";
import { customerActions } from "../../../redux/customer/customerSlice";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { Text } = Typography;

const CustomerPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [keyword, setKeyword] = useState("");

  // Redux State
  const { list, loading, totalElements } = useSelector(
    (state: RootState) => state.customer,
  );

  // Local State cho bộ lọc
  const [filter, setFilter] = useState<CustomerPageParams>({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilter((prev) => ({
        ...prev,
        keyword: keyword.trim(),
        page: 0,
      }));
    }, 500);

    return () => clearTimeout(timeout);
  }, [keyword]);

  // Fetch dữ liệu
  const fetchCustomers = useCallback(() => {
    dispatch(customerActions.getAll(filter));
  }, [dispatch, filter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleRefresh = () => {
    fetchCustomers();
    notification.success({
      title: "Làm mới thành công",
      description: "Dữ liệu đã được cập nhật mới nhất",
    });
  };

  const handleExport = () => {
    if (totalElements === 0) {
      notification.warning({
        message: "Thông báo",
        description: "Hệ thống không có dữ liệu khách hàng để xuất file!",
      });
      return;
    }

    Modal.confirm({
      title: "Xác nhận xuất file",
      content: `Bạn có chắc chắn muốn xuất danh sách ${totalElements} nhân viên ra file Excel không?`,
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: () => {
        dispatch(customerActions.exportExcel());
        notification.info({
          message: "Đang xử lý ",
          description:
            "Hệ thống đang khởi tạo tệp Excel cho toàn bộ danh sách nhân viên...",
        });
      },
      onCancel: () => {
        notification.info({
          message: "Hủy xuất file",
          description: "Bạn đã hủy yêu cầu xuất file Excel.",
        });
      },
    });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setFilter((prev) => ({ ...prev, page: page - 1, size: pageSize }));
  };

  const handleReset = () => {
    form.resetFields();
    setKeyword("");
    setFilter({ page: 0, size: 10, keyword: "", status: undefined });
  };

  const handleStatusChange = useCallback(
    (id: string) => {
      dispatch(customerActions.changeStatusCustomer(id));
    },
    [dispatch],
  );

  const columns: ColumnsType<CustomerResponse> = useMemo(
    () => [
      {
        title: "STT",
        key: "index",
        align: "center",
        width: 60,
        render: (_value, _record, index) => (
          <Text style={{ fontSize: "14px" }}>
            {filter.page * filter.size + index + 1}
          </Text>
        ),
      },
      {
        title: "Khách hàng",
        key: "customer",
        width: 220,
        render: (record: CustomerResponse) => (
          <Space size="middle">
            <Avatar src={record.image} icon={<UserOutlined />} size={48} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Text strong style={{ fontSize: "13px" }}>
                {record.name}
              </Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.code}
              </Text>
            </div>
          </Space>
        ),
      },
      {
        title: "Giới tính",
        dataIndex: "gender",
        key: "gender",
        align: "center",
        width: 90,
        render: (gender: boolean) => (
          <Tag
            color={gender ? "blue" : "magenta"}
            style={{ borderRadius: "4px", border: "none" }}
          >
            {gender ? "Nam" : "Nữ"}
          </Tag>
        ),
      },
      {
        title: "Ngày sinh",
        dataIndex: "dateOfBirth",
        key: "dateOfBirth",
        align: "center",
        width: 110,
        render: (date) => (
          <span style={{ fontSize: "13px" }}>
            {date ? dayjs(date).format("DD/MM/YYYY") : "---"}
          </span>
        ),
      },
      {
        title: "Liên hệ",
        key: "contact",
        width: 240,
        render: (record: CustomerResponse) => (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <Space size={4}>
              <PhoneOutlined style={{ color: "#7f7f7f", fontSize: "12px" }} />
              <Text style={{ fontSize: "13px" }}>
                {record.phoneNumber || "---"}
              </Text>
            </Space>
            <Space size={4}>
              <MailOutlined style={{ color: "#7f7f7f", fontSize: "12px" }} />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.email}
              </Text>
            </Space>
          </div>
        ),
      },
      {
        title: "Địa chỉ mặc định",
        key: "address",
        width: 210,
        render: (record: CustomerResponse) => {
          const defaultAddr =
            record.addresses?.find((a) => a.isDefault) || record.addresses?.[0];
          return defaultAddr ? (
            <Tooltip
              title={`${defaultAddr.addressDetail}, ${defaultAddr.wardCommune},  ${defaultAddr.provinceCity}`}
            >
              <Text
                ellipsis
                style={{ maxWidth: 280, display: "block", fontSize: "13px" }}
              >
                {`${defaultAddr.addressDetail}, ${defaultAddr.wardCommune}`}
              </Text>
            </Tooltip>
          ) : (
            <Text type="secondary" italic>
              Chưa có địa chỉ
            </Text>
          );
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: 100,
        render: (status: string, record: CustomerResponse) => (
          <Popconfirm
            title="Thay đổi trạng thái"
            description={`Bạn có chắc chắn muốn ${status === "ACTIVE" ? "ngừng hoạt động" : "kích hoạt"} khách hàng này?`}
            onConfirm={() => handleStatusChange(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Switch checked={status === "ACTIVE"} size="default" />
          </Popconfirm>
        ),
      },
      {
        title: "Thao tác",
        key: "action",
        align: "center",
        width: 90,
        fixed: "right",
        render: (record: CustomerResponse) => (
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              shape="circle"
              icon={
                <EditOutlined style={{ color: "#faad14", fontSize: "14px" }} />
              }
              onClick={() => navigate(`/admin/customers/${record.id}`)}
            />
          </Tooltip>
        ),
      },
    ],
    [filter.page, filter.size, handleStatusChange, navigate],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <Card
        title={
          <span>
            <SearchOutlined /> Bộ lọc tìm kiếm
          </span>
        }
        className="shadow-md mb-4"
        extra={
          <Tooltip title="Làm mới bộ lọc">
            <Button
              shape="circle"
              icon={<ReloadOutlined />}
              onClick={handleReset}
              type="primary"
              ghost
            />
          </Tooltip>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(_, allValues) => {
            setKeyword(allValues.keyword || "");
            setFilter((prev) => ({
              ...prev,
              gender: allValues.gender,
              status: allValues.status,
              page: 0,
            }));
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            <Form.Item name="keyword" label="Tìm kiếm chung">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Tên, mã khách hàng, SĐT..."
                allowClear
              />
            </Form.Item>

            <Form.Item name="gender" label="Giới tính">
              <Select placeholder="Chọn giới tính" allowClear>
                <Select.Option value={true}>Nam</Select.Option>
                <Select.Option value={false}>Nữ</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="Trạng thái">
              <Radio.Group>
                <Radio value={undefined}>Tất cả</Radio>
                <Radio value="ACTIVE">Hoạt động</Radio>
                <Radio value="INACTIVE">Ngưng</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card
        title={
          <Text strong style={{ fontSize: "16px", fontWeight: 600 }}>
            Danh sách khách hàng ({totalElements})
          </Text>
        }
        extra={
          <Space size="middle">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/customerAdd")}
              style={{
                borderRadius: "20px",
                height: "35px",
                fontSize: "16px",
              }}
            >
              Thêm mới
            </Button>
            <Button
              icon={<FileExcelOutlined />}
              onClick={handleExport}
              loading={loading}
              style={{
                borderRadius: "20px",
                color: "#1d7444",
                borderColor: "#1d7444",
              }}
            >
              Xuất Excel
            </Button>
            <Button
              icon={<SyncOutlined spin={loading} />}
              onClick={handleRefresh}
              style={{ borderRadius: "20px" }}
            >
              Tải lại
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={false}
          rowKey="id"
          scroll={{ x: 1100 }}
          className="custom-table"
          bordered
          locale={{
            emptyText: (
              <div style={{ padding: "20px" }}>
                <Text type="secondary">
                  Không tìm thấy khách hàng nào khớp với bộ lọc
                </Text>
                <br />
                <Button type="link" onClick={handleReset}>
                  Xóa bộ lọc
                </Button>
              </div>
            ),
          }}
        />

        <div
          style={{
            padding: "20px 0",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <Pagination
            current={filter.page + 1}
            pageSize={filter.size}
            total={totalElements}
            onChange={handlePageChange}
            showSizeChanger
            style={{ fontSize: "14px" }}
            pageSizeOptions={["5", "10", "20", "50"]}
          />
        </div>
      </Card>
    </div>
  );
};

export default CustomerPage;
