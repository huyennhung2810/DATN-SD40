import React, { useState } from "react";
import { Modal, Input, Button, List, Typography, Space, message } from "antd";

const { Text } = Typography;

interface AssignSerialModalProps {
    open: boolean;
    onClose: () => void;
    onAssign: (serialNumbers: string[]) => void;
    maxQuantity: number;
}

const AssignSerialModal: React.FC<AssignSerialModalProps> = ({ open, onClose, onAssign, maxQuantity }) => {
    const [inputValue, setInputValue] = useState("");
    const [serials, setSerials] = useState<string[]>([]);

    const handleAdd = () => {
        const sn = inputValue.trim();
        if (!sn) return;
        if (serials.includes(sn)) {
            message.warning("Mã Serial này đã được thêm!");
            return;
        }
        if (serials.length >= maxQuantity) {
            message.error(`Chỉ được phép nhập tối đa ${maxQuantity} mã Serial cho sản phẩm này.`);
            return;
        }
        setSerials([...serials, sn]);
        setInputValue("");
    };

    const handleRemove = (sn: string) => {
        setSerials(serials.filter((item) => item !== sn));
    };

    const handleConfirm = () => {
        if (serials.length !== maxQuantity) {
            message.error(`Vui lòng nhập đủ ${maxQuantity} mã Serial trước khi xác nhận.`);
            return;
        }
        onAssign(serials);
    };

    return (
        <Modal
            title={`Nhập/Quét mã Serial cần xuất kho (Yêu cầu: ${maxQuantity})`}
            open={open}
            onCancel={onClose}
            onOk={handleConfirm}
            okText="Xác nhận gán"
            cancelText="Hủy"
            destroyOnClose
            afterClose={() => {
                setInputValue("");
                setSerials([]);
            }}
        >
            <Space direction="vertical" style={{ width: "100%" }}>
                <Input.Search
                    placeholder="Nhập hoặc dùng máy quét mã Serial..."
                    enterButton="Thêm"
                    size="large"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onSearch={handleAdd}
                    autoFocus
                />

                <List
                    header={<Text strong>Đã quét ({serials.length}/{maxQuantity}):</Text>}
                    bordered
                    dataSource={serials}
                    renderItem={(item) => (
                        <List.Item
                            actions={[<Button danger type="link" onClick={() => handleRemove(item)}>Xóa</Button>]}
                        >
                            <Text code>{item}</Text>
                        </List.Item>
                    )}
                />
            </Space>
        </Modal>
    );
};

export default AssignSerialModal;
