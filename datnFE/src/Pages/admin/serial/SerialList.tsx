import { BarcodeOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Pagination,
  Radio,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { QRCodeSVG } from "qrcode.react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { SerialPageParams, SerialResponse } from "../../../models/serial";
import { serialActions } from "../../../redux/serial/serialSlice";
import type { RootState } from "../../../redux/store";

const { Title, Text } = Typography;

/** serialStatus === 'SOLD' → đã bán (vàng); ngược lại → chưa bán (xanh). */
function isSerialSold(r: SerialResponse): boolean {
  return String(r.serialStatus ?? "").toUpperCase() === "SOLD";
}

const SerialPage: React.FC = () => {
  const dispatch = useDispatch();

  const {
    list = [],
    loading,
    totalElements = 0,
  } = useSelector((state: RootState) => state.serial || {});

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<SerialPageParams>({
    page: 0,
    size: 10,
    keyword: "",
    status: undefined,
  });

  const handleStatusChange = (status: string | undefined) => {
    setFilter((prev) => ({
      ...prev,
      status: status,
      keyword: keyword.trim(),
      page: 0,
    }));
  };

  useEffect(() => {
    dispatch(serialActions.getAll(filter));
  }, [dispatch, filter]);

  const columns: ColumnsType<SerialResponse> = [
    {
      title: "STT",
      align: "center",
      width: 60,
      render: (_, __, i) => filter.page * filter.size + i + 1,
    },
    {
      title: "Serial Number",
      render: (r) => (
        <div>
          <Text strong>{r.serialNumber}</Text>
        </div>
      ),
    },
    {
      title: "QR Code",
      align: "center",
      render: (r) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <QRCodeSVG value={r.serialNumber} size={64} />
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      render: (v) => (
        <div>
          <Text strong>{v || "---"}</Text>
        </div>
      ),
    },
    {
      title: "Ngày nhập",
      dataIndex: "createdDate",
      align: "center",
      render: (d) => (
        <div>
          {d ? dayjs(d, "DD/MM/YYYY HH:mm:ss").format("DD/MM/YYYY") : "---"}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "serialStatus",
      align: "center",
      render: (ss) => {
        const sold = isSerialSold({ serialStatus: ss } as SerialResponse);
        return (
          <Tag color={sold ? "gold" : "success"}>
            {sold ? "ĐÃ BÁN" : "TRONG KHO"}
          </Tag>
        );
      },
    },
  ];

  return (
    <>
      <div
        className="solid-card"
        style={{ padding: "var(--spacing-lg)", marginBottom: 16 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                backgroundColor: "var(--color-primary-light)",
                padding: "12px",
                borderRadius: "var(--radius-md)",
              }}
            >
              <BarcodeOutlined
                style={{
                  fontSize: "24px",
                  color: "var(--color-primary)",
                }}
              />
            </div>

            <div>
              <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                Quản lý Serial
              </Title>
              <Text type="secondary" style={{ fontSize: "13px" }}>
                Quản lý mã Serial và trạng thái sản phẩm
              </Text>
            </div>
          </div>

          <Text type="secondary">
            Tổng: <b>{totalElements}</b> serial
          </Text>
        </div>
      </div>

      <Card
        variant="borderless"
        style={{
          borderRadius: "12px",
          marginBottom: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Form layout="vertical">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            <Form.Item
              label={
                <Text strong>
                  <SearchOutlined /> Tìm kiếm Serial
                </Text>
              }
            >
              <Input
                placeholder="Nhập số Serial hoặc mã định danh..."
                size="large"
                allowClear
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </Form.Item>

            <Form.Item label={<Text strong>Trạng thái sản phẩm</Text>}>
              <Radio.Group
                size="large"
                buttonStyle="solid"
                value={filter.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <Radio.Button
                  value={undefined}
                  style={{ minWidth: "100px", textAlign: "center" }}
                >
                  Tất cả
                </Radio.Button>
                <Radio.Button
                  value="ACTIVE"
                  style={{ minWidth: "100px", textAlign: "center" }}
                >
                  <Tag
                    color="success"
                    style={{
                      border: "none",
                      background: "transparent",
                      margin: 0,
                    }}
                  >
                    Trong kho
                  </Tag>
                </Radio.Button>
                <Radio.Button
                  value="INACTIVE"
                  style={{ minWidth: "100px", textAlign: "center" }}
                >
                  <Tag
                    color="gold"
                    style={{
                      border: "none",
                      background: "transparent",
                      margin: 0,
                    }}
                  >
                    Đã bán
                  </Tag>
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card title={`Danh sách (${totalElements})`}>
        <Table
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={false}
          rowKey="id"
          bordered
          size="middle"
          scroll={{ x: 1000 }}
        />

        <Pagination
          style={{ marginTop: 16, textAlign: "right" }}
          current={filter.page + 1}
          pageSize={filter.size}
          total={totalElements}
          onChange={(p, s) => setFilter({ ...filter, page: p - 1, size: s })}
        />
      </Card>
    </>
  );
};

export default SerialPage;
