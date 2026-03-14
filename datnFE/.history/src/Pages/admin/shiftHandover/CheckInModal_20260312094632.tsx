import React, { useEffect } from "react";
import { Modal, Form, InputNumber, Button, Typography, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { shiftActions } from "../../../redux/shiftHandover/shiftHandoverSlice";

const CheckInModal = ({ isOpen, onClose, scheduleId }: any) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { isLoading, currentShift } = useSelector(
    (state: any) => state.shiftHandover,
  );

  useEffect(() => {
    if (currentShift && isOpen) {
      onClose();
      form.resetFields();
    }
  }, [currentShift, isOpen]);

  const onFinish = (values: any) => {
    dispatch(
      shiftActions.checkInRequest({
        scheduleId,
        initialCash: values.initialCash,
        note: "",
      }),
    );
  };

  return (
    <Modal
      title="Bắt Đầu Ca Làm Việc"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="initialCash"
          label="Tiền mặt thực tế tại quầy (VND)"
          rules={[{ required: true }]}
        >
          <InputNumber
            style={{ width: "100%", height: 40 }}
            formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(val) => val!.replace(/\$\s?|(,*)/g, "")}
            min={0}
          />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          block
          style={{ background: "#20c997", height: 40, fontWeight: 600 }}
        >
          XÁC NHẬN VÀO CA
        </Button>
      </Form>
    </Modal>
  );
};

export default CheckInModal;
