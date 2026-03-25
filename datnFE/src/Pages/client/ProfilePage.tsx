import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Form,
  Input,
  Button,
  Avatar,
  Spin,
  message,
  Tag,
  Radio,
  DatePicker,
  Modal,
  Popconfirm,
  Checkbox,
  Select,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  UserOutlined,
  CameraOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  LockOutlined,
  LogoutOutlined,
  TagOutlined,
  CalendarOutlined,
  IdcardOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../redux/store";
import type { CustomerResponse } from "../../models/customer";
import type { AddressRequest, AddressResponse } from "../../models/address";
import { getProfile, updateProfile } from "../../api/clientProfileApi";
import { authActions } from "../../redux/auth/authSlice";

const ProfilePage: React.FC = () => {
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profileForm] = Form.useForm();
  const [addrForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);
  const [profile, setProfile] = useState<CustomerResponse | null>(null);
  const [activeMenu, setActiveMenu] = useState("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<AddressResponse | null>(null);

  const [provinces, setProvinces] = useState<{ name: string; code: number }[]>(
    [],
  );
  const [modalCommunes, setModalCommunes] = useState<
    { name: string; code: number }[]
  >([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  const normalizeString = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/^(tinh|thanh pho|huyen|quan|thi xa|xa|phuong|thi tran)\s+/i, "")
      .trim();

  const loadModalCommunes = async (pCode: number) => {
    setLoadingCommunes(true);
    setModalCommunes([]);
    try {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/v2/p/${pCode}?depth=2`,
      );
      setModalCommunes(res.data.wards ?? []);
    } catch {
      message.error("Không tải được danh sách Phường/Xã");
    } finally {
      setLoadingCommunes(false);
    }
  };

  useEffect(() => {
    axios
      .get<{ name: string; code: number }[]>(
        "https://provinces.open-api.vn/api/v2/p/?depth=1",
      )
      .then((res) => setProvinces(res.data))
      .catch(() => message.error("Không tải được danh sách Tỉnh/Thành"));
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate("/login");
      return;
    }
    if (user.userId) {
      setLoading(true);
      getProfile(user.userId)
        .then((data) => {
          setProfile(data);
          profileForm.setFieldsValue({
            name: data.name,
            email: data.email,
            phoneNumber: data.phoneNumber,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
          });
          dispatch(authActions.setUserImage(data.image ?? undefined));
        })
        .catch(() => message.error("Không thể tải thông tin hồ sơ"))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, isLoggedIn]);

  const reloadProfile = () => {
    if (!user?.userId) return;
    getProfile(user.userId).then((data) => {
      setProfile(data);
      profileForm.setFieldsValue({
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
      });
      dispatch(authActions.setUserImage(data.image ?? undefined));
    });
  };

  const handleSave = async () => {
    const values = await profileForm.validateFields();
    if (!user || !profile) return;
    setSaving(true);
    try {
      const dob: Dayjs | null = values.dateOfBirth;
      await updateProfile({
        id: user.userId,
        code: profile.code,
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
        dateOfBirth: dob ? dob.valueOf() : null,
        image: pendingImage ?? undefined,
        addresses: [],
      });
      message.success("Cập nhật hồ sơ thành công");
      setPendingImage(null);
      reloadProfile();
    } catch {
      message.error("Cập nhật thất bại, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const saveAddresses = async (newAddresses: AddressRequest[]) => {
    if (!user || !profile) return;
    await updateProfile({
      id: user.userId,
      code: profile.code,
      name: profile.name,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      gender: profile.gender,
      dateOfBirth: profile.dateOfBirth,
      addresses: newAddresses,
    });
    await reloadProfile();
  };

  const openAddModal = () => {
    setEditingAddr(null);
    addrForm.resetFields();
    addrForm.setFieldsValue({ isDefault: false });
    setModalCommunes([]);
    setAddrModalOpen(true);
  };

  const openEditModal = (addr: AddressResponse) => {
    setEditingAddr(addr);
    addrForm.setFieldsValue({
      name: addr.name,
      phoneNumber: addr.phoneNumber,
      provinceCode: addr.provinceCode ? Number(addr.provinceCode) : undefined,
      wardCode: addr.wardCode ? Number(addr.wardCode) : undefined,
      provinceCity: addr.provinceCity,
      wardCommune: addr.wardCommune,
      addressDetail: addr.addressDetail,
      isDefault: addr.isDefault,
    });
    if (addr.provinceCode) {
      loadModalCommunes(Number(addr.provinceCode));
    } else {
      setModalCommunes([]);
    }
    setAddrModalOpen(true);
  };

  const handleAddrSubmit = async () => {
    const values = await addrForm.validateFields();
    if (!profile) return;
    setSavingAddr(true);
    try {
      const current: AddressRequest[] = (profile.addresses ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        phoneNumber: a.phoneNumber,
        provinceCity: a.provinceCity,
        wardCommune: a.wardCommune,
        addressDetail: a.addressDetail,
        isDefault: a.isDefault,
        provinceCode: a.provinceCode,
        wardCode: a.wardCode,
      }));

      if (values.isDefault) {
        current.forEach((a) => {
          a.isDefault = false;
        });
      }

      if (editingAddr) {
        const idx = current.findIndex((a) => a.id === editingAddr.id);
        if (idx !== -1) current[idx] = { ...current[idx], ...values };
      } else {
        if (current.length === 0) values.isDefault = true;
        current.push(values as AddressRequest);
      }

      await saveAddresses(current);
      message.success(editingAddr ? "Đã cập nhật địa chỉ" : "Đã thêm địa chỉ");
      setAddrModalOpen(false);
    } catch {
      message.error("Lỗi khi lưu địa chỉ");
    } finally {
      setSavingAddr(false);
    }
  };

  const handleDeleteAddr = async (addr: AddressResponse) => {
    if (!profile) return;
    const remaining: AddressRequest[] = (profile.addresses ?? [])
      .filter((a) => a.id !== addr.id)
      .map((a) => ({
        id: a.id,
        name: a.name,
        phoneNumber: a.phoneNumber,
        provinceCity: a.provinceCity,
        wardCommune: a.wardCommune,
        addressDetail: a.addressDetail,
        isDefault: a.isDefault,
        provinceCode: a.provinceCode,
        wardCode: a.wardCode,
      }));
    if (addr.isDefault && remaining.length > 0) remaining[0].isDefault = true;
    try {
      await saveAddresses(remaining);
      message.success("Đã xóa địa chỉ");
    } catch {
      message.error("Lỗi khi xóa địa chỉ");
    }
  };

  const handleSetDefault = async (addr: AddressResponse) => {
    if (!profile) return;
    const updated: AddressRequest[] = (profile.addresses ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      phoneNumber: a.phoneNumber,
      provinceCity: a.provinceCity,
      wardCommune: a.wardCommune,
      addressDetail: a.addressDetail,
      isDefault: a.id === addr.id,
      provinceCode: a.provinceCode,
      wardCode: a.wardCode,
    }));
    try {
      await saveAddresses(updated);
      message.success("Đã đặt làm địa chỉ mặc định");
    } catch {
      message.error("Lỗi khi cập nhật địa chỉ");
    }
  };

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

  const getAvatarSrc = (): string | undefined => {
    if (previewUrl) return previewUrl;
    if (profile?.image) return profile.image;
    return user?.pictureUrl ?? undefined;
  };

  const menuItems = [
    { key: "profile", label: "Hồ sơ", icon: <UserOutlined /> },
    { key: "orders", label: "Đơn mua", icon: <ShoppingOutlined /> },
    { key: "vouchers", label: "Phiếu giảm giá", icon: <TagOutlined /> },
    { key: "password", label: "Đổi mật khẩu", icon: <LockOutlined /> },
  ];

  const handleMenuClick = (key: string) => {
    if (key === "orders") navigate("/client/orders");
    else if (key === "password") navigate(`/change-password/${user?.username}`);
    else setActiveMenu(key);
  };

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
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        paddingTop: 32,
        paddingBottom: 48,
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "#9ca3af",
            marginBottom: 24,
          }}
        >
          <span
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/client")}
          >
            Trang chủ
          </span>
          <span>/</span>
          <span style={{ color: "#374151", fontWeight: 500 }}>
            Tài khoản của tôi
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* ========== SIDEBAR ========== */}
          <div
            style={{ width: 280, flexShrink: 0, position: "sticky", top: 80 }}
          >
            {/* Profile card */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid #f3f4f6",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  height: 72,
                  background:
                    "linear-gradient(135deg,#B71C1C 0%,#E53935 60%,#FF7043 100%)",
                }}
              />
              <div style={{ padding: "0 24px 24px", marginTop: -40 }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <Avatar
                    size={80}
                    src={getAvatarSrc()}
                    icon={!getAvatarSrc() ? <UserOutlined /> : undefined}
                    style={{
                      backgroundColor: "#D32F2F",
                      border: "4px solid #fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                    }}
                  >
                    <CameraOutlined
                      style={{ fontSize: 12, color: "#D32F2F" }}
                    />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                </div>
                <div style={{ marginTop: 12 }}>
                  <p
                    style={{
                      fontWeight: 700,
                      color: "#111827",
                      fontSize: 15,
                      marginBottom: 2,
                    }}
                  >
                    {profile?.name ?? user?.fullName}
                  </p>
                  {profile?.account?.username && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "#9ca3af",
                        marginBottom: 2,
                      }}
                    >
                      @{profile.account.username}
                    </p>
                  )}
                  {profile?.createdDate && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <CalendarOutlined /> Thành viên từ{" "}
                      {dayjs(profile.createdDate).format("MM/YYYY")}
                    </p>
                  )}
                  {pendingImage && (
                    <p style={{ fontSize: 12, color: "#f59e0b", marginTop: 4 }}>
                      Ảnh chưa được lưu
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #f3f4f6",
                marginTop: 16,
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Tài khoản của tôi
                </span>
              </div>
              <nav style={{ padding: "4px 0" }}>
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleMenuClick(item.key)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "11px 20px",
                      fontSize: 14,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      backgroundColor:
                        activeMenu === item.key ? "#fff1f2" : "transparent",
                      color: activeMenu === item.key ? "#dc2626" : "#6b7280",
                      fontWeight: activeMenu === item.key ? 600 : 400,
                      borderRight:
                        activeMenu === item.key
                          ? "3px solid #D32F2F"
                          : "3px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <span
                      style={{
                        color: activeMenu === item.key ? "#dc2626" : "#d1d5db",
                        fontSize: 15,
                      }}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </nav>
              <div style={{ borderTop: "1px solid #f3f4f6", padding: "4px 0" }}>
                <button
                  onClick={() => {
                    dispatch(authActions.logout({ isAdmin: false }));
                    navigate("/client");
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 20px",
                    fontSize: 14,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#6b7280",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff1f2";
                    e.currentTarget.style.color = "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#6b7280";
                  }}
                >
                  <LogoutOutlined style={{ color: "#d1d5db" }} /> Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* ========== MAIN CONTENT ========== */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* ---- Hồ sơ tab ---- */}
            {activeMenu === "profile" && (
              <>
                {/* Profile form card */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: "1px solid #f3f4f6",
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      padding: "20px 32px",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#111827",
                        margin: 0,
                      }}
                    >
                      Hồ sơ của tôi
                    </h2>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#9ca3af",
                        margin: "4px 0 0",
                      }}
                    >
                      Quản lý thông tin hồ sơ để bảo mật tài khoản
                    </p>
                  </div>
                  <div style={{ padding: "28px 32px" }}>
                    <Form
                      form={profileForm}
                      layout="horizontal"
                      onFinish={handleSave}
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}
                      labelAlign="right"
                      colon={false}
                    >
                      <Form.Item
                        label={
                          <span style={{ color: "#4b5563", fontWeight: 500 }}>
                            Tên
                          </span>
                        }
                        name="name"
                        rules={[
                          { required: true, message: "Vui lòng nhập tên" },
                        ]}
                      >
                        <Input
                          placeholder="Nhập họ và tên"
                          size="large"
                          maxLength={100}
                        />
                      </Form.Item>
                      <Form.Item
                        label={
                          <span style={{ color: "#4b5563", fontWeight: 500 }}>
                            Email
                          </span>
                        }
                        name="email"
                        rules={[
                          { type: "email", message: "Email không hợp lệ" },
                        ]}
                      >
                        <Input
                          placeholder="Nhập địa chỉ email"
                          size="large"
                          prefix={
                            <MailOutlined
                              style={{ color: "#d1d5db", marginRight: 4 }}
                            />
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        label={
                          <span style={{ color: "#4b5563", fontWeight: 500 }}>
                            Số điện thoại
                          </span>
                        }
                        name="phoneNumber"
                        rules={[
                          {
                            pattern: /^0(3|5|7|8|9)\d{8}$/,
                            message: "Số điện thoại không hợp lệ",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Nhập số điện thoại"
                          size="large"
                          prefix={
                            <PhoneOutlined
                              style={{ color: "#d1d5db", marginRight: 4 }}
                            />
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        label={
                          <span style={{ color: "#4b5563", fontWeight: 500 }}>
                            Giới tính
                          </span>
                        }
                        name="gender"
                      >
                        <Radio.Group>
                          <Radio value={true}>Nam</Radio>
                          <Radio value={false}>Nữ</Radio>
                        </Radio.Group>
                      </Form.Item>
                      <Form.Item
                        label={
                          <span style={{ color: "#4b5563", fontWeight: 500 }}>
                            Ngày sinh
                          </span>
                        }
                        name="dateOfBirth"
                      >
                        <DatePicker
                          size="large"
                          style={{ width: "100%" }}
                          format="DD/MM/YYYY"
                          placeholder="Chọn ngày sinh"
                          disabledDate={(d) => d && d.isAfter(dayjs())}
                        />
                      </Form.Item>
                      <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={saving}
                          size="large"
                          style={{
                            backgroundColor: "#D32F2F",
                            borderColor: "#D32F2F",
                            minWidth: 140,
                          }}
                        >
                          Lưu thay đổi
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                </div>

                {/* Quick stats row */}
                <div style={{ display: "flex", gap: 16 }}>
                  {[
                    {
                      icon: (
                        <IdcardOutlined
                          style={{ fontSize: 20, color: "#D32F2F" }}
                        />
                      ),
                      label: "Mã khách hàng",
                      value: profile?.code ?? "—",
                      bg: "#fff1f2",
                    },
                    {
                      icon: (
                        <EnvironmentOutlined
                          style={{ fontSize: 20, color: "#1976D2" }}
                        />
                      ),
                      label: "Địa chỉ đã lưu",
                      value: `${profile?.addresses?.length ?? 0} địa chỉ`,
                      bg: "#eff6ff",
                    },
                    {
                      icon: (
                        <TagOutlined
                          style={{ fontSize: 20, color: "#388E3C" }}
                        />
                      ),
                      label: "Vai trò",
                      value: profile?.account?.role ?? "CUSTOMER",
                      bg: "#f0fdf4",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        flex: 1,
                        background: "#fff",
                        border: "1px solid #f3f4f6",
                        borderRadius: 12,
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div
                        style={{
                          background: s.bg,
                          borderRadius: 10,
                          padding: 10,
                          flexShrink: 0,
                        }}
                      >
                        {s.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}
                        >
                          {s.label}
                        </p>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#1f2937",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ---- Địa chỉ section ---- */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: "1px solid #f3f4f6",
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      padding: "20px 32px",
                      borderBottom: "1px solid #f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#111827",
                          margin: 0,
                        }}
                      >
                        Địa chỉ của tôi
                      </h2>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#9ca3af",
                          margin: "3px 0 0",
                        }}
                      >
                        {profile?.addresses?.length ?? 0} địa chỉ đã lưu
                      </p>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={openAddModal}
                      size="small"
                      style={{
                        backgroundColor: "#D32F2F",
                        borderColor: "#D32F2F",
                      }}
                    >
                      Thêm địa chỉ
                    </Button>
                  </div>
                  <div style={{ padding: "20px 32px" }}>
                    {(profile?.addresses ?? []).length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "40px 0",
                          color: "#d1d5db",
                        }}
                      >
                        <EnvironmentOutlined
                          style={{
                            fontSize: 40,
                            display: "block",
                            marginBottom: 12,
                          }}
                        />
                        <p
                          style={{
                            fontSize: 15,
                            color: "#6b7280",
                            fontWeight: 500,
                            margin: 0,
                          }}
                        >
                          Chưa có địa chỉ nào
                        </p>
                        <p
                          style={{
                            fontSize: 13,
                            color: "#9ca3af",
                            marginTop: 4,
                          }}
                        >
                          Thêm địa chỉ để thuận tiện hơn khi đặt hàng
                        </p>
                        <Button
                          onClick={openAddModal}
                          icon={<PlusOutlined />}
                          style={{ marginTop: 16 }}
                        >
                          Thêm ngay
                        </Button>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        {(profile?.addresses ?? []).map((addr, idx) => (
                          <div
                            key={addr.id ?? idx}
                            style={{
                              border: `1.5px solid ${addr.isDefault ? "#fca5a5" : "#e5e7eb"}`,
                              borderRadius: 12,
                              padding: "16px 20px",
                              background: addr.isDefault ? "#fff9f9" : "#fff",
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  marginBottom: 4,
                                  flexWrap: "wrap",
                                }}
                              >
                                <span
                                  style={{ fontWeight: 600, color: "#1f2937" }}
                                >
                                  {addr.name}
                                </span>
                                <span style={{ color: "#d1d5db" }}>|</span>
                                <span
                                  style={{ fontSize: 13, color: "#6b7280" }}
                                >
                                  {addr.phoneNumber}
                                </span>
                                {addr.isDefault && (
                                  <Tag color="red" style={{ margin: 0 }}>
                                    <CheckCircleFilled
                                      style={{ marginRight: 3 }}
                                    />
                                    Mặc định
                                  </Tag>
                                )}
                              </div>
                              <p
                                style={{
                                  fontSize: 13,
                                  color: "#6b7280",
                                  margin: 0,
                                  lineHeight: 1.6,
                                }}
                              >
                                {addr.addressDetail}, {addr.wardCommune},{" "}
                                {addr.provinceCity}
                              </p>
                              {!addr.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(addr)}
                                  style={{
                                    marginTop: 6,
                                    fontSize: 12,
                                    color: "#D32F2F",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                    textDecoration: "underline",
                                  }}
                                >
                                  Đặt làm mặc định
                                </button>
                              )}
                            </div>
                            <div
                              style={{ display: "flex", gap: 8, flexShrink: 0 }}
                            >
                              <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => openEditModal(addr)}
                              >
                                Sửa
                              </Button>
                              <Popconfirm
                                title="Xóa địa chỉ này?"
                                description="Hành động này không thể hoàn tác."
                                onConfirm={() => handleDeleteAddr(addr)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <Button
                                  size="small"
                                  danger
                                  icon={<DeleteOutlined />}
                                />
                              </Popconfirm>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ---- Phiếu giảm giá tab ---- */}
            {activeMenu === "vouchers" && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #f3f4f6",
                  overflow: "hidden",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    padding: "20px 32px",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    Phiếu giảm giá
                  </h2>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#9ca3af",
                      margin: "4px 0 0",
                    }}
                  >
                    Các voucher hiện có của bạn
                  </p>
                </div>
                <div
                  style={{
                    padding: "64px 32px",
                    textAlign: "center",
                    color: "#d1d5db",
                  }}
                >
                  <TagOutlined
                    style={{ fontSize: 48, display: "block", marginBottom: 16 }}
                  />
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: "#6b7280",
                      margin: 0,
                    }}
                  >
                    Bạn chưa có phiếu giảm giá nào
                  </p>
                  <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>
                    Hãy khám phá các ưu đãi của chúng tôi
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== ADDRESS MODAL ========== */}
      <Modal
        title={
          <span style={{ fontWeight: 700 }}>
            {editingAddr ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
          </span>
        }
        open={addrModalOpen}
        onCancel={() => setAddrModalOpen(false)}
        footer={null}
        width={540}
        destroyOnClose
      >
        <Form
          form={addrForm}
          layout="vertical"
          onFinish={handleAddrSubmit}
          style={{ marginTop: 16 }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <Form.Item
              label="Họ tên người nhận"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Nguyễn Văn A" size="large" />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                { required: true, message: "Vui lòng nhập SĐT" },
                { pattern: /^0(3|5|7|8|9)\d{8}$/, message: "SĐT không hợp lệ" },
              ]}
              style={{ flex: 1 }}
            >
              <Input
                placeholder="0901234567"
                size="large"
                prefix={<PhoneOutlined style={{ color: "#d1d5db" }} />}
              />
            </Form.Item>
          </div>
          <Form.Item name="provinceCity" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="wardCommune" hidden>
            <Input />
          </Form.Item>
          <div style={{ display: "flex", gap: 12 }}>
            <Form.Item
              label="Tỉnh / Thành phố"
              name="provinceCode"
              rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành" }]}
              style={{ flex: 1 }}
            >
              <Select
                showSearch
                size="large"
                placeholder="Chọn Tỉnh / Thành phố"
                filterOption={(input, option) =>
                  normalizeString(String(option?.label ?? "")).includes(
                    normalizeString(input),
                  )
                }
                options={provinces.map((p) => ({
                  label: p.name,
                  value: p.code,
                }))}
                onChange={(val, opt) => {
                  const label = Array.isArray(opt) ? opt[0]?.label : opt?.label;
                  addrForm.setFieldsValue({
                    provinceCity: String(label ?? ""),
                    wardCode: undefined,
                    wardCommune: "",
                  });
                  setModalCommunes([]);
                  if (val) loadModalCommunes(val);
                }}
              />
            </Form.Item>
            <Form.Item
              label="Phường / Xã"
              name="wardCode"
              rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
              style={{ flex: 1 }}
            >
              <Select
                showSearch
                size="large"
                placeholder="Chọn Phường / Xã"
                disabled={modalCommunes.length === 0}
                loading={loadingCommunes}
                filterOption={(input, option) =>
                  normalizeString(String(option?.label ?? "")).includes(
                    normalizeString(input),
                  )
                }
                options={modalCommunes.map((w) => ({
                  label: w.name,
                  value: w.code,
                }))}
                onChange={(val, opt) => {
                  const label = Array.isArray(opt) ? opt[0]?.label : opt?.label;
                  addrForm.setFieldsValue({
                    wardCommune: String(label ?? ""),
                    wardCode: val,
                  });
                }}
              />
            </Form.Item>
          </div>
          <Form.Item
            label="Địa chỉ cụ thể"
            name="addressDetail"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input
              placeholder="Số nhà, tên đường..."
              size="large"
              prefix={<EnvironmentOutlined style={{ color: "#d1d5db" }} />}
            />
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
          </Form.Item>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <Button onClick={() => setAddrModalOpen(false)} size="large">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={savingAddr}
              size="large"
              style={{ backgroundColor: "#D32F2F", borderColor: "#D32F2F" }}
            >
              {editingAddr ? "Cập nhật" : "Thêm địa chỉ"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
