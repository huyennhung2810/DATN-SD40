import React, { useState } from "react";
import { Modal, Form, Input, message, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import sensorTypeApi from "../api/sensorTypeApi";
import type { SensorTypeRequest } from "../api/sensorTypeApi";
import lensMountApi from "../api/lensMountApi";
import type { LensMountRequest } from "../api/lensMountApi";
import resolutionApi from "../api/resolutionApi";
import type { ResolutionRequest } from "../api/resolutionApi";
import processorApi from "../api/processorApi";
import type { ProcessorRequest } from "../api/processorApi";
import imageFormatApi from "../api/imageFormatApi";
import type { ImageFormatRequest } from "../api/imageFormatApi";
import videoFormatApi from "../api/videoFormatApi";
import type { VideoFormatRequest } from "../api/videoFormatApi";

export type TechSpecType = "sensorType" | "lensMount" | "resolution" | "processor" | "imageFormat" | "videoFormat";

interface QuickAddTechSpecModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (value: string, label: string) => void;
  type: TechSpecType;
}

const techSpecLabels: Record<TechSpecType, string> = {
  sensorType: "Loại cảm biến",
  lensMount: "Mount ống kính",
  resolution: "Độ phân giải",
  processor: "Bộ xử lý",
  imageFormat: "Định dạng ảnh",
  videoFormat: "Định dạng video",
};

const techSpecPlaceholders: Record<TechSpecType, string> = {
  sensorType: "Ví dụ: CMOS, CCD, BSI CMOS...",
  lensMount: "Ví dụ: Canon EF, Nikon F, Sony E...",
  resolution: "Ví dụ: 24MP, 45MP, 4K, 8K...",
  processor: "Ví dụ: DIGIC X, EXPEED 7, BIONZ XR...",
  imageFormat: "Ví dụ: JPEG, RAW, RAW+JPEG...",
  videoFormat: "Ví dụ: 4K 30fps, 4K 60fps, 8K...",
};

const QuickAddTechSpecModal: React.FC<QuickAddTechSpecModalProps> = ({
  open,
  onClose,
  onCreated,
  type,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const getApiCreateFunction = () => {
    switch (type) {
      case "sensorType":
        return (data: SensorTypeRequest) => sensorTypeApi.create(data);
      case "lensMount":
        return (data: LensMountRequest) => lensMountApi.create(data);
      case "resolution":
        return (data: ResolutionRequest) => resolutionApi.create(data);
      case "processor":
        return (data: ProcessorRequest) => processorApi.create(data);
      case "imageFormat":
        return (data: ImageFormatRequest) => imageFormatApi.create(data);
      case "videoFormat":
        return (data: VideoFormatRequest) => videoFormatApi.create(data);
      default:
        throw new Error(`Unknown tech spec type: ${type}`);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const createFn = getApiCreateFunction();
      const res = await createFn({
        name: values.name.trim(),
        description: values.description?.trim() || "",
        status: "ACTIVE",
      });

      if (res?.data?.id) {
        const label = values.name.trim();
        message.success(`Đã thêm ${techSpecLabels[type]} mới thành công!`);
        onCreated(values.name.trim(), label);
        form.resetFields();
        onClose();
      } else {
        message.error(`Không thể tạo ${techSpecLabels[type]}. Vui lòng thử lại.`);
      }
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(
        error?.response?.data?.message || `Lỗi khi tạo ${techSpecLabels[type]} mới`,
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
          Thêm nhanh {techSpecLabels[type]}
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
        Thêm mới {techSpecLabels[type].toLowerCase()} để sử dụng ngay trong form.
      </Typography.Text>
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={`Tên ${techSpecLabels[type].toLowerCase()}`}
          rules={[{ required: true, message: `Vui lòng nhập tên ${techSpecLabels[type].toLowerCase()}` }]}
        >
          <Input placeholder={techSpecPlaceholders[type]} size="large" autoFocus />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả"
        >
          <Input.TextArea rows={2} placeholder={`Mô tả ${techSpecLabels[type].toLowerCase()} (không bắt buộc)`} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuickAddTechSpecModal;
