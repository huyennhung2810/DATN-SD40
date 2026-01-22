import React, { useState, useEffect, useCallback } from "react";
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
  Collapse,
  Space,
  Modal,
  ConfigProvider,
  notification,
  Typography,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  ScanOutlined,
  EnvironmentOutlined,
  SaveOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import dayjs from "dayjs";
import type { RcFile, UploadProps } from "antd/es/upload/interface";
import type { FormListFieldData, RuleObject } from "antd/es/form";

import { customerActions } from "../../../redux/customer/customerSlice";
import { customerApi } from "../../../api/customerApi";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  mapResponseToFormValues,
  type CustomerRequest,
  type CustomerResponse,
} from "../../../models/customer";
import type { AddressRequest } from "../../../models/address";
import type { DefaultOptionType } from "antd/es/cascader";

const { Title, Text } = Typography;

interface AdministrativeUnit {
  name: string;
  code: number;
}

export interface CustomerFormValues {
  code?: string;
  name: string;
  email: string;
  phoneNumber: string;
  identityCard: string;
  gender: boolean;
  dateOfBirth: dayjs.Dayjs | null;
  addresses: AddressRequest[];
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

const CustomerForm: React.FC = () => {
  const [activeKeys, setActiveKeys] = useState<string[]>(["0"]);

  const [form] = Form.useForm<CustomerFormValues>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { loading } = useSelector((state: RootState) => state.customer);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [provinces, setProvinces] = useState<AdministrativeUnit[]>([]);
  const [communesMap, setCommunesMap] = useState<
    Record<number, AdministrativeUnit[]>
  >({});
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  //  Tải danh sách Tỉnh/Thành phố khi khởi tạo
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
  }, []);

  //logic địa chỉ
  const loadCommunes = useCallback(async (pCode: number, index: number) => {
    try {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/v2/p/${pCode}?depth=2`,
      );
      if (res.data.wards) {
        setCommunesMap((prev) => ({ ...prev, [index]: res.data.wards }));
      }
    } catch (error) {
      console.error("Error loading communes:", error);
      notification.error({ message: "Lỗi tải danh sách Phường/Xã mới nhất" });
    }
  }, []);

  const handleProvinceChange = useCallback(
    (pCode: number, index: number, provinceName: string) => {
      loadCommunes(pCode, index);
      form.setFieldValue(["addresses", index, "provinceCity"], provinceName);
      form.setFieldValue(["addresses", index, "provinceCode"], pCode);
      form.setFieldValue(["addresses", index, "wardCommune"], "");
      form.setFieldValue(["addresses", index, "wardCode"], undefined);
    },
    [loadCommunes, form],
  );

  const duplicateValidator = useCallback(
    (
      field: keyof Pick<
        CustomerFormValues,
        "identityCard" | "email" | "phoneNumber"
      >,
    ) => {
      return async (_: RuleObject, value: string): Promise<void> => {
        if (!value || value.trim() === "") {
          return Promise.resolve();
        }

        try {
          const response = await customerApi.checkDuplicate({
            [field]: value,
            id,
          });

          if (response.data) {
            const fieldLabel =
              field === "identityCard"
                ? "Số CCCD"
                : field === "email"
                  ? "Email"
                  : "Số điện thoại";

            return Promise.reject(new Error(`${fieldLabel} này đã tồn tại!`));
          }
          return Promise.resolve();
        } catch (error: unknown) {
          console.error("Duplicate check error:", error);
          return Promise.resolve();
        }
      };
    },
    [id],
  );

  // Logic Quét QR CCCD
  const onScanSuccess = useCallback(
    async (decodedText: string): Promise<void> => {
      try {
        setIsScannerOpen(false);
        const parts = decodedText.split("|");

        if (provinces.length === 0) {
          notification.warning({
            message:
              "Dữ liệu hành chính đang được tải, vui lòng thử lại sau giây lát!",
          });
          return;
        }
        if (parts.length < 6) {
          notification.warning({ message: "Mã QR không đúng định dạng CCCD" });
          return;
        }

        const [cccd, , fullName, dobStr, genderStr, address] = parts;

        const birthDate =
          dobStr && dobStr.length === 8 ? dayjs(dobStr, "DDMMYYYY") : null;

        form.setFieldsValue({
          identityCard: cccd,
          name: fullName,
          gender: genderStr.toLowerCase() === "nam",
          dateOfBirth: birthDate,
        });

        if (address) {
          const index = 0;
          const addrParts = address
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s);

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

            setCommunesMap((prev) => ({ ...prev, [index]: wardList }));

            let foundComm: AdministrativeUnit | undefined = undefined;
            const searchParts = addrParts.slice(0, -1).reverse();

            for (const part of searchParts) {
              const normPart = normalizeString(part);
              foundComm = wardList.find((w) => {
                const normWardAPI = normalizeString(w.name);
                return (
                  normPart === normWardAPI ||
                  (normPart.length > 4 && normWardAPI.includes(normPart)) ||
                  (normWardAPI.length > 4 && normPart.includes(normWardAPI))
                );
              });
              if (foundComm) break;
            }

            const currentAddresses = form.getFieldValue("addresses") || [{}];
            currentAddresses[index] = {
              ...currentAddresses[index],
              provinceCode: foundProv.code,
              provinceCity: foundProv.name,
              wardCode: foundComm?.code,
              wardCommune: foundComm?.name || "",
              addressDetail: address,
              name: fullName,
            };
            form.setFieldsValue({ addresses: [...currentAddresses] });
          }
        }
        notification.success({ message: "Đã quét thông tin CCCD thành công!" });
      } catch (e) {
        console.error(e);
        notification.error({ message: "Lỗi khi xử lý dữ liệu QR" });
      }
    },
    [form, provinces],
  );

  //Xử lý dữ liệu khi Chỉnh sửa (Edit Mode)
  useEffect(() => {
    if (isEdit && id) {
      customerApi.getCustomerById(id).then(async (res: CustomerResponse) => {
        const sortedAddresses = res.addresses
          ? [...res.addresses].sort((a, b) =>
              a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1,
            )
          : [];

        const formValues = mapResponseToFormValues({
          ...res,
          addresses: sortedAddresses,
        });

        if (res.image) setPreviewImage(res.image);

        if (sortedAddresses.length > 0) {
          const keys = sortedAddresses.map((_, i) => i.toString());
          setActiveKeys(keys);

          await Promise.all(
            sortedAddresses.map(async (addr, i) => {
              if (addr.provinceCode)
                await loadCommunes(Number(addr.provinceCode), i);
            }),
          );
        }
        form.setFieldsValue(formValues);
      });
    }
  }, [id, isEdit, form, loadCommunes]);

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
      if (scanner) scanner.clear().catch((e) => console.error(e));
    };
  }, [isScannerOpen, onScanSuccess]);

  const validateAge = (
    _: RuleObject,
    value: dayjs.Dayjs | null,
  ): Promise<void> => {
    if (value) {
      const age = dayjs().diff(value, "year");
      if (age < 15) {
        return Promise.reject(new Error("Khách hàng phải từ 15 tuổi trở lên"));
      }
    }
    return Promise.resolve();
  };

  const onFinish = (values: CustomerFormValues): void => {
    Modal.confirm({
      title: "Xác nhận lưu thông tin",
      content: `Bạn có chắc chắn muốn lưu thông tin khách hàng ${values.name}?`,
      onOk: () => {
        const sortedAddresses = [...values.addresses].sort((a, b) =>
          a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1,
        );

        const payload: CustomerRequest = {
          ...values,
          id: id,
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.valueOf() : null,
          image: imageFile || previewImage || null,
          addresses: sortedAddresses.map((addr) => ({
            ...addr,
            provinceCode: Number(addr.provinceCode),
            wardCode: Number(addr.wardCode),
          })),
        };

        const handleNavigate = () => navigate("/customer");

        dispatch(
          isEdit
            ? customerActions.updateCustomer({
                data: payload,
                navigate: handleNavigate,
              })
            : customerActions.addCustomer({
                data: payload,
                navigate: handleNavigate,
              }),
        );
      },
    });
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

  const handleBack = () => {
    if (form.isFieldsTouched()) {
      Modal.confirm({
        title: "Xác nhận rời khỏi",
        content:
          "Những thay đổi bạn đã nhập sẽ không được lưu. Bạn vẫn muốn quay lại chứ?",
        okText: "Rời đi",
        cancelText: "Ở lại",
        centered: true,
        onOk: () => navigate("/customer"),
      });
    } else {
      navigate("/customer");
    }
  };

  const getAddressCollapseItems = (
    fields: FormListFieldData[],
    remove: (name: number) => void,
  ) => {
    return fields.map(({ key, name, ...restField }, index) => ({
      key: key.toString(),
      label: (
        <Space>
          <EnvironmentOutlined style={{ color: "#1890ff" }} />
          <Text strong>Địa chỉ {index + 1}</Text>
        </Space>
      ),
      extra: (
        <Space size="middle" onClick={(e) => e.stopPropagation()}>
          <Form.Item name={[name, "isDefault"]} valuePropName="checked" noStyle>
            <Radio
              onChange={(e) => {
                if (e.target.checked) {
                  const allAddresses = (form.getFieldValue("addresses") ||
                    []) as AddressRequest[];
                  const updated = allAddresses.map((addr, i) => ({
                    ...addr,
                    isDefault: i === index,
                  }));
                  form.setFieldsValue({ addresses: updated });
                }
              }}
            ></Radio>
          </Form.Item>

          {fields.length > 1 ? (
            <Popconfirm
              title="Xóa địa chỉ"
              description="Bạn có chắc chắn muốn xóa địa chỉ này?"
              onConfirm={() => remove(name)}
              okText="Xóa"
              cancelText="Hủy"
              placement="topRight"
            >
              <Tooltip title="Xóa địa chỉ">
                <DeleteOutlined
                  style={{ color: "#ff4d4f", fontSize: "16px" }}
                />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Tooltip title="Phải có ít nhất một địa chỉ liên hệ">
              <DeleteOutlined
                style={{
                  color: "#d9d9d9",
                  cursor: "not-allowed",
                  fontSize: "16px",
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
      children: (
        <Row gutter={[16, 12]}>
          <Form.Item name={[name, "provinceCity"]} hidden>
            <Input />
          </Form.Item>
          <Form.Item name={[name, "wardCommune"]} hidden>
            <Input />
          </Form.Item>

          <Col span={12}>
            <Form.Item
              {...restField}
              name={[name, "name"]}
              label="Người nhận"
              rules={[{ required: true }]}
            >
              <Input size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              {...restField}
              name={[name, "phoneNumber"]}
              label="SĐT nhận"
              rules={[
                { required: true, pattern: /^(0|84)(3|5|7|8|9)([0-9]{8})$/ },
              ]}
            >
              <Input size="large" maxLength={10} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              {...restField}
              name={[name, "provinceCode"]}
              label="Tỉnh/Thành phố"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                size="large"
                options={provinces.map((p) => ({
                  label: p.name,
                  value: p.code,
                }))}
                onChange={(
                  val: number,
                  opt?: DefaultOptionType | DefaultOptionType[],
                ) => {
                  if (opt && !Array.isArray(opt) && "label" in opt) {
                    handleProvinceChange(val, index, String(opt.label));
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              {...restField}
              name={[name, "wardCode"]}
              label="Xã/Phường/Thị trấn"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                size="large"
                disabled={!communesMap[index]}
                options={communesMap[index]?.map((w) => ({
                  label: w.name,
                  value: w.code,
                }))}
                onChange={(
                  val: number,
                  opt?: DefaultOptionType | DefaultOptionType[],
                ) => {
                  if (opt && !Array.isArray(opt) && "label" in opt) {
                    form.setFieldValue(
                      ["addresses", index, "wardCommune"],
                      String(opt.label),
                    );
                    form.setFieldValue(["addresses", index, "wardCode"], val);
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              {...restField}
              name={[name, "addressDetail"]}
              label="Địa chỉ cụ thể"
              rules={[{ required: true }]}
            >
              <Input.TextArea
                rows={2}
                placeholder="Số nhà, tên đường, thôn/xóm..."
              />
            </Form.Item>
          </Col>
        </Row>
      ),
    }));
  };

  return (
    <ConfigProvider
      theme={{ token: { borderRadius: 12, colorPrimary: "#1890ff" } }}
    >
      <div
        style={{
          padding: "24px",
          backgroundColor: "#f0f2f5",
          minHeight: "100vh",
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
              {isEdit ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}
            </Title>
            <Text type="secondary">Hệ thống quản lý khách hàng Canon</Text>
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
          initialValues={{
            gender: true,
            addresses: [{ isDefault: true }],
          }}
        >
          <Row gutter={24}>
            <Col span={9}>
              <Card
                title={
                  <Space>
                    <UserOutlined style={{ color: "#1890ff" }} />
                    Thông tin cá nhân
                  </Space>
                }
              >
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <Upload {...uploadProps}>
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
                      <div style={{ color: "#8c8c8c" }}>
                        <PlusOutlined style={{ fontSize: 24 }} />
                        <div style={{ marginTop: 8 }}>Tải ảnh</div>
                      </div>
                    )}
                  </Upload>
                </div>
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
                  <Input size="large" placeholder="Ví dụ: Nguyễn Văn A" />
                </Form.Item>
                <Row gutter={16}>
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
                        placeholder="Chọn ngày sinh"
                        disabledDate={(current: dayjs.Dayjs) =>
                          current && current > dayjs().endOf("day")
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
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
              </Card>
            </Col>

            <Col span={15}>
              <Card
                title={
                  <Space>
                    <EnvironmentOutlined style={{ color: "#1890ff" }} />
                    Quản lý địa chỉ
                  </Space>
                }
              >
                <Form.List
                  name="addresses"
                  rules={[
                    {
                      validator: async (_, names) => {
                        if (!names || names.length < 1) {
                          return Promise.reject(
                            new Error("Vui lòng thêm ít nhất một địa chỉ"),
                          );
                        }
                      },
                    },
                  ]}
                >
                  {(fields, { add, remove }) => (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <Collapse
                        ghost
                        expandIconPlacement="end"
                        activeKey={activeKeys}
                        onChange={(keys) =>
                          setActiveKeys(Array.isArray(keys) ? keys : [keys])
                        }
                        items={getAddressCollapseItems(fields, remove)}
                      />
                      <Button
                        type="dashed"
                        onClick={() => {
                          add();
                          setActiveKeys([
                            ...activeKeys,
                            fields.length.toString(),
                          ]);
                        }}
                        block
                        icon={<PlusOutlined />}
                        size="large"
                      >
                        Thêm địa chỉ khác
                      </Button>
                    </div>
                  )}
                </Form.List>
                <div style={{ marginTop: 40, textAlign: "right" }}>
                  <Space size="middle">
                    <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                      Hủy bỏ
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      icon={<SaveOutlined />}
                      loading={loading}
                    >
                      Lưu thông tin
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>

        <Modal
          title="Quét QR CCCD Gắn Chip"
          open={isScannerOpen}
          onCancel={() => setIsScannerOpen(false)}
          footer={null}
          centered
          width={600}
        >
          <div
            id="reader"
            style={{ width: "100%", borderRadius: 12, overflow: "hidden" }}
          ></div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default CustomerForm;
