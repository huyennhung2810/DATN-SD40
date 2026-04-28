import {
  CameraOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  ShopOutlined,
  FilterOutlined,
  SearchOutlined,
  UploadOutlined,
  DownOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import {
  Alert,
  App,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Switch,
  Space,
  Spin,
  Steps,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import type { MenuProps } from "antd/es/menu";
import type { RcFile, UploadProps } from "antd/es/upload/interface";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import productApi from "../../../api/productApi";
import techSpecApi from "../../../api/techSpecApi";
import BatchCreateVariantModal from "../../../components/admin/variant/BatchCreateVariantModal";
import DynamicTechSpecForm from "../../../components/admin/DynamicTechSpecForm";
import QuickAddCategoryModal from "../../../components/QuickAddCategoryModal";
import QuickAddColorModal from "../../../components/QuickAddColorModal";
import QuickAddStorageModal from "../../../components/QuickAddStorageModal";
import QuickAddTechSpecModal, {
  type TechSpecType,
} from "../../../components/QuickAddTechSpecModal";
import type {
  ProductPageParams,
  ProductRequest,
  ProductResponse,
} from "../../../models/product";
import type { ProductDetailResponse } from "../../../models/productdetail";
import type { ProductImageResponse } from "../../../models/productImage";
import type {
  ProductVariantResponse,
  ProductWithVariantsResponse,
} from "../../../models/productVariant";
import {
  ProductVersion,
  ProductVersionOptions,
  formatVariantDisplayInfo,
} from "../../../models/productVersion";
import type {
  TechSpecRequest,
  TechSpecResponse,
} from "../../../models/techSpec";
import { initialTechSpec } from "../../../models/techSpec";
import { colorActions } from "../../../redux/color/colorSlice";
import { productActions } from "../../../redux/product/productSlice";
import { productCategoryActions } from "../../../redux/productCategory/productCategorySlice";
import { productImageActions } from "../../../redux/productImage/productImageSlice";
import { storageCapacityActions } from "../../../redux/storage/storageSlice";
import type { RootState } from "../../../redux/store";
import { imageFormatActions } from "../../../redux/techSpec/imageFormatSlice";
import { lensMountActions } from "../../../redux/techSpec/lensMountSlice";
import { processorActions } from "../../../redux/techSpec/processorSlice";
import { resolutionActions } from "../../../redux/techSpec/resolutionSlice";
import { sensorTypeActions } from "../../../redux/techSpec/sensorTypeSlice";
import { videoFormatActions } from "../../../redux/techSpec/videoFormatSlice";
const { Title, Text } = Typography;
const { Search } = Input;

/** Serial đã bán (BE: SerialStatus.SOLD) → tag vàng. */
function isVariantSerialSold(serial: { serialStatus?: string }): boolean {
  return String(serial.serialStatus ?? "").toUpperCase() === "SOLD";
}

/** Serial đang trong đơn (BE: SerialStatus.IN_ORDER) → tag xanh nước biển. */
function isVariantSerialInOrder(serial: { serialStatus?: string }): boolean {
  return String(serial.serialStatus ?? "").toUpperCase() === "IN_ORDER";
}

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
  const colorState = useSelector(
    (state: RootState) => state.color || { list: [], loading: false },
  );
  const storageCapacityState = useSelector(
    (state: RootState) => state.storage || { list: [], loading: false },
  );

  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [variantForm] = Form.useForm();
  const [keyword, setKeyword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [batchVariantModalOpen, setBatchVariantModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(
    null,
  );
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);
  const [selectedProductWithVariants, setSelectedProductWithVariants] =
    useState<ProductWithVariantsResponse | null>(null);
  const [editingVariant, setEditingVariant] =
    useState<ProductVariantResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [selectedSensorType, setSelectedSensorType] = useState<
    string | undefined
  >();
  const [selectedLensMount, setSelectedLensMount] = useState<
    string | undefined
  >();
  const [selectedResolution, setSelectedResolution] = useState<
    string | undefined
  >();
  const [selectedProcessor, setSelectedProcessor] = useState<
    string | undefined
  >();
  const [selectedImageFormat, setSelectedImageFormat] = useState<
    string | undefined
  >();
  const [selectedVideoFormat, setSelectedVideoFormat] = useState<
    string | undefined
  >();
  const [selectedIso, setSelectedIso] = useState<string | undefined>();
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);

  // 计算当前激活的高级筛选器数量
  const advancedFilterCount = [
    selectedSensorType,
    selectedLensMount,
    selectedResolution,
    selectedProcessor,
    selectedImageFormat,
    selectedVideoFormat,
    selectedIso,
  ].filter(Boolean).length;

  // 清除所有筛选条件
  const handleClearAllFilters = () => {
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
    setAdvancedFilterOpen(false);
  };
  const [productDetails, setProductDetails] = useState<ProductDetailResponse[]>(
    [],
  );
  const [productDetailsLoading, setProductDetailsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [variantLoading, setVariantLoading] = useState(false);
  // State riêng để theo dõi ảnh được chọn cho biến thể (đảm bảo UI phản hồi ngay)
  const [variantSelectedImageId, setVariantSelectedImageId] = useState<
    string | undefined
  >(undefined);
  const { notification, message } = App.useApp();

  // State cho modal edit biến thể - lưu trữ serial cũ
  const [variantSerials, setVariantSerials] = useState<any[]>([]);

  //
  const [currentStep, setCurrentStep] = useState(0);
  const [tempProductId, setTempProductId] = useState<string | null>(null);
  const [tempProductData, setTempProductData] = useState<ProductRequest | null>(
    null,
  );
  const [tempTechSpecId, setTempTechSpecId] = useState<string | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(
    null,
  );
  const [stepLoading, setStepLoading] = useState(false);
  const [pendingImages, setPendingImages] = useState<
    { file: File; preview: string }[]
  >([]);
  const [drawerPendingImages, setDrawerPendingImages] = useState<
    { file: File; preview: string }[]
  >([]);

  // Quick Add modal states
  const [quickAddCategoryOpen, setQuickAddCategoryOpen] = useState(false);
  const [quickAddTechSpecOpen, setQuickAddTechSpecOpen] = useState(false);
  const [quickAddTechSpecType, setQuickAddTechSpecType] =
    useState<TechSpecType | null>(null);
  const [quickAddColorOpen, setQuickAddColorOpen] = useState(false);
  const [quickAddStorageOpen, setQuickAddStorageOpen] = useState(false);

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
    dispatch(colorActions.getAll({ page: 0, size: 1000, keyword: "" }));
    dispatch(
      storageCapacityActions.getAll({ page: 0, size: 1000, keyword: "" }),
    );
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
  }, [
    keyword,
    selectedCategory,
    selectedStatus,
    selectedSensorType,
    selectedLensMount,
    selectedResolution,
    selectedProcessor,
    selectedImageFormat,
    selectedVideoFormat,
    selectedIso,
  ]);

  const handleRefresh = () => {
    fetchProducts();
    notification.success({
      message: "Làm mới thành công",
      description: "Dữ liệu đã được cập nhật",
    });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setFilter((prev) => ({ ...prev, page: page - 1, size: pageSize }));
  };

  const openModal = async (product?: ProductResponse) => {
    if (product) {
      // Lấy đầy đủ sản phẩm (có techSpecDynamic) — danh sách search thường không có
      let full: ProductResponse = product;
      try {
        full = await productApi.getById(product.id);
      } catch (e) {
        console.warn(
          "Không tải được chi tiết sản phẩm, dùng bản từ danh sách:",
          e,
        );
      }
      // edit mode on
      setEditingProduct(full);
      setCurrentStep(0);
      setTempProductId(full.id);
      setTempProductData({
        name: full.name,
        description: full.description,
        idProductCategory: full.idProductCategory,
        idTechSpec: full.idTechSpec || null,
        status: full.status,
      });
      setTempTechSpecId(full.idTechSpec || null);
      setSelectedThumbnail(null);
      modalForm.setFieldsValue({
        name: full.name,
        description: full.description,
        idProductCategory: full.idProductCategory,
        status: full.status,
        techSpecDynamic:
          full.techSpecDynamic && Object.keys(full.techSpecDynamic).length > 0
            ? { ...full.techSpecDynamic }
            : {},
        techSpec: full.techSpec
          ? {
              sensorType: full.techSpec.sensorType || undefined,
              lensMount: full.techSpec.lensMount || undefined,
              resolution: full.techSpec.resolution || undefined,
              iso: full.techSpec.iso || "",
              processor: full.techSpec.processor || undefined,
              imageFormat: full.techSpec.imageFormat || undefined,
              videoFormat: full.techSpec.videoFormat || undefined,
            }
          : {
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
      modalForm.setFieldsValue({
        status: "ACTIVE",
        techSpec: initialTechSpec,
        techSpecDynamic: {},
      });
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
        const result = await productApi.search({
          page: 0,
          size: 1,
          name: values.name,
        });
        if (result.data && result.data.length > 0) {
          // taking the first one (newest with matching name)
          const newProduct =
            result.data.find((p: any) => p.name === values.name) ||
            result.data[0];
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
          description:
            error.message ||
            error.response?.data?.message ||
            "Có lỗi xảy ra, vui lòng thử lại",
        });
      }
    } finally {
      setStepLoading(false);
    }
  };

  // step 2: techspec vibes
  const handleStep2Submit = async () => {
    let savedDynamicSpecs = false;
    try {
      // Try to read both old format (techSpec) and new format (techSpecDynamic)
      let techSpecValues: any = {};
      try {
        const oldValues = await modalForm.validateFields(["techSpec"]);
        if (oldValues.techSpec) {
          techSpecValues = { ...oldValues.techSpec };
        }
      } catch (_) {
        /* field not present */
      }

      // Also read new dynamic format
      try {
        const dynamicValues = modalForm.getFieldValue("techSpecDynamic");
        if (
          dynamicValues &&
          tempProductId &&
          typeof dynamicValues === "object"
        ) {
          const payload: Record<string, string | number | boolean> = {};
          for (const [k, v] of Object.entries(dynamicValues)) {
            if (v === undefined || v === null || v === "") continue;
            if (typeof v === "object") continue;
            payload[k] = v as string | number | boolean;
          }
          if (Object.keys(payload).length > 0) {
            await productApi.saveTechSpecValues(tempProductId, payload);
            savedDynamicSpecs = true;
          }
        }
        if (dynamicValues) {
          // Map dynamic spec codes to legacy TechSpec fields
          if (dynamicValues["spec_sensor_type"] && !techSpecValues.sensorType) {
            techSpecValues.sensorType = dynamicValues["spec_sensor_type"];
          }
          if (dynamicValues["spec_lens_mount"] && !techSpecValues.lensMount) {
            techSpecValues.lensMount = dynamicValues["spec_lens_mount"];
          }
          if (
            dynamicValues["spec_resolution_mp"] &&
            !techSpecValues.resolution
          ) {
            techSpecValues.resolution = String(
              dynamicValues["spec_resolution_mp"],
            );
          }
          if (dynamicValues["spec_iso_standard"] && !techSpecValues.iso) {
            const isoMin = dynamicValues["spec_iso_standard"]?.min;
            const isoMax = dynamicValues["spec_iso_standard"]?.max;
            techSpecValues.iso =
              isoMin && isoMax ? `${isoMin}-${isoMax}` : isoMin || isoMax || "";
          }
          if (
            dynamicValues["spec_image_processor"] &&
            !techSpecValues.processor
          ) {
            techSpecValues.processor = dynamicValues["spec_image_processor"];
          }
          if (
            dynamicValues["spec_video_format"] &&
            !techSpecValues.videoFormat
          ) {
            techSpecValues.videoFormat = dynamicValues["spec_video_format"];
          }
          // techSpecDynamic đã lưu vào bảng tech_spec_value; đồng thời map một phần sang TechSpec cũ.
        }
      } catch (_) {
        /* not set yet */
      }

      // Check if any field has value
      const hasTechSpecData =
        techSpecValues.sensorType ||
        techSpecValues.lensMount ||
        techSpecValues.resolution ||
        techSpecValues.iso ||
        techSpecValues.processor ||
        techSpecValues.imageFormat ||
        techSpecValues.videoFormat;

      setStepLoading(true);

      if (hasTechSpecData && tempProductId) {
        const techSpecPayload: TechSpecRequest = {
          id: tempTechSpecId || undefined,
          idProduct: tempProductId,
          sensorType: techSpecValues.sensorType || undefined,
          lensMount: techSpecValues.lensMount || undefined,
          resolution: techSpecValues.resolution || undefined,
          iso: techSpecValues.iso || undefined,
          processor: techSpecValues.processor || undefined,
          imageFormat: techSpecValues.imageFormat || undefined,
          videoFormat: techSpecValues.videoFormat || undefined,
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
            notification.error({
              message: "Lỗi",
              description: "Không nhận được phản hồi từ server",
            });
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
          await productApi.update(tempProductId, {
            ...tempProductData,
            idTechSpec: techSpecId,
          });
        }
      } else if (!savedDynamicSpecs) {
        notification.info({
          message: "Bỏ qua thông số kỹ thuật",
          description: "Không có thông số kỹ thuật nào được chọn",
        });
      } else if (savedDynamicSpecs && !hasTechSpecData) {
        notification.success({ message: "Đã lưu thông số kỹ thuật động" });
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
      const imageUrlsFromRedux = productImages.map(
        (img: ProductImageResponse) => img.url,
      );

      if (selectedThumbnail && imageUrlsFromRedux.length > 0) {
        // set thumbnail (update product with new imageUrls)
        const newImageUrls = [
          selectedThumbnail,
          ...imageUrlsFromRedux.filter((url) => url !== selectedThumbnail),
        ];
        if (tempProductData) {
          await productApi.update(tempProductId, {
            ...tempProductData,
            imageUrls: newImageUrls,
          });
        }
      } else if (imageUrlsFromRedux.length > 0) {
        // no thumbnail selected? still update images
        if (tempProductData) {
          await productApi.update(tempProductId, {
            ...tempProductData,
            imageUrls: imageUrlsFromRedux,
          });
        }
      }

      notification.success({
        message: "Thành công",
        description: editingProduct
          ? "Cập nhật sản phẩm thành công!"
          : "Thêm mới sản phẩm thành công!",
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
      setCurrentStep((prev) => prev - 1);
    }
  };

  // ===== END FORM WIZARD =====

  const handleStatusChange = useCallback(
    (id: string) => {
      dispatch(productActions.changeStatusProduct(id));
    },
    [dispatch],
  );

  const openDetail = async (product: ProductResponse) => {
    console.log("Product data:", product);
    console.log("TechSpec data:", product.techSpec);
    setSelectedProduct(product);
    setIsDetailOpen(true);
    dispatch(productImageActions.getImagesByProduct(product.id));

    // Fetch product with variants using new API
    setProductDetailsLoading(true);
    try {
      const response = await productApi.getProductWithVariants(product.id);
      setSelectedProductWithVariants(response);
      // Convert variants to ProductDetailResponse format for compatibility
      if (response.variants) {
        const details = response.variants.map(
          (v: ProductVariantResponse) =>
            ({
              id: v.id,
              code: v.code,
              version: v.version,
              // LEVEL 1: Copy variantVersion
              variantVersion: v.variantVersion,
              colorId: v.colorId,
              colorName: v.colorName,
              storageCapacityId: v.storageCapacityId,
              storageCapacityName: v.storageCapacityName,
              salePrice: v.salePrice,
              quantity: v.quantity,
              status: v.status,
              imageUrl: v.imageUrl,
              selectedImageId: v.selectedImageId,
              selectedImageUrl: v.selectedImageUrl,
              serials: v.serials, // Include serials for edit modal
            }) as ProductDetailResponse,
        );
        setProductDetails(details);
      } else {
        setProductDetails([]);
      }
    } catch (error) {
      console.error("Error fetching product with variants:", error);
      setProductDetails([]);
      setSelectedProductWithVariants(null);
    } finally {
      setProductDetailsLoading(false);
    }
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedProduct(null);
    dispatch(productImageActions.resetImages());
    setProductDetails([]);
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
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
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
          }),
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
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
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
          }),
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
      }),
    );
  };

  // upload all pending images
  const handleUploadAllPendingImages = () => {
    const targetProductId = tempProductId || selectedProduct?.id;
    if (!targetProductId) {
      notification.warning({
        message: "Vui lòng lưu sản phẩm trước khi tải ảnh lên!",
      });
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
          }),
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
          }),
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

  // Xử lý import Excel cho serial biến thể
  const handleImportExcelVariant = (file: any) => {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Lấy cột đầu tiên làm serial
      const serials = jsonData
        .map((row: any) => row[0])
        .filter((v: any) => v)
        .join("\n");

      variantForm.setFieldsValue({
        serialList: serials,
      });
    };

    reader.readAsArrayBuffer(file);

    return false; // Chặn upload lên server
  };

  // Mở modal thêm biến thể mới
  const openAddVariantModal = () => {
    setEditingVariant(null);
    setVariantSelectedImageId(undefined);
    setVariantSerials([]); // Clear serials when adding new variant
    variantForm.resetFields();
    variantForm.setFieldsValue({
      status: "ACTIVE",
      quantity: 0,
      // LEVEL 1: Default variantVersion là BODY_ONLY khi tạo mới
      variantVersion: ProductVersion.BODY_ONLY,
    });
    setIsVariantModalOpen(true);
  };

  // Mở modal sửa biến thể
  const openEditVariantModal = (variant: ProductVariantResponse) => {
    setEditingVariant(variant);
    const selectedImgId = variant.selectedImageId;
    setVariantSelectedImageId(selectedImgId);

    // Lấy serial từ productDetails nếu có
    const currentDetail = productDetails.find((d) => d.id === variant.id);
    const serials = currentDetail?.serials || [];

    // Format serial cũ để hiển thị (chỉ đọc)
    setVariantSerials(serials);

    // Set giá trị form
    variantForm.setFieldsValue({
      code: variant.code,
      // LEVEL 1: Backend auto-generate version, nhưng vẫn load về để hiển thị
      version: variant.version,
      // LEVEL 1: Load variantVersion với fallback về BODY_ONLY nếu không có
      variantVersion:
        (variant as any).variantVersion || ProductVersion.BODY_ONLY,
      colorId: variant.colorId,
      storageCapacityId: variant.storageCapacityId,
      salePrice: variant.salePrice,
      quantity: variant.quantity,
      status: variant.status,
      imageUrl: variant.imageUrl,
      selectedImageId: selectedImgId,
    });
    setIsVariantModalOpen(true);
  };

  // Lưu biến thể (thêm mới hoặc cập nhật)
  const handleSaveVariant = async () => {
    if (!selectedProduct) return;

    try {
      await variantForm.validateFields();
      setVariantLoading(true);

      const values = variantForm.getFieldsValue();

      // Xử lý serial nếu có
      let variantData: any = {
        code: values.code,
        // LEVEL 1: Backend sẽ auto-generate version name từ variantVersion + color + storage
        version: values.version,
        // LEVEL 1: variantVersion bắt buộc - dimension cấp 1
        variantVersion: values.variantVersion,
        colorId: values.colorId,
        storageCapacityId: values.storageCapacityId,
        salePrice: values.salePrice,
        status: values.status,
        imageUrl: values.imageUrl,
        selectedImageId: values.selectedImageId || null,
      };

      // Chỉ xử lý serial khi thêm mới biến thể (không phải khi edit)
      if (!editingVariant && values.serialList) {
        const rawSerials = values.serialList
          .split(/\n/)
          .map((s: string) => s.trim())
          .filter((s: string) => s !== "");

        // Loại bỏ các mã trùng lặp
        const uniqueSerials = Array.from(new Set<string>(rawSerials));

        if (uniqueSerials.length !== rawSerials.length) {
          notification.warning({
            message: "Đã tự động loại bỏ các mã Serial nhập trùng!",
          });
        }

        // Tạo danh sách serial
        const serials = uniqueSerials.map((sn: string) => ({
          serialNumber: sn,
          code: sn,
          status: "ACTIVE",
        }));

        // Gán quantity và serials
        variantData.quantity = serials.length;
        variantData.serials = serials;
      } else if (editingVariant) {
        // Khi edit, giữ nguyên quantity
        variantData.quantity = values.quantity;

        // Xử lý thêm serial mới khi cập nhật
        if (values.newSerialList) {
          const rawNewSerials = values.newSerialList
            .split(/\n/)
            .map((s: string) => s.trim())
            .filter((s: string) => s !== "");

          if (rawNewSerials.length > 0) {
            // Loại bỏ trùng lặp trong danh sách mới
            const uniqueNewSerials = Array.from(new Set<string>(rawNewSerials));

            if (uniqueNewSerials.length !== rawNewSerials.length) {
              notification.warning({
                message:
                  "Đã tự động loại bỏ các mã Serial nhập trùng trong danh sách mới!",
              });
            }

            // Kiểm tra trùng với serial cũ
            const existingSerialNumbers = variantSerials.map(
              (s: any) => s.serialNumber,
            );
            const duplicatesWithOld = uniqueNewSerials.filter((sn: string) =>
              existingSerialNumbers.includes(sn),
            );

            if (duplicatesWithOld.length > 0) {
              notification.error({
                message: "Lỗi",
                description: `Các serial sau đã tồn tại: ${duplicatesWithOld.join(", ")}`,
              });
              setVariantLoading(false);
              return;
            }

            // Gửi danh sách serial mới
            variantData.newSerials = uniqueNewSerials;
          }
        }
      }

      if (editingVariant) {
        // Cập nhật biến thể hiện có
        await productApi.updateVariant(editingVariant.id, variantData);
        notification.success({ message: "Cập nhật biến thể thành công" });
      } else {
        // Thêm biến thể mới
        await productApi.addVariant(selectedProduct.id, variantData);
        notification.success({ message: "Thêm biến thể thành công" });
      }

      setIsVariantModalOpen(false);
      variantForm.resetFields();

      // Refresh lại danh sách biến thể
      const response = await productApi.getProductWithVariants(
        selectedProduct.id,
      );
      setSelectedProductWithVariants(response);
      if (response.variants) {
        const details = response.variants.map(
          (v: ProductVariantResponse) =>
            ({
              id: v.id,
              code: v.code,
              version: v.version,
              // LEVEL 1: Copy variantVersion
              variantVersion: v.variantVersion,
              colorId: v.colorId,
              colorName: v.colorName,
              storageCapacityId: v.storageCapacityId,
              storageCapacityName: v.storageCapacityName,
              salePrice: v.salePrice,
              quantity: v.quantity,
              status: v.status,
              imageUrl: v.imageUrl,
              selectedImageId: v.selectedImageId,
              selectedImageUrl: v.selectedImageUrl,
            }) as ProductDetailResponse,
        );
        setProductDetails(details);
      }
    } catch (error: any) {
      console.error("Lỗi khi lưu biến thể:", error);
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message || error.message || "Có lỗi xảy ra",
      });
    } finally {
      setVariantLoading(false);
    }
  };

  // Xóa biến thể
  const handleDeleteVariant = async (variantId: string) => {
    if (!selectedProduct) return;

    try {
      setVariantLoading(true);
      await productApi.deleteVariant(variantId);
      notification.success({ message: "Xóa biến thể thành công" });

      // Refresh lại danh sách biến thể
      const response = await productApi.getProductWithVariants(
        selectedProduct.id,
      );
      setSelectedProductWithVariants(response);
      if (response.variants) {
        const details = response.variants.map(
          (v: ProductVariantResponse) =>
            ({
              id: v.id,
              code: v.code,
              version: v.version,
              // LEVEL 1: Copy variantVersion
              variantVersion: v.variantVersion,
              colorId: v.colorId,
              colorName: v.colorName,
              storageCapacityId: v.storageCapacityId,
              storageCapacityName: v.storageCapacityName,
              salePrice: v.salePrice,
              quantity: v.quantity,
              status: v.status,
              imageUrl: v.imageUrl,
              selectedImageId: v.selectedImageId,
              selectedImageUrl: v.selectedImageUrl,
            }) as ProductDetailResponse,
        );
        setProductDetails(details);
      }
    } catch (error: any) {
      console.error("Lỗi khi xóa biến thể:", error);
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message || error.message || "Có lỗi xảy ra",
      });
    } finally {
      setVariantLoading(false);
    }
  };

  // Lưu ảnh đại diện cho biến thể (lưu ngay khi chọn)
  const handleSaveImageVariant = async (variantId: string, imageId: string) => {
    if (!selectedProduct) return;

    try {
      await productApi.updateVariantImage(variantId, imageId);
      notification.success({ message: "Đã chọn ảnh đại diện" });

      // Refresh lại danh sách biến thể
      const response = await productApi.getProductWithVariants(
        selectedProduct.id,
      );
      setSelectedProductWithVariants(response);
      if (response.variants) {
        const details = response.variants.map(
          (v: ProductVariantResponse) =>
            ({
              id: v.id,
              code: v.code,
              version: v.version,
              // LEVEL 1: Copy variantVersion
              variantVersion: v.variantVersion,
              colorId: v.colorId,
              colorName: v.colorName,
              storageCapacityId: v.storageCapacityId,
              storageCapacityName: v.storageCapacityName,
              salePrice: v.salePrice,
              quantity: v.quantity,
              status: v.status,
              imageUrl: v.imageUrl,
              selectedImageId: v.selectedImageId,
              selectedImageUrl: v.selectedImageUrl,
            }) as ProductDetailResponse,
        );
        setProductDetails(details);
      }
    } catch (error: any) {
      console.error("Lỗi khi lưu ảnh:", error);
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message || error.message || "Có lỗi xảy ra",
      });
    }
  };

  /** Đồng bộ danh sách biến thể trong drawer sau khi thêm/sửa/xóa/batch. */
  const refreshProductVariants = async (productId: string) => {
    const response = await productApi.getProductWithVariants(productId);
    setSelectedProductWithVariants(response);
    if (response.variants) {
      const details = response.variants.map(
        (v: ProductVariantResponse) =>
          ({
            id: v.id,
            code: v.code,
            version: v.version,
            variantVersion: v.variantVersion,
            colorId: v.colorId,
            colorName: v.colorName,
            storageCapacityId: v.storageCapacityId,
            storageCapacityName: v.storageCapacityName,
            salePrice: v.salePrice,
            quantity: v.quantity,
            status: v.status,
            imageUrl: v.imageUrl,
            selectedImageId: v.selectedImageId,
            selectedImageUrl: v.selectedImageUrl,
            serials: v.serials,
          }) as ProductDetailResponse,
      );
      setProductDetails(details);
    } else {
      setProductDetails([]);
    }
  };

  const adminProductCode = (p: ProductResponse | null): string => {
    if (!p) return "";
    const c = (p as ProductResponse & { code?: string }).code;
    if (c && String(c).trim()) return String(c).trim();
    const fromName = p.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .toUpperCase();
    return fromName.slice(0, 32) || p.id.slice(0, 8).toUpperCase();
  };

  const variantAddMenuItems: MenuProps["items"] = [
    {
      key: "single",
      label: "Thêm một biến thể",
      onClick: () => openAddVariantModal(),
    },
    {
      key: "batch",
      label: "Thêm hàng loạt biến thể",
      onClick: () => {
        if (!selectedProduct) {
          message.warning("Mở chi tiết sản phẩm trước khi thêm biến thể.");
          return;
        }
        setBatchVariantModalOpen(true);
      },
    },
  ];

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

  // Xử lý xuất Excel danh sách sản phẩm
  const handleExportExcel = () => {
    if (totalElements === 0) {
      notification.warning({
        message: "Thông báo",
        description: "Hệ thống không có dữ liệu sản phẩm để xuất file!",
      });
      return;
    }

    Modal.confirm({
      title: "Xác nhận xuất file",
      content: `Bạn có chắc chắn muốn xuất danh sách ${totalElements} sản phẩm ra file Excel không?`,
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: () => {
        notification.info({
          message: "Đang xử lý",
          description:
            "Hệ thống đang khởi tạo tệp Excel cho toàn bộ danh sách sản phẩm...",
        });

        try {
          const exportData = list.map(
            (item: ProductResponse, index: number) => ({
              STT: index + 1,
              "Tên sản phẩm": item.name,
              "Mã SP (ID)": item.id,
              "Loại sản phẩm": getCategoryName(item.idProductCategory),
              "Trạng thái":
                item.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động",
              "Ngày tạo": item.createdDate
                ? dayjs(item.createdDate).format("DD/MM/YYYY HH:mm")
                : "---",
            }),
          );

          const worksheet = XLSX.utils.json_to_sheet(exportData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachSanPham");

          const fileName = `Hikari_Store_Products_${dayjs().format("DDMMYYYY_HHmm")}.xlsx`;
          XLSX.writeFile(workbook, fileName);

          notification.success({ message: "Xuất file Excel thành công!" });
        } catch (error) {
          notification.error({ message: "Có lỗi xảy ra khi xuất tệp!" });
        }
      },
      onCancel: () => {
        notification.info({
          message: "Hủy xuất file",
          description: "Bạn đã hủy yêu cầu xuất file Excel.",
        });
      },
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-lg)",
      }}
    >
      <div className="solid-card" style={{ padding: "var(--spacing-lg)" }}>
        <Space align="center" size={16}>
          <div
            style={{
              backgroundColor: "var(--color-primary-light)",
              padding: "12px",
              borderRadius: "var(--radius-md)",
            }}
          >
            <ShopOutlined
              style={{ fontSize: "24px", color: "var(--color-primary)" }}
            />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              Quản lý sản phẩm
            </Title>
            <Text type="secondary" style={{ fontSize: "13px" }}>
              Quản lý sản phẩm của hệ thống
            </Text>
          </div>
        </Space>
      </div>

      {/* ===== 现代化过滤器区域 ===== */}
      <div className="filter-section">
        {/* 第一行：核心筛选器 — 始终可见 */}
        <div className="filter-row-main">
          {/* 搜索框 */}
          <div className="filter-item filter-item-search">
            <Input.Search
              placeholder="Tìm theo tên sản phẩm..."
              allowClear
              enterButton={<SearchOutlined style={{ fontSize: 14 }} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="filter-search-input"
            />
          </div>

          {/* 产品类别筛选 */}
          <div className="filter-item">
            <Select
              placeholder="Loại sản phẩm"
              allowClear
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              options={categories.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
              className="filter-select"
              suffixIcon={
                <DownOutlined style={{ fontSize: 10, color: "#8C8C8F" }} />
              }
            />
          </div>

          {/* 状态筛选 */}
          <div className="filter-item">
            <Select
              placeholder="Trạng thái"
              allowClear
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              options={[
                { label: "Hoạt động", value: "ACTIVE" },
                { label: "Không hoạt động", value: "INACTIVE" },
              ]}
              className="filter-select"
              suffixIcon={
                <DownOutlined style={{ fontSize: 10, color: "#8C8C8F" }} />
              }
            />
          </div>

          {/* 高级筛选器折叠按钮 */}
          <div className="filter-item filter-item-advanced">
            <Button
              className={`filter-advanced-btn ${advancedFilterCount > 0 ? "has-filters" : ""}`}
              icon={<FilterOutlined style={{ fontSize: 13 }} />}
              onClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
            >
              Lọc nâng cao
              {advancedFilterCount > 0 && (
                <Badge
                  count={advancedFilterCount}
                  style={{
                    marginLeft: 6,
                    backgroundColor: "#0A84FF",
                    fontSize: 10,
                    minWidth: 18,
                    height: 18,
                    lineHeight: "18px",
                  }}
                />
              )}
            </Button>
          </div>

          {/* 清除全部按钮 — 仅在有筛选条件时显示 */}
          {(keyword ||
            selectedCategory ||
            selectedStatus ||
            advancedFilterCount > 0) && (
            <div className="filter-item filter-item-clear">
              <Button
                className="filter-clear-btn"
                icon={<CloseOutlined style={{ fontSize: 11 }} />}
                onClick={handleClearAllFilters}
              >
                Xóa lọc
              </Button>
            </div>
          )}
        </div>

        {/* 第二行：高级筛选器折叠面板 */}
        {advancedFilterOpen && (
          <div className="filter-row-advanced">
            <div className="filter-advanced-inner">
              <div className="filter-advanced-grid">
                {/* Loại cảm biến */}
                <div className="filter-item">
                  <Select
                    placeholder="Loại cảm biến"
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
                    className="filter-select"
                    suffixIcon={
                      <DownOutlined
                        style={{ fontSize: 10, color: "#8C8C8F" }}
                      />
                    }
                  />
                </div>

                {/* Ngàm lens */}
                <div className="filter-item">
                  <Select
                    placeholder="Ngàm lens"
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
                    className="filter-select"
                    suffixIcon={
                      <DownOutlined
                        style={{ fontSize: 10, color: "#8C8C8F" }}
                      />
                    }
                  />
                </div>

                {/* Độ phân giải */}
                <div className="filter-item">
                  <Select
                    placeholder="Độ phân giải"
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
                    className="filter-select"
                    suffixIcon={
                      <DownOutlined
                        style={{ fontSize: 10, color: "#8C8C8F" }}
                      />
                    }
                  />
                </div>

                {/* Bộ xử lý */}
                <div className="filter-item">
                  <Select
                    placeholder="Bộ xử lý"
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
                    className="filter-select"
                    suffixIcon={
                      <DownOutlined
                        style={{ fontSize: 10, color: "#8C8C8F" }}
                      />
                    }
                  />
                </div>

                {/* Định dạng ảnh */}
                <div className="filter-item">
                  <Select
                    placeholder="Định dạng ảnh"
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
                    className="filter-select"
                    suffixIcon={
                      <DownOutlined
                        style={{ fontSize: 10, color: "#8C8C8F" }}
                      />
                    }
                  />
                </div>

                {/* Định dạng video */}
                <div className="filter-item">
                  <Select
                    placeholder="Định dạng video"
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
                    className="filter-select"
                    suffixIcon={
                      <DownOutlined
                        style={{ fontSize: 10, color: "#8C8C8F" }}
                      />
                    }
                  />
                </div>

                {/* ISO */}
                <div className="filter-item">
                  <Input
                    placeholder="ISO"
                    allowClear
                    value={selectedIso}
                    onChange={(e) => setSelectedIso(e.target.value)}
                    className="filter-input"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="content-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          className="content-card-header"
          style={{
            padding: "var(--spacing-lg)",
            margin: 0,
            borderBottom: "1px solid var(--color-border-secondary)",
          }}
        >
          <Text strong style={{ fontSize: "15px" }}>
            Danh sách sản phẩm ({totalElements})
          </Text>
          <Space size="middle">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              Thêm mới
            </Button>
            <Button
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
              loading={loading}
              style={{
                borderRadius: "20px",
                color: "#1d7444",
                borderColor: "#1d7444",
              }}
            >
              Xuất Excel
            </Button>
            <Button
              icon={<ReloadOutlined spin={loading} />}
              onClick={handleRefresh}
            >
              Tải lại
            </Button>
          </Space>
        </div>
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
                            (e.target as HTMLImageElement).style.display =
                              "none";
                            const parent = (e.target as HTMLImageElement)
                              .parentElement;
                            if (parent) {
                              const icon = document.createElement("span");
                              icon.innerHTML =
                                '<svg viewBox="0 0 24 24" width="48" height="48" fill="#bfbfbf"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z"/><path d="M6 10l4-4 2 2 4-4 3 3z"/></svg>';
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
                    <Popconfirm
                      title="Thay đổi trạng thái"
                      description={`Bạn có chắc chắn muốn ${product.status === "ACTIVE" ? "ngừng hoạt động" : "kích hoạt"} sản phẩm này?`}
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        handleStatusChange(product.id);
                      }}
                      onCancel={(e) => e?.stopPropagation()}
                      okText="Đồng ý"
                      cancelText="Hủy"
                      key="status"
                    >
                      <Switch checked={product.status === "ACTIVE"} size="default" />
                    </Popconfirm>,
                    <Tooltip title="Chỉnh sửa" key="edit">
                      <EditOutlined
                        style={{ fontSize: "18px", color: "#faad14" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(product);
                        }}
                      />
                    </Tooltip>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <Text strong style={{ fontSize: "14px" }} ellipsis>
                        {product.name}
                      </Text>
                    }
                    description={
                      <Space
                        style={{ display: "flex", flexDirection: "column" }}
                        size={4}
                      >
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Loại: {getCategoryName(product.idProductCategory)}
                        </Text>
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
      </div>

      {/* Create/Edit Modal with Steps */}
      <Modal
        title={editingProduct ? "Cập nhật sản phẩm" : "Thêm mới sản phẩm"}
        open={isModalOpen}
        onCancel={closeModal}
        width={750}
        destroyOnHidden
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
            {
              title: "Thông số kỹ thuật & Phiên bản",
              description: "Thông số kỹ thuật, Phiên bản, Màu sắc",
            },
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

              <Form.Item name="idProductCategory" label="Loại sản phẩm">
                <Select
                  placeholder="Chọn loại sản phẩm (không bắt buộc)"
                  allowClear
                  size="large"
                  options={categories.map((cat) => ({
                    label: cat.name,
                    value: cat.id,
                  }))}
                  popupRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.preventDefault();
                          setQuickAddCategoryOpen(true);
                        }}
                        style={{ padding: "4px 12px", height: "auto" }}
                      >
                        + Thêm mới loại sản phẩm
                      </Button>
                    </>
                  )}
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
              <Typography.Text
                type="secondary"
                style={{ marginBottom: 16, display: "block" }}
              >
                Thông số kỹ thuật được cấu hình động từ hệ thống nhóm thông số
                (không bắt buộc)
              </Typography.Text>
              <Divider style={{ margin: "12px 0" }} />
              <DynamicTechSpecForm form={modalForm} />
              <Divider orientation="left">
                <Typography.Text strong>Phiên bản sản phẩm</Typography.Text>
              </Divider>
            </>
          )}

          {/* Bước 3: Hình ảnh sản phẩm */}
          {currentStep === 2 && (
            <>
              <Typography.Text
                strong
                style={{ marginBottom: 16, display: "block" }}
              >
                Tải ảnh sản phẩm lên
              </Typography.Text>
              <Typography.Text
                type="secondary"
                style={{ marginBottom: 16, display: "block" }}
              >
                Bạn có thể tải nhiều ảnh và chọn 1 ảnh làm ảnh đại diện cho thẻ
                sản phẩm
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
                <div
                  style={{
                    marginBottom: 24,
                    padding: 16,
                    background: "#f6ffed",
                    borderRadius: 8,
                    border: "1px solid #b7eb8f",
                  }}
                >
                  <Typography.Text
                    strong
                    style={{
                      color: "#52c41a",
                      display: "block",
                      marginBottom: 12,
                    }}
                  >
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
                              background:
                                "linear-gradient(transparent, rgba(0,0,0,0.7))",
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
                  <Typography.Text
                    strong
                    style={{ marginBottom: 12, display: "block" }}
                  >
                    Ảnh đã tải lên - Chọn ảnh đại diện (ấn vào ảnh để chọn)
                  </Typography.Text>
                  <Row gutter={[16, 16]}>
                    {productImages.map((img: ProductImageResponse) => (
                      <Col span={6} key={img.id}>
                        <div
                          onClick={() => setSelectedThumbnail(img.url)}
                          style={{
                            cursor: "pointer",
                            border:
                              selectedThumbnail === img.url
                                ? "3px solid #1890ff"
                                : "2px solid #d9d9d9",
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
                              <CheckCircleOutlined
                                style={{ fontSize: 32, color: "#fff" }}
                              />
                            </div>
                          )}
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background:
                                "linear-gradient(transparent, rgba(0,0,0,0.7))",
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
                <Empty
                  description="Chưa có ảnh nào được tải lên"
                  style={{ marginTop: 24 }}
                />
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
        destroyOnHidden
        extra={
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              closeDetail();
              openModal(selectedProduct!);
            }}
          >
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
                    <Descriptions
                      column={2}
                      bordered
                      size="small"
                      style={{ marginBottom: 24 }}
                    >
                      <Descriptions.Item label="ID" span={2}>
                        <Text code>{selectedProduct.id}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tên sản phẩm" span={2}>
                        {selectedProduct.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Mô tả" span={2}>
                        {selectedProduct.description || "---"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Loại sản phẩm">
                        {getCategoryName(selectedProduct.idProductCategory)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Trạng thái">
                        <Tag
                          color={
                            selectedProduct.status === "ACTIVE"
                              ? "green"
                              : "red"
                          }
                        >
                          {selectedProduct.status === "ACTIVE"
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày tạo">
                        {dayjs(selectedProduct.createdDate).format(
                          "DD/MM/YYYY HH:mm",
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Cập nhật lần cuối">
                        {dayjs(selectedProduct.lastModifiedDate).format(
                          "DD/MM/YYYY HH:mm",
                        )}
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

                    {/* Product Variants Section - Color, Capacity, Quantity */}
                    {productDetails.length > 0 && (
                      <>
                        <Divider orientation="left">
                          <Space>
                            <CameraOutlined />
                            <Text strong>Phiên bản sản phẩm</Text>
                          </Space>
                        </Divider>
                        <Descriptions column={2} bordered size="small">
                          <Descriptions.Item label="Tổng số lượng" span={2}>
                            <Text
                              strong
                              style={{ fontSize: "16px", color: "#1890ff" }}
                            >
                              {productDetails.reduce(
                                (total, detail) =>
                                  total + (detail.quantity || 0),
                                0,
                              )}{" "}
                              máy
                            </Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="Các phiên bản" span={2}>
                            <Space wrap>
                              {productDetails.map((detail) => (
                                <Tag
                                  key={detail.id}
                                  color="blue"
                                  style={{ marginBottom: 4 }}
                                >
                                  {detail.colorName} |{" "}
                                  {detail.storageCapacityName} -{" "}
                                  {detail.quantity} máy
                                </Tag>
                              ))}
                            </Space>
                          </Descriptions.Item>
                        </Descriptions>
                        <Table
                          dataSource={productDetails}
                          size="small"
                          pagination={false}
                          style={{ marginTop: 16 }}
                          columns={[
                            {
                              title: "Phiên bản",
                              dataIndex: "version",
                              key: "version",
                            },
                            {
                              title: "Màu sắc",
                              dataIndex: "colorName",
                              key: "colorName",
                            },
                            {
                              title: "Dung lượng",
                              dataIndex: "storageCapacityName",
                              key: "storageCapacityName",
                            },
                            {
                              title: "Giá bán",
                              dataIndex: "salePrice",
                              key: "salePrice",
                              render: (value: number) =>
                                value?.toLocaleString("vi-VN") + " đ",
                            },
                            {
                              title: "Số lượng",
                              dataIndex: "quantity",
                              key: "quantity",
                              render: (value: number) => (
                                <Tag color={value > 0 ? "green" : "red"}>
                                  {value} máy
                                </Tag>
                              ),
                            },
                            {
                              title: "Trạng thái",
                              dataIndex: "status",
                              key: "status",
                              render: (status: string) => (
                                <Tag
                                  color={
                                    status === "ACTIVE" ? "success" : "default"
                                  }
                                >
                                  {status === "ACTIVE"
                                    ? "Đang bán"
                                    : "Ngừng bán"}
                                </Tag>
                              ),
                            },
                          ]}
                          rowKey="id"
                        />
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
                        <Button type="primary" icon={<PlusOutlined />}>
                          Chọn ảnh
                        </Button>
                      </Upload>
                    </div>

                    {/* Hiển thị danh sách ảnh đang chờ upload */}
                    {drawerPendingImages.length > 0 && (
                      <div
                        style={{
                          marginBottom: 24,
                          padding: 16,
                          background: "#f6ffed",
                          borderRadius: 8,
                          border: "1px solid #b7eb8f",
                        }}
                      >
                        <Typography.Text
                          strong
                          style={{
                            color: "#52c41a",
                            display: "block",
                            marginBottom: 12,
                          }}
                        >
                          Ảnh đang chờ tải lên ({drawerPendingImages.length}{" "}
                          ảnh)
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
                                    background:
                                      "linear-gradient(transparent, rgba(0,0,0,0.7))",
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
                                    onClick={() =>
                                      handleRemoveDrawerPendingImage(index)
                                    }
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
                    ) : productImages.length === 0 &&
                      drawerPendingImages.length === 0 ? (
                      <Empty description="Chưa có hình ảnh" />
                    ) : productImages.length > 0 ? (
                      <>
                        <Typography.Text
                          strong
                          style={{ marginBottom: 12, display: "block" }}
                        >
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
                                    style={{
                                      height: "120px",
                                      objectFit: "cover",
                                    }}
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
                                      <CloseOutlined
                                        style={{ color: "#ff4d4f" }}
                                      />
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
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: "11px" }}
                                    >
                                      {dayjs(img.createdDate).format(
                                        "DD/MM/YYYY",
                                      )}
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
              {
                key: "variants",
                label: `Phiên bản (${productDetails.length})`,
                children: (
                  <div>
                    {productDetailsLoading ? (
                      <div style={{ textAlign: "center", padding: 20 }}>
                        <Spin />
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            marginBottom: 16,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography.Text strong>
                            Danh sách biến thể sản phẩm
                          </Typography.Text>
                          <Dropdown
                            menu={{ items: variantAddMenuItems }}
                            trigger={["click"]}
                            placement="bottomRight"
                          >
                            <Button type="primary" icon={<PlusOutlined />}>
                              Thêm biến thể
                            </Button>
                          </Dropdown>
                        </div>

                        {selectedProductWithVariants && (
                          <Descriptions
                            column={3}
                            bordered
                            size="small"
                            style={{ marginBottom: 16 }}
                          >
                            <Descriptions.Item label="Tổng tồn kho">
                              <Text strong style={{ color: "#1890ff" }}>
                                {selectedProductWithVariants.totalQuantity || 0}
                              </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá thấp nhất">
                              <Text strong style={{ color: "#52c41a" }}>
                                {selectedProductWithVariants.minPrice?.toLocaleString(
                                  "vi-VN",
                                ) || 0}{" "}
                                đ
                              </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá cao nhất">
                              <Text strong style={{ color: "#ff4d4f" }}>
                                {selectedProductWithVariants.maxPrice?.toLocaleString(
                                  "vi-VN",
                                ) || 0}{" "}
                                đ
                              </Text>
                            </Descriptions.Item>
                          </Descriptions>
                        )}

                        {productDetails.length === 0 ? (
                          <Empty description="Sản phẩm này chưa có biến thể nào" />
                        ) : (
                          <Row gutter={[16, 16]}>
                            {productDetails.map((detail) => (
                              <Col xs={24} sm={12} md={8} key={detail.id}>
                                <Card
                                  size="small"
                                  hoverable
                                  style={{ borderColor: "#1890ff" }}
                                  actions={[
                                    <Tooltip title="Sửa" key="edit">
                                      <EditOutlined
                                        style={{
                                          fontSize: "16px",
                                          color: "#faad14",
                                        }}
                                        onClick={(e) => {
                                          e?.stopPropagation();
                                          // Convert to variant format for editing
                                          openEditVariantModal({
                                            id: detail.id,
                                            code: detail.code,
                                            version: detail.version,
                                            // LEVEL 1: Copy variantVersion
                                            variantVersion: (detail as any)
                                              .variantVersion,
                                            colorId: detail.colorId,
                                            colorName: detail.colorName,
                                            storageCapacityId:
                                              detail.storageCapacityId,
                                            storageCapacityName:
                                              detail.storageCapacityName,
                                            salePrice: detail.salePrice,
                                            quantity: detail.quantity,
                                            status: detail.status,
                                            imageUrl: detail.imageUrl,
                                            selectedImageId:
                                              detail.selectedImageId,
                                            selectedImageUrl:
                                              detail.selectedImageUrl,
                                          } as ProductVariantResponse);
                                        }}
                                      />
                                    </Tooltip>,
                                    <Popconfirm
                                      title="Xóa biến thể"
                                      description="Bạn có chắc chắn muốn xóa biến thể này?"
                                      onConfirm={(e) => {
                                        e?.stopPropagation();
                                        handleDeleteVariant(detail.id);
                                      }}
                                      onCancel={(e) => e?.stopPropagation()}
                                      okText="Xóa"
                                      cancelText="Hủy"
                                      key="delete"
                                    >
                                      <Tooltip title="Xóa">
                                        <DeleteOutlined
                                          style={{
                                            fontSize: "16px",
                                            color: "#ff4d4f",
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </Tooltip>
                                    </Popconfirm>,
                                  ]}
                                >
                                  <Space
                                    orientation="vertical"
                                    size={6}
                                    style={{ width: "100%" }}
                                  >
                                    {/* Dòng 1: SKU */}
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                      }}
                                    >
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: 12 }}
                                      >
                                        SKU:
                                      </Text>
                                      <Text strong style={{ fontSize: 12 }}>
                                        {detail.code || "Không có mã"}
                                      </Text>
                                    </div>

                                    {/* Dòng 2: Tên hiển thị đầy đủ */}
                                    {(() => {
                                      const displayInfo =
                                        formatVariantDisplayInfo({
                                          code: detail.code,
                                          version: detail.version,
                                          variantVersion: (detail as any)
                                            .variantVersion,
                                          colorName: detail.colorName,
                                          storageCapacityName:
                                            detail.storageCapacityName,
                                          salePrice: detail.salePrice,
                                          quantity: detail.quantity,
                                          status: detail.status,
                                        });
                                      return (
                                        <Tag
                                          color="blue"
                                          style={{
                                            alignSelf: "flex-start",
                                            fontSize: 12,
                                          }}
                                        >
                                          {displayInfo.shortLabel}
                                        </Tag>
                                      );
                                    })()}

                                    {/* Ảnh thumbnail */}
                                    {(detail.selectedImageUrl ||
                                      detail.imageUrl) && (
                                      <div
                                        style={{
                                          textAlign: "center",
                                          marginBottom: 4,
                                        }}
                                      >
                                        <img
                                          src={
                                            detail.selectedImageUrl ||
                                            detail.imageUrl
                                          }
                                          alt="variant"
                                          style={{
                                            width: 60,
                                            height: 60,
                                            objectFit: "cover",
                                            borderRadius: 4,
                                            border: "1px solid #f0f0f0",
                                          }}
                                        />
                                      </div>
                                    )}

                                    <Divider style={{ margin: "6px 0" }} />

                                    {/* Khu vực thông tin chi tiết */}
                                    <Space
                                      orientation="vertical"
                                      size={2}
                                      style={{ width: "100%" }}
                                    >
                                      {/* Phiên bản */}
                                      {(() => {
                                        const displayInfo =
                                          formatVariantDisplayInfo({
                                            code: detail.code,
                                            version: detail.version,
                                            variantVersion: (detail as any)
                                              .variantVersion,
                                            colorName: detail.colorName,
                                            storageCapacityName:
                                              detail.storageCapacityName,
                                            salePrice: detail.salePrice,
                                            quantity: detail.quantity,
                                            status: detail.status,
                                          });
                                        return (
                                          <div
                                            style={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                              fontSize: 12,
                                            }}
                                          >
                                            <Text type="secondary">
                                              Phiên bản:
                                            </Text>
                                            <Text strong>
                                              {displayInfo.versionDisplay}
                                            </Text>
                                          </div>
                                        );
                                      })()}

                                      {/* Màu sắc */}
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          fontSize: 12,
                                        }}
                                      >
                                        <Text type="secondary">Màu sắc:</Text>
                                        <Text strong>
                                          {detail.colorName || "Không rõ"}
                                        </Text>
                                      </div>

                                      {/* Dung lượng */}
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          fontSize: 12,
                                        }}
                                      >
                                        <Text type="secondary">
                                          Dung lượng:
                                        </Text>
                                        <Text strong>
                                          {detail.storageCapacityName ||
                                            "Không rõ"}
                                        </Text>
                                      </div>

                                      {/* Giá bán */}
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          fontSize: 12,
                                        }}
                                      >
                                        <Text type="secondary">Giá bán:</Text>
                                        <Text
                                          strong
                                          style={{ color: "#ff4d4f" }}
                                        >
                                          {detail.salePrice?.toLocaleString(
                                            "vi-VN",
                                          )}{" "}
                                          đ
                                        </Text>
                                      </div>

                                      {/* Tồn kho */}
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          fontSize: 12,
                                          alignItems: "center",
                                        }}
                                      >
                                        <Text type="secondary">Tồn kho:</Text>
                                        <Tag
                                          color={
                                            detail.quantity > 0
                                              ? "green"
                                              : "red"
                                          }
                                          style={{ margin: 0 }}
                                        >
                                          {detail.quantity} máy
                                        </Tag>
                                      </div>

                                      {/* Trạng thái */}
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          fontSize: 12,
                                          alignItems: "center",
                                        }}
                                      >
                                        <Text type="secondary">
                                          Trạng thái:
                                        </Text>
                                        <Tag
                                          color={
                                            detail.status === "ACTIVE"
                                              ? "success"
                                              : "default"
                                          }
                                          style={{ margin: 0 }}
                                        >
                                          {detail.status === "ACTIVE"
                                            ? "Đang bán"
                                            : "Ngừng bán"}
                                        </Tag>
                                      </div>
                                    </Space>
                                  </Space>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        )}
                      </>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </Drawer>

      {/* Modal Thêm/Sửa Biến thể */}
      <Modal
        title={editingVariant ? "Cập nhật biến thể" : "Thêm biến thể mới"}
        open={isVariantModalOpen}
        onCancel={() => setIsVariantModalOpen(false)}
        width={600}
        destroyOnHidden
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setIsVariantModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              onClick={handleSaveVariant}
              loading={variantLoading}
            >
              {editingVariant ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        }
      >
        <Form form={variantForm} layout="vertical">
          <Form.Item
            name="code"
            label="Mã sản phẩm chi tiết"
            rules={[
              { required: true, message: "Vui lòng nhập mã sản phẩm chi tiết" },
            ]}
          >
            <Input placeholder="Nhập mã sản phẩm chi tiết" />
          </Form.Item>

          {/* LEVEL 1: Thêm field "Phiên bản" - Select bắt buộc với 3 giá trị */}
          <Form.Item
            name="variantVersion"
            label="Phiên bản"
            rules={[{ required: true, message: "Vui lòng chọn phiên bản!" }]}
          >
            <Select
              placeholder="Chọn phiên bản máy ảnh"
              options={ProductVersionOptions}
            />
          </Form.Item>

          {/* NOTE: Trường "Tên phiên bản" (version) đã được loại bỏ vì backend sẽ tự động generate */}
          {/* Format: {VariantVersion} / {Color} / {Storage} - VD: "Body Only / Đen / 128GB" */}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="colorId"
                label="Màu sắc"
                rules={[{ required: true, message: "Vui lòng chọn màu sắc" }]}
              >
                <Select
                  placeholder="Chọn màu sắc"
                  showSearch
                  optionFilterProp="children"
                  options={(colorState?.list || []).map((c: any) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                  popupRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.preventDefault();
                          setQuickAddColorOpen(true);
                        }}
                        style={{ padding: "4px 12px", height: "auto" }}
                      >
                        + Thêm mới màu
                      </Button>
                    </>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="storageCapacityId"
                label="Dung lượng"
                rules={[
                  { required: true, message: "Vui lòng chọn dung lượng" },
                ]}
              >
                <Select
                  placeholder="Chọn dung lượng"
                  showSearch
                  optionFilterProp="children"
                  options={(storageCapacityState?.list || []).map((s: any) => ({
                    label: s.name,
                    value: s.id,
                  }))}
                  popupRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.preventDefault();
                          setQuickAddStorageOpen(true);
                        }}
                        style={{ padding: "4px 12px", height: "auto" }}
                      >
                        + Thêm mới dung lượng
                      </Button>
                    </>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="salePrice"
                label="Giá bán"
                rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
              >
                <InputNumber
                  placeholder="Nhập giá bán"
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as any}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              {editingVariant ? (
                <Form.Item name="quantity" label="Số lượng tồn kho">
                  <InputNumber
                    placeholder="Số lượng"
                    style={{ width: "100%" }}
                    min={0}
                    disabled
                  />
                </Form.Item>
              ) : (
                <Form.Item label=" " colon={false}>
                  <div style={{ padding: "8px 0", color: "#888" }}>
                    Số lượng sẽ được tính từ danh sách Serial
                  </div>
                </Form.Item>
              )}
            </Col>
          </Row>

          {/* Chỉ hiển thị phần nhập serial khi thêm mới biến thể */}
          {!editingVariant && (
            <Card
              size="small"
              title="Quản lý Serial"
              style={{ marginBottom: 16, background: "#fafafa" }}
            >
              <Upload
                beforeUpload={handleImportExcelVariant}
                showUploadList={false}
                accept=".xlsx,.xls"
              >
                <Button style={{ marginBottom: 10 }}>
                  Import Serial từ Excel
                </Button>
              </Upload>

              <Form.Item
                label={<Text strong>Nhập danh sách Serial mới</Text>}
                name="serialList"
                extra="Mỗi mã một dòng hoặc import từ Excel"
                rules={[
                  {
                    required: !editingVariant,
                    message: "Vui lòng nhập Serial!",
                  },
                ]}
              >
                <Input.TextArea
                  rows={5}
                  placeholder={`SP0001\nSP0002\nSP0003\nSP0004`}
                />
              </Form.Item>
            </Card>
          )}

          {/* Khi cập nhật: hiển thị serial cũ và thêm serial mới */}
          {editingVariant && (
            <Card
              size="small"
              style={{ marginBottom: 16, background: "#fafafa" }}
            >
              {/* Danh sách serial cũ - readonly, màu theo trạng thái bán */}
              <div style={{ marginBottom: 16 }}>
                <Text strong>
                  Quản lý serial hiện tại ({variantSerials.length} máy)
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Màu xanh lá: chưa bán · Màu xanh dương: đang trong đơn · Màu
                    vàng: đã bán
                  </Text>
                </div>
                <div
                  style={{
                    maxHeight: 150,
                    overflowY: "auto",
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                    padding: 8,
                    marginTop: 8,
                    background: "#fff",
                  }}
                >
                  {variantSerials.length > 0 ? (
                    <Space wrap>
                      {variantSerials.map((s: any, idx: number) => {
                        const sold = isVariantSerialSold(s);
                        const inOrder = isVariantSerialInOrder(s);
                        const tagColor = sold
                          ? "gold"
                          : inOrder
                            ? "geekblue"
                            : "success";
                        return (
                          <Tag
                            key={s.id ?? `${s.serialNumber}-${idx}`}
                            color={tagColor}
                          >
                            {s.serialNumber}
                          </Tag>
                        );
                      })}
                    </Space>
                  ) : (
                    <Text type="secondary">Chưa có serial nào</Text>
                  )}
                </div>
              </div>

              {/* Thêm serial mới */}
              <Divider style={{ margin: "12px 0" }} />
              <Text strong>Thêm Serial mới</Text>
              <Upload
                beforeUpload={(file) => {
                  // Import excel for new serials only
                  const reader = new FileReader();
                  reader.onload = (e: any) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                      header: 1,
                    });
                    const serials = jsonData
                      .map((row: any) => row[0])
                      .filter((v: any) => v)
                      .join("\n");
                    variantForm.setFieldsValue({
                      newSerialList: serials,
                    });
                  };
                  reader.readAsArrayBuffer(file);
                  return false;
                }}
                showUploadList={false}
                accept=".xlsx,.xls"
              >
                <Button size="small" style={{ marginTop: 8, marginBottom: 8 }}>
                  Import Serial từ Excel
                </Button>
              </Upload>

              <Form.Item
                label=" "
                name="newSerialList"
                extra="Nhập serial mới (mỗi mã một dòng). Hệ thống sẽ kiểm tra trùng lặp."
              >
                <Input.TextArea
                  rows={4}
                  placeholder={`SN0001\nSN0002\nSN0003`}
                />
              </Form.Item>
            </Card>
          )}

          <Form.Item name="imageUrl" label="URL Ảnh biến thể">
            <Input placeholder="Nhập URL ảnh hoặc để trống" />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE">
            <Select
              options={[
                { label: "Hoạt động", value: "ACTIVE" },
                { label: "Không hoạt động", value: "INACTIVE" },
              ]}
            />
          </Form.Item>

          {/* Chọn ảnh đại diện từ ảnh của sản phẩm mẹ */}
          <Form.Item label="Ảnh đại diện cho biến thể">
            {selectedProductWithVariants?.productImages &&
            selectedProductWithVariants.productImages.length > 0 ? (
              <div>
                <Typography.Text
                  type="secondary"
                  style={{ marginBottom: 8, display: "block" }}
                >
                  Chọn 1 ảnh từ danh sách ảnh của sản phẩm mẹ:
                </Typography.Text>
                <Row gutter={[8, 8]}>
                  {selectedProductWithVariants.productImages.map((img) => (
                    <Col span={8} key={img.id}>
                      <div
                        onClick={() => {
                          const newImageId = img.id;
                          setVariantSelectedImageId(newImageId);
                          variantForm.setFieldValue(
                            "selectedImageId",
                            newImageId,
                          );
                          // Lưu ngay khi chọn (chỉ khi đang sửa biến thể)
                          if (editingVariant) {
                            handleSaveImageVariant(
                              editingVariant.id,
                              newImageId,
                            );
                          }
                        }}
                        style={{
                          cursor: "pointer",
                          border:
                            variantSelectedImageId === img.id
                              ? "3px solid #1890ff"
                              : "2px solid #d9d9d9",
                          borderRadius: 8,
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <img
                          src={img.url}
                          alt="Ảnh sản phẩm"
                          style={{
                            width: "100%",
                            height: 80,
                            objectFit: "cover",
                          }}
                        />
                        {variantSelectedImageId === img.id && (
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
                            <CheckCircleOutlined
                              style={{ fontSize: 24, color: "#fff" }}
                            />
                          </div>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
                <Form.Item name="selectedImageId" hidden>
                  <Input />
                </Form.Item>
                <Button
                  type="link"
                  onClick={() => {
                    setVariantSelectedImageId(undefined);
                    variantForm.setFieldValue("selectedImageId", undefined);
                  }}
                  style={{ padding: 0, marginTop: 8 }}
                  disabled={!variantSelectedImageId}
                >
                  Bỏ chọn ảnh
                </Button>
              </div>
            ) : (
              <Alert
                message="Chưa có ảnh"
                description="Sản phẩm mẹ chưa có ảnh nào. Vui lòng thêm ảnh ở tab Hình ảnh trước khi chọn ảnh cho biến thể."
                type="warning"
                showIcon
              />
            )}
          </Form.Item>

          {/* Ảnh cũ (URL trực tiếp) - ẩn vì đã dùng selectedImageId */}
          <Form.Item name="imageUrl" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Quick Add Modals */}
      <QuickAddCategoryModal
        open={quickAddCategoryOpen}
        onClose={() => setQuickAddCategoryOpen(false)}
        onCreated={(categoryId, label) => {
          dispatch(productCategoryActions.getAll({ page: 0, size: 1000 }));
          modalForm.setFieldsValue({ idProductCategory: categoryId });
          notification.success({ message: `Đã chọn: ${label}` });
        }}
      />

      <QuickAddTechSpecModal
        open={quickAddTechSpecOpen}
        onClose={() => {
          setQuickAddTechSpecOpen(false);
          setQuickAddTechSpecType(null);
        }}
        onCreated={(value, label) => {
          if (quickAddTechSpecType === "sensorType") {
            dispatch(
              sensorTypeActions.getAll({ page: 0, size: 1000, keyword: "" }),
            );
            modalForm.setFieldsValue({
              techSpec: {
                ...modalForm.getFieldValue("techSpec"),
                sensorType: value,
              },
            });
          } else if (quickAddTechSpecType === "lensMount") {
            dispatch(
              lensMountActions.getAll({ page: 0, size: 1000, keyword: "" }),
            );
            modalForm.setFieldsValue({
              techSpec: {
                ...modalForm.getFieldValue("techSpec"),
                lensMount: value,
              },
            });
          } else if (quickAddTechSpecType === "resolution") {
            dispatch(
              resolutionActions.getAll({ page: 0, size: 1000, keyword: "" }),
            );
            modalForm.setFieldsValue({
              techSpec: {
                ...modalForm.getFieldValue("techSpec"),
                resolution: value,
              },
            });
          } else if (quickAddTechSpecType === "processor") {
            dispatch(
              processorActions.getAll({ page: 0, size: 1000, keyword: "" }),
            );
            modalForm.setFieldsValue({
              techSpec: {
                ...modalForm.getFieldValue("techSpec"),
                processor: value,
              },
            });
          } else if (quickAddTechSpecType === "imageFormat") {
            dispatch(
              imageFormatActions.getAll({ page: 0, size: 1000, keyword: "" }),
            );
            modalForm.setFieldsValue({
              techSpec: {
                ...modalForm.getFieldValue("techSpec"),
                imageFormat: value,
              },
            });
          } else if (quickAddTechSpecType === "videoFormat") {
            dispatch(
              videoFormatActions.getAll({ page: 0, size: 1000, keyword: "" }),
            );
            modalForm.setFieldsValue({
              techSpec: {
                ...modalForm.getFieldValue("techSpec"),
                videoFormat: value,
              },
            });
          }
          notification.success({ message: `Đã chọn: ${label}` });
        }}
        type={quickAddTechSpecType || "sensorType"}
      />

      <QuickAddColorModal
        open={quickAddColorOpen}
        onClose={() => setQuickAddColorOpen(false)}
        onCreated={(colorId, label) => {
          dispatch(colorActions.getAll({ page: 0, size: 1000, keyword: "" }));
          variantForm.setFieldsValue({ colorId });
          notification.success({ message: `Đã chọn: ${label}` });
        }}
      />

      <QuickAddStorageModal
        open={quickAddStorageOpen}
        onClose={() => setQuickAddStorageOpen(false)}
        onCreated={(storageId, label) => {
          dispatch(
            storageCapacityActions.getAll({ page: 0, size: 1000, keyword: "" }),
          );
          variantForm.setFieldsValue({ storageCapacityId: storageId });
          notification.success({ message: `Đã chọn: ${label}` });
        }}
      />

      <BatchCreateVariantModal
        open={batchVariantModalOpen}
        productId={selectedProduct?.id ?? ""}
        productCode={adminProductCode(selectedProduct)}
        productName={selectedProduct?.name ?? ""}
        colors={(colorState.list || []).map(
          (c: { id: string; name: string }) => ({
            id: String(c.id),
            name: c.name,
          }),
        )}
        storages={(storageCapacityState.list || []).map(
          (s: { id: string; name: string }) => ({
            id: String(s.id),
            name: s.name,
          }),
        )}
        productList={(list || []).map((p) => ({
          id: String(p.id),
          code: adminProductCode(p),
          name: p.name,
        }))}
        onSuccess={() => {
          setBatchVariantModalOpen(false);
          if (selectedProduct?.id) {
            void refreshProductVariants(selectedProduct.id);
          }
          fetchProducts();
        }}
        onCancel={() => setBatchVariantModalOpen(false)}
      />
    </div>
  );
};

export default ProductPage;
