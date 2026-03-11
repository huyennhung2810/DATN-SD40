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
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import bannerApi from "../../../api/bannerApi";
import type { BannerRequest } from "../../../models/banner";
import { BANNER_POSITIONS, BANNER_TYPES, LINK_TARGETS } from "../../../models/banner";

const { TextArea } = Input;

const BannerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [form] = Form.useForm<BannerRequest>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBanner(id);
    }
  }, [id]);

  const fetchBanner = async (bannerId: string) => {
    setLoading(true);
    try {
      const data = await bannerApi.getById(bannerId);
      const formatData: BannerRequest = {
        ...data,
        startAt: data.startAt ? dayjs(data.startAt).format("YYYY-MM-DDTHH:mm:ss") : undefined,
        endAt: data.endAt ? dayjs(data.endAt).format("YYYY-MM-DDTHH:mm:ss") : undefined,
      };
      form.setFieldsValue(formatData);
    } catch (error) {
      message.error("Lỗi khi tải thông tin banner");
      navigate("/admin/banners");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: BannerRequest) => {
    setLoading(true);
    try {
      const data = {
        ...values,
        startAt: values.startAt ? dayjs(values.startAt).format("YYYY-MM-DDTHH:mm:ss") : undefined,
        endAt: values.endAt ? dayjs(values.endAt).format("YYYY-MM-DDTHH:mm:ss") : undefined,
      };

      if (isEdit && id) {
        await bannerApi.update(id, data);
        message.success("Cập nhật banner thành công");
      } else {
        await bannerApi.create(data);
        message.success("Tạo banner thành công");
      }
      navigate("/admin/banners");
    } catch (error) {
      message.error(isEdit ? "Cập nhật banner thất bại" : "Tạo banner thất bại");
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
                rules={[{ required: true, message: "Vui lòng nhập URL ảnh" }]}
              >
                <Input placeholder="Nhập URL ảnh desktop" />
              </Form.Item>

              <Form.Item name="mobileImageUrl" label="Ảnh Mobile">
                <Input placeholder="Nhập URL ảnh mobile" />
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
                <Input type="color" style={{ width: "100%", height: "40px" }} />
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
