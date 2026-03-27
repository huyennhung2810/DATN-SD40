import React, { useState } from "react";
import { Modal, Form, Input, message, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { storageCapacityApi } from "../api/storageApi";

interface QuickAddStorageModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (storageId: string, label: string) => void;
}

const QuickAddStorageModal: React.FC<QuickAddStorageModalProps> = ({
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

      const res = await storageCapacityApi.addStorage({
        name: values.name.trim(),
        code: values.code?.trim() || values.name.trim().toUpperCase().replace(/\s+/g, ""),
        status: "ACTIVE",
      });

      if (res?.data?.id) {
        const label = values.name.trim();
        message.success("Đã thêm dung lượng mới thành công!");
        onCreated(res.data.id, label);
        form.resetFields();
        onClose();
      } else {
        message.error("Không thể tạo dung lượng. Vui lòng thử lại.");
      }
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(
        error?.response?.data?.message || "Lỗi khi tạo dung lượng mới",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <span>
          <PlusOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          Thêm nhanh Dung lượng
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
      destroyOnHidden
    >
      <Typography.Text
        type="secondary"
        style={{ display: "block", marginBottom: 16 }}
      >
        Thêm mới dung lượng để sử dụng ngay trong form.
      </Typography.Text>
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên dung lượng"
          rules={[{ required: true, message: "Vui lòng nhập tên dung lượng" }]}
        >
          <Input placeholder="Ví dụ: 128GB, 256GB, 512GB, 1TB..." size="large" autoFocus />
        </Form.Item>
        <Form.Item
          name="code"
          label="Mã dung lượng"
          tooltip="Để trống sẽ tự động tạo mã từ tên"
        >
          <Input placeholder="128GB, 256GB, 512GB, 1TB..." size="large" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuickAddStorageModal;
