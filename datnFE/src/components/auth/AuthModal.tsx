import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Tabs,
  message,
  Spin,
  Checkbox,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import type { RegisterRequest } from "../../models/auth";
import type { RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../../redux/auth/authSlice";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  redirectAfterAuth?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onClose,
  onSuccess,
  redirectAfterAuth = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // 如果已经登录，直接成功
  useEffect(() => {
    if (open && user?.userId) {
      onSuccess();
    }
  }, [open, user, onSuccess]);

  const handleLogin = async (values: {
    username: string;
    password: string;
    remember?: boolean;
  }) => {
    setLoading(true);
    try {
      const response = await axiosClient.post("/api/v1/auth/login", {
        username: values.username,
        password: values.password,
      });

      const { accessToken, refreshToken, userId, username, fullName, email, roles } =
        response.data;

      // Lưu vào Redux
      dispatch(
        authActions.loginSuccess({
          user: {
            userId,
            username,
            fullName,
            email,
            pictureUrl: "",
            roles: roles || ["CUSTOMER"],
          },
          accessToken,
          refreshToken,
        }),
      );

      // Lưu token vào localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userId", userId);

      message.success("Đăng nhập thành công!");
      onSuccess();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: {
    username: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    agreeTerms: boolean;
  }) => {
    setLoading(true);
    try {
      const payload: RegisterRequest = {
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.username, // Sử dụng username làm fullName
        phoneNumber: values.phone || "",
      };

      const response = await axiosClient.post("/api/v1/auth/register", payload);

      // Tự động đăng nhập sau khi đăng ký
      const { accessToken, refreshToken, userId, username, fullName, email, roles } =
        response.data;

      dispatch(
        authActions.loginSuccess({
          user: {
            userId,
            username,
            fullName,
            email,
            pictureUrl: "",
            roles: roles || ["CUSTOMER"],
          },
          accessToken,
          refreshToken,
        }),
      );

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userId", userId);

      message.success("Đăng ký thành công! Chào mừng bạn!");
      onSuccess();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    loginForm.resetFields();
    registerForm.resetFields();
    onClose();
  };

  const switchToLogin = () => {
    setActiveTab("login");
    registerForm.resetFields();
  };

  const switchToRegister = () => {
    setActiveTab("register");
    loginForm.resetFields();
  };

  const tabItems = [
    {
      key: "login",
      label: (
        <span>
          <UserOutlined />
          Đăng nhập
        </span>
      ),
    },
    {
      key: "register",
      label: (
        <span>
          <MailOutlined />
          Đăng ký
        </span>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closable={true}
      centered
      width={480}
      title={
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <h2 style={{ margin: 0, color: "#1a1a1a" }}>
            {activeTab === "login" ? "Đăng nhập" : "Tạo tài khoản nhanh"}
          </h2>
          <p style={{ margin: "8px 0 0", color: "#666", fontSize: 13 }}>
            {activeTab === "login"
              ? "Đăng nhập để tiếp tục thanh toán"
              : "Chỉ mất 30 giây, không cần địa chỉ"}
          </p>
        </div>
      }
    >
      <Spin spinning={loading}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          centered
          style={{ marginBottom: 24 }}
        />

        {activeTab === "login" && (
          <Form
            form={loginForm}
            layout="vertical"
            onFinish={handleLogin}
            autoComplete="off"
          >
            <Form.Item
              name="username"
              label="Tên đăng nhập hoặc Email"
              rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập hoặc email!" }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="Nhập tên đăng nhập hoặc email"
                size="large"
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
                placeholder="Nhập mật khẩu"
                size="large"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{ height: 48, fontWeight: 600 }}
              >
                Đăng nhập để thanh toán
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              <span style={{ color: "#666", fontSize: 13 }}>
                Chưa có tài khoản?{" "}
              </span>
              <Button
                type="link"
                onClick={switchToRegister}
                style={{ padding: 0, fontWeight: 600 }}
              >
                Tạo tài khoản nhanh
              </Button>
            </div>
          </Form>
        )}

        {activeTab === "register" && (
          <Form
            form={registerForm}
            layout="vertical"
            onFinish={handleRegister}
            autoComplete="off"
          >
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                { min: 3, message: "Tên đăng nhập ít nhất 3 ký tự!" },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="Chọn tên đăng nhập"
                size="large"
                autoFocus
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="Nhập email của bạn"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại (tùy chọn)"
            >
              <Input
                prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="0901234567"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="Tạo mật khẩu"
                size="large"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="Nhập lại mật khẩu"
                size="large"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="agreeTerms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error("Bạn phải đồng ý với điều khoản")),
                },
              ]}
            >
              <Checkbox>
                Tôi đồng ý với{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer">
                  điều khoản sử dụng
                </a>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{ height: 48, fontWeight: 600 }}
              >
                Tạo tài khoản & Thanh toán
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              <span style={{ color: "#666", fontSize: 13 }}>
                Đã có tài khoản?{" "}
              </span>
              <Button
                type="link"
                onClick={switchToLogin}
                style={{ padding: 0, fontWeight: 600 }}
              >
                Đăng nhập ngay
              </Button>
            </div>
          </Form>
        )}
      </Spin>
    </Modal>
  );
};

export default AuthModal;
