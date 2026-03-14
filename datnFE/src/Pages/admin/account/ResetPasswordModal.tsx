import React, { useState } from "react";
import { Modal, Form, Input, Button, message, Space } from "antd";
import { KeyOutlined } from "@ant-design/icons";
import accountApi from "../../../api/accountApi";
import type { AccountResponse } from "../../../models/account";

interface ResetPasswordModalProps {
  visible: boolean;
  account: AccountResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  visible,
  account,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { newPassword: string; confirmPassword: string }) => {
    if (!account) return;
    
    setLoading(true);
    try {
      await accountApi.resetPassword(account.id, values);
      message.success("Đặt lại mật khẩu thành công");
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Đặt lại mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <KeyOutlined />
          <span>Đặt lại mật khẩu</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          username: account?.username,
        }}
      >
        <Form.Item label="Tên đăng nhập">
          <Input value={account?.username} disabled />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              message: "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
            },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu mới" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Xác nhận mật khẩu mới" />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Đặt lại mật khẩu
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ResetPasswordModal;
