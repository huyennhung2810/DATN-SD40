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

interface SelectOption {
  label: string;
  value: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const WorkScheduleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [form] = Form.useForm<AssignShiftFormValues>();
  const [employees, setEmployees] = useState<SelectOption[]>([]);
  const [shifts, setShifts] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (): Promise<void> => {
    try {
      const [empRes, shiftRes] = await Promise.all([
        employeeApi.getAll({ page: 0, size: 100 }),
        shiftTemplateApi.getAll({ page: 0, size: 100 }),
      ]);

      const empData = empRes.data;

      if (Array.isArray(empData)) {
        setEmployees(
          empData.map((emp: EmployeeResponse) => ({
            label: `${emp.name} (${emp.code ?? "N/A"})`,
            value: emp.id,
          })),
        );
      }

      const shiftRaw = shiftRes as unknown as {
        isSuccess?: boolean;
        success?: boolean;
        data: ADShiftTemplateResponse[];
      };
      const shiftData = shiftRaw?.data;

      if (
        (shiftRaw?.isSuccess || shiftRaw?.success) &&
        Array.isArray(shiftData)
      ) {
        setShifts(
          shiftData.map((s) => {
            const startH = parseInt(String(s.startTime).split(":")[0], 10);
            const endH = parseInt(String(s.endTime).split(":")[0], 10);
            return {
              label: `${s.name} (${startH}h - ${endH}h)`,
              value: s.id,
            };
          }),
        );
      }
    } catch (error: unknown) {
      console.error(error);
      message.error("Không thể tải dữ liệu khởi tạo");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialData && employees.length > 0 && shifts.length > 0) {
      const empId =
        (initialData as unknown as { employeeId?: string }).employeeId ||
        employees.find((e) => e.label.includes(initialData.employeeName))
          ?.value;

      const shiftId =
        (initialData as unknown as { shiftTemplateId?: string })
          .shiftTemplateId ||
        shifts.find((s) =>
          s.label.includes(
            (initialData as unknown as { shiftName: string }).shiftName,
          ),
        )?.value;

      form.setFieldsValue({
        employeeId: empId,
        shiftTemplateId: shiftId,
        workDate: dayjs(initialData.workDate),
      });
    } else if (isOpen && !initialData) {
      form.resetFields();
    }
  }, [isOpen, initialData, employees, shifts, form]);

  const handleSubmit = async (values: AssignShiftFormValues) => {
    setLoading(true);
    try {
      const payload: CreateScheduleRequest = {
        employeeId: values.employeeId,
        shiftTemplateId: values.shiftTemplateId,
        workDate: values.workDate.format("YYYY-MM-DD"),
      };

      if (initialData) {
        await workScheduleApi.updateSchedule(initialData.id, payload);
        message.success("Cập nhật lịch làm việc thành công");
      } else {
        await workScheduleApi.assignShift(payload);
        message.success("Phân ca thành công");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      // Hiển thị thông báo lỗi cụ thể từ Backend
      const errorMsg =
        error.response?.data?.message || "Lỗi khi xử lý ca làm việc";
      message.error(errorMsg);
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
      destroyOnHidden
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
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>

        <div style={{ textAlign: "right", marginTop: 20 }}>
          <Space>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Xác nhận
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default WorkScheduleModal;
