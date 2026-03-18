import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  InputNumber,
  Input,
  Button,
  Row,
  Typography,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { shiftHandoverApi } from "../../../api/shiftHandoverApi";
import { shiftActions } from "../../../redux/shiftHandover/shiftHandoverSlice";

const { Text } = Typography;

const CheckOutModal = ({ isOpen, onClose, scheduleId }: any) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [systemCash, setSystemCash] = useState(0);
  const actualCash = Form.useWatch("actualCash", form);
  const withdraw = Form.useWatch("withdrawAmount", form);

  useEffect(() => {
    if (isOpen && scheduleId) {
      shiftHandoverApi
        .getShiftStats(scheduleId)
        .then((res) => setSystemCash((res as any).totalCashSystem || 0))
        .catch(() => message.error("Lỗi lấy thống kê ca"));
    }
  }, [isOpen, scheduleId]);

  const diff = (Number(actualCash) || 0) + (Number(withdraw) || 0) - systemCash;

  return (
    <Modal
      title="Xác nhận Kết Thúc Ca"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) =>
          dispatch(
            shiftActions.checkOutRequest({ ...values, scheduleId, audits: [] }),
          )
        }
      >
        <div
          style={{
            background: "#fafafa",
            padding: 15,
            borderRadius: 8,
            marginBottom: 20,
            border: "1px solid #eee",
          }}
        >
          <Row justify="space-between">
            <Text>Tiền mặt hệ thống:</Text>
            <Text strong>{systemCash.toLocaleString()} ₫</Text>
          </Row>
          <Row justify="space-between" style={{ marginTop: 8 }}>
            <Text>Chênh lệch:</Text>
            <Text type={diff < 0 ? "danger" : "success"} strong>
              {diff > 0 ? "+" : ""}
              {diff.toLocaleString()} ₫
            </Text>
          </Row>
        </div>
        <Form.Item
          name="actualCash"
          label="Tiền mặt thực tế đếm được"
          rules={[{ required: true }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(val) => val!.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>
        <Form.Item name="withdrawAmount" label="Số tiền rút khỏi két (nếu có)">
          <InputNumber
            style={{ width: "100%" }}
            formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(val) => val!.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>
        <Form.Item name="note" label="Ghi chú bàn giao">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          danger
          block
          style={{ fontWeight: 600 }}
        >
          XÁC NHẬN KẾT CA
        </Button>
      </Form>
    </Modal>
  );
};

export default CheckOutModal;
