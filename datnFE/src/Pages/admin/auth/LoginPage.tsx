import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Button, Card, Typography, message, Divider } from "antd";
import { UserOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import type { AppDispatch, RootState } from "../../../redux/store";
import { authActions } from "../../../redux/auth/authSlice";
import { getSocialLoginUrl } from "../../../constants/url";
import { getAccessToken } from "../../../utils/authStorage";

const { Title, Text, Paragraph } = Typography;

interface LoginFormValues {
  usernameOrEmail: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [form] = Form.useForm();

  // Redirect if already logged in
  const isAuthenticated = !!getAccessToken();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (values: LoginFormValues) => {
    dispatch(
      authActions.login({
        payload: {
          usernameOrEmail: values.usernameOrEmail,
          password: values.password,
          screen: "ADMIN",
        },
        onSuccess: () => {
          message.success("Đăng nhập thành công!");
          navigate("/");
        },
      })
    );
  };

  const handleGoogleLogin = () => {
    const googleLoginUrl = getSocialLoginUrl("google", "ADMIN");
    window.location.href = googleLoginUrl;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
        bodyStyle={{ padding: 40 }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 16px",
              background: "linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            HK
          </div>
          <Title level={2} style={{ marginBottom: 4, color: "#1a1a2e" }}>
            Hikari Camera
          </Title>
          <Text type="secondary">Hệ thống quản lý</Text>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 16px",
              background: "#fff2f0",
              border: "1px solid #ffccc7",
              borderRadius: 8,
              color: "#ff4d4f",
            }}
          >
            {error}
          </div>
        )}

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="usernameOrEmail"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập hoặc email" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Tên đăng nhập hoặc email"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Mật khẩu"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 48,
                fontSize: 16,
                fontWeight: 600,
                background: "linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)",
                border: "none",
                borderRadius: 8,
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <Divider plain>
            <Text type="secondary">hoặc</Text>
          </Divider>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
              block
              style={{
                height: 48,
                fontSize: 15,
                fontWeight: 500,
                background: "#fff",
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              Đăng nhập với Google
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
            © 2024 Hikari Camera. All rights reserved.
          </Paragraph>
        </div>
      </Card>

      <style>{`
        .ant-input-affix-wrapper {
          border-radius: 8px;
          padding: 10px 14px;
        }
        .ant-input-affix-wrapper:focus,
        .ant-input-affix-wrapper-focused {
          box-shadow: 0 0 0 2px rgba(10, 132, 255, 0.2);
          border-color: #0A84FF;
        }
        .ant-input-affix-wrapper .ant-input {
          background: transparent;
        }
        .ant-form-item-label > label {
          font-weight: 500;
          color: #1a1a2e;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
