import * as React from "react";
const { useEffect, useState } = React;
import { Card, Button, Tabs, Table, Row, Col, Typography, message, Tag, Space, Input, Modal, InputNumber, Select } from "antd";
import { PlusOutlined, DeleteOutlined, ScanOutlined, SearchOutlined, ShoppingCartOutlined, CheckCircleOutlined, PrinterOutlined, UserOutlined } from "@ant-design/icons";
import { posApi } from "../../../api/admin/posApi";
import { productDetailApi } from "../../../api/productDetailApi";
import { customerApi } from "../../../api/customerApi";
import SerialAssignmentModal from "../../../components/SerialAssignmentModal";

const { Title, Text } = Typography;

const PosPage: React.FC = () => {
    // Orders / Cart State
    const [orders, setOrders] = useState<any[]>([]);
    const [activeKey, setActiveKey] = useState<string>("");
    const [cartDetails, setCartDetails] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Products State
    const [products, setProducts] = useState<any[]>([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Payment State
    const [customerCash, setCustomerCash] = useState<number | null>(null);
    const [checkoutSuccessModal, setCheckoutSuccessModal] = useState<{ open: boolean; orderCode: string; totalAmount: number; change: number }>({ open: false, orderCode: "", totalAmount: 0, change: 0 });

    // Customer Selection State
    const [customerOptions, setCustomerOptions] = useState<{ value: string; label: string }[]>([]);
    const [fetchingCustomer, setFetchingCustomer] = useState(false);

    // Assign Serial Modal State
    const [assignModal, setAssignModal] = useState<{
        open: boolean;
        orderId: string;
        detailId: string;
        productName: string;
        requiredQty: number;
    }>({ open: false, orderId: "", detailId: "", productName: "", requiredQty: 0 });

    useEffect(() => {
        fetchPendingOrders();
        fetchProducts();
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
                } else if (res.data.data.length === 0) {
                    setActiveKey("");
                    setCartDetails([]);
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

    const fetchProducts = async (keyword = "") => {
        try {
            setLoadingProducts(true);
            const res: any = await productDetailApi.getAll({ keyword, page: 0, size: 50 });
            // Accommodate generic PageResponse structures
            const productList = res?.content || res?.data || res || [];
            if (Array.isArray(productList)) {
                setProducts(productList);
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi tải danh sách sản phẩm");
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleTabChange = (key: string) => {
        setActiveKey(key);
        fetchOrderDetails(key);
        setCustomerCash(null); // Reset cash input when switching tabs
    };

    const handleTabEdit = (targetKey: any, action: 'add' | 'remove') => {
        if (action === 'remove') {
            handleCancelOrder(targetKey as string);
        }
    };

    const handleCancelOrder = (orderId: string) => {
        Modal.confirm({
            title: "Xác nhận hủy hóa đơn",
            content: "Bạn có chắc chắn muốn hủy và xóa hóa đơn đang chờ này? Các Serial đã gán sẽ được trả lại kho.",
            okText: "Đồng ý",
            okType: "danger",
            cancelText: "Không",
            onOk: async () => {
                try {
                    await posApi.cancelOrder(orderId);
                    message.success("Đã hủy hóa đơn thành công");
                    if (activeKey === orderId) {
                        setActiveKey("");
                        setCartDetails([]);
                    }
                    fetchPendingOrders();
                } catch (error) {
                    message.error("Lỗi khi hủy hóa đơn");
                }
            }
        });
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

    const handleAddProductToCart = async (productDetailId: string) => {
        if (!activeKey) {
            message.warning("Vui lòng chọn hoặc tạo hóa đơn trước khi thêm sản phẩm.");
            return;
        }

        try {
            await posApi.addProductToOrder(activeKey, productDetailId, 1);
            message.success("Đã thêm sản phẩm vào giỏ");
            fetchOrderDetails(activeKey);
            fetchPendingOrders();
        } catch (error: any) {
            console.error(error);
            message.error(error.response?.data?.message || "Lỗi khi thêm sản phẩm");
        }
    };

    const handleSearchCustomer = async (value: string) => {
        if (!value) {
            setCustomerOptions([]);
            return;
        }
        setFetchingCustomer(true);
        try {
            const res = await customerApi.getAll({ keyword: value, page: 0, size: 20 });
            if (res && res.data) {
                const opts = res.data.map((c: any) => ({
                    value: c.id,
                    label: `${c.name || "Khách"} - ${c.phoneNumber || "N/A"}`
                }));
                setCustomerOptions(opts);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setFetchingCustomer(false);
        }
    };

    const handleSelectCustomer = async (customerId: string) => {
        if (!activeKey) return;
        try {
            await posApi.setCustomer(activeKey, customerId);
            message.success("Đã cập nhật khách hàng cho hóa đơn");
            fetchPendingOrders();
        } catch (error) {
            message.error("Lỗi khi thêm khách hàng");
            console.error(error);
        }
    };


    const handleRemoveProduct = async (detailId: string) => {
        if (!activeKey) return;
        try {
            await posApi.removeProductFromOrder(activeKey, detailId);
            message.success("Đã xóa sản phẩm khỏi giỏ");
            fetchOrderDetails(activeKey);
            fetchPendingOrders();
        } catch (error: any) {
            message.error("Lỗi khi xóa sản phẩm");
        }
    };

    const handleCheckout = async () => {
        if (!activeKey || cartDetails.length === 0) {
            message.warning("Hóa đơn trống, không thể thanh toán.");
            return;
        }

        const totalToPay = activeOrder?.totalAfterDiscount || 0;
        if (customerCash === null) {
            message.error("Vui lòng nhập số tiền khách đưa trước khi thanh toán!");
            return;
        }
        if (customerCash < totalToPay) {
            message.error("Số tiền khách đưa không đủ!");
            return;
        }

        const isMissingSerials = cartDetails.some(d => (d.assignedSerialsCount || 0) < d.quantity);
        if (isMissingSerials) {
            message.error("Vui lòng gán ĐẦY ĐỦ số lượng Serial cho tất cả các sản phẩm trước khi thanh toán.");
            return;
        }

        try {
            const res = await posApi.checkout(activeKey);
            if (res.data?.data) {
                const changeAmount = customerCash !== null ? customerCash - totalToPay : 0;
                setCheckoutSuccessModal({
                    open: true,
                    orderCode: activeOrder.code,
                    totalAmount: totalToPay,
                    change: changeAmount > 0 ? changeAmount : 0
                });

                fetchPendingOrders(); // will refresh and remove completed order from tabs
            }
        } catch (error: any) {
            console.error(error);
            message.error(error.response?.data?.message || "Thanh toán lỗi. Hãy kiểm tra lại.");
        }
    };

    const activeOrder = orders.find((o) => o.id === activeKey);

    const cartColumns = [
        {
            title: "Sản phẩm",
            key: "product",
            render: (_: any, record: any) => {
                const name = record.productDetail?.product?.name;
                const ver = record.productDetail?.version;
                const color = record.productDetail?.color?.name;
                return <Text strong>{`${name || "Sản phẩm"} ${ver ? `(${ver})` : ''} - ${color || ''}`}</Text>;
            },
        },
        {
            title: "Đơn giá",
            key: "unitPrice",
            render: (_: any, record: any) => {
                const original = record.productDetail?.originalPrice;
                const current = record.unitPrice;
                const hasDiscount = original && original > current;
                return (
                    <Space direction="vertical" size={0}>
                        {hasDiscount && (
                            <Text delete type="secondary" style={{ fontSize: '10px' }}>
                                {original.toLocaleString("vi-VN")} đ
                            </Text>
                        )}
                        <Text strong style={{ color: hasDiscount ? '#f5222d' : undefined }}>
                            {current?.toLocaleString("vi-VN") || 0} đ
                        </Text>
                    </Space>
                );
            }
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            align: "center" as const,
            render: (qty: number) => <Tag color="blue">{qty}</Tag>,
        },
        {
            title: "Thành tiền",
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (price: number) => <Text type="success" strong>{`${price?.toLocaleString("vi-VN") || 0} đ`}</Text>,
        },
        {
            title: "Serial",
            key: "serial",
            align: "center" as const,
            render: (_: any, record: any) => {
                const assigned = record.assignedSerialsCount || 0;
                const req = record.quantity || 0;
                const isComplete = assigned === req;
                return (
                    <Space direction="vertical" size="small">
                        {isComplete ? (
                            <Tag color="success">Đã gán đủ {assigned}/{req}</Tag>
                        ) : (
                            <Tag color="warning">Đã gán {assigned}/{req}</Tag>
                        )}
                        <Button
                            type={isComplete ? "default" : "primary"}
                            danger={!isComplete}
                            size="small"
                            icon={<ScanOutlined />}
                            onClick={() => setAssignModal({
                                open: true,
                                orderId: activeKey,
                                detailId: record.id,
                                productName: record.productDetail?.product?.name || "Sản phẩm",
                                requiredQty: record.quantity
                            })}
                        >
                            {isComplete ? "Sửa Serial" : "Chọn Serial"}
                        </Button>
                    </Space>
                );
            }
        },
        {
            title: "Xóa",
            key: "action",
            align: "center" as const,
            render: (_: any, record: any) => (
                <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleRemoveProduct(record.id)} />
            ),
        },
    ];

    const productColumns = [
        {
            title: "Tên SP",
            key: "name",
            render: (_: any, record: any) => <Text strong>{record.product?.name}</Text>,
        },
        {
            title: "Màu sắc",
            dataIndex: ["color", "name"],
            key: "color",
        },
        {
            title: "Phiên bản",
            dataIndex: "version",
            key: "version",
        },
        {
            title: "Tồn kho",
            dataIndex: "quantity",
            key: "quantity",
            align: "center" as const,
        },
        {
            title: "Giá bán",
            key: "price",
            render: (_: any, record: any) => {
                const original = record.salePrice;
                const current = record.discountedPrice;
                const hasDiscount = current && current < original;
                return (
                    <Space direction="vertical" size={0}>
                        {hasDiscount && (
                            <Text delete type="secondary" style={{ fontSize: '11px' }}>
                                {original?.toLocaleString("vi-VN")} đ
                            </Text>
                        )}
                        <Text type={hasDiscount ? "danger" : undefined} strong>
                            {(current || original)?.toLocaleString("vi-VN")} đ
                        </Text>
                        {hasDiscount && <Tag color="red" style={{ fontSize: '9px', margin: 0 }}>GIẢM GIÁ</Tag>}
                    </Space>
                );
            }
        },
        {
            title: "Hành động",
            key: "action",
            align: "center" as const,
            render: (_: any, record: any) => (
                <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    disabled={record.quantity === 0}
                    onClick={() => handleAddProductToCart(record.id)}
                >
                    Thêm
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0 }}>Bán Hàng Tại Quầy (POS)</Title>
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={createNewOrder}>
                    Tạo Hóa đơn Mới
                </Button>
            </Row>

            <Row gutter={[16, 16]}>
                {/* Left Column: Cart (Top) & Product List (Bottom) */}
                <Col span={16} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* KHU VỰC 2: GIỎ HÀNG */}
                    <Card title="Giỏ Hàng (Các Hóa đơn)" bordered={false} style={{ flex: 1, minHeight: '350px' }}>
                        {orders.length > 0 ? (
                            <Tabs
                                activeKey={activeKey}
                                onChange={handleTabChange}
                                type="editable-card"
                                hideAdd
                                onEdit={handleTabEdit}
                                items={orders.map((order, i) => ({
                                    label: `HĐ ${order.code || order.id.substring(0, 5)}`,
                                    key: order.id,
                                    children: (
                                        <Table
                                            dataSource={cartDetails}
                                            columns={cartColumns as any}
                                            rowKey="id"
                                            pagination={false}
                                            loading={loading}
                                            bordered
                                            size="small"
                                        />
                                    ),
                                }))}
                            />
                        ) : (
                            <div style={{ textAlign: "center", padding: "50px 0" }}>
                                <Text type="secondary">Chưa có hóa đơn nào. Vui lòng Bấm "Tạo Hóa đơn Mới".</Text>
                            </div>
                        )}
                    </Card>

                    {/* KHU VỰC 1: TÌM KIẾM SẢN PHẨM */}
                    <Card title="Tìm kiếm Kho Hàng" bordered={false} style={{ flex: 1 }}>
                        <Input
                            placeholder="Nhập tên máy ảnh, dòng máy..."
                            size="large"
                            suffix={<SearchOutlined />}
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onPressEnter={() => fetchProducts(searchKeyword)}
                            style={{ marginBottom: 16 }}
                        />
                        <Table
                            loading={loadingProducts}
                            dataSource={products}
                            columns={productColumns}
                            rowKey="id"
                            size="small"
                            pagination={{ pageSize: 5 }}
                        />
                    </Card>
                </Col>

                {/* KHU VỰC 3: THANH TOÁN */}
                <Col span={8}>
                    <Card bordered={false} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                        <Title level={4}>Thanh Toán</Title>

                        <div style={{ flex: 1, marginTop: 16 }}>
                            <div style={{ marginBottom: 16 }}>
                                <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>Khách hàng:</Text>
                                <Select
                                    showSearch
                                    placeholder={activeOrder && activeOrder.customer ? `${activeOrder.customer.name} - ${activeOrder.customer.phoneNumber}` : "Chọn khách hàng (Có thể để trống)"}
                                    style={{ width: "100%" }}
                                    allowClear
                                    onSearch={handleSearchCustomer}
                                    onChange={handleSelectCustomer}
                                    filterOption={false}
                                    options={customerOptions}
                                    loading={fetchingCustomer}
                                    suffixIcon={<UserOutlined />}
                                    notFoundContent={fetchingCustomer ? null : <Text type="secondary">Không tìm thấy KH</Text>}
                                />
                            </div>
                            {activeOrder ? (
                                <>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                                        <Text>Mã Hóa Đơn:</Text>
                                        <Text strong>{activeOrder.code}</Text>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                        <Text>Tổng tiền hàng:</Text>
                                        <Text strong>{activeOrder.totalAmount?.toLocaleString("vi-VN") || 0} đ</Text>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                        <Text>Giảm giá tự động:</Text>
                                        <Text strong type="success">
                                            {((activeOrder.totalAmount || 0) - (activeOrder.totalAfterDiscount || 0)).toLocaleString("vi-VN")} đ
                                        </Text>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, borderTop: "1px dashed #ccc", paddingTop: 16 }}>
                                        <Title level={4} style={{ margin: 0 }}>Khách cần trả:</Title>
                                        <Title level={4} type="danger" style={{ margin: 0 }}>
                                            {activeOrder.totalAfterDiscount?.toLocaleString("vi-VN") || 0} đ
                                        </Title>
                                    </div>
                                    <div style={{ marginBottom: 16 }}>
                                        <Text strong>Tiền khách đưa:</Text>
                                        <InputNumber
                                            style={{ width: '100%', marginTop: 8 }}
                                            size="large"
                                            value={customerCash}
                                            onChange={(val) => setCustomerCash(val as number)}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                            addonAfter="đ"
                                            placeholder="Nhập số tiền..."
                                        />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                                        <Text>Tiền thối lại:</Text>
                                        {(customerCash !== null && customerCash >= (activeOrder.totalAfterDiscount || 0)) ? (
                                            <Text strong type="success">
                                                {(customerCash - (activeOrder.totalAfterDiscount || 0)).toLocaleString("vi-VN")} đ
                                            </Text>
                                        ) : (
                                            <Text strong type={customerCash !== null ? "danger" : "secondary"}>
                                                {customerCash !== null ? "Khách đưa thiếu tiền" : "0 đ"}
                                            </Text>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <Text type="secondary">Chọn hóa đơn để xem thông tin thanh toán</Text>
                            )}
                        </div>

                        <Button
                            type="primary"
                            size="large"
                            style={{ background: '#52c41a' }}
                            block
                            onClick={handleCheckout}
                            disabled={
                                !activeOrder ||
                                cartDetails.length === 0 ||
                                cartDetails.some(d => (d.assignedSerialsCount || 0) < d.quantity) ||
                                customerCash === null ||
                                customerCash < (activeOrder.totalAfterDiscount || 0)
                            }
                        >
                            Xác nhận Thanh toán
                        </Button>
                    </Card>
                </Col>
            </Row>

            <SerialAssignmentModal
                open={assignModal.open}
                onClose={() => setAssignModal({ ...assignModal, open: false })}
                orderId={assignModal.orderId}
                detailId={assignModal.detailId}
                productName={assignModal.productName}
                requiredQuantity={assignModal.requiredQty}
                onSuccess={() => fetchOrderDetails(activeKey)}
            />

            {/* Thanh toán thành công Modal */}
            <Modal
                title={null}
                footer={null}
                closable={false}
                open={checkoutSuccessModal.open}
                centered
            >
                <div style={{ textAlign: 'center', padding: '30px 10px 10px' }}>
                    <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />
                    <Title level={3}>Thanh Toán Thành Công!</Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>Khách hàng đã thanh toán cho hóa đơn</Text>
                    <div style={{ margin: '24px 0', padding: '16px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8 }}>
                        <Row justify="space-between" style={{ marginBottom: 8 }}>
                            <Text>Mã đơn hàng:</Text>
                            <Text strong>{checkoutSuccessModal.orderCode}</Text>
                        </Row>
                        <Row justify="space-between" style={{ marginBottom: 8 }}>
                            <Text>Tổng tiền:</Text>
                            <Text strong>{checkoutSuccessModal.totalAmount.toLocaleString('vi-VN')} đ</Text>
                        </Row>
                        <Row justify="space-between">
                            <Text>Tiền thối lại:</Text>
                            <Text type="danger" strong>{checkoutSuccessModal.change.toLocaleString('vi-VN')} đ</Text>
                        </Row>
                    </div>
                    <Space size="middle" style={{ marginTop: 16 }}>
                        <Button
                            icon={<PrinterOutlined />}
                            size="large"
                            onClick={() => message.info('Tính năng in hóa đơn đang phát triển')}
                        >
                            In hóa đơn
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => {
                                setCheckoutSuccessModal({ ...checkoutSuccessModal, open: false });
                                setCustomerCash(null);
                            }}
                        >
                            Đóng & Bắt đầu đơn mới
                        </Button>
                    </Space>
                </div>
            </Modal>
        </div>
    );
};

export default PosPage;
