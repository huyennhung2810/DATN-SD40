import React, { useCallback, useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Radio,
  Button,
  Upload,
  Row,
  Col,
  Card,
  Space,
  Modal,
  Typography,
  Divider,
} from "antd";
import {
  PlusOutlined,
  ScanOutlined,
  EnvironmentOutlined,
  SaveOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import dayjs from "dayjs";
import type { RcFile, UploadProps } from "antd/es/upload/interface";

import { employeeActions } from "../../../redux/employee/employeeSlice";
import type { AppDispatch, RootState } from "../../../redux/store";
import type { EmployeeRequest } from "../../../models/employee";
import { App } from "antd";
import Title from "antd/es/typography/Title";
import type { RuleObject } from "antd/es/form";
import employeeApi from "../../../api/employeeApi";

const { Text } = Typography;

// --- Định nghĩa các Interface rõ ràng ---
interface AdministrativeUnit {
  name: string;
  code: number;
}

// Interface riêng cho Form để xử lý Date của Ant Design
interface EmployeeFormValues extends Omit<
  EmployeeRequest,
  "dateOfBirth" | "employeeImage"
> {
  dateOfBirth: dayjs.Dayjs | null;
}

const normalizeString = (str: string): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(tinh|thanh pho|huyen|quan|thi xa|xa|phuong|thi tran)\s+/i, "")
    .trim();
};

const disabledDate = (current: dayjs.Dayjs) => {
  return current && current > dayjs().endOf("day");
};

const validateAge = (
  _: RuleObject,
  value: dayjs.Dayjs | null,
): Promise<void> => {
  if (value) {
    const age = dayjs().diff(value, "year");
    if (age < 18) {
      return Promise.reject(new Error("Nhân viên phải từ 18 tuổi trở lên"));
    }
  }
  return Promise.resolve();
};

