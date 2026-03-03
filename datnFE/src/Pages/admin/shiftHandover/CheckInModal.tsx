import React from "react";
import {
  Modal,
  Form,
  InputNumber,
  Input,
  Button,
  Space,
  Typography,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import type { CheckInRequest } from "../../../models/shiftHandover";
import { shiftActions } from "../../../redux/shiftHandover/shiftHandoverSlice";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CheckInFormValues {
  initialCash?: number | string;
  note?: string;
}

interface RootState {
  shiftHandover: {
    isLoading: boolean;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
}

const CheckInModal: React.FC<Props> = ({ isOpen, onClose, scheduleId }) => {
  const [form] = Form.useForm<CheckInFormValues>();
  const dispatch = useDispatch();
  const isLoading = useSelector(
    (state: RootState) => state.shiftHandover.isLoading,
  );

  const handleFinish = (values: CheckInFormValues) => {
    const cleanInitialCash = values.initialCash
      ? Number(String(values.initialCash).replace(/,/g, ""))
      : undefined;

    const payload: CheckInRequest = {
      scheduleId,
      initialCash: cleanInitialCash,
      note: values.note,
    };
    dispatch(shiftActions.checkInRequest(payload));
  };

  return (
    <Modal
      title={<Title level={4}>Nhận Ca Làm Việc</Title>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Bạn sắp bắt đầu ca làm việc. Vui lòng xác nhận số tiền lẻ hiện có
            trong két. Nếu để trống, hệ thống sẽ tự động lấy số dư từ ca làm
            việc trước đó.
          </Text>
        </div>

        <Form.Item name="initialCash" label="Tiền lẻ trong két (Tùy chọn)">
          <Space.Compact style={{ width: "100%" }}>
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              min={0}
              placeholder="Để trống để sử dụng tiền dư ca trước"
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

        <Form.Item name="note" label="Ghi chú">
          <TextArea rows={2} placeholder="Nhập ghi chú (nếu có)..." />
        </Form.Item>

        <Form.Item
          style={{ textAlign: "right", marginTop: 24, marginBottom: 0 }}
        >
          <Space>
            <Button onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Vào Ca
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CheckInModal;
