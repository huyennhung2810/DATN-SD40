import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  Form,
  InputNumber,
  Button,
  Typography,
  Space,
  Skeleton,
} from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import type { CheckInRequest } from "../../../models/shiftHandover";
import { shiftActions } from "../../../redux/shiftHandover/shiftHandoverSlice";
import { shiftHandoverApi } from "../../../api/shiftHandoverApi";
import type { RootState } from "../../../redux/store";

const { Title, Text } = Typography;

interface CheckInFormValues {
  initialCash: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
}

const CheckInModal: React.FC<Props> = ({ isOpen, onClose, scheduleId }) => {
  const [form] = Form.useForm<CheckInFormValues>();
  const dispatch = useDispatch();
  const [fetchingStats, setFetchingStats] = useState(false);

  const { isLoading, currentShift } = useSelector(
    (state: RootState) => state.shiftHandover,
  );

  // Hàm fetch dữ liệu được memoize để tránh render thừa
  const fetchInitialData = useCallback(async () => {
    if (!scheduleId) return;

    setFetchingStats(true);
    try {
      const data = await shiftHandoverApi.getShiftStats(scheduleId);
      form.setFieldsValue({ initialCash: data.initialCash });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin tiền đầu ca:", error);
      form.setFieldsValue({ initialCash: 0 });
    } finally {
      setFetchingStats(false);
    }
  }, [scheduleId, form]);

  // Tự động đóng modal khi check-in thành công
  useEffect(() => {
    if (currentShift && isOpen) {
      onClose();
      form.resetFields();
    }
  }, [currentShift, isOpen, onClose, form]);

  // Kích hoạt fetch data khi Modal mở
  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen, fetchInitialData]);

  const handleFinish = (values: CheckInFormValues) => {
    const payload: CheckInRequest = {
      scheduleId,
      initialCash: values.initialCash,
      note: "Nhân viên bắt đầu ca",
    };
    dispatch(shiftActions.checkInRequest(payload));
  };

  return (
    <Modal
      title={
        <Space>
          <PlayCircleOutlined style={{ color: "#20c997" }} />
          <Title level={5} style={{ margin: 0 }}>
            Bắt Đầu Ca Làm Việc
          </Title>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
      destroyOnClose
      width={450}
    >
      {fetchingStats ? (
        <div style={{ padding: "20px 0" }}>
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
      ) : (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <div style={{ marginBottom: 20, marginTop: 10 }}>
            <Text type="secondary">
              Chào mừng bạn đến với <b>Website máy ảnh Canon Hikari Store</b>.
              Vui lòng xác nhận hoặc nhập số tiền mặt thực tế đang có trong két
              để bắt đầu ca làm việc.
            </Text>
          </div>

          <Form.Item
            name="initialCash"
            label={<Text strong>Số tiền mặt ban đầu (VND)</Text>}
            rules={[
              { required: true, message: "Vui lòng nhập số tiền mặt!" },
              { type: "number", min: 0, message: "Số tiền không được âm!" },
            ]}
          >
            <InputNumber
              style={{ width: "100%", height: 45, fontSize: "18px" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
              placeholder="Ví dụ: 2,000,000"
              autoFocus
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 25 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              style={{
                backgroundColor: "#20c997",
                borderColor: "#20c997",
                height: 50,
                fontSize: "16px",
                fontWeight: 600,
                borderRadius: "8px",
              }}
            >
              XÁC NHẬN VÀO CA
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default CheckInModal;