const EmployeeForm: React.FC = () => {
  const { notification } = App.useApp();
  const [form] = Form.useForm<EmployeeFormValues>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { loading, currentEmployee } = useSelector(
    (state: RootState) => state.employee,
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [provinces, setProvinces] = useState<AdministrativeUnit[]>([]);
  const [wards, setWards] = useState<AdministrativeUnit[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  // Tải danh sách Tỉnh/Thành
  const fetchedRef = React.useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    axios
      .get<AdministrativeUnit[]>(
        "https://provinces.open-api.vn/api/v2/p/?depth=1",
      )
      .then((res) => setProvinces(res.data))
      .catch(() => {
        notification.error({
          message: "Không tải được danh sách Tỉnh/Thành",
        });
      });
  }, [notification]);

  //Tải Phường/Xã
  const loadWards = React.useCallback(
    async (pCode: number): Promise<AdministrativeUnit[]> => {
      try {
        const res = await axios.get<{ wards: AdministrativeUnit[] }>(
          `https://provinces.open-api.vn/api/v2/p/${pCode}?depth=2`,
        );
        const wardList = res.data.wards || [];
        setWards(wardList);
        return wardList;
      } catch (error) {
        console.error("Error loading wards:", error);
        notification.error({ message: "Lỗi tải danh sách Phường/Xã" });
        return [];
      }
    },
    [notification],
  );

  // Khởi tạo & Đổ dữ liệu
  useEffect(() => {
    if (isEdit && id) {
      dispatch(employeeActions.getEmployeeById(id));
    } else {
      dispatch(employeeActions.resetCurrentEmployee());
      form.resetFields();
    }
  }, [id, isEdit, dispatch, form]);

  useEffect(() => {
    if (!isEdit || !currentEmployee?.id) return;

    const formValues: EmployeeFormValues = {
      ...currentEmployee,
      role: currentEmployee.account?.role || "STAFF",
      username: currentEmployee.account?.username || "",
      dateOfBirth: currentEmployee.dateOfBirth
        ? dayjs(currentEmployee.dateOfBirth)
        : null,
    };
    form.setFieldsValue(formValues);

    const timer = setTimeout(() => {
      if (currentEmployee.provinceCode) {
        loadWards(currentEmployee.provinceCode);
      }

      if (
        currentEmployee.employeeImage &&
        previewImage !== currentEmployee.employeeImage
      ) {
        setPreviewImage(currentEmployee.employeeImage);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [
    currentEmployee?.id,
    isEdit,
    form,
    loadWards,
    previewImage,
    currentEmployee,
  ]);

  const onScanSuccess = React.useCallback(
    async (decodedText: string) => {
      try {
        const parts = decodedText.split("|");
        if (parts.length < 6) {
          notification.warning({ message: "Mã QR không đúng định dạng CCCD" });
          return;
        }

        const [cccd, , fullName, dobStr, genderStr, address] = parts;
        setIsScannerOpen(false);

        if (provinces.length === 0) {
          notification.warning({
            message: "Dữ liệu hành chính chưa sẵn sàng, vui lòng thử lại!",
          });
          return;
        }

        const birthDate =
          dobStr && dobStr.length === 8 ? dayjs(dobStr, "DDMMYYYY") : null;
        form.setFieldsValue({
          identityCard: cccd,
          name: fullName,
          gender: genderStr.toLowerCase() === "nam",
          dateOfBirth: birthDate,
        });

        if (address) {
          const addrParts = address
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

          const pNameInQR = addrParts[addrParts.length - 1] || "";
          const normPName = normalizeString(pNameInQR);

          const foundProv = provinces.find((p) => {
            const normAPI = normalizeString(p.name);
            return normAPI.includes(normPName) || normPName.includes(normAPI);
          });

          if (foundProv) {
            const res = await axios.get<{ wards: AdministrativeUnit[] }>(
              `https://provinces.open-api.vn/api/v2/p/${foundProv.code}?depth=2`,
            );
            const wardList = res.data.wards || [];
            setWards(wardList);

            let foundWard: AdministrativeUnit | undefined = undefined;
            const searchParts = addrParts.slice(0, -1).reverse();

            for (const part of searchParts) {
              const normPart = normalizeString(part);
              foundWard = wardList.find((w) => {
                const normWardAPI = normalizeString(w.name);
                return (
                  normPart === normWardAPI ||
                  (normPart.length > 4 && normWardAPI.includes(normPart)) ||
                  (normWardAPI.length > 4 && normPart.includes(normWardAPI))
                );
              });
              if (foundWard) break;
            }

            form.setFieldsValue({
              provinceCode: foundProv.code,
              provinceCity: foundProv.name,
              wardCode: foundWard?.code,
              wardCommune: foundWard?.name || "",
              hometown: address,
            });
          }
        }
        notification.success({
          message: "Đã lấy thông tin từ CCCD thành công",
        });
      } catch (error) {
        console.error("Lỗi quét QR:", error);
        notification.error({ message: "Có lỗi xảy ra khi xử lý dữ liệu QR" });
      }
    },
    [provinces, notification, form],
  );

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (isScannerOpen) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false,
      );
      scanner.render(onScanSuccess, (err) => console.warn(err));
    }
    return () => {
      if (scanner) scanner.clear().catch(console.error);
    };
  }, [isScannerOpen, onScanSuccess]);

  const onFinish = (values: EmployeeFormValues) => {
    Modal.confirm({
      title: isEdit ? "Xác nhận cập nhật" : "Xác nhận thêm mới",
      content: `Bạn có chắc chắn muốn lưu thông tin nhân viên "${values.name}" vào hệ thống?`,
      okText: "Xác nhận",
      cancelText: "Hủy bỏ",
      centered: true,
      onOk: () => {
        const { password, role, ...rest } = values;
        const singleRole = Array.isArray(role) ? role[0] : role;

        const payload: EmployeeRequest = {
          ...rest,
          role: singleRole,
          id,
          dateOfBirth: rest.dateOfBirth ? rest.dateOfBirth.valueOf() : null,
          employeeImage: imageFile,
          ...(password && password.trim() !== "" ? { password } : {}),
        };

        dispatch(
          isEdit
            ? employeeActions.updateEmployee({
                data: payload,
                navigate: () => navigate("/employee"),
              })
            : employeeActions.addEmployee({
                data: payload,
                navigate: () => navigate("/employee"),
              }),
        );
      },
    });
  };

  const handleBack = () => {
    if (form.isFieldsTouched()) {
      Modal.confirm({
        title: "Xác nhận rời khỏi",
        content:
          "Những thay đổi bạn đã nhập sẽ không được lưu. Bạn vẫn muốn quay lại chứ?",
        okText: "Rời đi",
        cancelText: "Ở lại",
        centered: true,
        onOk: () => navigate("/employee"),
      });
    } else {
      navigate("/employee");
    }
  };

  const uploadProps: UploadProps = {
    listType: "picture-circle",
    showUploadList: false,
    beforeUpload: (file: RcFile) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        notification.error({
          message: "Bạn chỉ có thể tải lên định dạng JPG/PNG!",
        });
        return Upload.LIST_IGNORE;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        notification.error({ message: "Hình ảnh phải nhỏ hơn 2MB!" });
        return Upload.LIST_IGNORE;
      }
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
      return false;
    },
  };

  const duplicateValidator = useCallback(
    (field: "identityCard" | "email" | "phoneNumber" | "username") => {
      return async (_: RuleObject, value: string): Promise<void> => {
        if (!value || value.trim() === "") return Promise.resolve();

        if (isEdit && currentEmployee) {
          const oldValue =
            field === "username"
              ? currentEmployee.account?.username
              : currentEmployee[field as keyof typeof currentEmployee];

          if (value === oldValue) return Promise.resolve();
        }

        try {
          const response = await employeeApi.checkDuplicate({
            [field]: value,
            id: id || "",
          });

          if (response.data === true) {
            const labels = {
              identityCard: "Số CCCD",
              email: "Email",
              phoneNumber: "Số điện thoại",
              username: "Tên đăng nhập",
            };
            return Promise.reject(
              new Error(`${labels[field]} này đã tồn tại!`),
            );
          }
          return Promise.resolve();
        } catch (error) {
          console.error("Lỗi kiểm tra trùng lặp:", error);
          return Promise.resolve();
        }
      };
    },
    [id, isEdit, currentEmployee],
  );

  return (
    <div
      style={{
        padding: "5px",
        backgroundColor: "#f8f9fa",
        minHeight: "110vh",
      }}
    >
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space orientation="vertical" size={0}>
          <Title level={3} style={{ margin: 0 }}>
            {isEdit ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
          </Title>
          <Text type="secondary">Hệ thống quản lý nhân viên</Text>
        </Space>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Quay lại
        </Button>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark="optional"
      >
        <Card
          variant="borderless"
          style={{
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <Row gutter={48}>
            <Col xs={24} lg={8} style={{ borderRight: "1px solid #f0f0f0" }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <Title level={4} style={{ marginBottom: 24 }}>
                  Ảnh đại diện
                </Title>
                <Upload
                  listType="picture-circle"
                  {...uploadProps}
                  className="avatar-uploader"
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                      alt="avatar"
                    />
                  ) : (
                    <div>
                      <PlusOutlined style={{ fontSize: 24 }} />
                      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                    </div>
                  )}
                </Upload>
              </div>

              <Divider titlePlacement="left">
                <LockOutlined /> Tài khoản
              </Divider>

              <Form.Item
                name="username"
                label={<Text strong>Tên đăng nhập</Text>}
                rules={[{ required: !isEdit }]}
              >
                <Input
                  size="large"
                  prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                  disabled={isEdit}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<Text strong>Mật khẩu</Text>}
                rules={[{ required: !isEdit }]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="******"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item
                name="role"
                label={<Text strong>Chức vụ</Text>}
                initialValue="STAFF"
              >
                <Select
                  size="large"
                  options={[
                    { label: "Nhân viên", value: "STAFF" },
                    { label: "Quản trị", value: "ADMIN" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={16}>
              <Divider titlePlacement="left" style={{ marginTop: 0 }}>
                <UserOutlined /> Thông tin cơ bản
              </Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="identityCard"
                    label={<Text strong>Số CCCD</Text>}
                    validateTrigger="onBlur"
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        pattern: /^\d{12}$/,
                        message: "CCCD phải đủ 12 số",
                      },
                      { validator: duplicateValidator("identityCard") },
                    ]}
                  >
                    <Input
                      size="large"
                      maxLength={12}
                      suffix={
                        <ScanOutlined
                          onClick={() => setIsScannerOpen(true)}
                          style={{ color: "#1890ff", cursor: "pointer" }}
                        />
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label={<Text strong>Họ và tên</Text>}
                    rules={[
                      { required: true, message: "Vui lòng nhập họ tên" },
                      {
                        whitespace: true,
                        message: "Họ tên không được chỉ chứa khoảng trắng",
                      },
                      { min: 2, message: "Họ tên phải có ít nhất 2 ký tự" },
                    ]}
                  >
                    <Input size="large" placeholder="Vd: Nguyễn Văn A" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="gender"
                    label={<Text strong>Giới tính</Text>}
                    rules={[
                      { required: true, message: "Vui lòng chọn giới tính" },
                    ]}
                  >
                    <Radio.Group
                      buttonStyle="solid"
                      style={{ width: "100%", display: "flex" }}
                    >
                      <Radio.Button
                        value={true}
                        style={{ flex: 1, textAlign: "center" }}
                      >
                        Nam
                      </Radio.Button>
                      <Radio.Button
                        value={false}
                        style={{ flex: 1, textAlign: "center" }}
                      >
                        Nữ
                      </Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dateOfBirth"
                    label={<Text strong>Ngày sinh</Text>}
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày sinh" },
                      { validator: validateAge },
                    ]}
                  >
                    <DatePicker
                      size="large"
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                      disabledDate={disabledDate}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider titlePlacement="left">
                <EnvironmentOutlined /> Liên lạc & Địa chỉ
              </Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label={<Text strong>Email</Text>}
                    validateTrigger="onBlur"
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        type: "email",
                        message: "Email không đúng định dạng",
                      },
                      { validator: duplicateValidator("email") },
                    ]}
                  >
                    <Input size="large" prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phoneNumber"
                    label={<Text strong>SĐT</Text>}
                    validateTrigger="onBlur"
                    rules={[
                      {
                        required: true,
                        pattern: /^(0|84)(3|5|7|8|9)([0-9]{8})$/,
                        message: "SĐT không đúng định dạng",
                      },
                      { validator: duplicateValidator("phoneNumber") },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<PhoneOutlined />}
                      maxLength={10}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="provinceCode"
                    label={<Text strong>Tỉnh/Thành</Text>}
                    rules={[{ required: true }]}
                  >
                    <Select
                      size="large"
                      showSearch
                      placeholder="Chọn tỉnh thành"
                      options={provinces.map((p) => ({
                        label: p.name,
                        value: p.code,
                      }))}
                      onChange={(val, opt) => {
                        const option = opt as { label: string; value: number };
                        loadWards(val);
                        form.setFieldsValue({
                          provinceCity: option?.label,
                          wardCode: undefined,
                          wardCommune: "",
                        });
                      }}
                    />
                  </Form.Item>
                  <Form.Item name="provinceCity" hidden>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="wardCode"
                    label={<Text strong>Phường/Xã</Text>}
                    rules={[{ required: true }]}
                  >
                    <Select
                      size="large"
                      showSearch
                      placeholder="Chọn phường xã"
                      loading={
                        isEdit &&
                        wards.length === 0 &&
                        !!currentEmployee?.provinceCode
                      }
                      disabled={!wards.length}
                      options={wards.map((w) => ({
                        label: w.name,
                        value: w.code,
                      }))}
                      onChange={(_, opt) => {
                        const option = opt as { label: string; value: number };
                        if (option)
                          form.setFieldValue("wardCommune", option.label);
                      }}
                    />
                  </Form.Item>
                  <Form.Item name="wardCommune" hidden>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="hometown"
                    label={<Text strong>Quê quán (Địa chỉ cụ thể)</Text>}
                    rules={[{ required: true }]}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Số nhà, tên đường, thôn/xóm..."
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div
                style={{
                  textAlign: "right",
                  marginTop: 10,
                  borderTop: "1px solid #f0f0f0",
                  paddingTop: 10,
                }}
              >
                <Space size="large">
                  <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={loading}
                    style={{ minWidth: 100, borderRadius: "8px" }}
                  >
                    Lưu hồ sơ nhân viên
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>
      </Form>

      <Modal
        title="Quét mã QR CCCD"
        open={isScannerOpen}
        onCancel={() => setIsScannerOpen(false)}
        footer={null}
        centered
        width={600}
      >
        <div id="reader" style={{ width: "100%" }}></div>
      </Modal>
    </div>
  );
};

export default EmployeeForm;
