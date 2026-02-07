import React, { useState, useCallback, useEffect } from "react";
import {
    Card,
    Button,
    Input,
    InputNumber,
    Tag,
    Space,
    Typography,
    Pagination,
    Tooltip,
    Form,
    Modal,
    Popconfirm,
    Select,
    Upload,
    Row,
    Col,
    Drawer,
    Image,
    Empty,
    Spin,
    Descriptions,
    Divider,
    Steps,
    Tabs, // tabs are life
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    CameraOutlined,
    UploadOutlined,
    CloseOutlined,
    SettingOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import type { ProductPageParams, ProductResponse, ProductRequest } from "../../../models/product";
import type { TechSpecRequest, TechSpecResponse } from "../../../models/techSpec";
import type { ProductImageResponse } from "../../../models/productImage";
import type { RootState } from "../../../redux/store";
import { productActions } from "../../../redux/product/productSlice";
import { productCategoryActions } from "../../../redux/productCategory/productCategorySlice";
import { productImageActions } from "../../../redux/productImage/productImageSlice";
import { sensorTypeActions } from "../../../redux/techSpec/sensorTypeSlice";
import { lensMountActions } from "../../../redux/techSpec/lensMountSlice";
import { resolutionActions } from "../../../redux/techSpec/resolutionSlice";
import { processorActions } from "../../../redux/techSpec/processorSlice";
import { imageFormatActions } from "../../../redux/techSpec/imageFormatSlice";
import { videoFormatActions } from "../../../redux/techSpec/videoFormatSlice";
import type { RcFile, UploadProps } from "antd/es/upload/interface";
import { App } from "antd";
import { initialTechSpec } from "../../../models/techSpec";
import productApi from "../../../api/productApi";
import techSpecApi from "../../../api/techSpecApi";

const { Title, Text } = Typography;
const { Search } = Input;

const ProductPage: React.FC = () => {
    const dispatch = useDispatch();
    const { list, loading, totalElements } = useSelector(
        (state: RootState) => state.product,
    );
    const { list: categories } = useSelector(
        (state: RootState) => state.productCategory,
    );
    const { list: productImages, loading: imageLoading } = useSelector(
        (state: RootState) => state.productImage,
    );
    const sensorTypeState = useSelector((state: RootState) => state.sensorType);
    const lensMountState = useSelector((state: RootState) => state.lensMount);
    const resolutionState = useSelector((state: RootState) => state.resolution);
    const processorState = useSelector((state: RootState) => state.processor);
    const imageFormatState = useSelector((state: RootState) => state.imageFormat);
    const videoFormatState = useSelector((state: RootState) => state.videoFormat);

    const [form] = Form.useForm();
    const [modalForm] = Form.useForm();
    const [keyword, setKeyword] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
    const [selectedSensorType, setSelectedSensorType] = useState<string | undefined>();
    const [selectedLensMount, setSelectedLensMount] = useState<string | undefined>();
    const [selectedResolution, setSelectedResolution] = useState<string | undefined>();
    const [selectedProcessor, setSelectedProcessor] = useState<string | undefined>();
    const [selectedImageFormat, setSelectedImageFormat] = useState<string | undefined>();
    const [selectedVideoFormat, setSelectedVideoFormat] = useState<string | undefined>();
    const [selectedIso, setSelectedIso] = useState<string | undefined>();
    const [uploadLoading, setUploadLoading] = useState(false);
    const { notification, message } = App.useApp();

    //
    const [currentStep, setCurrentStep] = useState(0);
    const [tempProductId, setTempProductId] = useState<string | null>(null);
    const [tempProductData, setTempProductData] = useState<ProductRequest | null>(null);
    const [tempTechSpecId, setTempTechSpecId] = useState<string | null>(null);
    const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
    const [stepLoading, setStepLoading] = useState(false);
    const [pendingImages, setPendingImages] = useState<{ file: File; preview: string }[]>([]);
    const [drawerPendingImages, setDrawerPendingImages] = useState<{ file: File; preview: string }[]>([]);

    // load ảnh
    useEffect(() => {
        if (isModalOpen && tempProductId && currentStep >= 2) {
            dispatch(productImageActions.getImagesByProduct(tempProductId));
        }
    }, [isModalOpen, tempProductId, currentStep, dispatch]);

    const [filter, setFilter] = useState<ProductPageParams>({
        page: 0,
        size: 12,
        name: "",
        idProductCategory: undefined,
        idTechSpec: undefined,
        status: undefined,
        sensorType: undefined,
        lensMount: undefined,
        resolution: undefined,
        processor: undefined,
        imageFormat: undefined,
        videoFormat: undefined,
        iso: undefined,
    });

    // category
    useEffect(() => {
        dispatch(productCategoryActions.getAll({ page: 0, size: 1000 }));
    }, [dispatch]);

    // Load techspec data for filters on mount - data go brrr
    useEffect(() => {
        dispatch(sensorTypeActions.getAll({ page: 0, size: 1000, keyword: "" }));
        dispatch(lensMountActions.getAll({ page: 0, size: 1000, keyword: "" }));
        dispatch(resolutionActions.getAll({ page: 0, size: 1000, keyword: "" }));
        dispatch(processorActions.getAll({ page: 0, size: 1000, keyword: "" }));
        dispatch(imageFormatActions.getAll({ page: 0, size: 1000, keyword: "" }));
        dispatch(videoFormatActions.getAll({ page: 0, size: 1000, keyword: "" }));
    }, [dispatch]);

    // Load techspec data for modal - modal entering
    useEffect(() => {
        if (isModalOpen) {
            dispatch(sensorTypeActions.getAll({ page: 0, size: 1000, keyword: "" }));
            dispatch(lensMountActions.getAll({ page: 0, size: 1000, keyword: "" }));
            dispatch(resolutionActions.getAll({ page: 0, size: 1000, keyword: "" }));
            dispatch(processorActions.getAll({ page: 0, size: 1000, keyword: "" }));
            dispatch(imageFormatActions.getAll({ page: 0, size: 1000, keyword: "" }));
            dispatch(videoFormatActions.getAll({ page: 0, size: 1000, keyword: "" }));
        }
    }, [dispatch, isModalOpen]);

    const fetchProducts = useCallback(() => {
        dispatch(productActions.getAll(filter));
    }, [dispatch, filter]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Debounce search - cho zui thôi
    useEffect(() => {
        const timeout = setTimeout(() => {
            setFilter((prev) => ({
                ...prev,
                name: keyword.trim(),
                idProductCategory: selectedCategory,
                status: selectedStatus as "ACTIVE" | "INACTIVE" | undefined,
                sensorType: selectedSensorType,
                lensMount: selectedLensMount,
                resolution: selectedResolution,
                processor: selectedProcessor,
                imageFormat: selectedImageFormat,
                videoFormat: selectedVideoFormat,
                iso: selectedIso?.trim() || undefined,
                page: 0,
            }));
        }, 300);
        return () => clearTimeout(timeout);
    }, [keyword, selectedCategory, selectedStatus, selectedSensorType, selectedLensMount, selectedResolution, selectedProcessor, selectedImageFormat, selectedVideoFormat, selectedIso]);

    const handleRefresh = () => {
        fetchProducts();
        notification.success({
            message: "Làm mới thành công",
            description: "Dữ liệu đã được cập nhật",
        });
    };

    const handleReset = () => {
        form.resetFields();
        setKeyword("");
        setSelectedCategory(undefined);
        setSelectedStatus(undefined);
        setSelectedSensorType(undefined);
        setSelectedLensMount(undefined);
        setSelectedResolution(undefined);
        setSelectedProcessor(undefined);
        setSelectedImageFormat(undefined);
        setSelectedVideoFormat(undefined);
        setSelectedIso(undefined);
        setFilter({
            page: 0,
            size: 12,
            name: "",
            idProductCategory: undefined,
            idTechSpec: undefined,
            status: undefined,
            sensorType: undefined,
            lensMount: undefined,
            resolution: undefined,
            processor: undefined,
            imageFormat: undefined,
            videoFormat: undefined,
            iso: undefined,
        });
    };

    const handlePageChange = (page: number, pageSize: number) => {
        setFilter((prev) => ({ ...prev, page: page - 1, size: pageSize }));
    };

    const openModal = (product?: ProductResponse) => {
        if (product) {
            // edit mode on
            setEditingProduct(product);
            setCurrentStep(0);
            setTempProductId(product.id);
            setTempProductData({
                name: product.name,
                description: product.description,
                idProductCategory: product.idProductCategory,
                idTechSpec: product.idTechSpec || null,
                price: product.price || null,
                status: product.status,
            });
            setTempTechSpecId(product.idTechSpec || null);
            setSelectedThumbnail(null);
            modalForm.setFieldsValue({
                name: product.name,
                description: product.description,
                idProductCategory: product.idProductCategory,
                price: product.price,
                status: product.status,
                techSpec: product.techSpec ? {
                    sensorType: product.techSpec.sensorType || undefined,
                    lensMount: product.techSpec.lensMount || undefined,
                    resolution: product.techSpec.resolution || undefined,
                    iso: product.techSpec.iso || "",
                    processor: product.techSpec.processor || undefined,
                    imageFormat: product.techSpec.imageFormat || undefined,
                    videoFormat: product.techSpec.videoFormat || undefined,
                } : {
                    sensorType: undefined,
                    lensMount: undefined,
                    resolution: undefined,
                    iso: "",
                    processor: undefined,
                    imageFormat: undefined,
                    videoFormat: undefined,
                },
            });
        } else {
            // new who dis
            setEditingProduct(null);
            setCurrentStep(0);
            setTempProductId(null);
            setTempProductData(null);
            setTempTechSpecId(null);
            setSelectedThumbnail(null);
            modalForm.resetFields();
            modalForm.setFieldsValue({ status: "ACTIVE", techSpec: initialTechSpec });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setCurrentStep(0);
        setTempProductId(null);
        setTempProductData(null);
        setTempTechSpecId(null);
        setSelectedThumbnail(null);
        // dọn dẹp ram thôi
        pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
        setPendingImages([]);
        modalForm.resetFields();
    };

    // form wizard vibes ✨

  // step 1: let's gooo
  const handleStep1Submit = async () => {
    try {
      // just name plz
      await modalForm.validateFields(["name"]);
      setStepLoading(true);

      const values = modalForm.getFieldsValue();
      const productData: ProductRequest = {
        name: values.name,
        description: values.description || undefined,
        idProductCategory: values.idProductCategory || undefined,
        price: values.price || undefined,
        status: values.status || "ACTIVE",
      };

      if (editingProduct) {
        // updating existing stuff
        await productApi.update(editingProduct.id, productData);
        setTempProductId(editingProduct.id);
        setTempProductData(productData);
        setCurrentStep(1);
        notification.success({ message: "Đã cập nhật thông tin sản phẩm" });
      } else {
        // creating new stuff
        const response = await productApi.create(productData);
        console.log("Create response:", response);

        // Fetch lại danh sách sản phẩm để lấy sản phẩm vừa tạo
        const result = await productApi.search({ page: 0, size: 1, name: values.name });
        if (result.data && result.data.length > 0) {
          // taking the first one (newest with matching name)
          const newProduct = result.data.find((p: any) => p.name === values.name) || result.data[0];
          setTempProductId(newProduct.id);
          setTempProductData(productData);
        }

        setCurrentStep(1);
        notification.success({ message: "Đã tạo sản phẩm thành công" });
      }
    } catch (error: any) {
      // validation error check
      if (error.errorFields) {
        // antd validation error - already handled
        console.log("Lỗi validation:", error.errorFields);
      } else {
        // other errors
        console.error("Lỗi bước 1:", error);
        notification.error({
          message: "Lỗi",
          description: error.message || error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại",
        });
      }
    } finally {
      setStepLoading(false);
    }
  };

    // step 2: techspec vibes
    const handleStep2Submit = async () => {
        try {
            const values = await modalForm.validateFields(["techSpec"]);
            const techSpecData = values.techSpec;
            
            // Check if any field has value
            const hasTechSpecData = techSpecData && (
                techSpecData.sensorType ||
                techSpecData.lensMount ||
                techSpecData.resolution ||
                techSpecData.iso ||
                techSpecData.processor ||
                techSpecData.imageFormat ||
                techSpecData.videoFormat
            );

            setStepLoading(true);

            if (hasTechSpecData && tempProductId) {
                // @ts-ignore
                const techSpecPayload: TechSpecRequest = {
                    id: tempTechSpecId || undefined,
                    idProduct: tempProductId,
                    sensorType: techSpecData.sensorType || undefined,
                    lensMount: techSpecData.lensMount || undefined,
                    resolution: techSpecData.resolution || undefined,
                    iso: techSpecData.iso || undefined,
                    processor: techSpecData.processor || undefined,
                    imageFormat: techSpecData.imageFormat || undefined,
                    videoFormat: techSpecData.videoFormat || undefined,
                    status: "ACTIVE",
                };

                let techSpecId = tempTechSpecId;
                if (tempTechSpecId) {
                    // update existing techspec
                    await techSpecApi.update(tempTechSpecId, techSpecPayload);
                    notification.success({ message: "Đã cập nhật thông số kỹ thuật" });
                } else {
                    // create new techspec
                    const response = await techSpecApi.create(techSpecPayload);
                    console.log("TechSpec create response:", response);
                    
                    // got the id from response.data
                    if (response && response.data) {
                        techSpecId = response.data.id;
                        setTempTechSpecId(techSpecId);
                        notification.success({ message: "Đã thêm thông số kỹ thuật" });
                    } else {
                        notification.error({ message: "Lỗi", description: "Không nhận được phản hồi từ server" });
                        setStepLoading(false);
                        return;
                    }
                }

                // update tempProductData with new idTechSpec
                if (techSpecId && tempProductData) {
                    setTempProductData({ ...tempProductData, idTechSpec: techSpecId });
                }

                // update product with techSpecId
                if (tempProductData) {
                    await productApi.update(tempProductId, { ...tempProductData, idTechSpec: techSpecId });
                }
            } else {
                notification.info({ message: "Bỏ qua thông số kỹ thuật", description: "Không có thông số kỹ thuật nào được chọn" });
            }

            setCurrentStep(2);
        } catch (error) {
            console.error("Lỗi bước 2:", error);
            notification.error({ message: "Có lỗi khi lưu thông số kỹ thuật" });
        } finally {
            setStepLoading(false);
        }
    };

    // step 3: the final boss (images)
    const handleStep3Submit = async () => {
        if (!tempProductId) return;

        try {
            setStepLoading(true);

            // get current images from redux
            const imageUrlsFromRedux = productImages.map((img: ProductImageResponse) => img.url);

            if (selectedThumbnail && imageUrlsFromRedux.length > 0) {
                // set thumbnail (update product with new imageUrls)
                const newImageUrls = [selectedThumbnail, ...imageUrlsFromRedux.filter(url => url !== selectedThumbnail)];
                if (tempProductData) {
                    await productApi.update(tempProductId, { ...tempProductData, imageUrls: newImageUrls });
                }
            } else if (imageUrlsFromRedux.length > 0) {
                // no thumbnail selected? still update images
                if (tempProductData) {
                    await productApi.update(tempProductId, { ...tempProductData, imageUrls: imageUrlsFromRedux });
                }
            }

            notification.success({
                message: "Thành công",
                description: editingProduct ? "Cập nhật sản phẩm thành công!" : "Thêm mới sản phẩm thành công!",
            });

            closeModal();
            fetchProducts();
        } catch (error) {
            console.error("Lỗi bước 3:", error);
            notification.error({ message: "Có lỗi xảy ra khi hoàn tất" });
        } finally {
            setStepLoading(false);
        }
    };

    // go back plz
    const handleBackStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // ===== END FORM WIZARD =====

    const handleDelete = (id: string) => {
        dispatch(productActions.deleteProduct(id));
    };

    const openDetail = (product: ProductResponse) => {
        console.log("Product data:", product);
        console.log("TechSpec data:", product.techSpec);
        setSelectedProduct(product);
        setIsDetailOpen(true);
        dispatch(productImageActions.getImagesByProduct(product.id));
    };

    const closeDetail = () => {
        setIsDetailOpen(false);
        setSelectedProduct(null);
        dispatch(productImageActions.resetImages());
        // clean up drawer images
        drawerPendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
        setDrawerPendingImages([]);
    };

    // upload images - multi upload with preview support
    const uploadProps: UploadProps = {
        listType: "picture-card",
        showUploadList: false,
        accept: "image/*",
        beforeUpload: (file: RcFile) => {
            const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
            if (!isJpgOrPng) {
                message.error("Bạn chỉ có thể tải lên định dạng JPG/PNG!");
                return Upload.LIST_IGNORE;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error("Hình ảnh phải nhỏ hơn 5MB!");
                return Upload.LIST_IGNORE;
            }
            // add to pending
            setPendingImages((prev) => [
                ...prev,
                { file, preview: URL.createObjectURL(file) },
            ]);
            return false;
        },
        customRequest: async ({ file, onSuccess, onError }) => {
            const targetProductId = tempProductId || selectedProduct?.id;
            if (!targetProductId) {
                onError?.({ error: new Error("Chưa chọn sản phẩm") });
                return;
            }
            setUploadLoading(true);
            try {
                dispatch(
                    productImageActions.uploadImage({
                        productId: targetProductId,
                        file: file as File,
                    })
                );
                // saga will refresh images list
                onSuccess?.(file);
            } catch (error) {
                onError?.({ error: error as Error });
            } finally {
                setUploadLoading(false);
            }
        },
    };

    // upload props for drawer
    const drawerUploadProps: UploadProps = {
        listType: "picture-card",
        showUploadList: false,
        accept: "image/*",
        beforeUpload: (file: RcFile) => {
            const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
            if (!isJpgOrPng) {
                message.error("Bạn chỉ có thể tải lên định dạng JPG/PNG!");
                return Upload.LIST_IGNORE;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error("Hình ảnh phải nhỏ hơn 5MB!");
                return Upload.LIST_IGNORE;
            }
            // add to drawer's pending list
            setDrawerPendingImages((prev) => [
                ...prev,
                { file, preview: URL.createObjectURL(file) },
            ]);
            return false;
        },
        customRequest: async ({ file, onSuccess, onError }) => {
            if (!selectedProduct) {
                onError?.({ error: new Error("Chưa chọn sản phẩm") });
                return;
            }
            setUploadLoading(true);
            try {
                dispatch(
                    productImageActions.uploadImage({
                        productId: selectedProduct.id,
                        file: file as File,
                    })
                );
                onSuccess?.(file);
            } catch (error) {
                onError?.({ error: error as Error });
            } finally {
                setUploadLoading(false);
            }
        },
    };

    const handleDeleteImage = (imageId: string) => {
        if (!selectedProduct) return;
        dispatch(
            productImageActions.deleteImage({
                productId: selectedProduct.id,
                imageId,
            })
        );
    };

    // upload all pending images
    const handleUploadAllPendingImages = () => {
        const targetProductId = tempProductId || selectedProduct?.id;
        if (!targetProductId) {
            notification.warning({ message: "Vui lòng lưu sản phẩm trước khi tải ảnh lên!" });
            return;
        }

        if (pendingImages.length === 0) {
            notification.info({ message: "Không có ảnh nào để tải lên" });
            return;
        }

        // upload each image with delay
        pendingImages.forEach((img, index) => {
            setTimeout(() => {
                dispatch(
                    productImageActions.uploadImage({
                        productId: targetProductId,
                        file: img.file,
                    })
                );
            }, index * 500); // 500ms delay between uploads
        });

        // clear pending after upload
        notification.success({
            message: "Đang tải ảnh lên",
            description: `Đã thêm ${pendingImages.length} ảnh vào hàng đợi`,
        });
        setPendingImages([]);
    };

    // remove from pending list
    const handleRemovePendingImage = (index: number) => {
        const newPendingImages = [...pendingImages];
        // revoke URL to avoid memory leak
        URL.revokeObjectURL(newPendingImages[index].preview);
        newPendingImages.splice(index, 1);
        setPendingImages(newPendingImages);
    };

    // upload all pending images (cho drawer)
    const handleUploadAllDrawerPendingImages = () => {
        if (!selectedProduct) {
            notification.warning({ message: "Vui lòng chọn sản phẩm!" });
            return;
        }

        if (drawerPendingImages.length === 0) {
            notification.info({ message: "Không có ảnh nào để tải lên" });
            return;
        }

        // upload each image with delay
        drawerPendingImages.forEach((img, index) => {
            setTimeout(() => {
                dispatch(
                    productImageActions.uploadImage({
                        productId: selectedProduct.id,
                        file: img.file,
                    })
                );
            }, index * 500);
        });

        notification.success({
            message: "Đang tải ảnh lên",
            description: `Đã thêm ${drawerPendingImages.length} ảnh vào hàng đợi`,
        });
        setDrawerPendingImages([]);
    };

    // remove from pending list (cho drawer)
    const handleRemoveDrawerPendingImage = (index: number) => {
        const newPendingImages = [...drawerPendingImages];
        URL.revokeObjectURL(newPendingImages[index].preview);
        newPendingImages.splice(index, 1);
        setDrawerPendingImages(newPendingImages);
    };

    const getCategoryName = (id: string) => {
        const cat = categories.find((c) => c.id === id);
        return cat?.name || "---";
    };

    // check if techSpec has any data
    const hasTechSpecData = (techSpec?: TechSpecResponse) => {
        if (!techSpec) return false;
        return !!(
            techSpec.sensorType ||
            techSpec.lensMount ||
            techSpec.resolution ||
            techSpec.iso ||
            techSpec.processor ||
            techSpec.imageFormat ||
            techSpec.videoFormat
        );
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Card className="mb-3" style={{ borderRadius: "12px" }}>
                <Space align="center" size={16}>
                    <div
                        style={{
                            backgroundColor: "#e6f7ff",
                            padding: "12px",
                            borderRadius: "10px",
                        }}
                    >
                        <CameraOutlined style={{ fontSize: "26px", color: "#1890ff" }} />
                    </div>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>
                            Quản lý sản phẩm
                        </Title>
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                            Quản lý sản phẩm của hệ thống
                        </Text>
                    </div>
                </Space>
            </Card>

            <Card
                title={<span><SearchOutlined /> Bộ lọc tìm kiếm</span>}
                extra={
                    <Tooltip title="Làm mới bộ lọc">
                        <Button
                            shape="circle"
                            icon={<ReloadOutlined />}
                            onClick={handleReset}
                            type="primary"
                            ghost
                        />
                    </Tooltip>
                }
            >
                <Form form={form} layout="vertical">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={6}>
                            <Form.Item name="keyword" label="Tìm kiếm">
                                <Search
                                    placeholder="Nhập tên sản phẩm..."
                                    allowClear
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={5}>
                            <Form.Item name="idProductCategory" label="Loại sản phẩm">
                                <Select
                                    placeholder="Tất cả loại"
                                    allowClear
                                    value={selectedCategory}
                                    onChange={(val) => setSelectedCategory(val)}
                                    options={categories.map((cat) => ({
                                        label: cat.name,
                                        value: cat.id,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={4}>
                            <Form.Item name="status" label="Trạng thái">
                                <Select
                                    placeholder="Tất cả"
                                    allowClear
                                    value={selectedStatus}
                                    onChange={(val) => setSelectedStatus(val)}
                                    options={[
                                        { label: "Hoạt động", value: "ACTIVE" },
                                        { label: "Không hoạt động", value: "INACTIVE" },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={4}>
                            <Form.Item name="sensorType" label="Loại cảm biến">
                                <Select
                                    placeholder="Tất cả"
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    value={selectedSensorType}
                                    onChange={(val) => setSelectedSensorType(val)}
                                    loading={sensorTypeState.loading}
                                    options={sensorTypeState.list.map((item) => ({
                                        label: item.name,
                                        value: item.name,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={5}>
                            <Form.Item name="lensMount" label="Ngàm lens">
                                <Select
                                    placeholder="Tất cả"
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    value={selectedLensMount}
                                    onChange={(val) => setSelectedLensMount(val)}
                                    loading={lensMountState.loading}
                                    options={lensMountState.list.map((item) => ({
                                        label: item.name,
                                        value: item.name,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={4}>
                            <Form.Item name="resolution" label="Độ phân giải">
                                <Select
                                    placeholder="Tất cả"
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    value={selectedResolution}
                                    onChange={(val) => setSelectedResolution(val)}
                                    loading={resolutionState.loading}
                                    options={resolutionState.list.map((item) => ({
                                        label: item.name,
                                        value: item.name,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={4}>
                            <Form.Item name="processor" label="Bộ xử lý">
                                <Select
                                    placeholder="Tất cả"
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    value={selectedProcessor}
                                    onChange={(val) => setSelectedProcessor(val)}
                                    loading={processorState.loading}
                                    options={processorState.list.map((item) => ({
                                        label: item.name,
                                        value: item.name,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={4}>
                            <Form.Item name="imageFormat" label="Định dạng ảnh">
                                <Select
                                    placeholder="Tất cả"
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    value={selectedImageFormat}
                                    onChange={(val) => setSelectedImageFormat(val)}
                                    loading={imageFormatState.loading}
                                    options={imageFormatState.list.map((item) => ({
                                        label: item.name,
                                        value: item.name,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={4}>
                            <Form.Item name="videoFormat" label="Định dạng video">
                                <Select
                                    placeholder="Tất cả"
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    value={selectedVideoFormat}
                                    onChange={(val) => setSelectedVideoFormat(val)}
                                    loading={videoFormatState.loading}
                                    options={videoFormatState.list.map((item) => ({
                                        label: item.name,
                                        value: item.name,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={4}>
                            <Form.Item name="iso" label="ISO">
                                <Input
                                    placeholder="Nhập ISO..."
                                    allowClear
                                    value={selectedIso}
                                    onChange={(e) => setSelectedIso(e.target.value)}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card
                title={
                    <Text strong style={{ fontSize: "16px" }}>
                        Danh sách sản phẩm ({totalElements})
                    </Text>
                }
                extra={
                    <Space size="middle">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => openModal()}
                            style={{ borderRadius: "20px", height: "35px" }}
                        >
                            Thêm mới
                        </Button>
                        <Button
                            icon={<ReloadOutlined spin={loading} />}
                            onClick={handleRefresh}
                            style={{ borderRadius: "20px" }}
                        >
                            Tải lại
                        </Button>
                    </Space>
                }
            >
                {loading ? (
                    <div style={{ textAlign: "center", padding: "50px" }}>
                        <Spin size="large" />
                    </div>
                ) : list.length === 0 ? (
                    <Empty description="Không tìm thấy sản phẩm nào" />
                ) : (
                    <Row gutter={[16, 16]}>
                        {list.map((product: ProductResponse) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                                <Card
                                    hoverable
                                    onClick={() => openDetail(product)}
                                    cover={
                                        <div
                                            style={{
                                                height: "200px",
                                                overflow: "hidden",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: "#f5f5f5",
                                                position: "relative",
                                            }}
                                        >
                                            {product.imageUrls && product.imageUrls.length > 0 ? (
                                                <img
                                                    src={product.imageUrls[0]}
                                                    alt={product.name}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                    }}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = "none";
                                                        const parent = (e.target as HTMLImageElement).parentElement;
                                                        if (parent) {
                                                            const icon = document.createElement("span");
                                                            icon.innerHTML = '<svg viewBox="0 0 24 24" width="48" height="48" fill="#bfbfbf"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z"/><path d="M6 10l4-4 2 2 4-4 3 3z"/></svg>';
                                                            parent.appendChild(icon.firstChild!);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <CameraOutlined
                                                    style={{ fontSize: "48px", color: "#bfbfbf" }}
                                                />
                                            )}
                                            {product.imageUrls && product.imageUrls.length > 1 && (
                                                <span
                                                    style={{
                                                        position: "absolute",
                                                        bottom: 8,
                                                        right: 8,
                                                        backgroundColor: "rgba(0,0,0,0.6)",
                                                        color: "white",
                                                        padding: "2px 8px",
                                                        borderRadius: "10px",
                                                        fontSize: "12px",
                                                    }}
                                                >
                          +{product.imageUrls.length - 1}
                        </span>
                                            )}
                                        </div>
                                    }
                                    actions={[
                                        <Tooltip title="Chỉnh sửa" key="edit">
                                            <EditOutlined
                                                style={{ fontSize: "18px", color: "#faad14" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openModal(product);
                                                }}
                                            />
                                        </Tooltip>,
                                        <Popconfirm
                                            title="Xóa sản phẩm"
                                            description="Bạn có chắc chắn muốn xóa?"
                                            onConfirm={(e) => {
                                                e?.stopPropagation();
                                                handleDelete(product.id);
                                            }}
                                            onCancel={(e) => e?.stopPropagation()}
                                            okText="Xóa"
                                            cancelText="Hủy"
                                            key="delete"
                                        >
                                            <Tooltip title="Xóa">
                                                <DeleteOutlined
                                                    style={{ fontSize: "18px", color: "#ff4d4f" }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </Tooltip>
                                        </Popconfirm>,
                                    ]}
                                >
                                    <Card.Meta
                                        title={
                                            <Text strong style={{ fontSize: "14px" }} ellipsis>
                                                {product.name}
                                            </Text>
                                        }
                                        description={
                                            <Space style={{ display: 'flex', flexDirection: 'column' }} size={4}>
                                                <Text type="secondary" style={{ fontSize: "12px" }}>
                                                    Loại: {getCategoryName(product.idProductCategory)}
                                                </Text>
                                                {product.price && (
                                                    <Text strong style={{ fontSize: "14px", color: "#ff4d4f" }}>
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                                    </Text>
                                                )}
                                                <Tag
                                                    color={product.status === "ACTIVE" ? "green" : "red"}
                                                    style={{ marginTop: 4 }}
                                                >
                                                    {product.status === "ACTIVE"
                                                        ? "Hoạt động"
                                                        : "Không hoạt động"}
                                                </Tag>
                                            </Space>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: "24px",
                    }}
                >
                    <Pagination
                        current={filter.page + 1}
                        pageSize={filter.size}
                        total={totalElements}
                        onChange={handlePageChange}
                        showSizeChanger
                        pageSizeOptions={["12", "24", "48"]}
                    />
                </div>
            </Card>

            {/* Create/Edit Modal with Steps */}
            <Modal
                title={editingProduct ? "Cập nhật sản phẩm" : "Thêm mới sản phẩm"}
                open={isModalOpen}
                onCancel={closeModal}
                width={750}
                destroyOnClose
                footer={
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button onClick={closeModal}>Hủy</Button>
                        <Space>
                            {currentStep > 0 && (
                                <Button onClick={handleBackStep}>Quay lại</Button>
                            )}
                            {currentStep === 0 && (
                                <Button
                                    type="primary"
                                    onClick={handleStep1Submit}
                                    loading={stepLoading}
                                >
                                    Tiếp tục
                                </Button>
                            )}
                            {currentStep === 1 && (
                                <Button
                                    type="primary"
                                    onClick={handleStep2Submit}
                                    loading={stepLoading}
                                >
                                    Tiếp tục
                                </Button>
                            )}
                            {currentStep === 2 && (
                                <Button
                                    type="primary"
                                    onClick={handleStep3Submit}
                                    loading={stepLoading}
                                >
                                    Hoàn tất
                                </Button>
                            )}
                        </Space>
                    </div>
                }
            >
                {/* Steps Progress */}
                <Steps
                    current={currentStep}
                    size="small"
                    style={{ marginBottom: 24 }}
                    items={[
                        { title: "Sản phẩm", description: "Thông tin cơ bản" },
                        { title: "TechSpec", description: "Thông số kỹ thuật" },
                        { title: "Hình ảnh", description: "Ảnh sản phẩm" },
                    ]}
                />

                <Form form={modalForm} layout="vertical">
                    {/* Bước 1: Thông tin sản phẩm */}
                    {currentStep === 0 && (
                        <>
                            <Form.Item
                                name="name"
                                label="Tên sản phẩm"
                                rules={[
                                    { required: true, message: "Vui lòng nhập tên sản phẩm" },
                                    { min: 2, message: "Tên phải có ít nhất 2 ký tự" },
                                ]}
                            >
                                <Input placeholder="Nhập tên sản phẩm" size="large" />
                            </Form.Item>

                            <Form.Item name="description" label="Mô tả">
                                <Input.TextArea rows={3} placeholder="Nhập mô tả sản phẩm" />
                            </Form.Item>

                            <Form.Item name="price" label="Giá (VNĐ)">
                                <InputNumber
                                    placeholder="Nhập giá sản phẩm"
                                    size="large"
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as unknown as number}
                                    min={0}
                                    addonAfter="VNĐ"
                                />
                            </Form.Item>

                            <Form.Item name="idProductCategory" label="Loại sản phẩm">
                                <Select
                                    placeholder="Chọn loại sản phẩm (không bắt buộc)"
                                    allowClear
                                    size="large"
                                    options={categories.map((cat) => ({
                                        label: cat.name,
                                        value: cat.id,
                                    }))}
                                />
                            </Form.Item>

                            <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE">
                                <Select
                                    size="large"
                                    options={[
                                        { label: "Hoạt động", value: "ACTIVE" },
                                        { label: "Không hoạt động", value: "INACTIVE" },
                                    ]}
                                />
                            </Form.Item>
                        </>
                    )}

                    {/* Bước 2: Thông số kỹ thuật */}
                    {currentStep === 1 && (
                        <>
                            <Typography.Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
                                Chọn thông số kỹ thuật cho sản phẩm từ danh sách có sẵn (không bắt buộc)
                            </Typography.Text>
                            <Divider style={{ margin: "12px 0" }} />

                            <Row gutter={[16, 0]}>
                                <Col span={12}>
                                    <Form.Item name={["techSpec", "sensorType"]} label="Loại cảm biến">
                                        <Select
                                            placeholder="Chọn loại cảm biến"
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            loading={sensorTypeState.loading}
                                            options={sensorTypeState.list.map((item) => ({
                                                label: item.name,
                                                value: item.name,
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name={["techSpec", "lensMount"]} label="Mount ống kính">
                                        <Select
                                            placeholder="Chọn mount ống kính"
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            loading={lensMountState.loading}
                                            options={lensMountState.list.map((item) => ({
                                                label: item.name,
                                                value: item.name,
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[16, 0]}>
                                <Col span={12}>
                                    <Form.Item name={["techSpec", "resolution"]} label="Độ phân giải">
                                        <Select
                                            placeholder="Chọn độ phân giải"
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            loading={resolutionState.loading}
                                            options={resolutionState.list.map((item) => ({
                                                label: item.name,
                                                value: item.name,
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name={["techSpec", "iso"]} label="ISO">
                                        <Input placeholder="ví dụ: 100-51200" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[16, 0]}>
                                <Col span={12}>
                                    <Form.Item name={["techSpec", "processor"]} label="Bộ xử lý">
                                        <Select
                                            placeholder="Chọn bộ xử lý"
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            loading={processorState.loading}
                                            options={processorState.list.map((item) => ({
                                                label: item.name,
                                                value: item.name,
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name={["techSpec", "imageFormat"]} label="Định dạng ảnh">
                                        <Select
                                            placeholder="Chọn định dạng ảnh"
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            loading={imageFormatState.loading}
                                            options={imageFormatState.list.map((item) => ({
                                                label: item.name,
                                                value: item.name,
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name={["techSpec", "videoFormat"]} label="Định dạng video">
                                <Select
                                    placeholder="Chọn định dạng video"
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    loading={videoFormatState.loading}
                                    options={videoFormatState.list.map((item) => ({
                                        label: item.name,
                                        value: item.name,
                                    }))}
                                />
                            </Form.Item>

                            <Divider />
                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                Lưu ý: ISO vẫn nhập thủ công vì là dải giá trị. Các trường khác chọn từ danh sách.
                            </Typography.Text>
                        </>
                    )}

                    {/* Bước 3: Hình ảnh sản phẩm */}
                    {currentStep === 2 && (
                        <>
                            <Typography.Text strong style={{ marginBottom: 16, display: "block" }}>
                                Tải ảnh sản phẩm lên
                            </Typography.Text>
                            <Typography.Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
                                Bạn có thể tải nhiều ảnh và chọn 1 ảnh làm ảnh đại diện cho thẻ sản phẩm
                            </Typography.Text>

                            {/* Nút tải ảnh lên */}
                            <div style={{ marginBottom: 24 }}>
                                <Upload {...uploadProps}>
                                    <Button type="primary" icon={<PlusOutlined />}>
                                        Chọn ảnh
                                    </Button>
                                </Upload>
                            </div>

                            {/* Hiển thị danh sách ảnh đang chờ upload */}
                            {pendingImages.length > 0 && (
                                <div style={{ marginBottom: 24, padding: 16, background: "#f6ffed", borderRadius: 8, border: "1px solid #b7eb8f" }}>
                                    <Typography.Text strong style={{ color: "#52c41a", display: "block", marginBottom: 12 }}>
                                        Ảnh đang chờ tải lên ({pendingImages.length} ảnh)
                                    </Typography.Text>
                                    <Row gutter={[16, 16]}>
                                        {pendingImages.map((img, index) => (
                                            <Col span={6} key={index}>
                                                <div
                                                    style={{
                                                        position: "relative",
                                                        border: "2px solid #d9d9d9",
                                                        borderRadius: 8,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <img
                                                        src={img.preview}
                                                        alt={`Chờ upload ${index + 1}`}
                                                        style={{
                                                            width: "100%",
                                                            height: 100,
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            bottom: 0,
                                                            left: 0,
                                                            right: 0,
                                                            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                                                            color: "#fff",
                                                            padding: "4px 8px",
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        Ảnh #{index + 1}
                                                    </div>
                                                    <Tooltip title="Xóa khỏi danh sách">
                                                        <Button
                                                            type="text"
                                                            danger
                                                            icon={<CloseOutlined />}
                                                            onClick={() => handleRemovePendingImage(index)}
                                                            style={{
                                                                position: "absolute",
                                                                top: 4,
                                                                right: 4,
                                                                background: "rgba(255,255,255,0.9)",
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                    <div style={{ marginTop: 16, textAlign: "right" }}>
                                        <Button
                                            type="primary"
                                            icon={<UploadOutlined />}
                                            onClick={handleUploadAllPendingImages}
                                            loading={uploadLoading}
                                        >
                                            Tải tất cả lên ({pendingImages.length})
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Hiển thị danh sách ảnh đã tải lên */}
                            {productImages.length > 0 && (
                                <div style={{ marginTop: 24 }}>
                                    <Typography.Text strong style={{ marginBottom: 12, display: "block" }}>
                                        Ảnh đã tải lên - Chọn ảnh đại diện (ấn vào ảnh để chọn)
                                    </Typography.Text>
                                    <Row gutter={[16, 16]}>
                                        {productImages.map((img: ProductImageResponse) => (
                                            <Col span={6} key={img.id}>
                                                <div
                                                    onClick={() => setSelectedThumbnail(img.url)}
                                                    style={{
                                                        cursor: "pointer",
                                                        border: selectedThumbnail === img.url ? "3px solid #1890ff" : "2px solid #d9d9d9",
                                                        borderRadius: 8,
                                                        overflow: "hidden",
                                                        position: "relative",
                                                    }}
                                                >
                                                    <img
                                                        src={img.url}
                                                        alt={`Ảnh ${img.displayOrder || 1}`}
                                                        style={{
                                                            width: "100%",
                                                            height: 100,
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                    {selectedThumbnail === img.url && (
                                                        <div
                                                            style={{
                                                                position: "absolute",
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: 0,
                                                                backgroundColor: "rgba(24, 144, 255, 0.3)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                            }}
                                                        >
                                                            <CheckCircleOutlined style={{ fontSize: 32, color: "#fff" }} />
                                                        </div>
                                                    )}
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            bottom: 0,
                                                            left: 0,
                                                            right: 0,
                                                            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                                                            color: "#fff",
                                                            padding: "4px 8px",
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        Ảnh #{img.displayOrder || 1}
                                                    </div>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}

                            {productImages.length === 0 && pendingImages.length === 0 && (
                                <Empty description="Chưa có ảnh nào được tải lên" style={{ marginTop: 24 }} />
                            )}
                        </>
                    )}
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết sản phẩm"
                placement="right"
                size="large"
                open={isDetailOpen}
                onClose={closeDetail}
                destroyOnClose
                extra={
                    <Button icon={<EditOutlined />} onClick={() => {
                        closeDetail();
                        openModal(selectedProduct!);
                    }}>
                        Chỉnh sửa
                    </Button>
                }
            >
                {selectedProduct && (
                    <Tabs
                        defaultActiveKey="info"
                        items={[
                            {
                                key: "info",
                                label: "Thông tin",
                                children: (
                                    <>
                                        <Descriptions column={2} bordered size="small" style={{ marginBottom: 24 }}>
                                            <Descriptions.Item label="ID" span={2}>
                                                <Text code>{selectedProduct.id}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Tên sản phẩm" span={2}>
                                                {selectedProduct.name}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Mô tả" span={2}>
                                                {selectedProduct.description || "---"}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Giá" span={2}>
                                                {selectedProduct.price ? (
                                                    <Text strong style={{ color: "#ff4d4f", fontSize: "16px" }}>
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price)}
                                                    </Text>
                                                ) : (
                                                    "---"
                                                )}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Loại sản phẩm">
                                                {getCategoryName(selectedProduct.idProductCategory)}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Trạng thái">
                                                <Tag color={selectedProduct.status === "ACTIVE" ? "green" : "red"}>
                                                    {selectedProduct.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                                                </Tag>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Ngày tạo">
                                                {dayjs(selectedProduct.createdDate).format("DD/MM/YYYY HH:mm")}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Cập nhật lần cuối">
                                                {dayjs(selectedProduct.lastModifiedDate).format("DD/MM/YYYY HH:mm")}
                                            </Descriptions.Item>
                                        </Descriptions>

                                        {/* TechSpec Details Section */}
                                        {hasTechSpecData(selectedProduct.techSpec) && (
                                            <>
                                                <Divider orientation="left">
                                                    <Space>
                                                        <SettingOutlined />
                                                        <Text strong>Thông số kỹ thuật</Text>
                                                    </Space>
                                                </Divider>
                                                <Descriptions column={2} bordered size="small">
                                                    {selectedProduct.techSpec?.sensorType && (
                                                        <Descriptions.Item label="Loại cảm biến" span={2}>
                                                            {selectedProduct.techSpec.sensorType}
                                                        </Descriptions.Item>
                                                    )}
                                                    {selectedProduct.techSpec?.lensMount && (
                                                        <Descriptions.Item label="Mount ống kính" span={2}>
                                                            {selectedProduct.techSpec.lensMount}
                                                        </Descriptions.Item>
                                                    )}
                                                    {selectedProduct.techSpec?.resolution && (
                                                        <Descriptions.Item label="Độ phân giải">
                                                            {selectedProduct.techSpec.resolution}
                                                        </Descriptions.Item>
                                                    )}
                                                    {selectedProduct.techSpec?.iso && (
                                                        <Descriptions.Item label="ISO">
                                                            {selectedProduct.techSpec.iso}
                                                        </Descriptions.Item>
                                                    )}
                                                    {selectedProduct.techSpec?.processor && (
                                                        <Descriptions.Item label="Bộ xử lý" span={2}>
                                                            {selectedProduct.techSpec.processor}
                                                        </Descriptions.Item>
                                                    )}
                                                    {selectedProduct.techSpec?.imageFormat && (
                                                        <Descriptions.Item label="Định dạng ảnh">
                                                            {selectedProduct.techSpec.imageFormat}
                                                        </Descriptions.Item>
                                                    )}
                                                    {selectedProduct.techSpec?.videoFormat && (
                                                        <Descriptions.Item label="Định dạng video">
                                                            {selectedProduct.techSpec.videoFormat}
                                                        </Descriptions.Item>
                                                    )}
                                                </Descriptions>
                                            </>
                                        )}
                                    </>
                                ),
                            },
                            {
                                key: "images",
                                label: `Hình ảnh (${productImages.length})`,
                                children: (
                                    <div>
                                        {/* Nút tải ảnh lên */}
                                        <div style={{ marginBottom: 16 }}>
                                            <Upload {...drawerUploadProps}>
                                                <Button
                                                    type="primary"
                                                    icon={<PlusOutlined />}
                                                >
                                                    Chọn ảnh
                                                </Button>
                                            </Upload>
                                        </div>

                                        {/* Hiển thị danh sách ảnh đang chờ upload */}
                                        {drawerPendingImages.length > 0 && (
                                            <div style={{ marginBottom: 24, padding: 16, background: "#f6ffed", borderRadius: 8, border: "1px solid #b7eb8f" }}>
                                                <Typography.Text strong style={{ color: "#52c41a", display: "block", marginBottom: 12 }}>
                                                    Ảnh đang chờ tải lên ({drawerPendingImages.length} ảnh)
                                                </Typography.Text>
                                                <Row gutter={[16, 16]}>
                                                    {drawerPendingImages.map((img, index) => (
                                                        <Col xs={12} sm={8} md={6} key={index}>
                                                            <div
                                                                style={{
                                                                    position: "relative",
                                                                    border: "2px solid #d9d9d9",
                                                                    borderRadius: 8,
                                                                    overflow: "hidden",
                                                                }}
                                                            >
                                                                <img
                                                                    src={img.preview}
                                                                    alt={`Chờ upload ${index + 1}`}
                                                                    style={{
                                                                        width: "100%",
                                                                        height: 100,
                                                                        objectFit: "cover",
                                                                    }}
                                                                />
                                                                <div
                                                                    style={{
                                                                        position: "absolute",
                                                                        bottom: 0,
                                                                        left: 0,
                                                                        right: 0,
                                                                        background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                                                                        color: "#fff",
                                                                        padding: "4px 8px",
                                                                        fontSize: 12,
                                                                    }}
                                                                >
                                                                    Ảnh #{index + 1}
                                                                </div>
                                                                <Tooltip title="Xóa khỏi danh sách">
                                                                    <Button
                                                                        type="text"
                                                                        danger
                                                                        icon={<CloseOutlined />}
                                                                        onClick={() => handleRemoveDrawerPendingImage(index)}
                                                                        style={{
                                                                            position: "absolute",
                                                                            top: 4,
                                                                            right: 4,
                                                                            background: "rgba(255,255,255,0.9)",
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                                <div style={{ marginTop: 16, textAlign: "right" }}>
                                                    <Button
                                                        type="primary"
                                                        icon={<UploadOutlined />}
                                                        onClick={handleUploadAllDrawerPendingImages}
                                                        loading={uploadLoading}
                                                    >
                                                        Tải tất cả lên ({drawerPendingImages.length})
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {imageLoading ? (
                                            <div style={{ textAlign: "center", padding: 20 }}>
                                                <Spin />
                                            </div>
                                        ) : productImages.length === 0 && drawerPendingImages.length === 0 ? (
                                            <Empty description="Chưa có hình ảnh" />
                                        ) : productImages.length > 0 ? (
                                            <>
                                                <Typography.Text strong style={{ marginBottom: 12, display: "block" }}>
                                                    Ảnh đã tải lên
                                                </Typography.Text>
                                                <Row gutter={[16, 16]}>
                                                    {productImages.map((img: ProductImageResponse) => (
                                                        <Col xs={12} sm={8} md={6} key={img.id}>
                                                            <Card
                                                                hoverable
                                                                cover={
                                                                    <Image
                                                                        src={img.url}
                                                                        style={{ height: "120px", objectFit: "cover" }}
                                                                        preview={false}
                                                                    />
                                                                }
                                                                actions={[
                                                                    <Popconfirm
                                                                        title="Xóa ảnh"
                                                                        description="Bạn có chắc chắn?"
                                                                        onConfirm={() => handleDeleteImage(img.id)}
                                                                        okText="Xóa"
                                                                        cancelText="Hủy"
                                                                    >
                                                                        <Tooltip title="Xóa">
                                                                            <CloseOutlined style={{ color: "#ff4d4f" }} />
                                                                        </Tooltip>
                                                                    </Popconfirm>,
                                                                ]}
                                                            >
                                                                <Card.Meta
                                                                    title={
                                                                        <Text ellipsis style={{ fontSize: "12px" }}>
                                                                            Ảnh #{img.displayOrder || 1}
                                                                        </Text>
                                                                    }
                                                                    description={
                                                                        <Text type="secondary" style={{ fontSize: "11px" }}>
                                                                            {dayjs(img.createdDate).format("DD/MM/YYYY")}
                                                                        </Text>
                                                                    }
                                                                />
                                                            </Card>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </>
                                        ) : null}
                                    </div>
                                ),
                            },
                        ]}
                    />
                )}
            </Drawer>
        </div>
    );
};

export default ProductPage;