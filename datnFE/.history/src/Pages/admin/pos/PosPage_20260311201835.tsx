import React, { useEffect, useState } from "react";
import { Card, Button, Tabs, Table, Row, Col, Typography, message, Tag, Space, Modal } from "antd";
import { PlusOutlined, QrcodeOutlined, DeleteOutlined } from "@ant-design/icons";
import { posApi } from "../../../api/admin/posApi";
import QrScannerModal from "../../../components/QrScannerModal";

const { Title, Text } = Typography;

const PosPage: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [activeKey, setActiveKey] = useState<string>("");
    const [cartDetails, setCartDetails] = useState<any[]>([]);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPendingOrders();
    }, []);

    const fetchPendingOrders = async () => {
        try {
            setLoading(true);
            const res = await posApi.getPendingOrders();
            if (res.data?.data) {
                setOrders(res.data.data);
                if (res.data.data.length > 0 && !activeKey) {
                    setActiveKey(res.data.data[0].id);
                    fetchOrderDetails(res.data.data[0].id);
                }
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi tải danh sách hóa đơn");
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (orderId: string) => {
        try {
            const res = await posApi.getOrderDetails(orderId);
            if (res.data?.data) {
                setCartDetails(res.data.data);
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi tải chi tiết hóa đơn");
        }
    };

    const handleTabChange = (key: string) => {
        setActiveKey(key);
        fetchOrderDetails(key);
    };

    const createNewOrder = async () => {
        try {
            const res = await posApi.createOrder();
            if (res.data?.data) {
                message.success("Tạo Hóa đơn mới thành công");
                fetchPendingOrders();
                setActiveKey(res.data.data.id);
                setCartDetails([]);
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi tạo hóa đơn mới");
        }
    };

    const handleScanSuccess = async (serialNumber: string) => {
        if (!activeKey) {
            message.warning("Vui lòng chọn hoặc tạo hóa đơn trước khi quét.");
            return;
        }
        try {
            const res = await posApi.addSerialToOrder(activeKey, serialNumber);
            if (res.data?.data) {
                message.success(`Đã thêm máy mang mã ${serialNumber} vào hóa đơn.`);
                fetchOrderDetails(activeKey);
                fetchPendingOrders();
            }
        } catch (error: any) {
            console.error(error);
            message.error(error.response?.data?.message || "Lỗi khi quét Serial");
        }
    };

    const handleRemoveSerial = () => {
        // Note: To properly remove, we would need to let the user select a specific serial.
        // For now, in MVP, we just demonstrate cart additions.
        message.info("Tính năng xóa Serial đang phát triển. Vui lòng liên hệ Admin.");
    };

    const handleCheckout = async () => {
        if (!activeKey || cartDetails.length === 0) {
            message.warning("Hóa đơn trống, không thể thanh toán.");
            return;
        }
        try {
            const res = await posApi.checkout(activeKey);
            if (res.data?.data) {
                message.success("Thanh toán thành công! Đã tự động kích hoạt bảo hành điện tử.");
                // Clear finished tabs
                setCartDetails([]);
                fetchPendingOrders();
            }
        } catch (error: any) {
            console.error(error);
            message.error(error.response?.data?.message || "Thanh toán lỗi");
        }
    };

    const activeOrder = orders.find((o) => o.id === activeKey);

    const columns = [
        {
            title: "Sản phẩm",
            dataIndex: ["productDetail", "product", "name"],
            key: "name",
            render: (text: string) => <Text strong>{text || "Máy ảnh Sony/Canon"}</Text>,
        },
        {
            title: "Đơn giá",
            dataIndex: "unitPrice",
            key: "unitPrice",
            render: (price: number) => `${price?.toLocaleString("vi-VN") || 0} đ`,
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
            render: (qty: number) => <Tag color="blue">{qty}</Tag>,
        },
        {
            title: "Thành tiền",
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (price: number) => <Text type="success" strong>{`${price?.toLocaleString("vi-VN") || 0} đ`}</Text>,
        },
        {
            title: "Hành động",
            key: "action",
            render: () => (
                <Button danger type="text" icon={<DeleteOutlined />} onClick={handleRemoveSerial} />
            ),
        },
    ];

    return (
        <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0 }}>Bán Hàng Tại Quầy (POS)</Title>
                <Space>
                    <Button type="primary" icon={<QrcodeOutlined />} onClick={() => setIsScannerOpen(true)}>
                        Quét QR Thêm SP (Camera)
                    </Button>
                    <Button icon={<PlusOutlined />} onClick={createNewOrder}>
                        Tạo Hóa đơn mới
                    </Button>
                </Space>
            </Row>

            <Row gutter={[16, 16]}>
                <Col span={16}>
                    <Card bordered={false} style={{ height: "calc(100vh - 120px)" }}>
                        {orders.length > 0 ? (
                            <Tabs
                                activeKey={activeKey}
                                onChange={handleTabChange}
                                type="editable-card"
                                hideAdd
                                items={orders.map((order, i) => ({
                                    label: `Hóa đơn ${i + 1}`,
                                    key: order.id,
                                    children: (
                                        <Table
                                            dataSource={cartDetails}
                                            columns={columns as any}
                                            rowKey="id"
                                            pagination={false}
                                            bordered
                                        />
                                    ),
                                }))}
                            />
                        ) : (
                            <div style={{ textAlign: "center", padding: "100px 0" }}>
                                <Text type="secondary">Chưa có hóa đơn nào. Vui lòng Tạo hóa đơn mới.</Text>
                            </div>
                        )}
                    </Card>
                </Col>

                <Col span={8}>
                    <Card bordered={false} style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
                        <Title level={4}>Thanh Toán</Title>

                        <div style={{ flex: 1 }}>
                            <Text type="secondary">Khách hàng: Khách lẻ (Bấm quét để thêm)</Text>
                            <br /><br />
                            {activeOrder && (
                                <>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                        <Text>Tổng tiền hàng:</Text>
                                        <Text strong>{activeOrder.totalAmount?.toLocaleString("vi-VN") || 0} đ</Text>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                        <Text>Giảm giá:</Text>
                                        <Text strong>0 đ</Text>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, borderTop: "1px dashed #ccc", paddingTop: 12 }}>
                                        <Title level={4}>Khách cần trả:</Title>
                                        <Title level={4} type="danger">{activeOrder.totalAfterDiscount?.toLocaleString("vi-VN") || 0} đ</Title>
                                    </div>
                                </>
                            )}
                        </div>

                        <Button type="primary" size="large" block onClick={handleCheckout} disabled={!activeOrder}>
                            Xác nhận Thanh toán
                        </Button>
                    </Card>
                </Col>
            </Row>

            <QrScannerModal
                open={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleScanSuccess}
            />
        </div>
    );
};

export default PosPage;
