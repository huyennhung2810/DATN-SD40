import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Image,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import bannerApi from "../../../api/bannerApi";
import type { BannerResponse, BannerSearchRequest } from "../../../models/banner";
import {
  BannerPosition,
  BannerPositionLabel,
  EntityStatus,
  EntityStatusLabel,
} from "../../../models/banner";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const BannerList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BannerResponse[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<BannerSearchRequest>({
    page: 0,
    size: 10,
    sortBy: "priority",
    sortDirection: "ASC",
  });
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<EntityStatus | undefined>();
  const [positionFilter, setPositionFilter] = useState<BannerPosition | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: BannerSearchRequest = {
        ...filters,
        keyword: searchText || undefined,
        status: statusFilter,
        position: positionFilter,
        startDateFrom: dateRange?.[0]?.toISOString(),
        startDateTo: dateRange?.[1]?.toISOString(),
      };
      const response = await bannerApi.search(params);
      setData(response.data);
      setPagination({
        current: response.currentPage + 1,
        pageSize: response.totalElements / response.totalPages || 10,
        total: response.totalElements,
      });
    } catch (error) {
      message.error("Lỗi khi tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleTableChange = (paginationConfig: any) => {
    setFilters({
      ...filters,
      page: paginationConfig.current - 1,
      size: paginationConfig.pageSize,
    });
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 0 });
    fetchData();
  };

  const handleReset = () => {
    setSearchText("");
    setStatusFilter(undefined);
    setPositionFilter(undefined);
    setDateRange([null, null]);
    setFilters({
      page: 0,
      size: 10,
      sortBy: "priority",
      sortDirection: "ASC",
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await bannerApi.delete(id);
      message.success("Xóa banner thành công");
      fetchData();
    } catch (error) {
      message.error("Lỗi khi xóa banner");
    }
  };

  const handleChangeStatus = async (id: string, status: EntityStatus) => {
    try {
      const newStatus = status === EntityStatus.ACTIVE ? EntityStatus.INACTIVE : EntityStatus.ACTIVE;
      await bannerApi.changeStatus(id, newStatus);
      message.success("Đổi trạng thái thành công");
      fetchData();
    } catch (error) {
      message.error("Lỗi khi đổi trạng thái");
    }
  };

  const columns: ColumnsType<BannerResponse> = [
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 100,
      render: (imageUrl: string) => (
        <Image
          src={imageUrl}
          alt="Banner"
          width={80}
          height={60}
          style={{ objectFit: "cover", borderRadius: 4 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Vị trí",
      dataIndex: "position",
      key: "position",
      width: 150,
      render: (position: BannerPosition) => (
        <Tag color="blue">{BannerPositionLabel[position]}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: EntityStatus) => (
        <Tag color={status === EntityStatus.ACTIVE ? "green" : "red"}>
          {EntityStatusLabel[status]}
        </Tag>
      ),
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 80,
      sorter: true,
    },
    {
      title: "Thời gian hiển thị",
      key: "displayTime",
      width: 200,
      render: (_: any, record: BannerResponse) => (
        <div>
          {record.startAt && (
            <Text type="secondary">
              {dayjs(record.startAt).format("DD/MM/YYYY")}
            </Text>
          )}
          {record.startAt && record.endAt && " - "}
          {record.endAt && (
            <Text type="secondary">
              {dayjs(record.endAt).format("DD/MM/YYYY")}
            </Text>
          )}
          {!record.startAt && !record.endAt && (
            <Text type="secondary">Luôn hiển thị</Text>
          )}
        </div>
      ),
    },
    {
      title: "Link",
      dataIndex: "linkUrl",
      key: "linkUrl",
      width: 150,
      ellipsis: true,
      render: (linkUrl: string) =>
        linkUrl ? (
          <a href={linkUrl} target="_blank" rel="noopener noreferrer">
            {linkUrl}
          </a>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "lastModifiedDate",
      key: "lastModifiedDate",
      width: 150,
      render: (date: string) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_: any, record: BannerResponse) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/banners/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/banners/${record.id}/edit`)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa banner này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="banner-list-page">
      <Card>
        <div className="page-header">
          <Title level={3}>Quản lý Banner</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/banners/create")}
          >
            Thêm mới Banner
          </Button>
        </div>

        <div className="filter-section">
          <Space wrap>
            <Input
              placeholder="Tìm kiếm theo tiêu đề..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: 150 }}
            >
              <Select.Option value={EntityStatus.ACTIVE}>
                Hoạt động
              </Select.Option>
              <Select.Option value={EntityStatus.INACTIVE}>
                Không hoạt động
              </Select.Option>
            </Select>
            <Select
              placeholder="Vị trí"
              value={positionFilter}
              onChange={setPositionFilter}
              allowClear
              style={{ width: 180 }}
            >
              {Object.values(BannerPosition).map((pos) => (
                <Select.Option key={pos} value={pos}>
                  {BannerPositionLabel[pos]}
                </Select.Option>
              ))}
            </Select>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as any)}
              format="DD/MM/YYYY"
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
            <Button onClick={handleReset}>Đặt lại</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} banner`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      <style>{`
        .banner-list-page {
          padding: 24px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .page-header h3 {
          margin: 0 !important;
        }
        .filter-section {
          margin-bottom: 24px;
          padding: 16px;
          background: #fafafa;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default BannerList;
