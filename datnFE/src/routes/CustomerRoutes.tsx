import { Route } from "react-router-dom";
import CustomerLayout from "../layout/customer/CustomerLayout";
import CustomerHomePage from "../Pages/customer/HomePage";
import CustomerCatalogPage from "../Pages/customer/CatalogPage";

export const CustomerRoutes = () => (
  <Route path="/client" element={<CustomerLayout />}>
    <Route index element={<CustomerHomePage />} />
    <Route path="catalog" element={<CustomerCatalogPage />} />
    <Route path="products" element={<CustomerCatalogPage />} />
  </Route>
);

export default CustomerRoutes;
