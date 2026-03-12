import React, { useEffect } from "react"; // THÊM HOẶC SỬA: Import thêm useEffect
import { Modal, Form, InputNumber, Button, Typography, Space } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import type { CheckInRequest } from "../../../models/shiftHandover";
import { shiftActions } from "../../../redux/shiftHandover/shiftHandoverSlice";
import type { RootState } from "../../../redux/store";

const { Title, Text } = Typography;

interface CheckInFormValues {
  initialCash?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
}

const CheckInModal: React.FC<Props> = ({ isOpen, onClose, scheduleId }) => {
  const [form] = Form.useForm<CheckInFormValues>();
  const dispatch = useDispatch();

  const { isLoading, currentShift } = useSelector(
    (state: RootState) => state.shiftHandover,
  );

  useEffect(() => {
    if (currentShift && isOpen) {
      onClose();
      form.resetFields();
    }
  }, [currentShift, isOpen, onClose, form]);

  const handleFinish = (values: CheckInFormValues) => {
    const payload: CheckInRequest = {
      scheduleId,
      initialCash: values.initialCash || 0,
      note: "",
    };
    dispatch(shiftActions.checkInRequest(payload));
  };

  return (
    <Modal
      title={
        <Space>
          <PlayCircleOutlined />
          <Title level={5} style={{ margin: 0 }}>
            Bắt Đầu Ca Làm Việc
          </Title>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      mask={{ closable: false }}
      destroyOnHidden
      width={450}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div style={{ marginBottom: 20, marginTop: 10 }}>
          <Text type="secondary">
            Chào mừng bạn đến với ca làm việc mới. Vui lòng nhập số tiền mặt ban
            đầu tại quầy để bắt đầu ca.
          </Text>
        </div>

        <Form.Item
          name="initialCash"
          label={<Text strong>Số tiền mặt ban đầu (VND)</Text>}
          rules={[{ required: true, message: "Vui lòng nhập số tiền mặt!" }]}
        >
          <InputNumber
            style={{ width: "100%", height: 40 }}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => {
              if (!value) return 0;
              return Number(value.replace(/,/g, ""));
            }}
            min={0 as number}
            placeholder="Nhập số tiền mặt"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 10 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            style={{
              backgroundColor: "#20c997",
              borderColor: "#20c997",
              height: 45, 
              fontSize: "16px",
              fontWeight: 600,
              boxShadow: "0 4px 10px rgba(32, 201, 151, 0.3)", // Thêm đổ bóng cho nút
              borderRadius: "8px",
            }}
          >
            XÁC NHẬN VÀO CA
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CheckInModal;
