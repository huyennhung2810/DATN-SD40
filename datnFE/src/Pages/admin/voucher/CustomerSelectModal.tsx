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
  Button,
  Tag,
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

  // THÊM: State quản lý bộ lọc
  const [filterMode, setFilterMode] = useState<string>("ALL");

  // THÊM: State quản lý Modal nhập lý do (Tránh lỗi mất focus của Modal.confirm)
  const [disableModal, setDisableModal] = useState({
    visible: false,
    detailId: "",
    reason: "",
  });

  useEffect(() => {
    if (visible) {
      dispatch(customerActions.getAll(params));
      setSelectedRowKeys(initialSelectedKeys);
    }
  }, [visible, params, dispatch, initialSelectedKeys]);

  // Hàm tìm kiếm thông tin detail của một khách hàng trong voucher hiện tại
  const getDetailByCustomerId = (customerId: string) => {
    // Hỗ trợ đọc dữ liệu Backend trả về (d.customerId) HOẶC dữ liệu cũ (d.customer?.id)
    return voucherDetails.find(
      (d) => (d.customerId || d.customer?.id) === customerId,
    );
  };

  // --- LOGIC PHÂN HẠNG VÀ SẮP XẾP ---
  const getCustomerTier = (totalSpent: number = 0) => {
    if (totalSpent >= 20000000) return { label: "Vàng", color: "gold", rank: 3 };
    if (totalSpent >= 5000000) return { label: "Bạc", color: "silver", rank: 2 };
    return { label: "Đồng", color: "orange", rank: 1 };
  };

  const getFilteredAndSortedData = () => {
    if (!list) return [];

    // 1. Lọc theo lựa chọn
    const filteredList = list.filter((customer: any) => {
      const tierLabel = getCustomerTier(customer.totalSpent || 0).label;
      const isSelected =
        selectedRowKeys.includes(customer.id) ||
        getDetailByCustomerId(customer.id) !== undefined;

      if (filterMode === "GOLD") return tierLabel === "Vàng";
      if (filterMode === "SILVER") return tierLabel === "Bạc";
      if (filterMode === "BRONZE") return tierLabel === "Đồng";
      if (filterMode === "SELECTED") return isSelected;
      return true; // ALL
    });

    // 2. Sắp xếp (Đã chọn lên đầu -> Vàng -> Bạc -> Đồng)
    return filteredList.sort((a: any, b: any) => {
      const isASelected =
        selectedRowKeys.includes(a.id) ||
        getDetailByCustomerId(a.id) !== undefined;
      const isBSelected =
        selectedRowKeys.includes(b.id) ||
        getDetailByCustomerId(b.id) !== undefined;

      if (isASelected && !isBSelected) return -1;
      if (!isASelected && isBSelected) return 1;

      const tierA = getCustomerTier(a.totalSpent || 0).rank;
      const tierB = getCustomerTier(b.totalSpent || 0).rank;
      return tierB - tierA; // Xếp giảm dần theo rank
    });
  };

  // Hàm xử lý mở Modal nhập lý do
  const handleUpdateStatus = (id: string, newStatus: number) => {
    if (newStatus === 2) {
      setDisableModal({ visible: true, detailId: id, reason: "" });
    } else {
      if (onUpdateDetailStatus) onUpdateDetailStatus(id, 0, "");
    }
  };

  const columns: ColumnsType<any> = [
    { title: "Mã KH", dataIndex: "code", key: "code" },
    { title: "Họ tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Hạng KH",
      key: "tier",
      render: (record: any) => {
        const tier = getCustomerTier(record.totalSpent || 0);
        return (
          <Tag color={tier.color} style={{ fontWeight: "bold" }}>
            {tier.label}
          </Tag>
        );
      },
    },
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
        width: 70, // Giữ nguyên độ rộng bạn đã setup
        ellipsis: true, 
        render: (record: any) => {
          const detail = getDetailByCustomerId(record.id);

          if (detail?.usageStatus === 2) {
            return (
              <Text
                type="danger"
                ellipsis={{ tooltip: detail.reason }} 
                style={{ width: "100%" }} 
              >
                {detail.reason || "Không có lý do"}
              </Text>
            );
          }
          return "---";
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
    <>
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
        <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
          <Input
            placeholder="Tìm tên, email..."
            prefix={<SearchOutlined />}
            value={params.searchText}
            onChange={(e) =>
              setParams({ ...params, searchText: e.target.value, page: 0 })
            }
            style={{ width: 250 }}
          />

          <Select
            value={filterMode}
            onChange={(value) => setFilterMode(value)}
            style={{ width: 160 }}
            options={[
              { value: "ALL", label: "Tất cả các hạng" },
              { value: "GOLD", label: "Khách Vàng" },
              { value: "SILVER", label: "Khách Bạc" },
              { value: "BRONZE", label: "Khách Đồng" },
              { value: "SELECTED", label: "Người đã chọn" },
            ]}
          />

          <Button
            onClick={() => {
              setParams({ ...params, searchText: "", page: 0 });
              setFilterMode("ALL");
            }}
          >
            Làm mới
          </Button>
        </Space>

        <Table
          rowSelection={{ type: "checkbox", ...rowSelection }}
          columns={columns}
          dataSource={getFilteredAndSortedData()} // Nguồn dữ liệu đã được lọc và sắp xếp
          rowKey="id"
          loading={loading}
          pagination={{
            current: params.page + 1,
            pageSize: params.size,
            total: filterMode === "ALL" ? totalElements : getFilteredAndSortedData().length,
            onChange: (page, size) =>
              setParams({ ...params, page: page - 1, size }),
          }}
        />
      </Modal>

      {/* MODAL NHẬP LÝ DO (Độc lập, không bị lỗi gõ chữ) */}
      <Modal
        title="Xác nhận vô hiệu hóa"
        open={disableModal.visible}
        onOk={() => {
          if (!disableModal.reason.trim()) {
            message.error("Bạn phải nhập lý do!");
            return;
          }
          if (onUpdateDetailStatus) {
            onUpdateDetailStatus(disableModal.detailId, 2, disableModal.reason);
          }
          setDisableModal({ visible: false, detailId: "", reason: "" });
        }}
        onCancel={() =>
          setDisableModal({ visible: false, detailId: "", reason: "" })
        }
        okText="Xác nhận"
        cancelText="Hủy bỏ"
        zIndex={1001}
      >
        <Input.TextArea
          rows={4}
          placeholder="Nhập lý do vô hiệu hóa (bắt buộc)..."
          value={disableModal.reason}
          onChange={(e) =>
            setDisableModal({ ...disableModal, reason: e.target.value })
          }
          autoFocus
        />
      </Modal>
    </>
  );
};

export default CustomerSelectModal;