import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Tag,
  Space,
  Typography,
  Pagination,
  Tooltip,
  Form,
  notification,
  Avatar,
  Radio,
  Select,
  Switch,
  Popconfirm,
  Modal,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  FileExcelOutlined,
  UserOutlined,
  SyncOutlined,
  ReloadOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import type {
  EmployeePageParams,
  EmployeeResponse,
} from "../../../models/employee";
import type { RootState } from "../../../redux/store";
import { employeeActions } from "../../../redux/employee/employeeSlice";

const { Text } = Typography;

const EmployeePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [keyword, setKeyword] = useState("");

  // Redux State
  const { list, loading, totalElements } = useSelector(
    (state: RootState) => state.employee,
  );

  //Sửa Local State: Đồng bộ chuẩn keyword và bổ sung role
  const [filter, setFilter] = useState<EmployeePageParams>({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
    role: undefined,
  });

  // Fetch dữ liệu
  const fetchEmployees = useCallback(() => {
    dispatch(employeeActions.getAll(filter));
  }, [dispatch, filter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

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

  const handleRefresh = () => {
    fetchEmployees();
    notification.success({
      title: "Làm mới thành công",
      description: "Dữ liệu nhân viên đã được cập nhật mới nhất",
    });
  };

  const handleReset = () => {
    form.resetFields();
    setKeyword("");
    setFilter({
      page: 0,
      size: 10,
      keyword: "",
      status: undefined,
      role: undefined,
    });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setFilter((prev) => ({ ...prev, page: page - 1, size: pageSize }));
  };

  const handleStatusChange = useCallback(
    (id: string) => {
      dispatch(employeeActions.changeStatusEmployee(id));
    },
    [dispatch],
  );

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
        dispatch(employeeActions.exportExcel());
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

  const columns: ColumnsType<EmployeeResponse> = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => filter.page * filter.size + index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Nhân viên",
      key: "employee",
      width: 230,
      render: (record: EmployeeResponse) => (
        <Space size="middle">
          <Avatar
            src={record.employeeImage}
            icon={<UserOutlined />}
            size={48}
          />
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
      width: 100,
      render: (date) => (
        <span style={{ fontSize: "13px" }}>
          {date ? dayjs(date).format("DD/MM/YYYY") : "---"}
        </span>
      ),
    },
    {
      title: "Liên hệ",
      key: "contact",
      width: 180,
      render: (record: EmployeeResponse) => (
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
      title: "Quê quán",
      key: "hometown",
      width: 150,
      render: (record: EmployeeResponse) => (
        <Text
          ellipsis={{
            tooltip: `${record.hometown || "---"}, ${record.wardCommune || "---"}, ${record.provinceCity || "---"}`,
          }}
          style={{ fontSize: "13px" }}
        >
          {record.hometown || "---"}, {record.wardCommune || "---"},{" "}
          {record.provinceCity || "---"}
        </Text>
      ),
    },

    {
      title: "Chức vụ",
      key: "role",
      width: 120,
      align: "center",
      render: (_, record: EmployeeResponse) => {
        const role = record.account?.role;
        const isAdmin = role?.toUpperCase() === "ADMIN";

        return (
          <Tag
            color={isAdmin ? "magenta" : "blue"}
            style={{ fontWeight: "500" }}
          >
            {isAdmin ? "ADMIN" : "NHÂN VIÊN"}
          </Tag>
        );
      },
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 100,
      render: (status: string, record: EmployeeResponse) => (
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
      render: (record: EmployeeResponse) => (
        <Tooltip title="Chỉnh sửa">
          <Button
            type="text"
            shape="circle"
            icon={
              <EditOutlined style={{ color: "#faad14", fontSize: "14px" }} />
            }
            onClick={() => navigate(`/admin/employees/${record.id}`)}
          />
        </Tooltip>
      ),
    },
  ];

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
          onValuesChange={(_, vals) => {
            setKeyword(vals.keyword || "");
            setFilter((prev) => ({
              ...prev,
              keyword: vals.keyword,
              status: vals.status,
              role: vals.role,
              page: 0,
            }));
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px",
            }}
          >
            <Form.Item name="keyword" label="Tìm kiếm chung">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Nhập tên, mã hoặc email..."
                allowClear
              />
            </Form.Item>

            <Form.Item name="role" label="Chức vụ">
              <Select placeholder="Tất cả chức vụ" allowClear>
                <Select.Option value="ADMIN">ADMIN</Select.Option>
                <Select.Option value="STAFF">Nhân viên</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="status" label="Trạng thái">
              <Radio.Group buttonStyle="solid">
                <Radio value={undefined}>Tất cả</Radio>
                <Radio value="ACTIVE">Đang làm việc</Radio>
                <Radio value="INACTIVE">Đã nghỉ</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card
        title={
          <Text strong style={{ fontSize: "16px" }}>
            Danh sách nhân viên ({totalElements})
          </Text>
        }
        extra={
          <Space size="middle">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/employeeAdd")}
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
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "16px",
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

export default EmployeePage;
