import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  Space,
  Row,
  Col,
  message,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import accountApi from "../../../api/accountApi";
import type { AccountRequest, AccountResponse, AccountRole } from "../../../models/account";
import { ACCOUNT_ROLES, ACCOUNT_PROVIDERS } from "../../../models/account";

const AccountForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [form] = Form.useForm<AccountRequest>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAccount(id);
    }
  }, [id]);

  const fetchAccount = async (accountId: string) => {
    setLoading(true);
    try {
      const data = await accountApi.getById(accountId);
      form.setFieldsValue({
        username: data.username,
        role: data.role,
        provider: data.provider,
      });
    } catch (error) {
      message.error("Lỗi khi tải thông tin tài khoản");
      navigate("/admin/accounts");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: AccountRequest) => {
    setLoading(true);
    try {
      if (isEdit && id) {
        await accountApi.update(id, values);
        message.success("Cập nhật tài khoản thành công");
      } else {
        await accountApi.create(values);
        message.success("Tạo tài khoản thành công");
      }
      navigate("/admin/accounts");
    } catch (error: any) {
      message.error(error.response?.data?.message || (isEdit ? "Cập nhật tài khoản thất bại" : "Tạo tài khoản thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin/accounts")}
            />
            <span>{isEdit ? "Chỉnh sửa Tài khoản" : "Thêm Tài khoản mới"}</span>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            role: "STAFF",
            provider: "local",
          }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng nhập" },
                  { min: 3, max: 50, message: "Tên đăng nhập phải từ 3 đến 50 ký tự" },
                  { pattern: /^\S+$/, message: "Tên đăng nhập không được chứa khoảng trắng" },
                ]}
              >
                <Input placeholder="Nhập tên đăng nhập" disabled={isEdit} />
              </Form.Item>

              {!isEdit && (
                <>
                  <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu" },
                      { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
                      {
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                        message: "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
                      },
                    ]}
                  >
                    <Input.Password placeholder="Nhập mật khẩu" />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    dependencies={["password"]}
                    rules={[
                      { required: true, message: "Vui lòng xác nhận mật khẩu" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Xác nhận mật khẩu" />
                  </Form.Item>
                </>
              )}
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name="role"
                label="Vai trò"
                rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
              >
                <Select placeholder="Chọn vai trò">
                  {ACCOUNT_ROLES.map((role) => (
                    <Select.Option key={role.value} value={role.value}>
                      {role.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="provider" label="Nhà cung cấp">
                <Select placeholder="Chọn nhà cung cấp" disabled={isEdit}>
                  {ACCOUNT_PROVIDERS.map((provider) => (
                    <Select.Option key={provider.value} value={provider.value}>
                      {provider.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </Button>
              <Button onClick={() => navigate("/admin/accounts")}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AccountForm;
