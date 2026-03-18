import { Route } from "react-router-dom";
import CustomerLayout from "../layout/customer/CustomerLayout";
import { ClientHomePage } from "../components/homepage";
import CustomerCatalogPage from "../Pages/customer/CatalogPage";

export const CustomerRoutes = () => (
  <Route path="/client" element={<CustomerLayout />}>
    <Route index element={<ClientHomePage />} />
    <Route path="catalog" element={<CustomerCatalogPage />} />
    <Route path="products" element={<CustomerCatalogPage />} />
  </Route>
);

export default CustomerRoutes;
