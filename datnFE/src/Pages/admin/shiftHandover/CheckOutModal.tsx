import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  InputNumber,
  Input,
  Button,
  Row,
  Typography,
  message,
  Divider,
  Alert,
  Space,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { shiftHandoverApi } from "../../../api/shiftHandoverApi";
import { shiftActions } from "../../../redux/shiftHandover/shiftHandoverSlice";
import type { RootState } from "../../../redux/store";

const { Text, Title } = Typography;

const CheckOutModal = ({ isOpen, onClose, scheduleId: _scheduleId }: any) => {
  // Lấy scheduleId từ Redux (ưu tiên ca đang mở)
  const { currentShift } = useSelector(
    (state: RootState) => state.shiftHandover,
  );
  const scheduleId =
    currentShift?.workScheduleId || currentShift?.id || _scheduleId || "";
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // Lấy dữ liệu từ store và form
  const { isLoading } = useSelector((state: RootState) => state.shiftHandover);
  const [initialCash, setInitialCash] = useState(
    currentShift?.initialCash || 0,
  );
  const [systemSales, setSystemSales] = useState(
    currentShift?.totalCashSales || 0,
  );
  const [bankSales, setBankSales] = useState(currentShift?.totalBankSales || 0);

  const actualCash = Form.useWatch("actualCash", form) || 0;
  const withdraw = Form.useWatch("withdrawAmount", form) || 0;

  //useEffect GỌI API:
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!isOpen || !scheduleId) return;
      console.log("[CheckOutModal] scheduleId truyền vào:", scheduleId);
      try {
        const res = await shiftHandoverApi.getShiftStats(scheduleId);
        console.log("[CheckOutModal] Kết quả getShiftStats:", res);
        if (isMounted) {
          const statsData = (res as any).data || res;

          setInitialCash(
            statsData.initialCash ?? currentShift?.initialCash ?? 0,
          );
          setSystemSales(
            statsData.totalCashSales ?? currentShift?.totalCashSales ?? 0,
          );
          setBankSales(
            statsData.totalBankSales ?? currentShift?.totalBankSales ?? 0,
          );
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu đối soát:", err);
        message.error("Không thể lấy dữ liệu đối soát từ hệ thống");
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [isOpen, scheduleId, currentShift]);

  // Công thức: Tiền kỳ vọng có trong két = (Đầu ca + Doanh thu) - Số tiền đã rút
  const expectedCash = initialCash + systemSales - withdraw;
  const diff = actualCash - expectedCash;

  const onFinish = async (values: any) => {
    // Ràng buộc: Nếu lệch tiền mà không có ghi chú thì chặn lại
    if (diff !== 0 && !values.note) {
      message.error("Tiền mặt bị lệch! Vui lòng nhập lý do vào phần ghi chú.");
      return;
    }

    // Đảm bảo các trường đúng kiểu số
    const payload = {
      ...values,
      scheduleId,
      actualCash: Number(values.actualCash),
      withdrawAmount: Number(values.withdrawAmount) || 0,
    };
    console.log("[CheckOutModal] Payload gửi lên checkOutRequest:", payload);

    try {
      // 1. Gọi API trực tiếp để hứng lỗi dễ dàng
      const res = await shiftHandoverApi.checkOut(payload);

      // 2. Bóc tách data
      const statsData = (res as any).data?.data || (res as any).data || res;

      // 3. Báo thành công, đóng modal và xóa form
      message.success("Kết ca thành công!");
      onClose();
      form.resetFields();

      // 4. Báo cho Redux biết là đã kết ca xong (để xóa currentShift)
      // Lưu ý: Đảm bảo trong shiftHandoverSlice của bạn có action checkOutSuccess nhé
      dispatch(shiftActions.checkOutSuccess(statsData));
    } catch (error: any) {
      console.error("Lỗi khi kết ca:", error);

      // 5. Bắt chính xác câu thông báo lỗi từ Backend Spring Boot
      const errorMsg = error.response?.data?.message || "Lỗi khi kết thúc ca!";
      message.error(errorMsg);
    }
  };

  return (
    <>
      <Modal
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              Bàn Giao & Kết Thúc Ca
            </Title>
          </Space>
        }
        open={isOpen}
        onCancel={onClose}
        footer={null}
        destroyOnHidden
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ withdrawAmount: 0 }}
        >
          {/* Box tóm tắt số liệu hệ thống */}
          <div
            style={{
              background: "#f5f5f5",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #e8e8e8",
            }}
          >
            <Row justify="space-between">
              <Text>Tiền mặt đầu ca:</Text>
              <Text>{initialCash.toLocaleString()} ₫</Text>
            </Row>
            <Row justify="space-between" style={{ marginTop: 8 }}>
              <Text>Doanh thu tiền mặt:</Text>
              <Text>+ {systemSales.toLocaleString()} ₫</Text>
            </Row>
            <Row justify="space-between" style={{ marginTop: 8 }}>
              <Text>Doanh thu chuyển khoản:</Text>
              <Text>+ {bankSales.toLocaleString()} ₫</Text>
            </Row>
            <Row justify="space-between" style={{ marginTop: 8 }}>
              <Text>Tiền rút ra và nộp lại:</Text>
              <Text>- {withdraw.toLocaleString()} ₫</Text>
            </Row>
            <Divider style={{ margin: "12px 0" }} />
            <Row justify="space-between">
              <Text strong>Tiền mặt kỳ vọng trong két:</Text>
              <Text strong style={{ color: "#1890ff" }}>
                {expectedCash.toLocaleString()} ₫
              </Text>
            </Row>
          </div>

          {/* Cảnh báo chênh lệch */}
          {diff !== 0 && (
            <Alert
              message={
                <Text
                  strong
                  style={{ color: diff < 0 ? "#cf1322" : "#d46b08" }}
                >
                  Chênh lệch: {diff > 0 ? "+" : ""}
                  {diff.toLocaleString()} ₫
                </Text>
              }
              type={diff < 0 ? "error" : "warning"}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            name="actualCash"
            label={<Text strong>Tiền mặt thực tế kiểm đếm (VND)</Text>}
            rules={[
              { required: true, message: "Vui lòng nhập số tiền thực tế!" },
            ]}
          >
            <InputNumber
              style={{ width: "100%", height: 40 }}
              placeholder="Nhập tổng tiền mặt đang có trong két..."
              formatter={(val) =>
                `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(val) => val!.replace(/\$\s?|(,*)/g, "") as any}
            />
          </Form.Item>

          <Form.Item
            name="withdrawAmount"
            label={<Text strong>Số tiền rút ra nộp lại (Nếu có)</Text>}
          >
            <InputNumber
              style={{ width: "100%", height: 40 }}
              placeholder="Nhập số tiền đã rút ra để nộp lại cho quản lý..."
              formatter={(val) =>
                `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(val) => val!.replace(/\$\s?|(,*)/g, "") as any}
            />
          </Form.Item>

          <Form.Item
            name="note"
            label={<Text strong>Ghi chú / Giải trình</Text>}
            required={diff !== 0}
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú hoặc lý do nếu tiền bị lệch..."
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            danger
            block
            loading={isLoading}
            style={{ height: 45, fontWeight: 700, marginTop: 10 }}
          >
            XÁC NHẬN KẾT CA & IN BIÊN BẢN
          </Button>
        </Form>
      </Modal>
    </>
  );
};

export default CheckOutModal;
