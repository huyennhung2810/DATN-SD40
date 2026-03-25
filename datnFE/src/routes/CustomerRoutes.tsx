import { Route } from "react-router-dom";
import CustomerLayout from "../layout/customer/CustomerLayout";
import { ClientHomePage } from "../components/homepage";
import CustomerCatalogPage from "../Pages/customer/CatalogPage";
import ProductDetail from "../components/homepage/ProductDetail";
import CartPage from "../Pages/client/CartPage";
import CheckoutPage from "../Pages/client/CheckoutPage";
import ProfilePage from "../Pages/client/ProfilePage";
import OrderListPage from "../Pages/client/OrderListPage";
import OrderDetailPage from "../Pages/client/OrderDetailPage";

export const CustomerRoutes = () => (
  <Route path="/client" element={<CustomerLayout />}>
    <Route index element={<ClientHomePage />} />
    <Route path="catalog" element={<CustomerCatalogPage />} />
    <Route path="products" element={<CustomerCatalogPage />} />
    <Route path="product/:id" element={<ProductDetail />} />
    <Route path="cart" element={<CartPage />} />
    <Route path="checkout" element={<CheckoutPage />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="orders" element={<OrderListPage />} />
    <Route path="orders/:id" element={<OrderDetailPage />} />
  </Route>
);

export default CustomerRoutes;
