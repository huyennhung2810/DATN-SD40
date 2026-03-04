import React, { useEffect, useState } from "react"; // 1. Thêm useState vào đây
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
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  addDiscountRequest,
  updateDiscountRequest,
  getDiscountByIdRequest,
  resetCurrentDiscount,
} from "../../../redux/discount/discountSlice";
import type { DiscountRequest } from "../../../models/Discount";
import productDetailApi from "../../../api/productDetailApi";
const { Search } = Input; // Lấy component Search
const { Title } = Typography;
const { RangePicker } = DatePicker;

const DiscountForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [keyword, setKeyword] = useState<string>(""); // State lưu từ khóa tìm kiếm
  // 3. Đưa selectedRowKeys vào TRONG component
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 4. Giả lập dữ liệu sản phẩm (Bạn nên thay bằng dữ liệu từ Redux/API thực tế)
  const [allProductDetails, setAllProductDetails] = useState<any[]>([]);

  const { currentDiscount, loading } = useSelector(
    (state: RootState) => state.discount,
  );
  // Hàm gọi API lấy sản phẩm (đã cập nhật để nhận keyword)
  const fetchProducts = async (searchKey: string = "") => {
    try {
      const res: any = await productDetailApi.getAll({
        page: 0,
        size: 1000,
        keyword: searchKey, // Truyền keyword xuống BE
      });

      const rawData = res.data.content || res.data;
      const formattedData = rawData.map((item: any) => ({
        id: item.id,
        name: `${item.product?.name} [${item.color?.name || "N/A"}]`,
        salePrice: item.salePrice,
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
      createdAt: currentDiscount.createdAt ? dayjs(currentDiscount.createdAt).format("DD/MM/YYYY HH:mm") : "N/A",
      updatedAt: currentDiscount.updatedAt ? dayjs(currentDiscount.updatedAt).format("DD/MM/YYYY HH:mm") : "N/A",
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

  // Thêm useEffect này để lấy dữ liệu
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Lấy danh sách sản phẩm (giả sử lấy 1000 cái để chọn cho thoải mái)
        const response: any = await productDetailApi.productDetail.getAll({
          page: 0,
          size: 1000,
        });
        console.log("Check data nè:", response);

        // Map lại dữ liệu để hiển thị tên máy ảnh đầy đủ hơn
        const mappedData = response.data.content.map((item: any) => ({
          ...item,
          // Kết hợp Tên + Màu để người dùng dễ chọn
          name: `${item.product?.name || "N/A"} [${item.color?.name || "N/A"}]`,
          salePrice: item.salePrice,
        }));

        setAllProductDetails(mappedData);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        message.error("Không thể tải danh sách sản phẩm máy ảnh");
      }
    };

    loadProducts();
  }, []);

  const onFinish = (values: any) => {
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
                    <Form.Item label="Ngày tạo" name="createdAt">
                      <Input
                        disabled
                        style={{
                          backgroundColor: "#f5f5f5",
                          color: "rgba(0,0,0,0.65)",
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Lần cập nhật cuối" name="updatedAt">
                      <Input
                        disabled
                        style={{
                          backgroundColor: "#f5f5f5",
                          color: "rgba(0,0,0,0.65)",
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
                { title: "Tên máy ảnh", dataIndex: "name", key: "name" },
                {
                  title: "Giá bán",
                  dataIndex: "salePrice",
                  key: "salePrice",
                  render: (val) =>
                    val ? `${val.toLocaleString()} VND` : "0 VND",
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
                size="large"
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
