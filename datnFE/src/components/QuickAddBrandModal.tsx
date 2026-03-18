import React, { useState } from "react";
import { Modal, Form, Input, message, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import brandApi from "../api/brandApi";

interface QuickAddBrandModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (brandId: string, label: string) => void;
}

const QuickAddBrandModal: React.FC<QuickAddBrandModalProps> = ({
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

      const res = await brandApi.create({
        name: values.name.trim(),
        code: values.code?.trim() || values.name.trim().toUpperCase().replace(/\s+/g, ""),
        description: values.description?.trim() || "",
        status: "ACTIVE",
      });

      if (res?.data?.id) {
        const label = values.name.trim();
        message.success("Đã thêm thương hiệu mới thành công!");
        onCreated(res.data.id, label);
        form.resetFields();
        onClose();
      } else {
        message.error("Không thể tạo thương hiệu. Vui lòng thử lại.");
      }
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(
        error?.response?.data?.message || "Lỗi khi tạo thương hiệu mới",
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
          Thêm nhanh Thương hiệu
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
        Thêm mới thương hiệu để sử dụng ngay trong form.
      </Typography.Text>
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên thương hiệu"
          rules={[{ required: true, message: "Vui lòng nhập tên thương hiệu" }]}
        >
          <Input placeholder="Ví dụ: Canon, Nikon, Sony,..." size="large" autoFocus />
        </Form.Item>
        <Form.Item
          name="code"
          label="Mã thương hiệu"
          tooltip="Để trống sẽ tự động tạo mã từ tên"
        >
          <Input placeholder="CANON, NIKON, SONY,..." size="large" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả"
        >
          <Input.TextArea rows={2} placeholder="Mô tả thương hiệu (không bắt buộc)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuickAddBrandModal;
