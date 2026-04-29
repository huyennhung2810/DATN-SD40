import {
  Button,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  Input,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import * as XLSX from "xlsx";
import React, { useState } from "react";

const { Text } = Typography;
const { TextArea } = Input;

interface SerialInputModalProps {
  open: boolean;
  variantLabel: string;
  initialSerials?: string[];
  onSave: (serials: string[]) => void;
  onCancel: () => void;
}

const SerialInputModal: React.FC<SerialInputModalProps> = ({
  open,
  variantLabel,
  initialSerials = [],
  onSave,
  onCancel,
}) => {
  const [serials, setSerials] = useState<string[]>(initialSerials);
  const [inputText, setInputText] = useState("");

  const handleAddFromText = () => {
    const lines = inputText
      .split(/\n/)
      .map((s) => s.trim())
      .filter((s) => s !== "");
    if (lines.length === 0) return;

    const unique = Array.from(new Set([...serials, ...lines]));
    setSerials(unique);
    setInputText("");
  };

  const handleImportExcel = (file: any) => {
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
      const unique = Array.from(new Set([...serials, ...imported]));
      setSerials(unique);
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleRemove = (sn: string) => {
    setSerials((prev) => prev.filter((s) => s !== sn));
  };

  const handleClearAll = () => {
    setSerials([]);
  };

  const columns: ColumnsType<{ serial: string; index: number }> = [
    {
      title: "STT",
      align: "center",
      width: 60,
      render: (_, __, i) => i + 1,
    },
    {
      title: "Mã Serial",
      render: (_, r) => <Text code>{r.serial}</Text>,
    },
    {
      title: "Thao tác",
      align: "center",
      width: 80,
      render: (_, r) => (
        <Button
          type="text"
          danger
          size="small"
          onClick={() => handleRemove(r.serial)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const tableData = serials.map((serial, index) => ({ serial, index }));

  return (
    <Modal
      title={`Nhập Serial — ${variantLabel}`}
      open={open}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="clear" onClick={handleClearAll} danger>
          Xóa tất cả
        </Button>,
        <Button key="save" type="primary" onClick={() => onSave(serials)}>
          Lưu ({serials.length} serial)
        </Button>,
      ]}
    >
      <Space orientation="vertical" style={{ width: "100%" }} size="middle">
        {/* Nhập text */}
        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            Nhập serial (mỗi dòng 1 mã)
          </Text>
          <Space.Compact style={{ width: "100%" }}>
            <TextArea
              placeholder="SP001&#10;SP002&#10;SP003"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button type="primary" onClick={handleAddFromText} style={{ height: "auto" }}>
              Thêm
            </Button>
          </Space.Compact>
        </div>

        {/* Import Excel */}
        <Space>
          <Text strong>Hoặc import từ Excel:</Text>
          <Upload beforeUpload={handleImportExcel} showUploadList={false} accept=".xlsx,.xls">
            <Button>Import Excel</Button>
          </Upload>
        </Space>

        {/* Thống kê */}
        <Space>
          <Tag color="blue">{serials.length} serial</Tag>
          <Text type="secondary">Có thể bỏ trống (tạo biến thể trước, bổ sung serial sau)</Text>
        </Space>

        {/* Bảng preview */}
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="serial"
          size="small"
          pagination={{ pageSize: 10, size: "small" }}
          locale={{ emptyText: "Chưa có serial nào" }}
          scroll={{ y: 300 }}
        />
      </Space>
    </Modal>
  );
};

export default SerialInputModal;
