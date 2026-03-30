import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Button,
  Table,
  message,
  Typography,
  Space,
  Spin,
  Tag,
} from "antd";
import {
  QrcodeOutlined,
  DeleteOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import QrScannerModal from "./QrScannerModal";
import { posApi } from "../api/admin/posApi";

interface AvailableSerial {
  id: string;
  serialNumber: string;
  code: string;
}

interface SerialAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  detailId: string;
  productName: string;
  requiredQuantity: number;
  productDetailId: string;
  onSuccess: () => void;
  /** Already-assigned serials for this detail (passed when editing) */
  initialSerials?: AvailableSerial[];
}

const SerialAssignmentModal: React.FC<SerialAssignmentModalProps> = ({
  open,
  onClose,
  orderId,
  detailId,
  productName,
  requiredQuantity,
  productDetailId,
  onSuccess,
  initialSerials = [],
}) => {
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);
  const [availableSerials, setAvailableSerials] = useState<AvailableSerial[]>(
    [],
  );
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Pre-populate with already-assigned serials
      setSelectedSerials(initialSerials.map((s) => s.serialNumber));
      setInputValue("");
      fetchAvailableSerials();
    }
  }, [open, productDetailId]);

  const fetchAvailableSerials = async () => {
    if (!productDetailId) return;
    try {
      setLoadingAvailable(true);
      const res = await posApi.getAvailableSerials(productDetailId);
      const available: AvailableSerial[] = res.data?.data || [];
      // Merge in the already-assigned serials (which are IN_ORDER, not in available list)
      // so they can appear in the top table with "Đã chọn" indicator
      const merged = [
        ...initialSerials.filter(
          (s) => !available.find((a) => a.serialNumber === s.serialNumber),
        ),
        ...available,
      ];
      setAvailableSerials(merged);
    } catch (error) {
      console.error("Không thể tải danh sách:", error);
      setAvailableSerials(initialSerials);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handlePickSerial = (serialNumber: string) => {
    if (selectedSerials.includes(serialNumber)) {
      message.warning("Mã Serial này đã được chọn");
      return;
    }
    if (selectedSerials.length >= requiredQuantity) {
      message.warning(
        `Chỉ được phép chọn tối đa ${requiredQuantity} mã Serial`,
      );
      return;
    }
    setSelectedSerials([...selectedSerials, serialNumber]);
  };

  const handleAddManual = () => {
    if (!inputValue.trim()) return;
    handlePickSerial(inputValue.trim());
    setInputValue("");
  };

  const handleScanSuccess = (serialNumber: string) => {
    handlePickSerial(serialNumber);
    message.success(`Đã quét mã: ${serialNumber}`);
    if (selectedSerials.length + 1 >= requiredQuantity) {
      setIsScannerOpen(false);
    }
  };

  const handleRemoveSelected = (serial: string) => {
    setSelectedSerials(selectedSerials.filter((s) => s !== serial));
  };

  const handleConfirm = async () => {
    if (selectedSerials.length !== requiredQuantity) {
      message.error(`Vui lòng chọn đúng ${requiredQuantity} mã Serial`);
      return;
    }
    try {
      setLoading(true);
      await posApi.assignSerialsToOrderDetail(
        orderId,
        detailId,
        selectedSerials,
      );
      message.success("Gán Serial thành công!");
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi gán Serial");
    } finally {
      setLoading(false);
    }
  };

  const availableColumns = [
    {
      title: "STT",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 55,
      align: "center" as const,
    },
    {
      title: "Mã Serial",
      dataIndex: "serialNumber",
      key: "serialNumber",
      render: (text: string) => <Typography.Text code>{text}</Typography.Text>,
    },
    {
      title: "Mã code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Chọn",
      key: "action",
      width: 100,
      align: "center" as const,
      render: (_: any, record: AvailableSerial) => {
        const alreadyPicked = selectedSerials.includes(record.serialNumber);
        const isFull = selectedSerials.length >= requiredQuantity;
        return (
          <Button
            type={alreadyPicked ? "default" : "primary"}
            size="small"
            icon={<CheckOutlined />}
            disabled={!alreadyPicked && isFull}
            onClick={() =>
              alreadyPicked
                ? handleRemoveSelected(record.serialNumber)
                : handlePickSerial(record.serialNumber)
            }
          >
            {alreadyPicked ? "Đã chọn" : "Chọn"}
          </Button>
        );
      },
    },
  ];

  const selectedColumns = [
    {
      title: "STT",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 55,
      align: "center" as const,
    },
    {
      title: "Serial đã chọn",
      dataIndex: "serial",
      key: "serial",
      render: (text: string) => <Typography.Text code>{text}</Typography.Text>,
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      align: "center" as const,
      render: (_: any, record: any) => (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveSelected(record.serial)}
        />
      ),
    },
  ];

  const selectedData = selectedSerials.map((s) => ({ serial: s }));

  return (
    <Modal
      title={`Chọn Serial cho: ${productName}`}
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      okButtonProps={{
        disabled: selectedSerials.length !== requiredQuantity,
        loading,
      }}
      okText="Xác nhận Gán"
      cancelText="Đóng"
      width={680}
      destroyOnHidden
    >
      <div style={{ marginBottom: 12 }}>
        <Typography.Text strong>Yêu cầu chọn đủ: </Typography.Text>
        <Typography.Text
          type={
            selectedSerials.length === requiredQuantity
              ? "success"
              : selectedSerials.length > requiredQuantity
                ? "danger"
                : "danger"
          }
          strong
        >
          {selectedSerials.length} / {requiredQuantity} Serial
        </Typography.Text>
        {selectedSerials.length === requiredQuantity && (
          <Tag color="success" style={{ marginLeft: 8 }}>
            Đã đủ ✓
          </Tag>
        )}
        {selectedSerials.length > requiredQuantity && (
          <Tag color="error" style={{ marginLeft: 8 }}>
            Vượt quá số lượng!
          </Tag>
        )}
      </div>

      {/* ── Bảng danh sách Serial khả dụng ── */}
      <Typography.Text strong style={{ display: "block", marginBottom: 6 }}>
        Danh sách Serial có sẵn:
      </Typography.Text>
      <Spin spinning={loadingAvailable}>
        <Table
          dataSource={availableSerials}
          columns={availableColumns}
          rowKey="id"
          pagination={{ pageSize: 5, size: "small" }}
          size="small"
          bordered
          style={{ marginBottom: 16 }}
          locale={{
            emptyText: "Không có Serial nào khả dụng cho sản phẩm này",
          }}
          rowClassName={(record: AvailableSerial) =>
            selectedSerials.includes(record.serialNumber)
              ? "ant-table-row-selected"
              : ""
          }
        />
      </Spin>

      {/* ── Nhập thủ công / Quét Camera ── */}
      <Space style={{ marginBottom: 12, width: "100%" }}>
        <Input
          placeholder="Hoặc nhập thủ công mã Serial..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleAddManual}
          style={{ width: 260 }}
          disabled={selectedSerials.length >= requiredQuantity}
        />
        <Button
          type="primary"
          onClick={handleAddManual}
          disabled={selectedSerials.length >= requiredQuantity}
        >
          Thêm
        </Button>
        <Button
          icon={<QrcodeOutlined />}
          onClick={() => setIsScannerOpen(true)}
          disabled={selectedSerials.length >= requiredQuantity}
        >
          Quét Camera
        </Button>
      </Space>

      {/* ── Bảng Serial đã chọn ── */}
      <Typography.Text strong style={{ display: "block", marginBottom: 6 }}>
        Serial đã chọn ({selectedSerials.length}/{requiredQuantity}):
      </Typography.Text>
      <Table
        dataSource={selectedData}
        columns={selectedColumns}
        rowKey="serial"
        pagination={false}
        size="small"
        bordered
        locale={{ emptyText: "Chưa chọn Serial nào" }}
      />

      <QrScannerModal
        open={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </Modal>
  );
};

export default SerialAssignmentModal;
