import React, { useEffect, useState, useRef } from "react"; // 1. Thêm useState vào đây
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Table,
  message,
  Radio,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs, { Dayjs } from "dayjs";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  addDiscountRequest,
  updateDiscountRequest,
  getDiscountByIdRequest,
  resetCurrentDiscount,
} from "../../../redux/discount/discountSlice";
import { productDetailApi } from "../../../api/discountApi";

const { Search } = Input; // Lấy component Search
const { Title } = Typography;
const { RangePicker } = DatePicker;

const DiscountForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const isSubmittingRef = useRef(false);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 4. Giả lập dữ liệu sản phẩm (Bạn nên thay bằng dữ liệu từ Redux/API thực tế)
  const [allProductDetails, setAllProductDetails] = useState<any[]>([]);
  const disabledDate = (current: Dayjs) =>
    current && current < dayjs().startOf("day");
  const { currentDiscount, loading } = useSelector(
    (state: RootState) => state.discount,
  );
  // Hàm gọi API lấy sản phẩm
  const fetchProducts = async (searchKey: string = "") => {
    try {
      const res: any = await productDetailApi.getAll({
        page: 0,
        size: 1000,
        keyword: searchKey,
      });

      const rawData = res.data.content || res.data;

      const formattedData = rawData.map((item: any) => ({
        id: item.id,
        // PHẢI THÊM 3 DÒNG NÀY ĐỂ BẢNG (TABLE) CÓ THỂ ĐỌC ĐƯỢC:
        code: item.code,
        productName: item.productName,
        colorName: item.colorName || "N/A",

        // Các dòng cũ của bạn giữ nguyên
        salePrice: item.salePrice,
        quantity: item.quantity,
        storageCapacityName: item.storageCapacityName || "N/A",
        version: item.version || "N/A",
        status: item.status,
      }));

      setAllProductDetails(formattedData);
    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
    }
  };
  // Gọi lần đầu khi mở form
  useEffect(() => {
    fetchProducts("");
  }, []);
  useEffect(() => {
    if (id) {
      dispatch(getDiscountByIdRequest(id));
    } else {
      dispatch(resetCurrentDiscount());
      form.resetFields();
      setSelectedRowKeys([]);
    }
  }, [id, dispatch, form]);

  useEffect(() => {
    if (id && currentDiscount) {
      form.setFieldsValue({
        code: currentDiscount.code,
        name: currentDiscount.name,
        discountPercent: currentDiscount.discountPercent,
        quantity: currentDiscount.quantity,
        note: currentDiscount.note,
        status: currentDiscount.status === 0 ? 0 : 1,
        // Đổ dữ liệu vào form để hiển thị
        createdAt: currentDiscount.createdAt
          ? dayjs(currentDiscount.createdAt).format("DD/MM/YYYY HH:mm")
          : "N/A",
        updatedAt: currentDiscount.updatedAt
          ? dayjs(currentDiscount.updatedAt).format("DD/MM/YYYY HH:mm")
          : "N/A",
        timeRange: [
          dayjs(currentDiscount.startDate),
          dayjs(currentDiscount.endDate),
        ],
      });

      if (currentDiscount.discountDetails) {
        const ids = currentDiscount.discountDetails.map(
          (item: any) => item.productDetailId || item.productDetail?.id,
        );
        setSelectedRowKeys(ids);
      }
    }
  }, [currentDiscount, id, form]);

  const onFinish = (values: any) => {
    // 2. Chặn đứng nếu đang xử lý
    if (isSubmittingRef.current || loading) return;

    // 3. Khóa cửa ngay lập tức
    isSubmittingRef.current = true;
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 sản phẩm!");
      return;
    }

    // Đóng gói dữ liệu chuẩn
    const payload = {
      code: values.code,
      name: values.name,
      discountPercent: Number(values.discountPercent),
      quantity: Number(values.quantity),
      note: values.note,
      // Chuyển Dayjs về số Long (Timestamp)
      startDate: values.timeRange ? values.timeRange[0].valueOf() : null,
      endDate: values.timeRange ? values.timeRange[1].valueOf() : null,
      createdBy: localStorage.getItem("employeeCode") || "Nhung",
      updatedBy: localStorage.getItem("employeeCode") || "Nhung",
      productDetailIds: selectedRowKeys, // Danh sách ID sản phẩm đã chọn
    };

    if (id) {
      // TRƯỜNG HỢP CẬP NHẬT
      dispatch(
        updateDiscountRequest({
          id: id,
          data: payload,
          navigate: () => navigate("/discount"),
        }),
      );
    } else {
      // TRƯỜNG HỢP THÊM MỚI
      dispatch(
        addDiscountRequest({
          data: payload,
          navigate: () => navigate("/discount"),
        }),
      );
    }
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 2000);
  };
  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/discount")}
        >
          Quay lại
        </Button>
        <Card
          title={
            <Title level={4}>
              {id ? "Cập nhật đợt giảm giá" : "Tạo mới đợt giảm giá"}
            </Title>
          }
        >
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Mã giảm giá"
                  name="code"
                  rules={[{ required: true, message: "Vui lòng nhập mã!" }]}
                >
                  <Input placeholder="Ví dụ: DIS2026" disabled={!!id} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tên chương trình"
                  name="name"
                  rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                >
                  <Input placeholder="Ví dụ: Giảm giá hè rực rỡ" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Mức giảm (%)"
                  name="discountPercent"
                  rules={[
                    { required: true, message: "Vui lòng nhập mức giảm!" },
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={100}
                    style={{ width: "100%" }}
                    formatter={(v) => `${v}%`}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Số lượng"
                  name="quantity"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng!" },
                  ]}
                >
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Thời gian áp dụng"
                  name="timeRange"
                  rules={[
                    { required: true, message: "Vui lòng chọn thời gian!" },
                  ]}
                >
                  <RangePicker
                    disabledDate={disabledDate}
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Chế độ vận hành"
                  name="status"
                  initialValue={1}
                  tooltip="Chế độ tự động sẽ kích hoạt chương trình dựa trên thời gian. Buộc dừng sẽ tắt chương trình ngay lập tức."
                >
                  <Radio.Group optionType="button" buttonStyle="solid">
                    <Radio.Button value={1}>
                      Chạy tự động (Theo thời gian)
                    </Radio.Button>
                    <Radio.Button value={0}>
                      Buộc dừng (Tắt chương trình)
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>

              {id && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Typography.Text strong>
                          Thông tin người tạo
                        </Typography.Text>
                      }
                    >
                      <Input
                        size="large"
                        disabled
                        prefix={<UserOutlined />}
                        value={`${currentDiscount?.createdBy || "N/A"} - ${
                          currentDiscount?.createdAt
                            ? dayjs(currentDiscount.createdAt).format(
                                "DD/MM/YYYY HH:mm",
                              )
                            : "N/A"
                        }`}
                        style={{
                          backgroundColor: "#f5f5f5",
                          color: "#595959",
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={
                        <Typography.Text strong>
                          Thông tin cập nhật cuối
                        </Typography.Text>
                      }
                    >
                      <Input
                        size="large"
                        disabled
                        prefix={<UserOutlined />}
                        value={`${currentDiscount?.updatedBy || "N/A"} - ${
                          currentDiscount?.updatedAt
                            ? dayjs(currentDiscount.updatedAt).format(
                                "DD/MM/YYYY HH:mm",
                              )
                            : "N/A"
                        }`}
                        style={{
                          backgroundColor: "#f5f5f5",
                          color: "#595959",
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Col span={24}>
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea
                    rows={4}
                    placeholder="Nhập ghi chú chi tiết về chương trình..."
                  />
                </Form.Item>
              </Col>
            </Row>

            <Title level={5} style={{ marginTop: 20 }}>
              Chọn sản phẩm áp dụng
            </Title>
            {/* THÊM Ô TÌM KIẾM TẠI ĐÂY */}
            <div style={{ marginBottom: 16, maxWidth: 400 }}>
              <Search
                placeholder="Tìm theo tên máy ảnh hoặc mã..."
                allowClear
                enterButton="Tìm kiếm"
                size="middle"
                onSearch={(value) => fetchProducts(value)} // Gọi API khi nhấn Enter hoặc nút Tìm
              />
            </div>
            <Table
              rowSelection={{
                type: "checkbox",
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
              }}
              columns={[
                {
                  title: "Mã SP",
                  dataIndex: "code",
                  key: "code",
                },
                {
                  title: "Tên máy ảnh",
                  dataIndex: "productName",
                  key: "productName",
                },
                {
                  title: "Màu sắc",
                  dataIndex: "colorName",
                  key: "colorName",
                },
                {
                  title: "Dung lượng",
                  dataIndex: "storageCapacityName",
                  key: "storageCapacityName",
                },
                {
                  title: "Cấu hình",
                  dataIndex: "version",
                  key: "version",
                },
                {
                  title: "Giá bán",
                  dataIndex: "salePrice",
                  key: "salePrice",
                  // Thêm 'vi-VN' để dấu phẩy/chấm phân cách tiền tệ chuẩn xác theo kiểu Việt Nam
                  render: (val) =>
                    val ? `${val.toLocaleString("vi-VN")} VND` : "0 VND",
                },
                {
                  title: "Số lượng",
                  dataIndex: "quantity",
                  key: "quantity",
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  render: (status) => {
                    // Cập nhật trạng thái 1 thành Đang bán
                    if (status === 0 || status === "ACTIVE") {
                      return (
                        <span style={{ color: "green", fontWeight: 500 }}>
                          Đang bán
                        </span>
                      );
                    }
                    return (
                      <span style={{ color: "red", fontWeight: 500 }}>
                        Ngừng bán
                      </span>
                    );
                  },
                },
              ]}
              dataSource={allProductDetails}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              style={{ marginBottom: 20 }}
            />

            <div style={{ textAlign: "right" }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                disabled={loading} // Khóa hoàn toàn, không cho nhấn thêm lần 2
                size="large"
                style={{ minWidth: "150px" }} // Thêm một chút độ rộng để nút không bị co lại khi hiện icon xoay
              >
                {id ? "Lưu thay đổi" : "Kích hoạt chương trình"}
              </Button>
            </div>
          </Form>
        </Card>
      </Space>
    </div>
  );
};

export default DiscountForm;
