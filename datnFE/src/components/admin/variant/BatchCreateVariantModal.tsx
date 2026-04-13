import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import * as XLSX from "xlsx";
import React, { useEffect, useState } from "react";
import {
  ProductVersionOptions,
  getProductVersionDisplayName,
} from "../../../models/productVersion";
import type {
  BatchVariantRow,
  BatchCreateResponse,
} from "../../../models/productdetail";
import { productDetailApi } from "../../../api/productDetailApi";
import { generateVariantCode } from "../../../utils/variantCodeHelper";
import SerialInputModal from "./SerialInputModal";

const { Text, Title } = Typography;
const { TextArea } = Input;

interface BatchCreateVariantModalProps {
  open: boolean;
  productId: string;
  productCode: string;
  productName: string;
  colors: { id: string; name: string }[];
  storages: { id: string; name: string }[];
  productList: { id: string; code: string; name: string }[];
  onSuccess: () => void;
  onCancel: () => void;
}

const BatchCreateVariantModal: React.FC<BatchCreateVariantModalProps> = ({
  open,
  productId: initialProductId,
  productCode: initialProductCode,
  productName: initialProductName,
  colors,
  storages,
  productList,
  onSuccess,
  onCancel,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProductCode, setSelectedProductCode] = useState<string>("");
  const [selectedProductName, setSelectedProductName] = useState<string>("");

  const [step, setStep] = useState<"product-select" | "select" | "preview">("product-select");
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedStorages, setSelectedStorages] = useState<string[]>([]);
  const [rows, setRows] = useState<BatchVariantRow[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Bulk apply values
  const [bulkPrice, setBulkPrice] = useState<number | undefined>(undefined);
  const [bulkImageUrl, setBulkImageUrl] = useState("");
  const [codePrefix, setCodePrefix] = useState("");

  // Serial input per row
  const [serialModalOpen, setSerialModalOpen] = useState(false);
  const [serialRowIndex, setSerialRowIndex] = useState<number>(-1);

  useEffect(() => {
    if (open) {
      if (initialProductId) {
        setSelectedProductId(initialProductId);
        setSelectedProductCode(initialProductCode);
        setSelectedProductName(initialProductName);
        setCodePrefix(initialProductCode);
        setStep("select");
      } else {
        setSelectedProductId("");
        setSelectedProductCode("");
        setSelectedProductName("");
        setCodePrefix("");
        setStep("product-select");
      }
      setSelectedVersions([ProductVersionOptions[0].value]);
      setSelectedColors([]);
      setSelectedStorages([]);
      setRows([]);
      setBulkPrice(undefined);
      setBulkImageUrl("");
    }
  }, [open, initialProductId, initialProductCode, initialProductName]);

  const handleProductConfirm = () => {
    if (!selectedProductId) {
      message.warning("Vui lòng chọn sản phẩm!");
      return;
    }
    setCodePrefix(selectedProductCode);
    setStep("select");
  };

  const handleBackToProductSelect = () => {
    setStep("product-select");
    setSelectedVersions([ProductVersionOptions[0].value]);
    setSelectedColors([]);
    setSelectedStorages([]);
    setRows([]);
  };

  // --- AXIS SELECTION ---
  const toggleVersion = (v: string) =>
    setSelectedVersions((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );

  const toggleColor = (id: string) =>
    setSelectedColors((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleStorage = (id: string) =>
    setSelectedStorages((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleAllColors = (checked: boolean) =>
    setSelectedColors(checked ? colors.map((c) => c.id) : []);

  const toggleAllStorages = (checked: boolean) =>
    setSelectedStorages(checked ? storages.map((s) => s.id) : []);

  // --- GENERATE COMBINATIONS ---
  const handleGenerate = () => {
    if (selectedVersions.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 Phiên bản!");
      return;
    }
    if (selectedColors.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 Màu sắc!");
      return;
    }
    if (selectedStorages.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 Dung lượng!");
      return;
    }

    const newRows: BatchVariantRow[] = [];
    let idx = 1;

    for (const vid of selectedVersions) {
      for (const cid of selectedColors) {
        for (const sid of selectedStorages) {
          const colorName = colors.find((c) => c.id === cid)?.name || "";
          const storageName = storages.find((s) => s.id === sid)?.name || "";
          const generatedCode = generateVariantCode(
            codePrefix || selectedProductCode,
            vid,
            colorName,
            storageName
          );

          newRows.push({
            id: `temp-${idx}`,
            rowIndex: idx,
            versionId: vid,
            versionName: getProductVersionDisplayName(vid),
            colorId: cid,
            colorName,
            storageId: sid,
            storageName,
            productCode: generatedCode,
            price: bulkPrice ?? 0,
            imageUrl: bulkImageUrl,
            serials: [],
          });
          idx++;
        }
      }
    }

    setRows(newRows);
    setStep("preview");
  };

  // --- BULK ACTIONS ---
  const applyPriceToAll = () => {
    if (bulkPrice === undefined || bulkPrice < 0) {
      message.warning("Giá bán phải >= 0!");
      return;
    }
    setRows((prev) => prev.map((r) => ({ ...r, price: bulkPrice })));
    message.success("Đã áp dụng giá cho tất cả dòng");
  };

  const applyImageToAll = () => {
    setRows((prev) => prev.map((r) => ({ ...r, imageUrl: bulkImageUrl })));
    message.success("Đã áp dụng ảnh cho tất cả dòng");
  };

  const generateCodes = () => {
    const prefix = codePrefix || selectedProductCode;
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        productCode: generateVariantCode(
          prefix,
          r.versionId,
          r.colorName,
          r.storageName
        ),
      }))
    );
    message.success("Đã sinh mã cho tất cả dòng");
  };

  // --- ROW EDITS ---
  const updateRow = (index: number, field: keyof BatchVariantRow, value: any) => {
    setRows((prev) =>
      prev.map((r) => (r.rowIndex === index ? { ...r, [field]: value } : r))
    );
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((r) => r.rowIndex !== index));
  };

  // --- SERIAL INPUT ---
  const openSerialInput = (rowIndex: number) => {
    setSerialRowIndex(rowIndex);
    setSerialModalOpen(true);
  };

  const handleSerialSave = (serials: string[]) => {
    setRows((prev) =>
      prev.map((r) =>
        r.rowIndex === serialRowIndex ? { ...r, serials } : r
      )
    );
    setSerialModalOpen(false);
  };

  const getCurrentSerialRow = () =>
    rows.find((r) => r.rowIndex === serialRowIndex);

  // --- CLIENT-SIDE VALIDATION ---
  const validateRows = (): { valid: boolean; errors: Map<number, string> } => {
    const errors = new Map<number, string>();
    const seenCodes = new Set<string>();

    for (const r of rows) {
      if (seenCodes.has(r.productCode)) {
        errors.set(r.rowIndex, `Mã SPCT '${r.productCode}' bị trùng trong danh sách`);
        continue;
      }
      seenCodes.add(r.productCode);

      if (!r.productCode || r.productCode.trim() === "") {
        errors.set(r.rowIndex, "Mã SPCT không được để trống");
        continue;
      }

      if (r.price < 0) {
        errors.set(r.rowIndex, "Giá bán phải >= 0");
        continue;
      }

      if (r.serials.length > new Set(r.serials).size) {
        errors.set(r.rowIndex, "Serial trùng trong cùng dòng");
        continue;
      }
    }

    return { valid: errors.size === 0, errors };
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    const { valid, errors } = validateRows();
    if (!valid) {
      const firstErr = errors.entries().next().value;
      message.error(firstErr ? firstErr[1] : "Có lỗi validation");
      setRows((prev) =>
        prev.map((r) => {
          const err = errors.get(r.rowIndex);
          return err
            ? { ...r, error: err, errorField: "productCode" }
            : { ...r, error: undefined, errorField: undefined };
        })
      );
      return;
    }

    if (rows.length === 0) {
      message.warning("Không có biến thể nào để tạo!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: rows.map((r) => ({
          productCode: r.productCode,
          versionId: r.versionId,
          colorId: r.colorId,
          storageCapacityId: r.storageId,
          price: r.price,
          imageUrl: r.imageUrl || null,
          note: r.note || null,
          serials: r.serials.map((sn) => ({
            serialNumber: sn,
            status: "ACTIVE",
          })),
        })),
      };

      const res = await productDetailApi.batchCreate(selectedProductId, payload);
      const response = res as unknown as { data: BatchCreateResponse };

      if (response.data?.success) {
        message.success(
          `Đã tạo ${response.data.totalCreated} biến thể thành công!`
        );
        onSuccess();
      } else {
        const backendErrors = response.data?.errors || [];
        setRows((prev) =>
          prev.map((r) => {
            const beErr = backendErrors.find(
              (e: { rowIndex: number }) =>
                e.rowIndex === r.rowIndex || e.rowIndex === r.rowIndex
            );
            return beErr
              ? {
                  ...r,
                  error: beErr.message,
                  errorField: beErr.field,
                }
              : r;
          })
        );
        message.error(
          `Có ${backendErrors.length} biến thể không hợp lệ — kiểm tra các dòng báo lỗi`
        );
      }
    } catch (err: any) {
      message.error(
        "Lỗi khi tạo biến thể: " +
          (err?.response?.data?.message || err?.message || "Không xác định")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --- IMPORT SERIALS FROM EXCEL PER ROW ---
  const handleImportSerialsExcel = (rowIndex: number, file: any) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const imported = jsonData
        .map((row: any) => row[0])
        .filter((v: any) => v)
        .map((s: any) => String(s).trim())
        .filter((s: string) => s !== "");
      setRows((prev) =>
        prev.map((r) =>
          r.rowIndex === rowIndex
            ? { ...r, serials: Array.from(new Set([...r.serials, ...imported])) }
            : r
        )
      );
      message.success(`Đã import ${imported.length} serial cho dòng này`);
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  // --- TABLE COLUMNS ---
  const columns: ColumnsType<BatchVariantRow> = [
    {
      title: "STT",
      dataIndex: "rowIndex",
      align: "center",
      width: 50,
      fixed: "left",
    },
    {
      title: "Phiên bản",
      align: "center",
      width: 130,
      render: (_, r) => (
        <Tag color="green" style={{ fontSize: 12 }}>
          {r.versionName}
        </Tag>
      ),
    },
    {
      title: "Màu sắc",
      align: "center",
      width: 110,
      render: (_, r) => <Text>{r.colorName}</Text>,
    },
    {
      title: "Dung lượng",
      align: "center",
      width: 100,
      render: (_, r) => <Text>{r.storageName}</Text>,
    },
    {
      title: "Mã SPCT",
      dataIndex: "productCode",
      align: "left",
      width: 200,
      render: (val, r) => (
        <Input
          size="small"
          value={val}
          status={r.errorField === "productCode" ? "error" : undefined}
          onChange={(e) => updateRow(r.rowIndex, "productCode", e.target.value)}
          style={{ fontSize: 12 }}
        />
      ),
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      align: "right",
      width: 140,
      render: (val, r) => (
        <InputNumber
          size="small"
          value={val}
          min={0}
          formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(v) => Number(v!.replace(/\$\s?|(,*)/g, ""))}
          onChange={(v) => updateRow(r.rowIndex, "price", v ?? 0)}
          style={{ width: "100%", fontSize: 12 }}
          status={r.errorField === "price" ? "error" : undefined}
        />
      ),
    },
    {
      title: "Ảnh biến thể",
      dataIndex: "imageUrl",
      align: "center",
      width: 100,
      render: (val) =>
        val ? (
          <img
            src={val}
            alt="thumb"
            style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Serial",
      dataIndex: "serials",
      align: "center",
      width: 130,
      render: (_, r) => (
        <Space orientation="vertical" size={2}>
          <Tag color={r.serials.length > 0 ? "blue" : "default"}>
            {r.serials.length} serial
          </Tag>
          <Space size={2}>
            <Button
              size="small"
              onClick={() => openSerialInput(r.rowIndex)}
            >
              Nhập
            </Button>
            <Upload
              beforeUpload={(f) => handleImportSerialsExcel(r.rowIndex, f)}
              showUploadList={false}
              accept=".xlsx,.xls"
            >
              <Button size="small">Excel</Button>
            </Upload>
          </Space>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "error",
      align: "center",
      width: 160,
      render: (_, r) =>
        r.error ? (
          <Tooltip title={r.error}>
            <Tag color="error" style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.error.length > 25 ? r.error.substring(0, 25) + "..." : r.error}
            </Tag>
          </Tooltip>
        ) : (
          <Tag color="success">OK</Tag>
        ),
    },
    {
      title: "Xóa",
      align: "center",
      width: 60,
      fixed: "right",
      render: (_, r) => (
        <Button
          type="text"
          danger
          size="small"
          onClick={() => removeRow(r.rowIndex)}
        >
          ✕
        </Button>
      ),
    },
  ];

  // --- RENDER STEP 0: PRODUCT SELECT ---
  const renderProductSelectStep = () => (
    <div style={{ padding: "8px 0" }}>
      <Alert
        type="info"
        message="Chọn sản phẩm để tạo biến thể hàng loạt"
        description="Biến thể sẽ được tạo cho sản phẩm được chọn bên dưới."
        style={{ marginBottom: 16 }}
      />
      <Card size="small" title="Chọn sản phẩm">
        <Select
          placeholder="Tìm và chọn sản phẩm..."
          showSearch
          optionFilterProp="label"
          style={{ width: "100%" }}
          value={selectedProductId || undefined}
          onChange={(val, opt: any) => {
            setSelectedProductId(val);
            setSelectedProductCode(opt?.code || "");
            setSelectedProductName(opt?.label || "");
          }}
          options={productList.map((p: any) => ({
            label: `${p.code} - ${p.name}`,
            value: String(p.id),
            code: p.code,
          }))}
        />
        {selectedProductId && (
          <Alert
            type="success"
            message={`Đã chọn: ${selectedProductName}`}
            description={`Mã: ${selectedProductCode}`}
            style={{ marginTop: 12 }}
          />
        )}
      </Card>
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" onClick={handleProductConfirm}>
            Tiếp tục →
          </Button>
        </Space>
      </div>
    </div>
  );

  // --- RENDER STEP 1: SELECT AXES ---
  const renderSelectStep = () => (
    <div style={{ padding: "8px 0" }}>
      <Alert
        type="info"
        message={`Sản phẩm: ${selectedProductName}`}
        description={`Mã sản phẩm: ${selectedProductCode} — Tổ hợp tối đa: ${selectedVersions.length} × ${selectedColors.length} × ${selectedStorages.length} = ${selectedVersions.length * selectedColors.length * selectedStorages.length} biến thể`}
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[16, 16]}>
        {/* Phiên bản */}
        <Col span={8}>
          <Card
            size="small"
            title={
              <Space>
                <Text strong>Phiên bản</Text>
                <Tag color="green">{selectedVersions.length}</Tag>
              </Space>
            }
          >
            <Checkbox.Group
              options={ProductVersionOptions}
              value={selectedVersions}
              onChange={(vals) => setSelectedVersions(vals as string[])}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            />
          </Card>
        </Col>

        {/* Màu sắc */}
        <Col span={8}>
          <Card
            size="small"
            title={
              <Space>
                <Text strong>Màu sắc</Text>
                <Tag color="blue">{selectedColors.length}</Tag>
                <Button
                  type="link"
                  size="small"
                  onClick={() => toggleAllColors(selectedColors.length !== colors.length)}
                >
                  {selectedColors.length === colors.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </Button>
              </Space>
            }
          >
            <Checkbox.Group
              value={selectedColors}
              onChange={(vals) => setSelectedColors(vals as string[])}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              {colors.map((c) => (
                <Checkbox key={c.id} value={c.id}>
                  {c.name}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Card>
        </Col>

        {/* Dung lượng */}
        <Col span={8}>
          <Card
            size="small"
            title={
              <Space>
                <Text strong>Dung lượng</Text>
                <Tag color="purple">{selectedStorages.length}</Tag>
                <Button
                  type="link"
                  size="small"
                  onClick={() => toggleAllStorages(selectedStorages.length !== storages.length)}
                >
                  {selectedStorages.length === storages.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </Button>
              </Space>
            }
          >
            <Checkbox.Group
              value={selectedStorages}
              onChange={(vals) => setSelectedStorages(vals as string[])}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              {storages.map((s) => (
                <Checkbox key={s.id} value={s.id}>
                  {s.name}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" size="large" onClick={handleGenerate}>
            Tạo danh sách biến thể ({selectedVersions.length}×{selectedColors.length}×{selectedStorages.length} ={" "}
            {selectedVersions.length * selectedColors.length * selectedStorages.length} biến thể)
          </Button>
        </Space>
      </div>
    </div>
  );

  // --- RENDER STEP 2: PREVIEW ---
  const renderPreviewStep = () => (
    <div style={{ padding: "8px 0" }}>
      {/* Bulk actions */}
      <Card
        size="small"
        title="Áp dụng hàng loạt"
        style={{ marginBottom: 12 }}
        extra={
          <Button
            type="link"
            size="small"
            onClick={handleBackToProductSelect}
          >
            ← Chọn lại sản phẩm
          </Button>
        }
      >
        <Row gutter={[12, 12]} align="middle">
          <Col span={6}>
            <Text strong>Prefix mã SPCT:</Text>
            <Input
              size="small"
              value={codePrefix}
              onChange={(e) => setCodePrefix(e.target.value)}
              placeholder={selectedProductCode}
            />
          </Col>
          <Col span={5}>
            <Text strong>Giá bán chung:</Text>
            <InputNumber
              size="small"
              value={bulkPrice}
              min={0}
              placeholder="VNĐ"
              style={{ width: "100%" }}
              onChange={(v) => setBulkPrice(v ?? undefined)}
            />
          </Col>
          <Col span={7}>
            <Text strong>URL ảnh chung:</Text>
            <Input
              size="small"
              value={bulkImageUrl}
              onChange={(e) => setBulkImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </Col>
          <Col span={6}>
            <Space>
              <Button size="small" onClick={generateCodes}>
                Sinh mã tự động
              </Button>
              <Button size="small" onClick={applyPriceToAll}>
                Áp dụng giá
              </Button>
              <Button size="small" onClick={applyImageToAll}>
                Áp dụng ảnh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Preview table */}
      <Alert
        type="warning"
        message={`Đang tạo ${rows.length} biến thể cho sản phẩm: ${selectedProductName}`}
        style={{ marginBottom: 8 }}
      />

      <Table
        columns={columns}
        dataSource={rows}
        rowKey="id"
        size="small"
        scroll={{ x: 1300, y: 400 }}
        pagination={false}
        rowClassName={(r) => (r.error ? "ant-table-row-error" : "")}
        footer={() => (
          <Space style={{ float: "right" }}>
            <Text type="secondary">
              Tổng: <strong>{rows.length}</strong> biến thể — Serial:{" "}
              <strong>{rows.reduce((sum, r) => sum + r.serials.length, 0)}</strong>
            </Text>
          </Space>
        )}
      />
    </div>
  );

  const stepTitle: Record<string, string> = {
    "product-select": "Bước 1: Chọn sản phẩm",
    "select": "Bước 2: Chọn tổ hợp biến thể",
    "preview": "Bước 3: Xem & chỉnh sửa",
  };

  const stepColor: Record<string, string> = {
    "product-select": "orange",
    "select": "blue",
    "preview": "green",
  };

  return (
    <>
      <Modal
        title={
          <Space>
            <Text strong style={{ fontSize: 16 }}>
              Thêm hàng loạt biến thể
            </Text>
            <Tag color={stepColor[step]}>
              {stepTitle[step]}
            </Tag>
          </Space>
        }
        open={open}
        onCancel={onCancel}
        width={step === "product-select" ? 600 : step === "select" ? 900 : 1400}
        footer={
          step === "preview" ? (
            <div style={{ textAlign: "right" }}>
              <Space>
                <Button onClick={onCancel}>Hủy</Button>
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={submitting}
                  disabled={rows.length === 0}
                >
                  Lưu {rows.length} biến thể
                </Button>
              </Space>
            </div>
          ) : null
        }
      >
        {step === "product-select" && renderProductSelectStep()}
        {step === "select" && renderSelectStep()}
        {step === "preview" && renderPreviewStep()}
      </Modal>

      {/* Serial input sub-modal */}
      {serialModalOpen && getCurrentSerialRow() && (
        <SerialInputModal
          open={serialModalOpen}
          variantLabel={`${getCurrentSerialRow()!.versionName} / ${getCurrentSerialRow()!.colorName} / ${getCurrentSerialRow()!.storageName}`}
          initialSerials={getCurrentSerialRow()!.serials}
          onSave={handleSerialSave}
          onCancel={() => setSerialModalOpen(false)}
        />
      )}
    </>
  );
};

export default BatchCreateVariantModal;
