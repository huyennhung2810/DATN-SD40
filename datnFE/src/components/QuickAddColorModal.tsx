import React, { useState } from "react";
import { Modal, Form, Input, message, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { colorApi } from "../api/colorApi";

interface QuickAddColorModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (colorId: string, label: string) => void;
}

const QuickAddColorModal: React.FC<QuickAddColorModalProps> = ({
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

      const res = await colorApi.addColor({
        name: values.name.trim(),
        code: values.code?.trim() || values.name.trim().toUpperCase().replace(/\s+/g, ""),
        status: "ACTIVE",
      });

      if (res?.data?.id) {
        const label = values.name.trim();
        message.success("Đã thêm màu sắc mới thành công!");
        onCreated(res.data.id, label);
        form.resetFields();
        onClose();
      } else {
        message.error("Không thể tạo màu sắc. Vui lòng thử lại.");
      }
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(
        error?.response?.data?.message || "Lỗi khi tạo màu sắc mới",
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
          Thêm nhanh Màu sắc
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
        Thêm mới màu sắc để sử dụng ngay trong form.
      </Typography.Text>
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên màu sắc"
          rules={[{ required: true, message: "Vui lòng nhập tên màu sắc" }]}
        >
          <Input placeholder="Ví dụ: Đen, Trắng, Xanh đậm..." size="large" autoFocus />
        </Form.Item>
        <Form.Item
          name="code"
          label="Mã màu"
          tooltip="Để trống sẽ tự động tạo mã từ tên"
        >
          <Input placeholder="BLACK, WHITE, NAVY..." size="large" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuickAddColorModal;
