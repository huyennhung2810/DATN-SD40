import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  DatePicker,
  InputNumber,
  Space,
  Row,
  Col,
  message,
} from "antd";
import Dragger from "antd/es/upload/Dragger";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import bannerApi from "../../../api/bannerApi";
import type { BannerRequest, BannerPosition, BannerType, LinkTarget } from "../../../models/banner";
import { BANNER_POSITIONS, BANNER_TYPES, LINK_TARGETS } from "../../../models/banner";

const { TextArea } = Input;

interface BannerFormValues {
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  linkTarget?: string;
  position?: string;
  type?: string;
  priority?: number;
  startAt?: dayjs.Dayjs;
  endAt?: dayjs.Dayjs;
  buttonText?: string;
  backgroundColor?: string;
}

const BannerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [form] = Form.useForm<BannerFormValues>();
  const [loading, setLoading] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBanner(id);
    }
  }, [id]);

  const fetchBanner = async (bannerId: string) => {
    setLoading(true);
    try {
      const data = await bannerApi.getById(bannerId);
      form.setFieldsValue({
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        imageUrl: data.imageUrl,
        mobileImageUrl: data.mobileImageUrl,
        linkUrl: data.linkUrl,
        linkTarget: data.linkTarget,
        position: data.position,
        type: data.type,
        priority: data.priority,
        startAt: data.startAt ? dayjs(data.startAt) : undefined,
        endAt: data.endAt ? dayjs(data.endAt) : undefined,
        buttonText: data.buttonText,
        backgroundColor: data.backgroundColor,
      });
      setDesktopPreview(data.imageUrl || null);
      setMobilePreview(data.mobileImageUrl || null);
    } catch {
      message.error("Lỗi khi tải thông tin banner");
      navigate("/admin/banners");
    } finally {
      setLoading(false);
    }
  };

  const handleDesktopUpload = async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      message.error("Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, GIF)");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      message.error("Kích thước file không được vượt quá 10MB");
      return false;
    }

    setUploadingDesktop(true);
    try {
      const url = await bannerApi.uploadImage(file);
      form.setFieldValue("imageUrl", url);
      setDesktopPreview(url);
      message.success("Upload ảnh desktop thành công");
    } catch {
      message.error("Upload ảnh desktop thất bại");
    } finally {
      setUploadingDesktop(false);
    }
    return false;
  };

  const handleMobileUpload = async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      message.error("Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, GIF)");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      message.error("Kích thước file không được vượt quá 10MB");
      return false;
    }

    setUploadingMobile(true);
    try {
      const url = await bannerApi.uploadImage(file);
      form.setFieldValue("mobileImageUrl", url);
      setMobilePreview(url);
      message.success("Upload ảnh mobile thành công");
    } catch {
      message.error("Upload ảnh mobile thất bại");
    } finally {
      setUploadingMobile(false);
    }
    return false;
  };

  const handleRemoveDesktop = () => {
    form.setFieldValue("imageUrl", undefined);
    setDesktopPreview(null);
  };

  const handleRemoveMobile = () => {
    form.setFieldValue("mobileImageUrl", undefined);
    setMobilePreview(null);
  };

  const onFinish = async (values: BannerFormValues) => {
    setLoading(true);
    try {
      const imageUrl = typeof values.imageUrl === "string" ? values.imageUrl : desktopPreview || "";
      const mobileImageUrl = typeof values.mobileImageUrl === "string" ? values.mobileImageUrl : mobilePreview || undefined;

      const data: BannerRequest = {
        title: values.title!,
        subtitle: values.subtitle || undefined,
        description: values.description || undefined,
        imageUrl,
        mobileImageUrl,
        linkUrl: values.linkUrl || undefined,
        linkTarget: (values.linkTarget as LinkTarget) || undefined,
        position: (values.position as BannerPosition) || undefined,
        type: (values.type as BannerType) || undefined,
        priority: values.priority ?? 0,
        startAt: values.startAt ? values.startAt.format("YYYY-MM-DDTHH:mm:ss") : undefined,
        endAt: values.endAt ? values.endAt.format("YYYY-MM-DDTHH:mm:ss") : undefined,
        buttonText: values.buttonText || undefined,
        backgroundColor:
          values.backgroundColor && values.backgroundColor.trim() !== "" ? values.backgroundColor : undefined,
      };

      console.log("[DEBUG] Banner request payload:", JSON.stringify(data, null, 2));
      if (isEdit && id) {
        await bannerApi.update(id, data);
        message.success("Cập nhật banner thành công");
      } else {
        if (!data.imageUrl) {
          message.error("Vui lòng upload ảnh desktop");
          setLoading(false);
          return;
        }
        await bannerApi.create(data);
        message.success("Tạo banner thành công");
      }
      navigate("/admin/banners");
    } catch (err: any) {
      const errorMsg =
        err?.message
        || (isEdit ? "Cập nhật banner thất bại" : "Tạo banner thất bại");
      message.error(errorMsg);
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
              onClick={() => navigate("/admin/banners")}
            />
            <span>{isEdit ? "Chỉnh sửa Banner" : "Thêm Banner mới"}</span>
          </Space>
        }
        loading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            position: "HOME_HERO",
            type: "IMAGE",
            linkTarget: "SAME_TAB",
            priority: 0,
          }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input placeholder="Nhập tiêu đề banner" />
              </Form.Item>

              <Form.Item name="subtitle" label="Phụ đề">
                <Input placeholder="Nhập phụ đề" />
              </Form.Item>

              <Form.Item name="description" label="Mô tả">
                <TextArea rows={3} placeholder="Nhập mô tả" />
              </Form.Item>

              <Form.Item
                name="position"
                label="Vị trí hiển thị"
                rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
              >
                <Select placeholder="Chọn vị trí">
                  {BANNER_POSITIONS.map((pos) => (
                    <Select.Option key={pos.value} value={pos.value}>
                      {pos.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="type"
                label="Loại banner"
                rules={[{ required: true, message: "Vui lòng chọn loại banner" }]}
              >
                <Select placeholder="Chọn loại">
                  {BANNER_TYPES.map((type) => (
                    <Select.Option key={type.value} value={type.value}>
                      {type.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="priority" label="Thứ tự ưu tiên">
                <InputNumber min={0} style={{ width: "100%" }} placeholder="Số càng lớn càng ưu tiên" />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name="imageUrl"
                label="Ảnh Desktop"
                rules={[{ required: true, message: "Vui lòng upload ảnh desktop" }]}
              >
                {desktopPreview ? (
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <img
                      src={desktopPreview}
                      alt="Desktop preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        borderRadius: "8px",
                        border: "1px solid #d9d9d9",
                      }}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleRemoveDesktop}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        background: "rgba(255,255,255,0.9)",
                      }}
                    />
                  </div>
                ) : (
                  <Dragger
                    showUploadList={false}
                    beforeUpload={handleDesktopUpload}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    disabled={uploadingDesktop}
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined style={{ color: uploadingDesktop ? "#bfbfbf" : "#1890ff" }} />
                    </p>
                    <p className="ant-upload-text">
                      {uploadingDesktop ? "Đang upload..." : "Click hoặc kéo thả file ảnh vào đây"}
                    </p>
                    <p className="ant-upload-hint">Hỗ trợ: JPG, PNG, WEBP, GIF (tối đa 10MB)</p>
                  </Dragger>
                )}
              </Form.Item>

              <Form.Item name="mobileImageUrl" label="Ảnh Mobile">
                {mobilePreview ? (
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <img
                      src={mobilePreview}
                      alt="Mobile preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        borderRadius: "8px",
                        border: "1px solid #d9d9d9",
                      }}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleRemoveMobile}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        background: "rgba(255,255,255,0.9)",
                      }}
                    />
                  </div>
                ) : (
                  <Dragger
                    showUploadList={false}
                    beforeUpload={handleMobileUpload}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    disabled={uploadingMobile}
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined style={{ color: uploadingMobile ? "#bfbfbf" : "#1890ff" }} />
                    </p>
                    <p className="ant-upload-text">
                      {uploadingMobile ? "Đang upload..." : "Click hoặc kéo thả file ảnh vào đây"}
                    </p>
                    <p className="ant-upload-hint">Hỗ trợ: JPG, PNG, WEBP, GIF (tối đa 10MB)</p>
                  </Dragger>
                )}
              </Form.Item>

              <Form.Item name="linkUrl" label="Link đích">
                <Input placeholder="https://example.com" />
              </Form.Item>

              <Form.Item name="linkTarget" label="Mở link">
                <Select placeholder="Chọn cách mở link">
                  {LINK_TARGETS.map((target) => (
                    <Select.Option key={target.value} value={target.value}>
                      {target.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="buttonText" label="Nút bấm">
                <Input placeholder="Xem chi tiết" />
              </Form.Item>

              <Form.Item name="backgroundColor" label="Màu nền">
                <Input type="color" value={null} style={{ width: "100%", height: "40px" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Form.Item name="startAt" label="Ngày bắt đầu">
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="endAt"
                label="Ngày kết thúc"
                dependencies={["startAt"]}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || !getFieldValue("startAt")) {
                        return Promise.resolve();
                      }
                      if (dayjs(value).isBefore(dayjs(getFieldValue("startAt")))) {
                        return Promise.reject(new Error("Ngày kết thúc phải lớn hơn ngày bắt đầu"));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </Button>
              <Button onClick={() => navigate("/admin/banners")}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BannerForm;
