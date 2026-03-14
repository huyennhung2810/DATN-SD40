import React, { useState } from "react";
import { Form, Input, Button, Tabs, Divider, Typography, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../../redux/auth/authSlice";
import type { RootState } from "../../redux/store";
import { getSocialLoginUrl } from "../../constants/url";

const { Title, Text } = Typography;

type LoginMode = "customer" | "admin";

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<LoginMode>("admin");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const onFinish = (values: { username: string; password: string }) => {
    if (mode === "admin") {
      dispatch(
        authActions.loginAdmin({
          data: values,
          navigate: () => {
            // Chỉ navigate khi login thành công (saga sẽ gọi)
            navigate("/");
          },
        }),
      );
    } else {
      dispatch(
        authActions.login({
          data: values,
          navigate: () => {
            // Chỉ navigate khi login thành công (saga sẽ gọi)
            navigate("/client");
          },
        }),
      );
    }
  };

  const handleOAuth2 = (provider: "google" | "github") => {
    const role = mode === "admin" ? "ADMIN" : "CUSTOMER";
    window.location.href = getSocialLoginUrl(provider, role);
  };

  const tabItems = [
    { key: "admin", label: "Quản lý / Nhân viên" },
    { key: "customer", label: "Khách hàng" },
  ];

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
          width: 460,
          background: "#fff",
          borderRadius: 12,
          padding: "40px 40px 32px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: "#d32f2f" }}>
            📷 Hikari Camera
          </Title>
          <Text type="secondary">Đăng nhập tài khoản</Text>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={mode}
          onChange={(key) => setMode(key as LoginMode)}
          items={tabItems}
          centered
        />

        {/* Error message */}
        {error && (
          <div
            style={{
              background: "#fff2f0",
              border: "1px solid #ffccc7",
              borderRadius: 6,
              padding: "8px 12px",
              marginBottom: 16,
              color: "#ff4d4f",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <Form
          layout="vertical"
          onFinish={onFinish}
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Tên đăng nhập"
              autoFocus
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Mật khẩu"
            />
          </Form.Item>
          <div style={{ textAlign: "right", marginTop: -8, marginBottom: 16 }}>
            <Link to="/forgot-password" style={{ fontSize: 13 }}>
              Quên mật khẩu?
            </Link>
          </div>
          <Form.Item style={{ marginBottom: 12 }}>
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
              Đăng nhập
            </Button>
          </Form.Item>
          {mode === "customer" && (
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
              </Text>
            </div>
          )}
        </Form>

        {/* Social login */}
        <Divider plain style={{ fontSize: 12, color: "#aaa" }}>
          Hoặc đăng nhập bằng
        </Divider>
        <Space style={{ width: "100%" }} orientation="vertical">
          <Button
            block
            icon={
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                width={16}
                height={16}
                style={{ marginRight: 6, verticalAlign: "middle" }}
              />
            }
            onClick={() => handleOAuth2("google")}
            style={{ height: 40 }}
          >
            Google
          </Button>
          <Button
            block
            icon={<span style={{ marginRight: 6, fontSize: 16 }}>🐙</span>}
            onClick={() => handleOAuth2("github")}
            style={{ height: 40 }}
          >
            GitHub
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default LoginPage;
