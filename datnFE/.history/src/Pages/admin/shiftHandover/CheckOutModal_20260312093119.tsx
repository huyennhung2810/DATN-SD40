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
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { shiftActions } from "../../../redux/shiftHandover/shiftHandoverSlice";
import shiftHandoverApi from "../../../api/shiftHandoverApi";

const { Text, Title } = Typography;

const CheckOutModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
}> = ({ isOpen, onClose, scheduleId }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [stats, setStats] = useState({ systemCash: 0 }); // Tiền hệ thống tính toán (đầu ca + doanh thu POS)

  useEffect(() => {
    if (isOpen && scheduleId) {
      shiftHandoverApi
        .getShiftStats(scheduleId)
        .then((res) => setStats({ systemCash: res.data?.totalCashSystem || 0 }))
        .catch(() => message.error("Không lấy được thống kê ca trực"));
    }
  }, [isOpen, scheduleId]);

  const handleFinish = (values: any) => {
    dispatch(
      shiftActions.checkOutRequest({
        scheduleId,
        actualCash: values.actualCash,
        withdrawAmount: values.withdrawAmount || 0,
        note: values.note,
        audits: [],
      }),
    );
  };

  return (
    <Modal
      title={<Title level={5}>Xác nhận Kết Thúc Ca</Title>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={550}
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
          <Text type="success" strong style={{ fontSize: 18 }}>
            {stats.systemCash.toLocaleString("vi-VN")} ₫
          </Text>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="actualCash"
              label={<Text strong>Tiền mặt thực tế đếm được</Text>}
              rules={[{ required: true, message: "Nhập số tiền thực tế!" }]}
            >
              <InputNumber
                style={{ width: "100%", height: 40 }}
                formatter={(val) =>
                  `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(val) => val!.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="withdrawAmount"
              label={<Text strong>Tiền rút khỏi két (nếu có)</Text>}
            >
              <InputNumber
                style={{ width: "100%", height: 40 }}
                formatter={(val) =>
                  `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(val) => val!.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="note" label="Ghi chú (Nếu lệch tiền hoặc có sự cố)">
          <Input.TextArea rows={3} placeholder="Nhập ghi chú bàn giao..." />
        </Form.Item>

        <Space style={{ width: "100%", justifyContent: "right" }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            danger
            style={{ fontWeight: 600 }}
          >
            XÁC NHẬN KẾT CA
          </Button>
        </Space>
      </Form>
    </Modal>
  );
};

export default CheckOutModal;
