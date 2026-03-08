import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Table, message, Typography, Space } from 'antd';
import { QrcodeOutlined, DeleteOutlined } from '@ant-design/icons';
import QrScannerModal from './QrScannerModal';
import { posApi } from '../api/admin/posApi';

interface SerialAssignmentModalProps {
    open: boolean;
    onClose: () => void;
    orderId: string;
    detailId: string;
    productName: string;
    requiredQuantity: number;
    onSuccess: () => void;
}

const SerialAssignmentModal: React.FC<SerialAssignmentModalProps> = ({
    open, onClose, orderId, detailId, productName, requiredQuantity, onSuccess
}) => {
    const [selectedSerials, setSelectedSerials] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Reset when opened
    useEffect(() => {
        if (open) {
            setSelectedSerials([]);
            setInputValue('');
        }
    }, [open]);

    const handleAddManual = () => {
        if (!inputValue.trim()) return;
        if (selectedSerials.includes(inputValue.trim())) {
            message.warning('Mã Serial này đã được chọn');
            return;
        }
        if (selectedSerials.length >= requiredQuantity) {
            message.warning(`Chỉ được phép chọn tối đa ${requiredQuantity} mã Serial`);
            return;
        }
        setSelectedSerials([...selectedSerials, inputValue.trim()]);
        setInputValue('');
    };

    const handleScanSuccess = (serialNumber: string) => {
        if (selectedSerials.includes(serialNumber)) {
            message.warning('Mã Serial này đã được chọn');
            return;
        }
        if (selectedSerials.length >= requiredQuantity) {
            message.warning(`Chỉ được phép chọn tối đa ${requiredQuantity} mã Serial`);
            setIsScannerOpen(false);
            return;
        }
        setSelectedSerials([...selectedSerials, serialNumber]);
        message.success(`Đã quét mã: ${serialNumber}`);
        // Optionally close scanner if limit reached
        if (selectedSerials.length + 1 >= requiredQuantity) {
            setIsScannerOpen(false);
        }
    };

    const handleRemoveSelected = (serial: string) => {
        setSelectedSerials(selectedSerials.filter(s => s !== serial));
    };

    const handleConfirm = async () => {
        if (selectedSerials.length !== requiredQuantity) {
            message.error(`Vui lòng chọn đúng ${requiredQuantity} mã Serial`);
            return;
        }
        try {
            setLoading(true);
            await posApi.assignSerialsToOrderDetail(orderId, detailId, selectedSerials);
            message.success('Gán Serial thành công!');
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi gán Serial (có thể Serial không tồn tại hoặc đã bán)');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'STT',
            key: 'index',
            render: (_: any, __: any, index: number) => index + 1,
            width: 80,
            align: 'center' as const,
        },
        {
            title: 'Serial đã chọn',
            dataIndex: 'serial',
            key: 'serial',
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleRemoveSelected(record.serial)} />
            )
        }
    ];

    const data = selectedSerials.map(s => ({ serial: s }));

    return (
        <Modal
            title={`Chọn Serial cho: ${productName}`}
            open={open}
            onCancel={onClose}
            onOk={handleConfirm}
            okButtonProps={{ disabled: selectedSerials.length !== requiredQuantity, loading }}
            okText="Xác nhận Gán"
            cancelText="Đóng"
            width={600}
        >
            <div style={{ marginBottom: 16 }}>
                <Typography.Text strong>Yêu cầu chọn đủ: </Typography.Text>
                <Typography.Text type="danger" strong>{selectedSerials.length} / {requiredQuantity} Serial</Typography.Text>
            </div>

            <Space style={{ marginBottom: 16, width: '100%' }}>
                <Input
                    placeholder="Nhập thủ công mã Serial"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onPressEnter={handleAddManual}
                    style={{ width: 280 }}
                />
                <Button type="primary" onClick={handleAddManual}>Thêm</Button>
                <Button icon={<QrcodeOutlined />} onClick={() => setIsScannerOpen(true)}>Quét Camera</Button>
            </Space>

            <Table
                dataSource={data}
                columns={columns}
                rowKey="serial"
                pagination={false}
                size="small"
                bordered
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
