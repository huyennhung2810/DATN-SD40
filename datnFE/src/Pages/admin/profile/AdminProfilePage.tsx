import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Form,
  Input,
  Button,
  Avatar,
  Spin,
  message,
  Radio,
  DatePicker,
  Select,
  Tabs,
  Tag,
} from "antd";
import type { DefaultOptionType } from "antd/es/select";
import dayjs from "dayjs";
import axios from "axios";
import {
  UserOutlined,
  CameraOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
  IdcardOutlined,
  CalendarOutlined,
  SaveOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../redux/store";
import { authActions } from "../../../redux/auth/authSlice";
import {
  getEmployeeById,
  updateEmployee,
  changePassword,
} from "../../../api/employeeApi";
import type { EmployeeResponse } from "../../../models/employee";

interface AdministrativeUnit {
  name: string;
  code: number;
}

const normalizeString = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(tinh|thanh pho|huyen|quan|thi xa|xa|phuong|thi tran)\s+/i, "")
    .trim();

const AdminProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [employee, setEmployee] = useState<EmployeeResponse | null>(null);
  const [activeTab, setActiveTab] = useState("info");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [provinces, setProvinces] = useState<AdministrativeUnit[]>([]);
  const [communes, setCommunes] = useState<AdministrativeUnit[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  const fetchedProvinces = useRef(false);

  useEffect(() => {
    if (fetchedProvinces.current) return;
    fetchedProvinces.current = true;
    axios
      .get<AdministrativeUnit[]>(
        "https://provinces.open-api.vn/api/v2/p/?depth=1",
      )
      .then((res) => setProvinces(res.data))
      .catch(() => message.error("Không tải được danh sách Tỉnh/Thành"));
  }, []);

  const loadCommunes = useCallback(async (pCode: number) => {
    setLoadingCommunes(true);
    setCommunes([]);
    try {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/v2/p/${pCode}?depth=2`,
      );
      setCommunes(res.data.wards ?? []);
    } catch {
      message.error("Không tải được danh sách Phường/Xã");
    } finally {
      setLoadingCommunes(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const data = await getEmployeeById(user.userId);
      setEmployee(data);
      profileForm.setFieldsValue({
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
        identityCard: data.identityCard,
        hometown: data.hometown,
        provinceCode: data.provinceCode ?? undefined,
        wardCode: data.wardCode ?? undefined,
        provinceCity: data.provinceCity,
        wardCommune: data.wardCommune,
      });
      if (data.provinceCode) {
        await loadCommunes(data.provinceCode);
      }
      dispatch(authActions.setUserImage(data.employeeImage ?? undefined));
    } catch {
      message.error("Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [user?.userId, profileForm, loadCommunes, dispatch]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      message.error("Vui lòng chọn file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error("Ảnh không được vượt quá 5MB");
      return;
    }
    setPendingImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    const values = await profileForm.validateFields();
    if (!user || !employee) return;
    setSaving(true);
    try {
      const res = await updateEmployee({
        id: employee.id,
        code: employee.code,
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.valueOf() : null,
        identityCard: values.identityCard,
        hometown: values.hometown,
        provinceCity: values.provinceCity,
        wardCommune: values.wardCommune,
        provinceCode: values.provinceCode,
        wardCode: values.wardCode,
        role: employee.account?.role ?? "STAFF",
        employeeImage: pendingImage ?? employee.employeeImage,
      });
      message.success("Cập nhật hồ sơ thành công");
      setPendingImage(null);
      if (res.data?.employeeImage) {
        dispatch(authActions.setUserImage(res.data.employeeImage));
      }
      await loadProfile();
    } catch {
      message.error("Cập nhật thất bại, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const values = await passwordForm.validateFields();
    if (!user?.username) return;
    setSavingPw(true);
    try {
      await changePassword(user.username, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("Đổi mật khẩu thành công");
      passwordForm.resetFields();
    } catch {
      message.error("Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu cũ.");
    } finally {
      setSavingPw(false);
    }
  };

  const getAvatarSrc = () =>
    previewUrl ?? employee?.employeeImage ?? user?.image ?? user?.pictureUrl;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f6fa",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Top profile banner card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid #f0f0f0",
            marginBottom: 24,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              height: 100,
              background:
                "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)",
            }}
          />
          <div
            style={{
              padding: "0 32px 24px",
              display: "flex",
              alignItems: "flex-start",
              gap: 20,
              marginTop: -48,
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar
                size={96}
                src={getAvatarSrc()}
                icon={!getAvatarSrc() ? <UserOutlined /> : undefined}
                style={{
                  backgroundColor: "#1890ff",
                  border: "4px solid #fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  display: "block",
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                }}
              >
                <CameraOutlined style={{ fontSize: 13, color: "#1890ff" }} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>
            {/* paddingTop: 52 = 100px banner - 48px marginTop → pushes text below the banner boundary */}
            <div style={{ paddingTop: 52, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  {employee?.name ?? user?.fullName}
                </h2>
                <Tag
                  color={
                    employee?.account?.role === "ADMIN" ? "purple" : "blue"
                  }
                >
                  {employee?.account?.role === "ADMIN"
                    ? "Quản trị viên"
                    : "Nhân viên"}
                </Tag>
                {pendingImage && <Tag color="orange">Ảnh chưa được lưu</Tag>}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  marginTop: 6,
                  color: "#6b7280",
                  fontSize: 13,
                  flexWrap: "wrap",
                }}
              >
                {employee?.code && (
                  <span>
                    <IdcardOutlined style={{ marginRight: 4 }} />
                    {employee.code}
                  </span>
                )}
                {user?.username && (
                  <span>
                    <UserOutlined style={{ marginRight: 4 }} />@{user.username}
                  </span>
                )}
                {employee?.email && (
                  <span>
                    <MailOutlined style={{ marginRight: 4 }} />
                    {employee.email}
                  </span>
                )}
                {employee?.createdDate && (
                  <span>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    Từ {dayjs(employee.createdDate).format("MM/YYYY")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #f0f0f0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ padding: "0 24px" }}
            items={[
              {
                key: "info",
                label: (
                  <span>
                    <UserOutlined /> Thông tin cá nhân
                  </span>
                ),
                children: (
                  <div style={{ padding: "8px 8px 24px" }}>
                    <Form
                      form={profileForm}
                      layout="vertical"
                      onFinish={handleSaveProfile}
                      requiredMark="optional"
                    >
                      {/* Hidden fields for province/ward text */}
                      <Form.Item name="provinceCity" hidden>
                        <Input />
                      </Form.Item>
                      <Form.Item name="wardCommune" hidden>
                        <Input />
                      </Form.Item>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0 24px",
                        }}
                      >
                        {/* Họ và tên */}
                        <Form.Item
                          label="Họ và tên"
                          name="name"
                          rules={[
                            { required: true, message: "Vui lòng nhập họ tên" },
                            { min: 2, message: "Ít nhất 2 ký tự" },
                          ]}
                        >
                          <Input
                            size="large"
                            placeholder="Nguyễn Văn A"
                            prefix={
                              <UserOutlined style={{ color: "#d1d5db" }} />
                            }
                          />
                        </Form.Item>

                        {/* Email */}
                        <Form.Item
                          label="Email"
                          name="email"
                          rules={[
                            {
                              type: "email",
                              message: "Email không đúng định dạng",
                            },
                          ]}
                        >
                          <Input
                            size="large"
                            placeholder="example@email.com"
                            prefix={
                              <MailOutlined style={{ color: "#d1d5db" }} />
                            }
                          />
                        </Form.Item>

                        {/* Số điện thoại */}
                        <Form.Item
                          label="Số điện thoại"
                          name="phoneNumber"
                          rules={[
                            {
                              pattern: /^0(3|5|7|8|9)\d{8}$/,
                              message: "SĐT không đúng định dạng",
                            },
                          ]}
                        >
                          <Input
                            size="large"
                            placeholder="0901234567"
                            maxLength={10}
                            prefix={
                              <PhoneOutlined style={{ color: "#d1d5db" }} />
                            }
                          />
                        </Form.Item>

                        {/* CCCD */}
                        <Form.Item label="Số CCCD/CMND" name="identityCard">
                          <Input
                            size="large"
                            placeholder="012345678901"
                            prefix={
                              <IdcardOutlined style={{ color: "#d1d5db" }} />
                            }
                          />
                        </Form.Item>

                        {/* Giới tính */}
                        <Form.Item label="Giới tính" name="gender">
                          <Radio.Group size="large">
                            <Radio value={true}>Nam</Radio>
                            <Radio value={false}>Nữ</Radio>
                          </Radio.Group>
                        </Form.Item>

                        {/* Ngày sinh */}
                        <Form.Item label="Ngày sinh" name="dateOfBirth">
                          <DatePicker
                            size="large"
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày sinh"
                            disabledDate={(d) => d && d.isAfter(dayjs())}
                          />
                        </Form.Item>

                        {/* Quê quán */}
                        <Form.Item
                          label="Quê quán"
                          name="hometown"
                          style={{ gridColumn: "1 / -1" }}
                        >
                          <Input
                            size="large"
                            placeholder="Quê quán"
                            prefix={
                              <HomeOutlined style={{ color: "#d1d5db" }} />
                            }
                          />
                        </Form.Item>

                        {/* Tỉnh / Thành phố */}
                        <Form.Item
                          label="Tỉnh / Thành phố"
                          name="provinceCode"
                          rules={[
                            {
                              required: false,
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            size="large"
                            placeholder="Chọn Tỉnh / Thành phố"
                            filterOption={(input, option) =>
                              normalizeString(
                                String(option?.label ?? ""),
                              ).includes(normalizeString(input))
                            }
                            options={provinces.map((p) => ({
                              label: p.name,
                              value: p.code,
                            }))}
                            onChange={(
                              val: number,
                              opt?: DefaultOptionType | DefaultOptionType[],
                            ) => {
                              const label = Array.isArray(opt)
                                ? opt[0]?.label
                                : opt?.label;
                              profileForm.setFieldsValue({
                                provinceCity: String(label ?? ""),
                                wardCode: undefined,
                                wardCommune: "",
                              });
                              setCommunes([]);
                              if (val) loadCommunes(val);
                            }}
                          />
                        </Form.Item>

                        {/* Phường / Xã */}
                        <Form.Item label="Phường / Xã" name="wardCode">
                          <Select
                            showSearch
                            size="large"
                            placeholder="Chọn Phường / Xã"
                            disabled={communes.length === 0}
                            loading={loadingCommunes}
                            filterOption={(input, option) =>
                              normalizeString(
                                String(option?.label ?? ""),
                              ).includes(normalizeString(input))
                            }
                            options={communes.map((w) => ({
                              label: w.name,
                              value: w.code,
                            }))}
                            onChange={(
                              val: number,
                              opt?: DefaultOptionType | DefaultOptionType[],
                            ) => {
                              const label = Array.isArray(opt)
                                ? opt[0]?.label
                                : opt?.label;
                              profileForm.setFieldsValue({
                                wardCommune: String(label ?? ""),
                                wardCode: val,
                              });
                            }}
                          />
                        </Form.Item>
                      </div>

                      <div
                        style={{
                          borderTop: "1px solid #f3f4f6",
                          paddingTop: 20,
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={saving}
                          size="large"
                          icon={<SaveOutlined />}
                          style={{ minWidth: 160 }}
                        >
                          Lưu thay đổi
                        </Button>
                      </div>
                    </Form>
                  </div>
                ),
              },
              {
                key: "password",
                label: (
                  <span>
                    <LockOutlined /> Đổi mật khẩu
                  </span>
                ),
                children: (
                  <div
                    style={{
                      padding: "8px 8px 24px",
                      maxWidth: 480,
                    }}
                  >
                    <Form
                      form={passwordForm}
                      layout="vertical"
                      onFinish={handleChangePassword}
                      requiredMark="optional"
                    >
                      <Form.Item
                        label="Mật khẩu hiện tại"
                        name="oldPassword"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập mật khẩu hiện tại",
                          },
                        ]}
                      >
                        <Input.Password
                          size="large"
                          placeholder="Nhập mật khẩu hiện tại"
                          prefix={<LockOutlined style={{ color: "#d1d5db" }} />}
                        />
                      </Form.Item>

                      <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập mật khẩu mới",
                          },
                          {
                            min: 6,
                            message: "Mật khẩu mới phải có ít nhất 6 ký tự",
                          },
                        ]}
                      >
                        <Input.Password
                          size="large"
                          placeholder="Nhập mật khẩu mới"
                          prefix={<LockOutlined style={{ color: "#d1d5db" }} />}
                        />
                      </Form.Item>

                      <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng xác nhận mật khẩu mới",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (
                                !value ||
                                getFieldValue("newPassword") === value
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("Mật khẩu xác nhận không khớp"),
                              );
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          size="large"
                          placeholder="Nhập lại mật khẩu mới"
                          prefix={<LockOutlined style={{ color: "#d1d5db" }} />}
                        />
                      </Form.Item>

                      <div
                        style={{
                          borderTop: "1px solid #f3f4f6",
                          paddingTop: 20,
                          marginTop: 4,
                        }}
                      >
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={savingPw}
                          size="large"
                          icon={<SaveOutlined />}
                          style={{ minWidth: 160 }}
                        >
                          Đổi mật khẩu
                        </Button>
                      </div>
                    </Form>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
