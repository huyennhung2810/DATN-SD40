import React, { useEffect, useState } from "react";
import {
  Modal,
  Table,
  Input,
  Space,
  Select,
  Badge,
  Typography,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { customerActions } from "../../../redux/customer/customerSlice";
import type { ColumnsType } from "antd/es/table";
const { Text } = Typography;

interface Props {
  visible: boolean;
  onCancel: () => void;
  onSelect: (selectedIds: string[]) => void;
  initialSelectedKeys: string[];
  isEdit: boolean; // Thêm props để phân biệt chế độ
  onUpdateDetailStatus?: (id: string, status: number, reason: string) => void;
  // Dữ liệu details từ currentVoucher truyền xuống để hiển thị trạng thái
  voucherDetails?: any[];
}

const CustomerSelectModal: React.FC<Props> = ({
  visible,
  onCancel,
  onSelect,
  initialSelectedKeys,
  isEdit,
  onUpdateDetailStatus,
  voucherDetails = [],
}) => {
  const dispatch = useDispatch();
  const { list, totalElements, loading } = useSelector(
    (state: any) => state.customer,
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [params, setParams] = useState({ page: 0, size: 10, searchText: "" });

  useEffect(() => {
    if (visible) {
      dispatch(customerActions.getAll(params));
      setSelectedRowKeys(initialSelectedKeys);
    }
  }, [visible, params, dispatch, initialSelectedKeys]);

  // Hàm tìm kiếm thông tin detail của một khách hàng trong voucher hiện tại
  const getDetailByCustomerId = (customerId: string) => {
    return voucherDetails.find((d) => d.customer?.id === customerId);
  };

  const handleUpdateStatus = (id: string, newStatus: number) => {
    if (newStatus === 2) {
      let reasonText = "";
      Modal.confirm({
        title: "Xác nhận vô hiệu hóa",
        content: (
          <Input.TextArea
            rows={3}
            placeholder="Nhập lý do vô hiệu hóa (bắt buộc)..."
            onChange={(e) => (reasonText = e.target.value)}
          />
        ),
        onOk: () => {
          if (!reasonText.trim()) {
            message.error("Bạn phải nhập lý do!");
            return Promise.reject();
          }
          if (onUpdateDetailStatus) onUpdateDetailStatus(id, 2, reasonText);
        },
      });
    } else {
      if (onUpdateDetailStatus) onUpdateDetailStatus(id, 0, "");
    }
  };

  const columns: ColumnsType<any> = [
    { title: "Mã KH", dataIndex: "code", key: "code" },
    { title: "Họ tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
  ];

  // Nếu là CHỈNH SỬA, thêm các cột quản lý trạng thái
  if (isEdit) {
    columns.push(
      {
        title: "Trạng thái",
        key: "status",
        render: (record: any) => {
          const detail = getDetailByCustomerId(record.id);
          if (!detail) return <Badge status="default" text="Mới thêm" />;

          const status = detail.usageStatus;
          if (status === 0)
            return <Badge status="processing" text="Chưa dùng" />;
          if (status === 1) return <Badge status="success" text="Đã dùng" />;
          return <Badge status="error" text="Vô hiệu hóa" />;
        },
      },
      {
        title: "Thao tác",
        key: "action",
        render: (record: any) => {
          const detail = getDetailByCustomerId(record.id);
          if (!detail) return "---";

          // Nếu đã dùng (usageStatus === 1) -> Hiển thị thông báo không thể thao tác
          if (detail.usageStatus === 1) {
            return (
              <Badge
                status="success"
                text={
                  <Text type="secondary" italic>
                    Đã áp dụng đơn hàng
                  </Text>
                }
              />
            );
          }

          // Nếu chưa dùng hoặc vô hiệu hóa mới hiện Select để chuyển đổi
          return (
            <Select
              value={detail.usageStatus}
              style={{ width: 130 }}
              onChange={(value) => handleUpdateStatus(detail.id, value)}
            >
              <Select.Option value={0}>Kích hoạt</Select.Option>
              <Select.Option value={2}>Vô hiệu hóa</Select.Option>
            </Select>
          );
        },
      },
      {
        title: "Lý do",
        key: "reason",
        render: (record: any) => {
          const detail = getDetailByCustomerId(record.id);
          return detail?.usageStatus === 2 ? (
            <Text type="danger" ellipsis={{ tooltip: detail.reason }}>
              {detail.reason || "N/A"}
            </Text>
          ) : (
            "---"
          );
        },
      },
    );
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: any[]) => {
      setSelectedRowKeys(keys);
    },
    getCheckboxProps: (record: any) => ({
      // KHÔNG ĐƯỢC BỎ CHỌN khách hàng cũ (đã có trong detail)
      disabled: isEdit && getDetailByCustomerId(record.id) !== undefined,
      name: record.name,
    }),
  };

  return (
    <Modal
      title={
        isEdit
          ? "Quản lý khách hàng & Trạng thái Voucher"
          : "Chọn khách hàng áp dụng"
      }
      open={visible}
      onOk={() => {
        onSelect(selectedRowKeys);
        onCancel();
      }}
      onCancel={onCancel}
      width={isEdit ? 1100 : 700}
      okText="Xác nhận"
    >
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm tên, email..."
          prefix={<SearchOutlined />}
          onChange={(e) =>
            setParams({ ...params, searchText: e.target.value, page: 0 })
          }
          style={{ width: 300 }}
        />
      </Space>

      <Table
        rowSelection={{ type: "checkbox", ...rowSelection }}
        columns={columns}
        dataSource={list}
        rowKey="id"
        loading={loading}
        pagination={{
          current: params.page + 1,
          pageSize: params.size,
          total: totalElements,
          onChange: (page, size) =>
            setParams({ ...params, page: page - 1, size }),
        }}
      />
    </Modal>
  );
};

export default CustomerSelectModal;
