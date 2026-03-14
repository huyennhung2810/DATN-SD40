import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  Radio,
  Tag,
  Badge,
  message,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs, { Dayjs } from "dayjs";
import CustomerSelectModal from "./CustomerSelectModal";
import { voucherApi } from "../../../api/voucherApi";

import type { RootState, AppDispatch } from "../../../redux/store";
import type {
  VoucherFormValues,
  VoucherRequest,
} from "../../../models/Voucher";
import {
  addVoucherRequest,
  updateVoucherRequest,
  getVoucherByIdRequest,
  resetCurrentVoucher,
} from "../../../redux/Voucher/voucherSlice";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
// Helper function để hiển thị tag trạng thái
const getStatusTag = (status: number) => {
  switch (status) {
    case 0:
      return <Tag color="default">Buộc dừng</Tag>;
    case 1:
      return <Tag color="blue">Sắp diễn ra</Tag>;
    case 2:
      return <Tag color="success">Đang diễn ra</Tag>;
    case 3:
      return <Tag color="error">Đã kết thúc</Tag>;
    default:
      return <Tag>Không xác định</Tag>;
  }
};

const VoucherForm: React.FC = () => {
  const [form] = Form.useForm<VoucherFormValues>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { loading, currentVoucher } = useSelector(
    (state: RootState) => state.voucher,
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const voucherTypeWatch = Form.useWatch("voucherType", form);
  const discountUnit = Form.useWatch("discountUnit", form);

  // --- HÀM XỬ LÝ CẬP NHẬT TRẠNG THÁI DETAIL (Vô hiệu hóa khách hàng) ---
  const handleUpdateDetailStatus = async (
    detailId: string,
    status: number,
    reason: string,
  ) => {
    try {
      // Gọi trực tiếp API
      await voucherApi.updateDetailStatus(detailId, { status, reason });
      message.success("Cập nhật trạng thái khách hàng thành công");

      // Sau khi cập nhật thành công, load lại dữ liệu Voucher để đồng bộ số lượng
      if (id) {
        dispatch(getVoucherByIdRequest(id));
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể cập nhật trạng thái");
    }
  };

  // Logic tính toán số lượng Quantity hiển thị
  useEffect(() => {
    if (voucherTypeWatch === "INDIVIDUAL") {
      if (isEdit && currentVoucher) {
        const details: any[] = (currentVoucher as any).details || [];
        const existingUnusedCount = details.filter(
          (d) =>
            selectedCustomerIds.includes(d.customer?.id) && d.usageStatus === 0,
        ).length;

        const oldIds = details.map((d) => d.customer?.id);
        const newAddedCount = selectedCustomerIds.filter(
          (cid) => !oldIds.includes(cid),
        ).length;

        form.setFieldsValue({ quantity: existingUnusedCount + newAddedCount });
      } else {
        form.setFieldsValue({ quantity: selectedCustomerIds.length });
      }
    }
  }, [selectedCustomerIds, voucherTypeWatch, isEdit, currentVoucher, form]);

  // Load dữ liệu khi vào trang
  useEffect(() => {
    if (isEdit && id) {
      dispatch(getVoucherByIdRequest(id));
    } else {
      dispatch(resetCurrentVoucher());
      form.resetFields();
      setSelectedCustomerIds([]);
    }
  }, [id, isEdit, dispatch]);

  // Đổ dữ liệu vào form khi currentVoucher thay đổi
  useEffect(() => {
    if (isEdit && currentVoucher) {
      form.setFieldsValue({
        ...currentVoucher,
        dateRange: [
          dayjs(currentVoucher.startDate),
          dayjs(currentVoucher.endDate),
        ],
      });

      if (currentVoucher.voucherType === "INDIVIDUAL") {
        const details = (currentVoucher as any).details || [];
        const oldIds = details.map((d: any) => d.customer?.id).filter(Boolean);
        setSelectedCustomerIds(oldIds);
      }
    }
  }, [currentVoucher, isEdit, form]);

  const onFinish = async (values: VoucherFormValues) => {
    if (loading) return;
    const { dateRange, ...rest } = values;
    const payload: VoucherRequest = {
      ...rest,
      startDate: dateRange ? dateRange[0].valueOf() : null,
      endDate: dateRange ? dateRange[1].valueOf() : null,
      id: id,
      customerIds:
        values.voucherType === "INDIVIDUAL" ? selectedCustomerIds : [],
      lastModifiedBy: localStorage.getItem("employeeCode") || "Nhung",
      createdBy: localStorage.getItem("employeeCode") || "Nhung",
    };

    const action = isEdit ? updateVoucherRequest : addVoucherRequest;
    dispatch(action({ data: payload, navigate: () => navigate("/voucher") }));
  };

  const disabledDate = (current: Dayjs) =>
    current && current < dayjs().startOf("day");
  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space direction="vertical" size={0}>
          <Title level={3} style={{ margin: 0 }}>
            {isEdit ? "Chỉnh sửa Voucher" : "Tạo Voucher mới"}
            {isEdit && currentVoucher && (
              <span style={{ marginLeft: 12 }}>
                {getStatusTag(currentVoucher.status)}
              </span>
            )}
          </Title>
          <Text type="secondary">
            Cấu hình đối tượng áp dụng và hình thức giảm giá
          </Text>
        </Space>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/voucher")}
        >
          Quay lại
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        initialValues={{
          voucherType: "ALL",
          discountUnit: "PERCENT",
          status: 1,
        }}
      >
        <Card
          variant="borderless"
          style={{
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <Row gutter={48}>
            {/* CỘT TRÁI */}
            <Col xs={24} lg={12} style={{ borderRight: "1px solid #f0f0f0" }}>
              <Divider titlePlacement="left">
                <UsergroupAddOutlined /> Thông tin cơ bản
              </Divider>

              <Form.Item
                name="voucherType"
                label={<Text strong>Đối tượng áp dụng</Text>}
              >
                <Radio.Group
                  buttonStyle="solid"
                  style={{ width: "100%" }}
                  disabled={isEdit}
                >
                  <Radio.Button
                    value="ALL"
                    style={{ width: "50%", textAlign: "center" }}
                  >
                    Tất cả
                  </Radio.Button>

                  <Radio.Button
                    value="INDIVIDUAL"
                    style={{ width: "50%", textAlign: "center" }}
                  >
                    Cá nhân
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

           
              {voucherTypeWatch === "INDIVIDUAL" && (
                <div
                  style={{
                    marginBottom: 24,
                    padding: "16px 20px",
                    backgroundColor: "#fafafa", 
                    borderRadius: "8px",
                    border: "1px solid #d9d9d9", 
                  }}
                >
                  <Space direction="vertical" style={{ width: "100%" }} size="middle">
                    <Text type="secondary" italic>
                      * Voucher này sẽ chỉ áp dụng cho danh sách khách hàng được chọn bên dưới.
                    </Text>
                    
                    <Space size="middle" align="center">
                      <Button
                        type="primary"
                    
                        icon={<UsergroupAddOutlined />}
                        onClick={() => setIsModalVisible(true)}
                      >
                        Chọn danh sách khách hàng
                      </Button>

                      {selectedCustomerIds.length > 0 && (
                        <Tag 
                          color="success" 
                          style={{ margin: 0, padding: "4px 12px", fontSize: "14px", borderRadius: "4px" }}
                        >
                          Đã chọn: <b>{selectedCustomerIds.length}</b> khách hàng
                        </Tag>
                      )}
                    </Space>
                  </Space>
                </div>
              )}
              <Form.Item
                name="code"
                label={<Text strong>Mã Voucher</Text>}
                rules={[
                  { required: true, message: "Vui lòng nhập mã" },
                  {
                    validator: async (_, value) => {
                      // Chỉ kiểm tra khi tạo mới và có nhập giá trị
                      if (isEdit || !value || value.trim() === "")
                        return Promise.resolve();

                      try {
                        // Gọi hàm bạn vừa đồng bộ vào class api
                        const response =
                          await voucherApi.checkCodeExists(value);

                        // Kiểm tra kết quả trả về từ Backend (thường là true/false)
                        if (response.data === true) {
                          return Promise.reject(
                            new Error(
                              "Mã voucher này đã tồn tại trên hệ thống!",
                            ),
                          );
                        }
                        return Promise.resolve();
                      } catch (error) {
                        // Nếu lỗi API (404, 500...), tạm thời cho qua hoặc log lỗi
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
                validateTrigger="onBlur" // Tối ưu: Chỉ check khi người dùng rời khỏi ô nhập
              >
                <Input
                  size="large"
                  placeholder="Ví dụ: TET2026"
                  disabled={isEdit}
                />
              </Form.Item>

              <Form.Item
                name="name"
                label={<Text strong>Tên chương trình</Text>}
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input size="large" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="quantity"
                    label={<Text strong>Số lượng</Text>}
                    rules={[
                      { required: true, message: "Vui lòng nhập số lượng" },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      style={{ width: "100%" }}
                      min={1}
                      disabled={voucherTypeWatch === "INDIVIDUAL"}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label={<Text strong>Chế độ vận hành</Text>}
                    initialValue={1}
                    // Đảm bảo khi load dữ liệu 2, 3 từ BE nó vẫn hiển thị là "Cho phép hoạt động"
                    getValueProps={(value) => ({
                      value: value === 2 || value === 3 || value === 1 ? 1 : 0,
                    })}
                  >
                    <Select size="large">
                      {/* Nếu chọn 1: Backend sẽ dựa vào ngày tháng để tính ra 1, 2 hoặc 3 */}
                      <Select.Option value={1}>
                        <Badge
                          status="processing"
                          text="Cho phép hoạt động theo lịch"
                        />
                      </Select.Option>

                      {/* Nếu chọn 0: Backend sẽ ép về 0 (Buộc dừng) */}
                      <Select.Option value={0}>
                        <Badge
                          status="error"
                          text="Tạm dừng (Buộc dừng ngay lập tức)"
                        />
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            {/* CỘT PHẢI */}
            <Col xs={24} lg={12}>
              <Divider titlePlacement="left">
                <CalendarOutlined /> Hình thức & Thời hạn
              </Divider>

              <Form.Item
                name="discountUnit"
                label={<Text strong>Hình thức giảm</Text>}
              >
                <Radio.Group
                  buttonStyle="solid"
                  style={{ width: "100%" }}
                  onChange={(e) => {
                    // BƯỚC 1: Bắt sự kiện khi đổi Radio. Nếu chọn VND, copy ngay giá trị giảm hiện tại sang ô Giảm tối đa
                    if (e.target.value === "VND") {
                      const currentVal = form.getFieldValue("discountValue");
                      form.setFieldValue("maxDiscountAmount", currentVal);
                    }
                  }}
                >
                  <Radio.Button
                    value="PERCENT"
                    style={{ width: "50%", textAlign: "center" }}
                  >
                    Phần trăm (%)
                  </Radio.Button>
                  <Radio.Button
                    value="VND"
                    style={{ width: "50%", textAlign: "center" }}
                  >
                    Số tiền (VND)
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="discountValue"
                    label={<Text strong>Giá trị giảm</Text>}
                    rules={[
                      { required: true, message: "Vui lòng nhập giá trị giảm" },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      style={{ width: "100%" }}
                      min={0}
                      max={discountUnit === "PERCENT" ? 100 : undefined}
                      formatter={(value) =>
                        discountUnit === "VND"
                          ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          : `${value}`
                      }
                      parser={(value) =>
                        Number(value!.replace(/\$\s?|(,*)/g, "")) as any
                      }
                      addonAfter={discountUnit === "PERCENT" ? "%" : "VND"}
                      onChange={(val) => {
                        // BƯỚC 2: Nếu đang chọn VND mà người dùng gõ thay đổi giá trị, ô Giảm tối đa cũng chạy theo thời gian thực
                        if (form.getFieldValue("discountUnit") === "VND") {
                          form.setFieldValue("maxDiscountAmount", val);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="maxDiscountAmount"
                    label={<Text strong>Giảm tối đa (VNĐ)</Text>}
                    dependencies={["conditions"]} // THÊM DÒNG NÀY: Để tự động check lại khi Đơn tối thiểu thay đổi
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số tiền giảm tối đa",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const conditions = getFieldValue("conditions");
                          if (
                            value !== undefined &&
                            value !== null &&
                            conditions !== undefined &&
                            conditions !== null &&
                            Number(value) > Number(conditions)
                          ) {
                            return Promise.reject(
                              new Error("Không được lớn hơn đơn tối thiểu!"),
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <InputNumber
                      size="large"
                      style={{ width: "100%" }}
                      min={0}
                      placeholder="0"
                      addonAfter="VND" // Thay thế Space.Compact + Button bằng cái này
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) =>
                        value!.replace(/\$\s?|(,*)/g, "") as any
                      }
                      disabled={discountUnit === "VND"}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="conditions"
                    label={<Text strong>Đơn tối thiểu (VNĐ)</Text>}
                    dependencies={["maxDiscountAmount"]}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập giá trị tối thiểu",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const maxDiscountAmount =
                            getFieldValue("maxDiscountAmount");
                          if (
                            value !== undefined &&
                            value !== null &&
                            maxDiscountAmount !== undefined &&
                            maxDiscountAmount !== null &&
                            Number(value) < Number(maxDiscountAmount)
                          ) {
                            return Promise.reject(
                              new Error(
                                "Đơn tối thiểu không được nhỏ hơn Giảm tối đa!",
                              ),
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <InputNumber
                      size="large"
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) =>
                        Number(value!.replace(/\$\s?|(,*)/g, "")) as any
                      }
                      addonAfter="VND"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* THÊM MỚI: Hàng hiển thị song song Thông tin người tạo và Cập nhật cuối */}
              {isEdit && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label={<Text strong>Thông tin người tạo</Text>}>
                      <Input
                        size="large"
                        disabled
                        prefix={<UserOutlined />}
                        value={`${currentVoucher?.createdBy || "N/A"} - ${
                          currentVoucher?.createdDate
                            ? dayjs(currentVoucher.createdDate).format(
                                "DD/MM/YYYY HH:mm",
                              )
                            : "N/A"
                        }`}
                        style={{ backgroundColor: "#f5f5f5", color: "#595959" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={<Text strong>Thông tin cập nhật cuối</Text>}
                    >
                      <Input
                        size="large"
                        disabled
                        prefix={<UserOutlined />}
                        value={`${currentVoucher?.lastModifiedBy || "N/A"} - ${
                          currentVoucher?.lastModifiedDate
                            ? dayjs(currentVoucher.lastModifiedDate).format(
                                "DD/MM/YYYY HH:mm",
                              )
                            : "N/A"
                        }`}
                        style={{ backgroundColor: "#f5f5f5", color: "#595959" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              <Form.Item
                name="dateRange"
                label={<Text strong>Thời hạn áp dụng</Text>}
                rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
              >
                <RangePicker
                  size="large"
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY HH:mm"
                  showTime={{ format: "HH:mm" }}
                  disabledDate={disabledDate}
                  placeholder={[
                    "Bắt đầu (Ngày & Giờ)",
                    "Kết thúc (Ngày & Giờ)",
                  ]}
                />
              </Form.Item>

              <Form.Item name="note" label={<Text strong>Ghi chú</Text>}>
                <Input.TextArea rows={2} />
              </Form.Item>

              {/* PHẦN NÚT BẤM - Đã sửa lỗi thiếu nút */}
              <Divider />
              <div style={{ textAlign: "right" }}>
                <Space size="large">
                  <Button size="large" onClick={() => navigate("/voucher")}>
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={loading}
                    style={{ minWidth: 150, borderRadius: "8px" }}
                  >
                    {isEdit ? "Cập nhật Voucher" : "Lưu Voucher"}
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>
      </Form>
      {/* MODAL CHỌN KHÁCH HÀNG */}
      <CustomerSelectModal
        visible={isModalVisible}
        isEdit={isEdit}
        initialSelectedKeys={selectedCustomerIds}
        voucherDetails={(currentVoucher as any)?.details || []}
        onCancel={() => setIsModalVisible(false)}
        onSelect={(ids) => setSelectedCustomerIds(ids)}
        onUpdateDetailStatus={handleUpdateDetailStatus} // Đã gán hàm xử lý thực tế
      />
    </div>
  );
};

export default VoucherForm;
