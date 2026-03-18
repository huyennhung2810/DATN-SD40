import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  Input,
  Space,
  Tag,
  Tooltip,
  Select,
  message,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import bannerApi from "../../../api/bannerApi";
import type { BannerResponse, BannerSearchParams, CommonStatus } from "../../../models/banner";
import { BANNER_POSITIONS, BANNER_TYPES } from "../../../models/banner";

const { Search } = Input;

const BannerList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<BannerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [params, setParams] = useState<BannerSearchParams>({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
    position: undefined,
    type: undefined,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const searchParams: BannerSearchParams = {
        page: params.page || 0,
        size: params.size || 10,
      };
      
      if (params.keyword && params.keyword.trim()) {
        searchParams.keyword = params.keyword.trim();
      }
      if (params.status) {
        searchParams.status = params.status;
      }
      if (params.position) {
        searchParams.position = params.position;
      }
      if (params.type) {
        searchParams.type = params.type;
      }
      
      const response = await bannerApi.search(searchParams);
      setData(response.data || []);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Error fetching banners:", error);
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

  const handleDelete = async (id: string) => {
    try {
      await bannerApi.delete(id);
      message.success("Xóa banner thành công");
      fetchData();
    } catch (error) {
      message.error("Xóa banner thất bại");
    }
  };

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await bannerApi.updateStatus(id, status);
      message.success("Cập nhật trạng thái thành công");
      fetchData();
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  const getPositionLabel = (value: string) => {
    const pos = BANNER_POSITIONS.find((p) => p.value === value);
    return pos ? pos.label : value;
  };

  const getTypeLabel = (value: string) => {
    const type = BANNER_TYPES.find((t) => t.value === value);
    return type ? type.label : value;
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) => params.page! * params.size! + index + 1,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Vị trí",
      dataIndex: "position",
      key: "position",
      render: (position: string) => getPositionLabel(position),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: string) => getTypeLabel(type),
    },
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 120,
      render: (imageUrl: string) =>
        imageUrl ? (
          <img
            src={imageUrl}
            alt="Banner"
            style={{ width: 100, height: 50, objectFit: "cover" }}
          />
        ) : (
          "-"
        ),
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
      title: "Thứ tự ưu tiên",
      dataIndex: "priority",
      key: "priority",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (createdDate: number) => dayjs(createdDate).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      render: (_: any, record: BannerResponse) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/banners/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title={record.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}>
            {record.status === "ACTIVE" ? (
              <Button
                type="text"
                danger
                icon={<StopOutlined />}
                onClick={() => handleStatusChange(record.id, 0)}
              />
            ) : (
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => handleStatusChange(record.id, 1)}
              />
            )}
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Quản lý Banner"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/banners/create")}
          >
            Thêm Banner
          </Button>
        }
      >
        <Space
          direction="vertical"
          style={{ width: "100%", marginBottom: 16 }}
          size="middle"
        >
          <Space wrap>
            <Search
              placeholder="Tìm kiếm banner..."
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
              placeholder="Lọc theo vị trí"
              allowClear
              style={{ width: 200 }}
              onChange={(value) =>
                setParams({ ...params, position: value, page: 0 })
              }
            >
              {BANNER_POSITIONS.map((pos) => (
                <Select.Option key={pos.value} value={pos.value}>
                  {pos.label}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="Lọc theo loại"
              allowClear
              style={{ width: 150 }}
              onChange={(value) =>
                setParams({ ...params, type: value, page: 0 })
              }
            >
              {BANNER_TYPES.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  {type.label}
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
            showTotal: (total) => `Tổng ${total} banner`,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default BannerList;
