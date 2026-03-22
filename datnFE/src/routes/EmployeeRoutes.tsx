import { Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import PosPage from "../Pages/admin/pos/PosPage";
import OrderPage from "../Pages/admin/order/OrderList";
import EmployeeChatPage from "../Pages/admin/chat/EmployeeChatPage";
import CustomerPage from "../Pages/admin/customer/CustomerList";
import CustomerForm from "../Pages/admin/customer/CustomerForm";
import ProductPage from "../Pages/admin/product/ProductList";
import ProductCategoryPage from "../Pages/admin/product-category/ProductCategoryList";
import SerialPage from "../Pages/admin/serial/SerialList";
import ShiftHandoverPage from "../Pages/admin/shiftHandover/ShiftHandoverPage";
import VoucherList from "../Pages/admin/voucher/VoucherList";
import DiscountList from "../Pages/admin/discount/DiscountList";
import BannerList from "../Pages/admin/banner/BannerList";
import TechSpecPage from "../Pages/admin/tech-spec/TechSpecList";
import ColorPage from "../Pages/admin/color/ColorList";
import StorageCapacityPage from "../Pages/admin/storage/StorageList";
import ProductDetailPage from "../Pages/admin/productdetail/productDetailList";
import VoucherForm from "../Pages/admin/voucher/VoucherForm";
import DiscountForm from "../Pages/admin/discount/DiscountForm";
import BannerForm from "../Pages/admin/banner/BannerForm";
import OrderDetailPage from "../Pages/admin/order/OrderDetail";

export const EmployeeRoutes = () => [
  <Route
    key="staff-guard"
    element={<PrivateRoute allowedRoles={["ADMIN", "STAFF"]} />}
  >
    {/* Nghiệp vụ chính */}
    <Route path="/pos" element={<PosPage />} />
    <Route path="/orders" element={<OrderPage />} />
    <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
    <Route path="/EChatAi" element={<EmployeeChatPage />} />
    <Route path="/shift-handover" element={<ShiftHandoverPage />} />

    {/* Quản lý Khách hàng */}
    <Route path="/customer" element={<CustomerPage />} />
    <Route path="/customerAdd" element={<CustomerForm />} />
    <Route path="/admin/customers/:id" element={<CustomerForm />} />

    {/* Quản lý Sản phẩm & Thuộc tính  */}
    <Route path="/admin/products" element={<ProductPage />} />
    <Route path="/admin/product-categories" element={<ProductCategoryPage />} />
    <Route path="/admin/tech-spec" element={<TechSpecPage />} />
    <Route path="/serial" element={<SerialPage />} />
    <Route path="/products/color" element={<ColorPage />} />
    <Route
      path="/products/storage-capacity"
      element={<StorageCapacityPage />}
    />
    <Route path="/products/product-detail" element={<ProductDetailPage />} />

    {/* Marketing & Khuyến mãi (ĐÃ BỔ SUNG FORM) */}
    <Route path="/voucher" element={<VoucherList />} />
    <Route path="/voucher/create" element={<VoucherForm />} />
    <Route path="/voucher/edit/:id" element={<VoucherForm />} />

    <Route path="/discount" element={<DiscountList />} />
    <Route path="/discount/create" element={<DiscountForm />} />
    <Route path="/discount/edit/:id" element={<DiscountForm />} />

    <Route path="/admin/banners" element={<BannerList />} />
    <Route path="/admin/banners/create" element={<BannerForm />} />
    <Route path="/admin/banners/:id/edit" element={<BannerForm />} />
    <Route path="/admin/banners/:id" element={<BannerForm />} />
  </Route>,
];

export default EmployeeRoutes;
