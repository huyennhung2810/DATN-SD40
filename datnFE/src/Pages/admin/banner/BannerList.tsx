// import React, { useState, useCallback, useEffect } from "react";
// import {
//   Card,
//   Button,
//   Input,
//   Space,
//   Typography,
//   Table,
//   Tag,
//   Modal,
//   Form,
//   Upload,
//   message,
//   Popconfirm,
//   Select,
//   InputNumber,
//   DatePicker,
//   Switch,
//   Tooltip,
// } from "antd";
// import {
//   PlusOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   ReloadOutlined,
//   PictureOutlined,
//   UploadOutlined,
//   PauseCircleOutlined,
//   PlayCircleOutlined,
// } from "@ant-design/icons";
// import { useDispatch, useSelector } from "react-redux";
// import type { RcFile } from "antd/es/upload/interface";
// import dayjs from "dayjs";
// import {
//   BannerSearchParams,
//   BannerRequest,
//   BannerResponse,
//   BANNER_SLOTS,
//   getSlotRatio,
// } from "../../../models/banner";
// import type { RootState } from "../../../redux/store";
// import { bannerActions } from "../../../redux/banner/bannerSlice";
// import bannerApi from "../../../api/bannerApi";

// const { Title, Text } = Typography;
// const { Search } = Input;

// // Preview component with aspect ratio
// const BannerPreview: React.FC<{ imageUrl: string; slot: string }> = ({
//   imageUrl,
//   slot,
// }) => {
//   const ratio = getSlotRatio(slot);
//   const [aspectWidth, aspectHeight] = ratio.split("/").map(Number);
//   const paddingTop = `${(aspectHeight / aspectWidth) * 100}%`;

//   return (
//     <div
//       style={{
//         width: 120,
//         position: "relative",
//         paddingTop,
//         borderRadius: 8,
//         overflow: "hidden",
//         backgroundColor: "#f5f5f5",
//       }}
//     >
//       {imageUrl ? (
//         <img
//           src={imageUrl}
//           alt="Banner Preview"
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             objectFit: "cover",
//           }}
//         />
//       ) : (
//         <div
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <PictureOutlined style={{ fontSize: 24, color: "#bfbfbf" }} />
//         </div>
//       )}
//     </div>
//   );
// };

// const BannerPage: React.FC = () => {
//   const dispatch = useDispatch();
//   const { list, loading, totalElements } = useSelector(
//     (state: RootState) => state.banner,
//   );

//   const [form] = Form.useForm();
//   const [keyword, setKeyword] = useState("");
//   const [selectedSlot, setSelectedSlot] = useState<string | undefined>();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingBanner, setEditingBanner] = useState<BannerResponse | null>(null);
//   const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
//   const [uploadLoading, setUploadLoading] = useState(false);
//   const [imageUrl, setImageUrl] = useState<string>("");

//   const [filter, setFilter] = useState<BannerSearchParams>({
//     page: 0,
//     size: 10,
//     keyword: "",
//     status: undefined,
//     slot: undefined,
//   });

//   const fetchBanners = useCallback(() => {
//     dispatch(bannerActions.getAll(filter));
//   }, [dispatch, filter]);

//   useEffect(() => {
//     fetchBanners();
//   }, [fetchBanners]);

