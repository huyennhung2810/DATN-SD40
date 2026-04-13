import React, { useState } from "react";
import { Modal, Form, Input, message, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import productCategoryApi from "../api/productCategoryApi";

interface QuickAddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (categoryId: string, label: string) => void;
}

const QuickAddCategoryModal: React.FC<QuickAddCategoryModalProps> = ({
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

      const res = await productCategoryApi.create({
        name: values.name.trim(),
        code: values.code?.trim() || values.name.trim().toUpperCase().replace(/\s+/g, ""),
        description: values.description?.trim() || "",
        status: "ACTIVE",
      });

      if (res?.data?.id) {
        const label = values.name.trim();
        message.success("Đã thêm loại sản phẩm mới thành công!");
        onCreated(res.data.id, label);
        form.resetFields();
        onClose();
      } else {
        message.error("Không thể tạo loại sản phẩm. Vui lòng thử lại.");
      }
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(
        error?.response?.data?.message || "Lỗi khi tạo loại sản phẩm mới",
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
          Thêm nhanh Loại sản phẩm
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
        Thêm mới loại sản phẩm để sử dụng ngay trong form.
      </Typography.Text>
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên loại sản phẩm"
          rules={[{ required: true, message: "Vui lòng nhập tên loại sản phẩm" }]}
        >
          <Input placeholder="Ví dụ: Máy ảnh, Ống kính,..." size="large" autoFocus />
        </Form.Item>
        <Form.Item
          name="code"
          label="Mã loại sản phẩm"
          tooltip="Để trống sẽ tự động tạo mã từ tên"
        >
          <Input placeholder="CAMERA, LENS,..." size="large" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả"
        >
          <Input.TextArea rows={2} placeholder="Mô tả loại sản phẩm (không bắt buộc)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuickAddCategoryModal;
