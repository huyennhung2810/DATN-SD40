import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Steps,
  notification,
  Modal,
} from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import authApi from "../../api/auth/authApi";

const { Title, Text } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otpForm] = Form.useForm();
  const navigate = useNavigate();

  // Bước 1: Gửi OTP
  const onSendOtp = async (values: { email: string }) => {
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: values.email });
      setEmail(values.email);
      notification.success({ message: `OTP đã được gửi đến ${values.email}` });
      setCurrentStep(1);
    } catch (error: any) {
      notification.error({ message: error?.message || "Không thể gửi OTP" });
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP + đặt mật khẩu mới
  const onVerifyOtp = async (values: {
    otpCode: string;
    newPassword: string;
  }) => {
    setLoading(true);
    try {
      await authApi.verifyOtp({
        email,
        otpCode: values.otpCode,
        newPassword: values.newPassword,
      });
      notification.success({
        message: "Đặt lại mật khẩu thành công!",
        description: "Vui lòng đăng nhập lại.",
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (error: any) {
      notification.error({
        message: error?.message || "OTP không hợp lệ hoặc đã hết hạn",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <div
        style={{
          width: 440,
          background: "#fff",
          borderRadius: 12,
          padding: "40px 40px 32px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Title level={3} style={{ margin: 0, color: "#d32f2f" }}>
            📷 Hikari Camera
          </Title>
          <Text type="secondary">Khôi phục mật khẩu</Text>
        </div>

        <Steps
          current={currentStep}
          size="small"
          style={{ marginBottom: 28 }}
          items={[{ title: "Nhập email" }, { title: "Xác thực OTP" }]}
        />

        {currentStep === 0 && (
          <Form layout="vertical" onFinish={onSendOtp} size="large">
            <Form.Item
              name="email"
              label="Email đã đăng ký"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="example@gmail.com"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={{
                  background: "#d32f2f",
                  borderColor: "#d32f2f",
                  height: 42,
                }}
              >
                Gửi mã OTP
              </Button>
            </Form.Item>
          </Form>
        )}

        {currentStep === 1 && (
          <Form
            layout="vertical"
            onFinish={onVerifyOtp}
            size="large"
            form={otpForm}
          >
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 16, fontSize: 13 }}
            >
              Mã OTP đã được gửi đến <strong>{email}</strong>. Có hiệu lực trong
              5 phút.
            </Text>
            <Form.Item
              name="otpCode"
              label="Mã OTP (6 chữ số)"
              rules={[
                { required: true, message: "Vui lòng nhập mã OTP!" },
                { len: 6, message: "OTP gồm 6 chữ số!" },
              ]}
            >
              <Input
                placeholder="123456"
                maxLength={6}
                style={{ letterSpacing: 4, textAlign: "center" }}
              />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu mới"
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
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!"),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập lại mật khẩu"
              />
            </Form.Item>
            <Button
              type="primary"
              block
              loading={loading}
              style={{
                background: "#d32f2f",
                borderColor: "#d32f2f",
                height: 42,
              }}
              onClick={() => {
                otpForm
                  .validateFields()
                  .then((values) => {
                    Modal.confirm({
                      title: "Xác nhận đặt lại mật khẩu",
                      content:
                        "Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản này?",
                      okText: "Đặt lại",
                      okType: "danger",
                      cancelText: "Huỷ",
                      centered: true,
                      onOk: () => onVerifyOtp(values),
                    });
                  })
                  .catch(() => {}); // validation error hiện tại ô input
              }}
            >
              Đặt lại mật khẩu
            </Button>
          </Form>
        )}

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <Link to="/login" style={{ fontSize: 13 }}>
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
