import React, { useState } from "react";
import { Card, Form, Input, Button, notification } from "antd";
import { LockOutlined } from "@ant-design/icons";
import OtpInput from "./OtpInput";
import OtpCountdown from "./OtpCountdown";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import type { ResponseObject } from "../../../models/base";
import { resetPassword } from "../../../api/employeeApi";
import type { ResetPasswordPayload } from "../../../models/employee";

interface ResetPasswordForm {
  otp: string;
  newPassword: string;
  confirmPassword?: string;
}

const QuenMatKhau = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [email] = useState("user@gmail.com");

  const onFinish = async (values: ResetPasswordForm) => {
    setLoading(true);
    try {
      const payload: ResetPasswordPayload = {
        email: email,
        otp: values.otp,
        newPassword: values.newPassword,
      };

      // Gọi API thực tế đã định nghĩa kiểu
      await resetPassword(payload);

      notification.success({
        message: "Thành công",
        description:
          "Mật khẩu đã được đổi! Chuyển về trang đăng nhập sau 2 giây.",
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const axiosError = error as AxiosError<ResponseObject<void>>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Mã OTP không chính xác hoặc đã hết hạn.";

      notification.error({
        message: "Lỗi",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Xác thực & Đổi mật khẩu"
      style={{ maxWidth: 450, margin: "50px auto" }}
    >
      <Form onFinish={onFinish} layout="vertical">
        <p style={{ textAlign: "center" }}>
          Mã xác nhận đã được gửi đến <b>{email}</b>
        </p>

        <Form.Item
          name="otp"
          label="Mã OTP"
          rules={[{ required: true, message: "Vui lòng nhập đủ 6 số!" }]}
        >
          <OtpInput
            length={6}
            onComplete={(code) => {
              form.setFieldsValue({ otp: code });
            }}
          />
        </Form.Item>

        <OtpCountdown onResend={() => {}} />

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, min: 8, message: "Mật khẩu ít nhất 8 ký tự!" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu mới"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value)
                  return Promise.resolve();
                return Promise.reject(new Error("Mật khẩu không khớp!"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Xác nhận lại mật khẩu"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={loading}
        >
          Đặt lại mật khẩu
        </Button>
      </Form>
    </Card>
  );
};

export default QuenMatKhau;
