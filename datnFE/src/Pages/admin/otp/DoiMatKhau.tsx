import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, notification, Card } from "antd";
import axios from "axios"; // Đảm bảo bạn đã cài axios hoặc dùng fetch

interface ChangePasswordValues {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const ChangePasswordPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: ChangePasswordValues) => {
    setLoading(true);
    try {
      // 1. CHỐT CHẶN CUỐI: Trim mật khẩu để tránh lỗi 61 ký tự
      const payload = {
        oldPassword: values.oldPassword?.trim(),
        newPassword: values.newPassword?.trim(),
      };

      // 2. GỌI API THỰC TẾ (Thay URL đúng với cấu hình của bạn)
      // Giả sử API: /api/v1/auth/change-password/{username}
      await axios.post(
        "http://localhost:8386/api/v1/admin/employee/change-password/" +
          username,
        payload,
      );

      notification.success({
        message: "Thành công",
        description: "Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại!",
      });

      navigate("/admin/login");
    } catch (error: any) {
      // 3. XỬ LÝ LỖI: Hiện thông báo nếu mật khẩu cũ sai hoặc không đúng định dạng
      notification.error({
        message: "Lỗi cập nhật",
        description:
          error.response?.data?.message ||
          "Mật khẩu hiện tại không chính xác hoặc không đủ độ mạnh!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Card
        title={<span style={{ fontSize: "20px" }}>Thiết lập mật khẩu mới</span>}
        style={{
          width: 450,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          borderRadius: "12px",
        }}
      >
        <p style={{ marginBottom: 24, textAlign: "center" }}>
          Tài khoản:{" "}
          <strong style={{ color: "#d32f2f", fontSize: "16px" }}>
            {username}
          </strong>
        </p>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            label="Mật khẩu hiện tại (trong Email)"
            name="oldPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu từ Email!" },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu hiện tại" size="large" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              {
                // Đồng bộ với Regex Backend (8 ký tự, 1 hoa, 1 thường, 1 số, 1 đặc biệt)
                pattern:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message:
                  "Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt!",
              },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" size="large" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận lại mật khẩu!" },
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
            <Input.Password placeholder="Nhập lại mật khẩu mới" size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                backgroundColor: "#d32f2f",
                borderColor: "#d32f2f",
                height: "45px",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;
