import React, { useState } from "react";
import { Modal, Form, Input, message, Typography } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { customerApi } from "../api/customerApi";

interface QuickAddCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (customerId: string, label: string) => void;
}

const QuickAddCustomerModal: React.FC<QuickAddCustomerModalProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append("name", values.name.trim());
      formData.append("phoneNumber", values.phoneNumber.trim());
      formData.append("email", "");
      formData.append("identityCard", "");
      formData.append("gender", "true");

      const res = await customerApi.addCustomer({
        name: values.name.trim(),
        phoneNumber: values.phoneNumber.trim(),
        email: "",
        gender: true,
        dateOfBirth: null,
        addresses: [],
      });

      if (res?.data?.id) {
        const label = `${values.name.trim()} - ${values.phoneNumber.trim()}`;
        message.success("Đã thêm khách hàng mới thành công!");
        onCreated(res.data.id, label);
        form.resetFields();
        onClose();
      } else {
        message.error("Không thể tạo khách hàng. Vui lòng thử lại.");
      }
    } catch (error: any) {
      if (error?.errorFields) return; // validation error, do nothing
      message.error(
        error?.response?.data?.message || "Lỗi khi tạo khách hàng mới",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <span>
          <UserAddOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          Thêm nhanh Khách hàng
        </span>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleOk}
      okText="Tạo & Chọn"
      cancelText="Hủy"
      confirmLoading={loading}
      width={420}
      destroyOnClose
    >
      <Typography.Text
        type="secondary"
        style={{ display: "block", marginBottom: 16 }}
      >
        Chỉ cần nhập Tên và Số điện thoại. Thông tin có thể bổ sung sau.
      </Typography.Text>
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
        >
          <Input placeholder="Nguyễn Văn A" size="large" autoFocus />
        </Form.Item>
        <Form.Item
          name="phoneNumber"
          label="Số điện thoại"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            {
              pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/,
              message: "Số điện thoại không hợp lệ",
            },
          ]}
        >
          <Input placeholder="0912345678" size="large" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuickAddCustomerModal;
