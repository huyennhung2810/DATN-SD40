import React from "react";
import { Form, Input, Button, Typography, Divider, Space } from "antd";
import { UserOutlined, LockOutlined, GithubFilled } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../../redux/auth/authSlice";
import type { RootState } from "../../redux/store";
import { getSocialLoginUrl } from "../../constants/url";

const { Title, Text } = Typography;

const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const onFinish = (values: { username: string; password: string }) => {
    dispatch(
      authActions.login({
        data: values,
        navigate: () => navigate("/client"),
      }),
    );
  };

  const handleOAuth2 = (provider: "google" | "github") => {
    window.location.href = getSocialLoginUrl(provider, "CUSTOMER");
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
            📷 Hikari Camera
          </Title>
          <Text type="secondary">Chào mừng bạn quay trở lại!</Text>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="username"
            label="Email / Tên đăng nhập"
            rules={[{ required: true, message: "Vui lòng nhập tài khoản!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email của bạn" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <div style={{ textAlign: "right", marginBottom: 16 }}>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ height: 42 }}
            >
              Đăng nhập ngay
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary">
              Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </Text>
          </div>
        </Form>

        <Divider plain style={{ fontSize: 12, color: "#aaa" }}>
          Đăng nhập nhanh qua
        </Divider>
        <Space style={{ width: "100%" }} orientation="vertical">
          <Button
            block
            onClick={() => handleOAuth2("google")}
            style={{ height: 40 }}
          >
            <img
              src="https://www.google.com/favicon.ico"
              width={16}
              style={{ marginRight: 8 }}
            />
            Tiếp tục với Google
          </Button>
          <Button
            block
            icon={<GithubFilled />}
            onClick={() => handleOAuth2("github")}
            style={{ height: 40 }}
          >
            Kết nối GitHub
          </Button>
        </Space>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #2c3e50 0%, #000000 100%)",
};
const cardStyle: React.CSSProperties = {
  width: 420,
  background: "#fff",
  borderRadius: 12,
  padding: "40px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
};
const errorStyle: React.CSSProperties = {
  background: "#fff2f0",
  border: "1px solid #ffccc7",
  borderRadius: 6,
  padding: "8px 12px",
  marginBottom: 16,
  color: "#ff4d4f",
};

export default CustomerLoginPage;
