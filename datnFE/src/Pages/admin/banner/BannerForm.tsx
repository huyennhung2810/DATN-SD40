import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Button,
  Space,
  Upload,
  Image,
  message,
  Tabs,
  Row,
  Col,
  Typography,
} from "antd";
import { PlusOutlined, UploadOutlined, SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import bannerApi from "../../../api/bannerApi";
import type { BannerRequest } from "../../../models/banner";
import {
  BannerPosition,
  BannerPositionLabel,
  BannerType,
  BannerTypeLabel,
  LinkTarget,
  LinkTargetLabel,
  EntityStatus,
  EntityStatusLabel,
} from "../../../models/banner";

const { Title, Text } = Typography;
const { TextArea } = Input;

const BannerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [form] = Form.useForm<BannerRequest>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [mobileImageUrl, setMobileImageUrl] = useState<string>("");

  useEffect(() => {
    if (isEdit && id) {
      fetchBanner(id);
    }
  }, [id, isEdit]);

  const fetchBanner = async (bannerId: string) => {
    setLoading(true);
    try {
      const data = await bannerApi.getById(bannerId);
      form.setFieldsValue({
        ...data,
        startAt: data.startAt ? dayjs(data.startAt) : undefined,
        endAt: data.endAt ? dayjs(data.endAt) : undefined,
      });
      setImageUrl(data.imageUrl);
      setMobileImageUrl(data.mobileImageUrl || "");
    } catch (error) {
      message.error("Lỗi khi tải thông tin banner");
      navigate("/admin/banners");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: BannerRequest) => {
    setSubmitting(true);
    try {
      const request: BannerRequest = {
        ...values,
        startAt: values.startAt?.toISOString(),
        endAt: values.endAt?.toISOString(),
      };

      if (isEdit && id) {
        await bannerApi.update(id, request);
        message.success("Cập nhật banner thành công");
      } else {
        await bannerApi.create(request);
        message.success("Tạo banner thành công");
      }
      navigate("/admin/banners");
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi lưu banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (info: any, type: "desktop" | "mobile") => {
    const { fileList } = info;
    if (info.file.status === "done" && info.file.response?.url) {
      const url = info.file.response.url;
      if (type === "desktop") {
        setImageUrl(url);
        form.setFieldValue("imageUrl", url);
      } else {
        setMobileImageUrl(url);
        form.setFieldValue("mobileImageUrl", url);
      }
      message.success("Tải ảnh thành công");
    } else if (info.file.status === "error") {
      message.error("Lỗi khi tải ảnh");
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh</div>
    </div>
  );

  const tabItems = [
    {
      key: "basic",
      label: "Thông tin cơ bản",
      children: (
        <Card size="small">
          <Form.Item
            name="title"
            label="Tiêu đề banner"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề banner" },
              { min: 2, message: "Tiêu đề phải có ít nhất 2 ký tự" },
            ]}
          >
            <Input placeholder="Nhập tiêu đề banner" maxLength={200} showCount />
          </Form.Item>

          <Form.Item name="subtitle" label="Tiêu đề phụ">
            <Input placeholder="Nhập tiêu đề phụ" maxLength={255} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea
              placeholder="Nhập mô tả banner"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="buttonText"
                label="Text nút bấm"
              >
                <Input placeholder="Ví dụ: Xem ngay" maxLength={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="backgroundColor" label="Màu nền">
                <Input type="color" placeholder="#ffffff" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: "image",
      label: "Hình ảnh",
      children: (
        <Card size="small">
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Form.Item
                name="imageUrl"
                label="Ảnh Desktop"
                rules={[{ required: true, message: "Vui lòng tải ảnh desktop" }]}
              >
                <div>
                  {imageUrl && (
                    <div style={{ marginBottom: 16 }}>
                      <Image
                        src={imageUrl}
                        alt="Desktop"
                        style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }}
                      />
                    </div>
                  )}
                  <Upload
                    name="file"
                    listType="picture-card"
                    showUploadList={false}
                    action="/api/upload"
                    beforeUpload={(file) => {
                      const isImage = file.type.startsWith("image/");
                      if (!isImage) {
                        message.error("Chỉ được tải file ảnh!");
                      }
                      const isLt5M = file.size / 1024 / 1024 < 5;
                      if (!isLt5M) {
                        message.error("Ảnh phải nhỏ hơn 5MB!");
                      }
                      return isImage && isLt5M;
                    }}
                    onChange={(info) => handleImageUpload(info, "desktop")}
                  >
                    {imageUrl ? null : uploadButton}
                  </Upload>
                </div>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="mobileImageUrl" label="Ảnh Mobile (Optional)">
                <div>
                  {mobileImageUrl && (
                    <div style={{ marginBottom: 16 }}>
                      <Image
                        src={mobileImageUrl}
                        alt="Mobile"
                        style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }}
                      />
                    </div>
                  )}
                  <Upload
                    name="file"
                    listType="picture-card"
                    showUploadList={false}
                    action="/api/upload"
                    beforeUpload={(file) => {
                      const isImage = file.type.startsWith("image/");
                      if (!isImage) {
                        message.error("Chỉ được tải file ảnh!");
                      }
                      const isLt5M = file.size / 1024 / 1024 < 5;
                      if (!isLt5M) {
                        message.error("Ảnh phải nhỏ hơn 5MB!");
                      }
                      return isImage && isLt5M;
                    }}
                    onChange={(info) => handleImageUpload(info, "mobile")}
                  >
                    {mobileImageUrl ? null : uploadButton}
                  </Upload>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: "navigation",
      label: "Điều hướng",
      children: (
        <Card size="small">
          <Form.Item name="linkUrl" label="Link đích">
            <Input placeholder="https://example.com hoặc /path" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="linkTarget" label="Mở link">
                <Select placeholder="Chọn cách mở link">
                  {Object.values(LinkTarget).map((target) => (
                    <Select.Option key={target} value={target}>
                      {LinkTargetLabel[target]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: "display",
      label: "Hiển thị",
      children: (
        <Card size="small">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Vị trí hiển thị"
                rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
              >
                <Select placeholder="Chọn vị trí hiển thị">
                  {Object.values(BannerPosition).map((pos) => (
                    <Select.Option key={pos} value={pos}>
                      {BannerPositionLabel[pos]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="Loại banner">
                <Select placeholder="Chọn loại banner">
                  {Object.values(BannerType).map((type) => (
                    <Select.Option key={type} value={type}>
                      {BannerTypeLabel[type]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Ưu tiên hiển thị"
                tooltip="Số nhỏ hiển thị trước"
              >
                <InputNumber
                  min={0}
                  max={9999}
                  style={{ width: "100%" }}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái">
                <Select placeholder="Chọn trạng thái">
                  {Object.values(EntityStatus)
                    .filter((s) => s !== EntityStatus.DELETED)
                    .map((status) => (
                      <Select.Option key={status} value={status}>
                        {EntityStatusLabel[status]}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="code"
            label="Mã banner"
            tooltip="Mã này dùng để tham chiếu, có thể để trống"
          >
            <Input placeholder="Nhập mã banner (tùy chọn)" />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: "time",
      label: "Thời gian",
      children: (
        <Card size="small">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startAt" label="Ngày bắt đầu hiển thị">
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày bắt đầu"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endAt" label="Ngày kết thúc hiển thị">
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày kết thúc"
                />
              </Form.Item>
            </Col>
          </Row>
          <Text type="secondary">
            Để trống nếu muốn hiển thị vô thời hạn. Nếu có cả hai ngày, ngày bắt đầu phải nhỏ hơn ngày kết thúc.
          </Text>
        </Card>
      ),
    },
  ];

  return (
    <div className="banner-form-page">
      <Card>
        <div className="page-header">
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin/banners")}
            />
            <Title level={3} style={{ margin: 0 }}>
              {isEdit ? "Sửa Banner" : "Thêm mới Banner"}
            </Title>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            priority: 0,
            status: EntityStatus.ACTIVE,
            type: BannerType.IMAGE,
            linkTarget: LinkTarget.SAME_TAB,
          }}
        >
          <Tabs items={tabItems} />

          <div className="form-actions">
            <Space>
              <Button onClick={() => navigate("/admin/banners")}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
              >
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>

      <style>{`
        .banner-form-page {
          padding: 24px;
        }
        .page-header {
          margin-bottom: 24px;
        }
        .form-actions {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
};

export default BannerForm;
