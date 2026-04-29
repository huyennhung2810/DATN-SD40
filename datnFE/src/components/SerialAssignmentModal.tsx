import React, { useState, useEffect, useRef } from "react";
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
  type InputRef,
} from "antd";
import {
  BarcodeOutlined, // Đổi icon sang Barcode
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
  const [availableSerials, setAvailableSerials] = useState<AvailableSerial[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (open) {
      setSelectedSerials(initialSerials.map((s) => s.serialNumber));
      setInputValue("");
      fetchAvailableSerials();
      
      // Tự động focus vào ô nhập liệu khi mở Modal
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, productDetailId]);

  const fetchAvailableSerials = async () => {
    if (!productDetailId) return;
    try {
      setLoadingAvailable(true);
      const res = await posApi.getAvailableSerials(productDetailId);
      const available: AvailableSerial[] = res.data?.data || [];
      const merged = [
        ...initialSerials.filter(
          (s) => !available.find((a) => a.serialNumber === s.serialNumber),
        ),
        ...available,
      ];
      setAvailableSerials(merged);

      // Tự động chọn trước serial khả dụng nếu chưa có serial nào được gán
      if (initialSerials.length === 0 && available.length > 0) {
        const needed = requiredQuantity;
        const toSelect = available
          .slice(0, needed)
          .map((s) => s.serialNumber);
        setSelectedSerials(toSelect);
      }
    } catch (error) {
      console.error("Không thể tải danh sách:", error);
      setAvailableSerials(initialSerials);
    } finally {
      setLoadingAvailable(false);
    }
  };

  // Hàm xử lý logic CHỌN IMEI (Có kiểm tra tồn tại)
  const handlePickSerial = (serialNumber: string): boolean => {
    // 1. Kiểm tra xem đã chọn chưa
    if (selectedSerials.includes(serialNumber)) {
      message.warning("Mã IMEI này đã được chọn!");
      return false;
    }

    // 2. KIỂM TRA QUAN TRỌNG: Mã IMEI quét được CÓ NẰM TRONG DANH SÁCH KHẢ DỤNG KHÔNG?
    const exists = availableSerials.find(s => s.serialNumber === serialNumber);
    if (!exists) {
      message.error(`Mã IMEI ${serialNumber} không tồn tại hoặc không thuộc sản phẩm này!`);
      return false;
    }

    // 3. Kiểm tra số lượng
    if (selectedSerials.length >= requiredQuantity) {
      message.warning(`Chỉ được phép chọn tối đa ${requiredQuantity} mã IMEI!`);
      return false;
    }

    // Nếu qua hết các bước kiểm tra -> Thêm vào danh sách đã chọn
    setSelectedSerials((prev) => [...prev, serialNumber]);
    return true;
  };

  const handleAddManual = () => {
    if (!inputValue.trim()) return;
    const success = handlePickSerial(inputValue.trim());
    
    if (success) {
      setInputValue("");
    }
    
    // Luôn focus lại vào ô input để quét liên tục bằng máy quét cầm tay
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Xử lý khi Camera quét thành công
  const handleScanSuccess = (serialNumber: string) => {
    const success = handlePickSerial(serialNumber);
    if (success) {
      message.success(`Đã quét và chọn mã: ${serialNumber}`);
      // Nếu đã đủ số lượng thì tự động đóng Camera đi
      if (selectedSerials.length + 1 >= requiredQuantity) {
        setIsScannerOpen(false);
      }
    }
  };

  const handleRemoveSelected = (serial: string) => {
    setSelectedSerials(selectedSerials.filter((s) => s !== serial));
  };

  const handleConfirm = async () => {
    if (selectedSerials.length !== requiredQuantity) {
      message.error(`Vui lòng chọn đúng ${requiredQuantity} mã IMEI`);
      return;
    }
    try {
      setLoading(true);
      await posApi.assignSerialsToOrderDetail(
        orderId,
        detailId,
        selectedSerials,
      );
      message.success("Gán IMEI thành công!");
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi gán IMEI");
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
      title: "Mã IMEI",
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
      title: "IMEI đã chọn",
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
      title={`Chọn mã IMEI cho: ${productName}`}
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
      <div style={{ marginBottom: 16 }}>
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
          {selectedSerials.length} / {requiredQuantity} IMEI
        </Typography.Text>
        {selectedSerials.length === requiredQuantity && (
          <Tag color="success" style={{ marginLeft: 8 }}>
            Đã đủ ✓
          </Tag>
        )}
      </div>

      {/* ── Nhập thủ công / Quét Camera (Chuyển lên trên cho tiện thao tác) ── */}
      <Space style={{ marginBottom: 16, width: "100%" }}>
        <Input
          ref={inputRef}
          placeholder="Nhập/Quét mã IMEI..."
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
          icon={<BarcodeOutlined />}
          onClick={() => setIsScannerOpen(true)}
          disabled={selectedSerials.length >= requiredQuantity}
        >
          Mở Camera Quét IMEI
        </Button>
      </Space>

      {/* ── Bảng danh sách IMEI khả dụng ── */}
      <Typography.Text strong style={{ display: "block", marginBottom: 6 }}>
        Danh sách mã IMEI có sẵn trong kho:
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
            emptyText: "Không có IMEI nào khả dụng cho sản phẩm này",
          }}
          rowClassName={(record: AvailableSerial) =>
            selectedSerials.includes(record.serialNumber)
              ? "ant-table-row-selected"
              : ""
          }
        />
      </Spin>

      {/* ── Bảng IMEI đã chọn ── */}
      <Typography.Text strong style={{ display: "block", marginBottom: 6 }}>
        Mã IMEI đã chọn ({selectedSerials.length}/{requiredQuantity}):
      </Typography.Text>
      <Table
        dataSource={selectedData}
        columns={selectedColumns}
        rowKey="serial"
        pagination={false}
        size="small"
        bordered
        locale={{ emptyText: "Chưa chọn mã IMEI nào" }}
      />

      {/* Tái sử dụng Component QrScannerModal cũ của bạn */}
      <QrScannerModal
        open={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </Modal>
  );
};

export default SerialAssignmentModal;