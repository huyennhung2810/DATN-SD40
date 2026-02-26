import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  InputNumber,
  Input,
  Button,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Select,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import type {
  CheckOutRequest,
  ProductAuditRequest,
} from "../../../models/shiftHandover";
import shiftHandoverApi from "../../../api/shiftHandoverApi";
import { shiftActions } from "../../../redux/shiftHandover/shiftHandoverSlice";

const { Text, Title } = Typography;
const { TextArea } = Input;

interface CheckOutFormValues {
  actualCash: number;
  withdrawAmount?: number;
  note?: string;
  audits?: ProductAuditRequest[];
}

interface RootState {
  shiftHandover: {
    isLoading: boolean;
    currentShift: unknown;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
}

const CheckOutModal: React.FC<Props> = ({ isOpen, onClose, scheduleId }) => {
  const [form] = Form.useForm<CheckOutFormValues>();
  const dispatch = useDispatch();

  const isLoading = useSelector(
    (state: RootState) => state.shiftHandover.isLoading,
  );
  const [initialCash, setInitialCash] = useState<number>(0);

  useEffect(() => {
    if (isOpen && scheduleId) {
      shiftHandoverApi.getShiftStats(scheduleId).then((res) => {
        setInitialCash(res.initialCash);
      });
    }
  }, [isOpen, scheduleId]);

  const handleFinish = (values: CheckOutFormValues) => {
    const payload: CheckOutRequest = {
      scheduleId,
      actualCash: values.actualCash,
      withdrawAmount: values.withdrawAmount || 0,
      note: values.note,
      audits: values.audits || [],
    };
    dispatch(shiftActions.checkOutRequest(payload));
  };

  return (
    <Modal
      title={<Title level={4}>Kết Thúc Ca Làm Việc</Title>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={700}
      maskClosable={false}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ withdrawAmount: 0 }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <div
              style={{
                background: "#f5f5f5",
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <Text strong>Tiền két nhận đầu ca: </Text>
              <Text type="success" strong style={{ fontSize: 18 }}>
                {initialCash.toLocaleString("vi-VN")} VNĐ
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                * Vui lòng đếm số tiền mặt thực tế đang có trong két (bao gồm cả
                tiền lẻ và doanh thu) và nhập vào ô bên dưới.
              </Text>
            </div>
          </Col>

          <Col span={12}>
            <Form.Item
              name="actualCash"
              label="Tiền mặt thực tế đếm được"
              rules={[
                { required: true, message: "Vui lòng nhập số tiền thực tế!" },
              ]}
            >
              {/* Bọc InputNumber bằng Space.Compact thay cho addonAfter */}
              <Space.Compact style={{ width: "100%" }}>
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  min={0}
                  placeholder="VD: 5,000,000"
                />
                <Button
                  disabled
                  style={{
                    color: "rgba(0, 0, 0, 0.88)",
                    backgroundColor: "#fafafa",
                    pointerEvents: "none",
                  }}
                >
                  VNĐ
                </Button>
              </Space.Compact>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="withdrawAmount" label="Tiền đã chi tiêu (Nếu có)">
              <Space.Compact style={{ width: "100%" }}>
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  min={0}
                />
                <Button
                  disabled
                  style={{
                    color: "rgba(0, 0, 0, 0.88)",
                    backgroundColor: "#fafafa",
                    pointerEvents: "none",
                  }}
                >
                  VNĐ
                </Button>
              </Space.Compact>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="note"
              label="Ghi chú / Giải trình (Bắt buộc nếu lệch tiền)"
            >
              <TextArea
                rows={2}
                placeholder="Nhập lý do nếu tiền thực tế bị lệch với hệ thống..."
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="horizontal">Kiểm kê Hàng Trưng Bày</Divider>

        <Form.List name="audits">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "productId"]}
                    rules={[{ required: true, message: "Vui lòng chọn SP" }]}
                  >
                    <Select
                      placeholder="Chọn sản phẩm..."
                      style={{ width: 220 }}
                    >
                      <Select.Option value="prod-1">
                        Canon EOS R5 (Body)
                      </Select.Option>
                      <Select.Option value="prod-2">
                        Lens Canon RF 24-70mm f/2.8L
                      </Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "actualQuantity"]}
                    rules={[{ required: true, message: "Nhập SL" }]}
                  >
                    <InputNumber
                      placeholder="SL"
                      min={0}
                      style={{ width: 80 }}
                    />
                  </Form.Item>

                  <Form.Item {...restField} name={[name, "conditionNote"]}>
                    <Input
                      placeholder="Tình trạng (xước, mốc...)"
                      style={{ width: 200 }}
                    />
                  </Form.Item>

                  <MinusCircleOutlined
                    onClick={() => remove(name)}
                    style={{ color: "red", cursor: "pointer" }}
                  />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm sản phẩm cần kiểm kê
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item
          style={{ textAlign: "right", marginTop: 16, marginBottom: 0 }}
        >
          <Space>
            <Button onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={isLoading} danger>
              Nộp báo cáo & Kết ca
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CheckOutModal;
