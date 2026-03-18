import React, { useState, useEffect } from "react";
import { Modal, Form, Select, DatePicker, Button, Space, message } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import employeeApi from "../../../api/employeeApi";
import workScheduleApi from "../../../api/workScheduleApi";
import shiftTemplateApi from "../../../api/shiftTemplateApi";
import type { EmployeeResponse } from "../../../models/employee";
import type {
  CreateScheduleRequest,
  WorkScheduleResponse,
} from "../../../models/workSchedule";
import type { ADShiftTemplateResponse } from "../../../models/shiftTemplate";

interface AssignShiftFormValues {
  employeeId: string;
  shiftTemplateId: string;
  workDate: Dayjs;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: WorkScheduleResponse | null;
}

const WorkScheduleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [form] = Form.useForm<AssignShiftFormValues>();
  const [employees, setEmployees] = useState<
    { label: string; value: string }[]
  >([]);
  const [shifts, setShifts] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Tải dữ liệu danh sách nhân viên và ca mẫu
  const fetchData = async () => {
    try {
      const [empRes, shiftRes] = await Promise.all([
        employeeApi.getAll({ page: 0, size: 100 }),
        shiftTemplateApi.getAll({ page: 0, size: 100 }),
      ]);

      if (empRes.data?.Em ) {
        setEmployees(
          empRes.data.data.map((emp: EmployeeResponse) => ({
            label: `${emp.name} (${emp.code || "N/A"})`,
            value: emp.id,
          })),
        );
      }

      // shiftRes trả về ResponseObject<ADShiftTemplateResponse[]>
      const shiftData = (shiftRes as any).data;
      if (Array.isArray(shiftData)) {
        setShifts(
          shiftData.map((s: ADShiftTemplateResponse) => ({
            label: `${s.name} (${s.startTime.slice(0, 5)} - ${s.endTime.slice(0, 5)})`,
            value: s.id,
          })),
        );
      }
    } catch (error) {
      message.error("Không thể tải dữ liệu khởi tạo");
    }
  };

  // 2. Lắng nghe sự kiện mở Modal
  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (initialData) {
        // Điền dữ liệu cũ vào form khi sửa
        form.setFieldsValue({
          employeeId: initialData.employeeId,
          shiftTemplateId: initialData.shiftTemplateId,
          workDate: dayjs(initialData.workDate),
        });
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, initialData, form]);

  // 3. Xử lý lưu dữ liệu
  const handleSubmit = async (values: AssignShiftFormValues) => {
    setLoading(true);
    try {
      const payload: CreateScheduleRequest = {
        employeeId: values.employeeId,
        shiftTemplateId: values.shiftTemplateId,
        workDate: values.workDate.format("YYYY-MM-DD"),
      };

      if (initialData) {
        // ✅ Cập nhật trực tiếp qua API PUT (Giữ nguyên ID)
        await workScheduleApi.updateSchedule(initialData.id, payload);
        message.success("Cập nhật lịch làm việc thành công");
      } else {
        // Tạo mới
        await workScheduleApi.assignShift(payload);
        message.success("Phân ca thành công");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      // Hiển thị thông báo lỗi cụ thể từ Backend (ví dụ: "Lịch bị trùng")
      const apiError = error.response?.data?.message || "Lỗi xử lý ca làm việc";
      message.error(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialData ? "Cập nhật ca làm việc" : "Phân ca làm việc"}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="employeeId"
          label="Nhân viên"
          rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
        >
          <Select
            showSearch
            options={employees}
            placeholder="Chọn nhân viên..."
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          name="shiftTemplateId"
          label="Ca làm việc"
          rules={[{ required: true, message: "Vui lòng chọn ca" }]}
        >
          <Select placeholder="Chọn ca mẫu..." options={shifts} />
        </Form.Item>

        <Form.Item
          name="workDate"
          label="Ngày làm việc"
          rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày"
          />
        </Form.Item>

        <div style={{ textAlign: "right", marginTop: 20 }}>
          <Space>
            <Button onClick={onClose}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ background: "#20c997", borderColor: "#20c997" }}
            >
              {initialData ? "Lưu thay đổi" : "Xác nhận phân ca"}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default WorkScheduleModal;
