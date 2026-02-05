import React, { useEffect } from "react";
import { Form, Input, InputNumber, DatePicker, Select, Button, Card, Row, Col, Space, Modal, Typography, Divider, App } from "antd";
import { SaveOutlined, ArrowLeftOutlined, GiftOutlined, CalendarOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";

import type { RootState, AppDispatch } from "../../../redux/store";
import type { VoucherFormValues, VoucherRequest } from "../../../models/Voucher";
import { 
    addVoucherRequest, 
    updateVoucherRequest, 
    getVoucherByIdRequest, 
    resetCurrentVoucher 
} from "../../../redux/Voucher/voucherSlice";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const VoucherForm: React.FC = () => {
    const { notification } = App.useApp();
    const [form] = Form.useForm<VoucherFormValues>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const { loading, currentVoucher } = useSelector((state: RootState) => state.voucher);

    // 1. Khởi tạo dữ liệu: Lấy chi tiết nếu là Edit, Reset nếu là Create
    useEffect(() => {
        if (isEdit && id) {
            dispatch(getVoucherByIdRequest(id));
        } else {
            dispatch(resetCurrentVoucher());
            form.resetFields();
        }
    }, [id, isEdit, dispatch, form]);

    // 2. Đổ dữ liệu từ Store vào Form khi có currentVoucher
    useEffect(() => {
        if (isEdit && currentVoucher) {
            form.setFieldsValue({
                ...currentVoucher,
                // Chuyển đổi timestamp từ Backend sang Dayjs cho RangePicker
                dateRange: [
                    dayjs(currentVoucher.startDate),
                    dayjs(currentVoucher.endDate)
                ]
            });
        }
    }, [currentVoucher, isEdit, form]);

    const onFinish = (values: VoucherFormValues) => {
        Modal.confirm({
            title: isEdit ? "Xác nhận cập nhật" : "Xác nhận tạo mới",
            content: `Bạn có chắc chắn muốn lưu voucher "${values.voucherName}"?`,
            centered: true,
            onOk: () => {
                const { dateRange, ...rest } = values;
                const payload: VoucherRequest = {
                    ...rest,
                    startDate: dateRange ? dateRange[0].valueOf() : null,
                    endDate: dateRange ? dateRange[1].valueOf() : null,
                    id: id,
                };
                
                // Gọi action tương ứng tùy theo chế độ
                const action = isEdit ? updateVoucherRequest : addVoucherRequest;
                
                dispatch(action({ 
                    data: payload, 
                    navigate: () => navigate("/admin/voucher") 
                }));
            },
        });
    };

    return (
        <div style={{ padding: "24px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Space direction="vertical" size={0}>
                    <Title level={3} style={{ margin: 0 }}>{isEdit ? "Chỉnh sửa Voucher" : "Tạo Voucher mới"}</Title>
                    <Text type="secondary">Thiết lập chương trình khuyến mãi cho cửa hàng</Text>
                </Space>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/voucher")}>Quay lại</Button>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">
                <Card variant="borderless" style={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                    <Row gutter={48}>
                        <Col xs={24} lg={12} style={{ borderRight: "1px solid #f0f0f0" }}>
                            <Divider titlePlacement="left"><GiftOutlined /> Thông tin cơ bản</Divider>
                            <Form.Item name="voucherCode" label={<Text strong>Mã Voucher</Text>} rules={[{ required: true, message: "Vui lòng nhập mã" }]}>
                                <Input size="large" placeholder="Ví dụ: TET2026" disabled={isEdit} />
                            </Form.Item>
                            
                            <Form.Item name="voucherName" label={<Text strong>Tên chương trình</Text>} rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                                <Input size="large" placeholder="Ví dụ: Giảm giá Tết Nguyên Đán" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="quantity" label={<Text strong>Số lượng phát hành</Text>} rules={[{ required: true }]}>
                                        <InputNumber size="large" style={{ width: '100%' }} min={1} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="status" label={<Text strong>Trạng thái</Text>} initialValue={1}>
                                        <Select size="large" options={[{ label: "Kích hoạt", value: 1 }, { label: "Tạm dừng", value: 0 }]} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Divider titlePlacement="left"><CalendarOutlined /> Thời gian & Giá trị</Divider>
                            <Form.Item name="dateRange" label={<Text strong>Thời hạn áp dụng</Text>} rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}>
                                <RangePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="maxDiscountAmount" label={<Text strong>Giá trị giảm (VNĐ)</Text>} rules={[{ required: true }]}>
                                        <InputNumber 
                                            size="large" 
                                            style={{ width: '100%' }} 
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="conditions" label={<Text strong>Đơn tối thiểu (VNĐ)</Text>} rules={[{ required: true }]}>
                                        <InputNumber 
                                            size="large" 
                                            style={{ width: '100%' }}
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="note" label={<Text strong>Ghi chú</Text>}>
                                <Input.TextArea rows={4} placeholder="Mô tả chi tiết chương trình..." />
                            </Form.Item>

                            <div style={{ textAlign: "right", marginTop: 24, borderTop: "1px solid #f0f0f0", paddingTop: 20 }}>
                                <Space size="large">
                                    <Button size="large" onClick={() => navigate("/admin/voucher")}>Hủy</Button>
                                    <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={loading} style={{ borderRadius: '8px', minWidth: 150 }}>
                                        {isEdit ? "Cập nhật Voucher" : "Lưu Voucher"}
                                    </Button>
                                </Space>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </Form>
        </div>
    );
};

export default VoucherForm;