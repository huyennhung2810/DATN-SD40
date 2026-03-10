import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, Form, Input, Button, Tabs, message, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, SaveOutlined } from "@ant-design/icons";
import type { AppDispatch, RootState } from "../../../redux/store";
import { authActions } from "../../../redux/auth/authSlice";
import type { UpdateProfilePayload, ChangePasswordPayload } from "../../../models/auth";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface ProfileFormValues {
  name: string;
  email: string;
  phoneNumber: string;
}

interface PasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const AccountSettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user, profileForm]);

  const handleProfileUpdate = (values: ProfileFormValues) => {
    const payload: UpdateProfilePayload = {
      name: values.name,
      email: values.email,
      phoneNumber: values.phoneNumber,
    };

    dispatch(
      authActions.updateProfile({
        payload,
        onSuccess: () => {
          message.success("Cập nhật thông tin thành công!");
        },
      })
    );
  };

  const handlePasswordChange = (values: PasswordFormValues) => {
    if (values.newPassword !== values.confirmNewPassword) {
      message.error("Mật khẩu mới không khớp");
      return;
    }

    const payload: ChangePasswordPayload = {
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmNewPassword,
    };

    dispatch(
      authActions.changePassword({
        payload,
        onSuccess: () => {
          message.success("Đổi mật khẩu thành công!");
          passwordForm.resetFields();
        },
      })
    );
  };

  return (
    <div>
      <Title level={3}>Cài đặt tài khoản</Title>
      <Text type="secondary" style={{ marginBottom: 24, display: "block" }}>
        Quản lý thông tin cá nhân và bảo mật tài khoản
      </Text>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Thông tin cá nhân" key="profile">
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                style={{ marginBottom: 16 }}
              />
            )}
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileUpdate}
              initialValues={{
                name: user?.name,
                email: user?.email,
                phoneNumber: user?.phoneNumber,
              }}
            >
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>

              <Form.Item name="phoneNumber" label="Số điện thoại">
                <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Đổi mật khẩu" key="password">
            <Alert
              message="Lưu ý: Nếu bạn đăng nhập bằng Google, bạn không có mật khẩu cục bộ."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Form.Item
                name="oldPassword"
                label="Mật khẩu cũ"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu cũ"
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu mới"
                />
              </Form.Item>

              <Form.Item
                name="confirmNewPassword"
                label="Xác nhận mật khẩu mới"
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu không khớp!"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu mới"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AccountSettingsPage;