//   // Debounce search
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       setFilter((prev) => ({
//         ...prev,
//         keyword: keyword.trim(),
//         status: selectedStatus as "ACTIVE" | "INACTIVE" | undefined,
//         slot: selectedSlot,
//         page: 0,
//       }));
//     }, 300);
//     return () => clearTimeout(timeout);
//   }, [keyword, selectedStatus, selectedSlot]);

//   const handleRefresh = () => {
//     fetchBanners();
//     message.success("Đã làm mới dữ liệu");
//   };

//   const handleReset = () => {
//     form.resetFields();
//     setKeyword("");
//     setSelectedSlot(undefined);
//     setSelectedStatus(undefined);
//     setFilter({
//       page: 0,
//       size: 10,
//       keyword: "",
//       status: undefined,
//       slot: undefined,
//     });
//   };

//   const handlePageChange = (page: number, pageSize: number) => {
//     setFilter((prev) => ({ ...prev, page: page - 1, size: pageSize }));
//   };

//   const handleToggleStatus = async (banner: BannerResponse) => {
//     try {
//       const newStatus = banner.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
//       await bannerApi.updateStatus(banner.id, newStatus);
//       message.success(
//         newStatus === "ACTIVE"
//           ? "Banner đã được kích hoạt"
//           : "Banner đã được tạm dừng",
//       );
//       fetchBanners();
//     } catch (error) {
//       message.error("Không thể cập nhật trạng thái banner");
//     }
//   };

//   const openModal = (banner?: BannerResponse) => {
//     if (banner) {
//       setEditingBanner(banner);
//       setImageUrl(banner.imageUrl);
//       form.setFieldsValue({
//         title: banner.title,
//         description: banner.description,
//         imageUrl: banner.imageUrl,
//         targetUrl: banner.targetUrl,
//         altText: banner.altText,
//         slot: banner.slot,
//         priority: banner.priority,
//         status: banner.status,
//         startAt: banner.startAt ? dayjs(banner.startAt) : null,
//         endAt: banner.endAt ? dayjs(banner.endAt) : null,
//       });
//     } else {
//       setEditingBanner(null);
//       setImageUrl("");
//       form.resetFields();
//       form.setFieldsValue({
//         status: "ACTIVE",
//         priority: 0,
//         slot: "HOME_HERO",
//       });
//     }
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingBanner(null);
//     setImageUrl("");
//     form.resetFields();
//   };

//   const handleSubmit = async () => {
//     try {
//       const values = await form.validateFields();

//       const bannerData: BannerRequest = {
//         id: editingBanner?.id,
//         title: values.title,
//         description: values.description,
//         imageUrl: imageUrl,
//         targetUrl: values.targetUrl,
//         altText: values.altText,
//         slot: values.slot,
//         priority: values.priority || 0,
//         status: values.status,
//         startAt: values.startAt ? values.startAt.valueOf() : null,
//         endAt: values.endAt ? values.endAt.valueOf() : null,
//       };

//       if (editingBanner) {
//         dispatch(
//           bannerActions.updateBanner({ data: bannerData, onSuccess: closeModal }),
//         );
//       } else {
//         dispatch(
//           bannerActions.addBanner({ data: bannerData, onSuccess: closeModal }),
//         );
//       }
//     } catch (error) {
//       console.error("Lỗi validate:", error);
//     }
//   };

//   const handleDelete = (id: string) => {
//     dispatch(bannerActions.deleteBanner(id));
//   };

//   // Upload ảnh
//   const uploadProps = {
//     name: "file",
//     listType: "picture-card" as const,
//     showUploadList: false,
//     accept: "image/*",
//     beforeUpload: (file: RcFile) => {
//       const isJpgOrPng =
//         file.type === "image/jpeg" ||
//         file.type === "image/png" ||
//         file.type === "image/webp";
//       if (!isJpgOrPng) {
//         message.error("Chỉ hỗ trợ định dạng JPG/PNG/WEBP!");
//         return Upload.LIST_IGNORE;
//       }
//       const isLt5M = file.size / 1024 / 1024 < 5;
//       if (!isLt5M) {
//         message.error("Hình ảnh phải nhỏ hơn 5MB!");
//         return Upload.LIST_IGNORE;
//       }
//       // Preview image
//       const reader = new FileReader();
//       reader.onload = () => {
//         setImageUrl(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//       return false;
//     },
//   };

//   const getSlotLabel = (slot: string) => {
//     const found = BANNER_SLOTS.find((s) => s.value === slot);
//     return found ? found.label : slot;
//   };

//   const columns = [
//     {
//       title: "STT",
//       dataIndex: "index",
//       key: "index",
//       width: 60,
//       render: (_: unknown, __: unknown, index: number) => (
//         <span style={{ fontWeight: 500 }}>
//           {index + 1 + filter.page * filter.size}
//         </span>
//       ),
//     },
//     {
//       title: "Hình ảnh",
//       dataIndex: "imageUrl",
//       key: "imageUrl",
//       width: 150,
//       render: (url: string, record: BannerResponse) => (
//         <BannerPreview imageUrl={url} slot={record.slot} />
//       ),
//     },
//     {
//       title: "Tiêu đề",
//       dataIndex: "title",
//       key: "title",
//       render: (title: string) => <Text strong>{title}</Text>,
//     },
//     {
//       title: "Vị trí",
//       dataIndex: "slot",
//       key: "slot",
//       width: 150,
//       render: (slot: string) => (
//         <Tag color="blue">{getSlotLabel(slot)}</Tag>
//       ),
//     },
//     {
//       title: "Ưu tiên",
//       dataIndex: "priority",
//       key: "priority",
//       width: 80,
//       align: "center" as const,
//       render: (priority: number) => <Text strong>{priority}</Text>,
//     },
//     {
//       title: "Trạng thái",
//       dataIndex: "status",
//       key: "status",
//       width: 120,
//       render: (status: string, record: BannerResponse) => (
//         <Switch
//           checked={status === "ACTIVE"}
//           checkedChildren="Hoạt động"
//           unCheckedChildren="Tạm dừng"
//           onChange={() => handleToggleStatus(record)}
//           style={{ marginRight: 8 }}
//         />
//       ),
//     },
//     {
//       title: "Ngày bắt đầu",
//       dataIndex: "startAt",
//       key: "startAt",
//       width: 120,
//       render: (date: number) =>
//         date ? dayjs(date).format("DD/MM/YYYY") : "---",
//     },
//     {
//       title: "Ngày kết thúc",
//       dataIndex: "endAt",
//       key: "endAt",
//       width: 120,
//       render: (date: number) =>
//         date ? dayjs(date).format("DD/MM/YYYY") : "---",
//     },
//     {
//       title: "Thao tác",
//       key: "actions",
//       width: 120,
//       fixed: "right" as const,
//       render: (_: unknown, record: BannerResponse) => (
//         <Space>
//           <Tooltip title="Sửa">
//             <Button
//               type="text"
//               icon={<EditOutlined />}
//               onClick={() => openModal(record)}
//               style={{ color: "#faad14" }}
//             />
//           </Tooltip>
//           <Popconfirm
//             title="Xóa banner"
//             description="Bạn có chắc chắn muốn xóa?"
//             onConfirm={() => handleDelete(record.id)}
//             okText="Xóa"
//             cancelText="Hủy"
//           >
//             <Tooltip title="Xóa">
//               <Button type="text" danger icon={<DeleteOutlined />} />
//             </Tooltip>
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
//       <Card style={{ borderRadius: "12px" }}>
//         <Space align="center" size={16}>
//           <div
//             style={{
//               backgroundColor: "#fff2e8",
//               padding: "12px",
//               borderRadius: "10px",
//             }}
//           >
//             <PictureOutlined style={{ fontSize: "26px", color: "#ff4d4f" }} />
//           </div>
//           <div>
//             <Title level={4} style={{ margin: 0 }}>
//               Quản lý Banner
//             </Title>
//             <Text type="secondary" style={{ fontSize: "14px" }}>
//               Quản lý banner hiển thị trên trang chủ
//             </Text>
//           </div>
//         </Space>
//       </Card>

//       <Card
//         title={<span>Bộ lọc tìm kiếm</span>}
//         extra={
//           <Button
//             shape="circle"
//             icon={<ReloadOutlined />}
//             onClick={handleReset}
//             type="primary"
//             ghost
//           />
//         }
//       >
//         <Space size={16} wrap>
//           <Search
//             placeholder="Tìm kiếm theo tiêu đề..."
//             allowClear
//             value={keyword}
//             onChange={(e) => setKeyword(e.target.value)}
//             style={{ width: 250 }}
//           />
//           <Select
//             placeholder="Vị trí banner"
//             allowClear
//             value={selectedSlot}
//             onChange={(val) => setSelectedSlot(val)}
//             style={{ width: 180 }}
//             options={BANNER_SLOTS.map((slot) => ({
//               label: slot.label,
//               value: slot.value,
//             }))}
//           />
//           <Select
//             placeholder="Trạng thái"
//             allowClear
//             value={selectedStatus}
//             onChange={(val) => setSelectedStatus(val)}
//             style={{ width: 150 }}
//             options={[
//               { label: "Hoạt động", value: "ACTIVE" },
//               { label: "Không hoạt động", value: "INACTIVE" },
//             ]}
//           />
//         </Space>
//       </Card>

//       <Card
//         title={
//           <Text strong style={{ fontSize: "16px" }}>
//             Danh sách banner ({totalElements})
//           </Text>
//         }
//         extra={
//           <Space size="middle">
//             <Button
//               type="primary"
//               icon={<PlusOutlined />}
//               onClick={() => openModal()}
//               style={{ borderRadius: "20px", height: "35px" }}
//             >
//               Thêm mới
//             </Button>
//             <Button
//               icon={<ReloadOutlined spin={loading} />}
//               onClick={handleRefresh}
//             >
//               Tải lại
//             </Button>
//           </Space>
//         }
//       >
//         <Table
//           columns={columns}
//           dataSource={list}
//           rowKey="id"
//           loading={loading}
//           pagination={{
//             current: filter.page + 1,
//             pageSize: filter.size,
//             total: totalElements,
//             onChange: handlePageChange,
//             showSizeChanger: true,
//             pageSizeOptions: ["10", "20", "50"],
//             showTotal: (total) => `Tổng ${total} banner`,
//           }}
//           scroll={{ x: 1200 }}
//         />
//       </Card>

//       {/* Modal Thêm/Sửa Banner */}
//       <Modal
//         title={editingBanner ? "Cập nhật banner" : "Thêm mới banner"}
//         open={isModalOpen}
//         onCancel={closeModal}
//         width={700}
//         destroyOnClose
//         footer={
//           <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
//             <Button onClick={closeModal}>Hủy</Button>
//             <Button type="primary" onClick={handleSubmit} loading={loading}>
//               {editingBanner ? "Cập nhật" : "Thêm mới"}
//             </Button>
//           </div>
//         }
//       >
//         <Form form={form} layout="vertical">
//           <Form.Item
//             name="title"
//             label="Tiêu đề banner"
//             rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
//           >
//             <Input placeholder="Nhập tiêu đề banner" />
//           </Form.Item>

//           <Form.Item
//             name="slot"
//             label="Vị trí hiển thị"
//             rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
//           >
//             <Select
//               placeholder="Chọn vị trí banner"
//               options={BANNER_SLOTS.map((slot) => ({
//                 label: `${slot.label} (${slot.ratio})`,
//                 value: slot.value,
//               }))}
//             />
//           </Form.Item>

//           <Form.Item name="description" label="Mô tả">
//             <Input.TextArea rows={2} placeholder="Nhập mô tả (tùy chọn)" />
//           </Form.Item>

//           <Form.Item
//             name="imageUrl"
//             label="Hình ảnh"
//             rules={[{ required: true, message: "Vui lòng tải lên hình ảnh" }]}
//           >
//             <div>
//               <Upload {...uploadProps}>
//                 <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
//               </Upload>
//               {imageUrl && (
//                 <div
//                   style={{
//                     marginTop: 16,
//                     padding: 8,
//                     border: "1px solid #d9d9d9",
//                     borderRadius: 8,
//                     display: "inline-block",
//                   }}
//                 >
//                   <img
//                     src={imageUrl}
//                     alt="Preview"
//                     style={{
//                       maxWidth: 300,
//                       maxHeight: 150,
//                       objectFit: "contain",
//                     }}
//                   />
//                 </div>
//               )}
//             </div>
//           </Form.Item>

//           <Form.Item name="targetUrl" label="Liên kết khi click">
//             <Input placeholder="https://example.com (tùy chọn)" />
//           </Form.Item>

//           <Form.Item name="altText" label="Alt text (SEO)">
//             <Input placeholder="Mô tả hình ảnh cho SEO" />
//           </Form.Item>

//           <Space size={16} wrap>
//             <Form.Item name="priority" label="Độ ưu tiên">
//               <InputNumber
//                 min={0}
//                 defaultValue={0}
//                 style={{ width: 100 }}
//                 placeholder="0"
//               />
//             </Form.Item>

//             <Form.Item name="status" label="Trạng thái">
//               <Select
//                 style={{ width: 150 }}
//                 options={[
//                   { label: "Hoạt động", value: "ACTIVE" },
//                   { label: "Không hoạt động", value: "INACTIVE" },
//                 ]}
//               />
//             </Form.Item>
//           </Space>

//           <Space size={16} wrap>
//             <Form.Item name="startAt" label="Ngày bắt đầu">
//               <DatePicker style={{ width: 180 }} placeholder="Chọn ngày" />
//             </Form.Item>

//             <Form.Item name="endAt" label="Ngày kết thúc">
//               <DatePicker style={{ width: 180 }} placeholder="Chọn ngày" />
//             </Form.Item>
//           </Space>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default BannerPage;
