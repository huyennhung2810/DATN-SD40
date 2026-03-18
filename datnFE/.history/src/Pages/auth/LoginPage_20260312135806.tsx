import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Tabs,
  Divider,
  Typography,
  Space,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { getSocialLoginUrl } from "../../constants/url";

const { Title, Text } = Typography;

type LoginMode = "customer" | "admin";

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<LoginMode>("admin");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy trạng thái từ Redux
  const { loading, error, isLoggedIn, user } = useSelector(
    (state: RootState) => state.auth,
  );

  // 1. Xóa thông báo lỗi khi chuyển Tab hoặc khi vào trang
  useEffect(() => {
    dispatch(authActions.clearError());
  }, [mode, dispatch]);

  // 2. Nếu đã đăng nhập thì tự động "đẩy" về trang tương ứng
  useEffect(() => {
    if (isLoggedIn && user) {
      const isAdmin = user.roles?.some((r) => r === "ADMIN" || r === "STAFF");
      navigate(isAdmin ? "/admin/dashboard" : "/client");
    }
  }, [isLoggedIn, user, navigate]);

  const onFinish = (values: any) => {
    if (mode === "admin") {
      dispatch(
        authActions.loginAdmin({
          data: values,
          navigate: () => navigate("/admin/dashboard"),
        }),
      );
    } else {
      dispatch(
        authActions.login({
          data: values,
          navigate: () => navigate("/client"),
        }),
      );
    }
  };

  const handleOAuth2 = (provider: "google" | "github") => {
    // Chuyển role thành string khớp với logic CustomOAuth2UserService ở Backend
    const role = mode === "admin" ? "ADMIN" : "CUSTOMER";
    window.location.href = getSocialLoginUrl(provider, role);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Title level={3} style={{ margin: 0, color: "#d32f2f" }}>
            📷 Hikari Camera
          </Title>
          <Text type="secondary">Hệ thống máy ảnh chuyên nghiệp</Text>
        </div>

        <Tabs
          activeKey={mode}
          onChange={(key) => setMode(key as LoginMode)}
          centered
          items={[
            { key: "admin", label: "QUẢN TRỊ VIÊN" },
            { key: "customer", label: "KHÁCH HÀNG" },
          ]}
        />

        {/* Thông báo lỗi tập trung */}
        {error && <div className="error-alert">{error}</div>}

        <Form
          layout="vertical"
          onFinish={onFinish}
          size="large"
          className="login-form"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" autoFocus />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <div className="form-options">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="login-btn"
            >
              Đăng nhập ngay
            </Button>
          </Form.Item>

          {mode === "customer" && (
            <div className="register-link">
              <Text type="secondary">
                Bạn mới đến? <Link to="/register">Tạo tài khoản mới</Link>
              </Text>
            </div>
          )}
        </Form>

        <Divider plain className="social-divider">
          Hoặc kết nối qua
        </Divider>

        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Button
            block
            icon={<GoogleOutlined style={{ color: "#ea4335" }} />}
            onClick={() => handleOAuth2("google")}
          >
            Tiếp tục với Google
          </Button>
          <Button
            block
            icon={<GithubOutlined />}
            onClick={() => handleOAuth2("github")}
          >
            Tiếp tục với GitHub
          </Button>
        </Space>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f2f5;
          background-image: radial-gradient(#d32f2f 0.5px, #f0f2f5 0.5px);
          background-size: 20px 20px;
        }
        .login-card {
          width: 420px;
          background: #fff;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
        .login-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .error-alert {
          background: #fff2f0;
          border: 1px solid #ffccc7;
          color: #ff4d4f;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          text-align: center;
        }
        .form-options {
          display: flex;
          justify-content: flex-end;
          margin-top: -12px;
          margin-bottom: 20px;
          font-size: 13px;
        }
        .login-btn {
          background: #d32f2f;
          border-color: #d32f2f;
          height: 48px;
          font-weight: 600;
        }
        .login-btn:hover {
          background: #b71c1c !important;
        }
        .register-link {
          text-align: center;
          margin-top: 8px;
        }
        .social-divider {
          font-size: 12px;
          color: #bfbfbf;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
