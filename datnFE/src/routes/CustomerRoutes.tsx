import { Route } from "react-router-dom";
import CustomerLayout from "../layout/customer/CustomerLayout";
import { ClientHomePage } from "../components/homepage";
import CustomerCatalogPage from "../Pages/customer/CatalogPage";
import ProductDetail from "../components/homepage/ProductDetail";
import CartPage from "../Pages/client/CartPage";
export const CustomerRoutes = () => (
  <Route path="/client" element={<CustomerLayout />}>
    <Route index element={<ClientHomePage />} />
    <Route path="catalog" element={<CustomerCatalogPage />} />
    <Route path="products" element={<CustomerCatalogPage />} />
    <Route path="product/:id" element={<ProductDetail />} />
    <Route path="cart" element={<CartPage />} />
  </Route>
);

export default CustomerRoutes;
