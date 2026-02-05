import React, { useEffect, useState } from "react";
import { Table, Button, Card, Input, Space, Tag, Typography, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";

import { fetchVouchersRequest } from "../../../redux/Voucher/voucherSlice";
import type { RootState, AppDispatch } from "../../../redux/store";
import type { Voucher } from "../../../models/Voucher";

const { Text, Title } = Typography;

const VoucherList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    
    // Đảm bảo lấy đúng dữ liệu từ Slice đã hoàn thiện
    const { list, loading, totalElements } = useSelector((state: RootState) => state.voucher);
    
    const [params, setParams] = useState({ page: 0, size: 10, keyword: "" });

    useEffect(() => {
        dispatch(fetchVouchersRequest(params));
    }, [dispatch, params]);

    const columns = [
        {
            title: "Mã Voucher",
            dataIndex: "voucherCode",
            key: "voucherCode",
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: "Tên chương trình",
            dataIndex: "voucherName",
            key: "voucherName",
            ellipsis: true,
        },
        {
            title: "Giảm tối đa",
            dataIndex: "maxDiscountAmount",
            key: "maxDiscountAmount",
            render: (value: number) => value?.toLocaleString("vi-VN") + " đ",
        },
        {
            title: "Thời hạn", // Bổ sung tiêu đề cột bị thiếu
            key: "duration",
            render: (_: any, record: Voucher) => (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    {dayjs(record.startDate).format("DD/MM/YYYY")} - {dayjs(record.endDate).format("DD/MM/YYYY")}
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
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: number) => (
                <Tag color={status === 1 ? "green" : "red"}>
                    {status === 1 ? "Đang chạy" : "Dừng"}
                </Tag>
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
                        icon={<EditOutlined style={{ color: '#1890ff' }} />} 
                        onClick={() => navigate(`/admin/voucher/edit/${record.id}`)} 
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <div style={{ padding: "24px" }}>
            <Card variant="borderless" style={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <Space direction="vertical" size={0}>
                        <Title level={3} style={{ margin: 0 }}>Quản lý Voucher</Title>
                        <Text type="secondary">Phát hành và theo dõi mã giảm giá</Text>
                    </Space>
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<PlusOutlined />} 
                        onClick={() => navigate("/admin/voucher/create")}
                        style={{ borderRadius: '8px' }}
                    >
                        Tạo Voucher mới
                    </Button>
                </div>

                <div style={{ marginBottom: 16, display: 'flex', gap: '10px' }}>
                    <Input
                        placeholder="Tìm kiếm theo mã hoặc tên voucher..."
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        allowClear
                        onPressEnter={(e: any) => setParams({ ...params, keyword: e.target.value, page: 0 })}
                    />
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={() => setParams({ page: 0, size: 10, keyword: "" })} 
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={list}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        total: totalElements,
                        current: params.page + 1,
                        pageSize: params.size,
                        onChange: (page, size) => setParams({ ...params, page: page - 1, size }),
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20', '50'],
                    }}
                />
            </Card>
        </div>
    );
};

export default VoucherList;