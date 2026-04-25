import React, { useEffect, useState, useRef,useMemo } from "react";
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
import { SaveOutlined, ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
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

const { Search } = Input;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const DiscountForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const isSubmittingRef = useRef(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [allProductDetails, setAllProductDetails] = useState<any[]>([]);

// LOGIC CHỌN NGÀY: Khóa quá khứ, nhưng "đặc cách" mở khóa cho đúng ngày bắt đầu cũ
  const disabledDate = (current: Dayjs) => {
    // 1. Lấy mốc hôm nay
    const today = dayjs().startOf("day");

    // 2. Nếu đang Cập nhật và đợt giảm giá có ngày bắt đầu cũ ở trong quá khứ
    if (id && currentDiscount?.startDate) {
      const originalStartDate = dayjs(currentDiscount.startDate).startOf("day");
      
      // Nếu ô đang vẽ trên lịch CHÍNH LÀ ngày bắt đầu cũ -> Cho phép (return false)
      if (current.isSame(originalStartDate, 'day')) {
        return false; 
      }
    }

    // 3. Các ngày khác: Cứ trước hôm nay là khóa đen thui
    return current && current.isBefore(today);
  };

  const { currentDiscount, loading } = useSelector(
    (state: RootState) => state.discount,
  );

  // 1. FETCH SẢN PHẨM (Giữ nguyên logic chuẩn)
  const fetchProducts = async (searchKey: string = "") => {
    try {
      const params: any = { page: 0, size: 1000, keyword: searchKey };
      if (id) {
        params.currentDiscountId = id;
      }

      const res: any = await productDetailApi.getAll(params);
      const rawData = res.data?.content || res.data || [];

      const formattedData = rawData.map((item: any) => ({
        id: item.id,
        code: item.code,
        productName: item.productName,
        colorName: item.colorName || "N/A",
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

  // 2. FETCH KHI VÀO TRANG
  useEffect(() => {
    fetchProducts("");
    if (id) {
      dispatch(getDiscountByIdRequest(id));
    } else {
      dispatch(resetCurrentDiscount());
      form.resetFields();
      setSelectedRowKeys([]);
    }
  }, [id, dispatch, form]);

  // 3. ĐỔ DỮ LIỆU VÀO FORM VÀ BẢNG (Logic gốc của bạn cực kỳ an toàn)
  useEffect(() => {
    if (id && currentDiscount) {
      form.setFieldsValue({
        code: currentDiscount.code,
        name: currentDiscount.name,
        discountPercent: currentDiscount.discountPercent,
        quantity: currentDiscount.quantity,
        note: currentDiscount.note,
        status: currentDiscount.status === 0 ? 0 : 1,
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

      // Lấy danh sách ID đã lưu lúc trước và quăng vào state
      if (currentDiscount.discountDetails) {
        const ids = currentDiscount.discountDetails.map(
          (item: any) => item.productDetailId || item.productDetail?.id,
        );
        setSelectedRowKeys(ids);
      }
    }
  }, [currentDiscount, id, form]);

  // 4. XỬ LÝ LƯU DỮ LIỆU (Nơi phép màu xảy ra)
  const onFinish = (values: any) => {
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;
    const validSelectedKeys = selectedRowKeys.filter((key) =>
      allProductDetails.some((product) => product.id === key)
    );

    if (validSelectedKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 sản phẩm hợp lệ!");
      isSubmittingRef.current = false;
      return;
    }

    const payload = {
      code: values.code,
      name: values.name,
      discountPercent: Number(values.discountPercent),
      quantity: Number(values.quantity),
      note: values.note,
      startDate: values.timeRange ? values.timeRange[0].valueOf() : null,
      endDate: values.timeRange ? values.timeRange[1].valueOf() : null,
      createdBy: user?.username || "Nhung",
      updatedBy: user?.username || "Nhung",
      status: values.status,
      // Gửi mảng ID đã được lọc sạch sẽ kẹt xuống Backend
      productDetailIds: validSelectedKeys, 
    };

    if (id) {
      dispatch(
        updateDiscountRequest({
          id: id,
          data: payload,
          navigate: () => navigate("/discount"),
        }),
      );
    } else {
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
const sortedProductDetails = useMemo(() => {
    if (!allProductDetails) return [];

    // Tạo bản sao của mảng và sắp xếp
    return [...allProductDetails].sort((a, b) => {
      // Kiểm tra xem ID của sản phẩm có nằm trong danh sách đang được tick chọn không
      const isASelected = selectedRowKeys.includes(a.id);
      const isBSelected = selectedRowKeys.includes(b.id);

      // Nếu A được chọn mà B không được chọn -> Đẩy A lên trên
      if (isASelected && !isBSelected) return -1;
      
      // Nếu B được chọn mà A không được chọn -> Đẩy B lên trên
      if (!isASelected && isBSelected) return 1;

      // Nếu cả hai cùng trạng thái (cùng chọn hoặc cùng không) -> Giữ nguyên vị trí cũ
      return 0;
    });
  }, [allProductDetails, selectedRowKeys]); // Chỉ chạy lại khi 1 trong 2 biến này thay đổi
  return (
    <div style={{ padding: "24px" }}>
      <Space orientation="vertical" style={{ width: "100%" }} size="large">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/discount")}>
          Quay lại
        </Button>
        <Card title={<Title level={4}>{id ? "Cập nhật đợt giảm giá" : "Tạo mới đợt giảm giá"}</Title>}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Mã giảm giá" name="code">
                  <Input placeholder="Hệ thống tự động tạo mã..." disabled={true} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tên chương trình" name="name" rules={[{ required: true, message: "Vui lòng nhập tên!" }]}>
                  <Input placeholder="Ví dụ: Giảm giá hè rực rỡ" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Mức giảm (%)" name="discountPercent" rules={[{ required: true, message: "Vui lòng nhập mức giảm!" }]}>
                  <InputNumber min={1} max={100} style={{ width: "100%" }} formatter={(v) => `${v}%`} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Số lượng" name="quantity" rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}>
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Thời gian áp dụng" name="timeRange" rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}>
                  <RangePicker disabledDate={disabledDate} showTime format="DD/MM/YYYY HH:mm" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Chế độ vận hành" name="status" initialValue={1} tooltip="Chế độ tự động sẽ kích hoạt chương trình dựa trên thời gian. Buộc dừng sẽ tắt chương trình ngay lập tức.">
                  <Radio.Group optionType="button" buttonStyle="solid">
                    <Radio.Button value={1}>Chạy tự động (Theo thời gian)</Radio.Button>
                    <Radio.Button value={0}>Buộc dừng (Tắt chương trình)</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>

              {id && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label={<Typography.Text strong>Thông tin người tạo</Typography.Text>}>
                      <Input
                        size="large" disabled prefix={<UserOutlined />}
                        value={`${currentDiscount?.createdBy || "N/A"} - ${currentDiscount?.createdAt ? dayjs(currentDiscount.createdAt).format("DD/MM/YYYY HH:mm") : "N/A"}`}
                        style={{ backgroundColor: "#f5f5f5", color: "#595959" }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label={<Typography.Text strong>Thông tin cập nhật cuối</Typography.Text>}>
                      <Input
                        size="large" disabled prefix={<UserOutlined />}
                        value={`${currentDiscount?.updatedBy || "N/A"} - ${currentDiscount?.updatedAt ? dayjs(currentDiscount.updatedAt).format("DD/MM/YYYY HH:mm") : "N/A"}`}
                        style={{ backgroundColor: "#f5f5f5", color: "#595959" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Col span={24}> 
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={4} placeholder="Nhập ghi chú chi tiết về chương trình..." />
                </Form.Item>
              </Col>
            </Row>

            <Title level={5} style={{ marginTop: 20 }}>Chọn sản phẩm áp dụng</Title>
            <div style={{ marginBottom: 16, maxWidth: 400 }}>
              <Search placeholder="Tìm theo tên máy ảnh hoặc mã..." allowClear enterButton="Tìm kiếm" size="middle" onSearch={(value) => fetchProducts(value)} />
            </div>
            <Table
              rowSelection={{
                type: "checkbox",
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
              }}
              columns={[
                { title: "Mã SP", dataIndex: "code", key: "code" },
                { title: "Tên máy ảnh", dataIndex: "productName", key: "productName" },
                { title: "version", dataIndex: "version", key: "version" },
                {
                  title: "Giá bán", dataIndex: "salePrice", key: "salePrice",
                  render: (val) => (val ? `${val.toLocaleString("vi-VN")} VND` : "0 VND"),
                },
                { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
                {
                  title: "Trạng thái", dataIndex: "status", key: "status",
                  render: (status) => {
                    if (status === 0 || status === "ACTIVE") return <span style={{ color: "green", fontWeight: 500 }}>Đang bán</span>;
                    return <span style={{ color: "red", fontWeight: 500 }}>Ngừng bán</span>;
                  },
                },
              ]}
              dataSource={sortedProductDetails}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              style={{ marginBottom: 20 }}
            />

            <div style={{ textAlign: "right" }}>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} disabled={loading} size="large" style={{ minWidth: "150px" }}>
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