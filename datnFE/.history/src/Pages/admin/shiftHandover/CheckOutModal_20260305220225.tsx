import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  InputNumber,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
} from "antd";
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
  actualCash: number | string;
  withdrawAmount?: number | string;
  note?: string;
  audits?: ProductAuditRequest[];
}

interface RootState {
  shiftHandover: { isLoading: boolean };
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
        shiftHandoverApi
            .getShiftStats(scheduleId)
            .then((res) => {
                setInitialCash(res.initialCash); 
            })
            .catch(() => on.error("Không lấy được thông tin tiền đầu ca"));
    }
}, [isOpen, scheduleId]);

  const handleFinish = (values: CheckOutFormValues) => {
    // Rửa sạch dấu phẩy cho Form Kết Ca
    const cleanActualCash = values.actualCash
      ? Number(String(values.actualCash).replace(/,/g, ""))
      : 0;
    const cleanWithdraw = values.withdrawAmount
      ? Number(String(values.withdrawAmount).replace(/,/g, ""))
      : 0;

    const payload: CheckOutRequest = {
      scheduleId,
      actualCash: cleanActualCash,
      withdrawAmount: cleanWithdraw,
      note: values.note,
      audits: values.audits || [],
    };
    dispatch(shiftActions.checkOutRequest(payload));
  };

  return (
    <Modal
      title={<Title level={5}>Xác nhận Kết Thúc Ca</Title>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      maskClosable={false}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div
          style={{
            background: "#fafafa",
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
            border: "1px solid #f0f0f0",
          }}
        >
          <Text>Tiền mặt hệ thống ghi nhận: </Text>
          <Text type="success" strong style={{ fontSize: 16 }}>
            {initialCash.toLocaleString("vi-VN")} ₫
          </Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              * Vui lòng đếm lại số tiền mặt thực tế đang có trong két và nhập
              vào ô bên dưới.
            </Text>
          </div>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="actualCash"
              label={<Text strong>Tiền mặt thực tế đếm được</Text>}
              rules={[{ required: true, message: "Vui lòng nhập số tiền!" }]}
            >
              <InputNumber
                style={{ width: "100%", height: 40 }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                min={0}
                placeholder="VD: 5,000,000"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="withdrawAmount"
              label={<Text strong>Tiền đã chi tiêu (Nếu có)</Text>}
            >
              <InputNumber
                style={{ width: "100%", height: 40 }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                min={0}
                placeholder="0"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="note" label="Ghi chú / Giải trình (Nếu lệch tiền)">
              <TextArea
                rows={2}
                placeholder="Nhập lý do nếu có sự chênh lệch..."
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          style={{ textAlign: "right", marginTop: 8, marginBottom: 0 }}
        >
          <Space>
            <Button onClick={onClose} disabled={isLoading}>
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              danger
              style={{ height: 38, fontWeight: 600 }}
            >
              Kết Thúc Ca
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CheckOutModal;
