import { Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import CustomerLayout from "../layout/customer/CustomerLayout";
import CustomerHomePage from "../Pages/customer/HomePage";
import CustomerCatalogPage from "../Pages/customer/CatalogPage";

export const CustomerRoutes = () => (
  <Route element={<PrivateRoute allowedRoles={["CUSTOMER"]} />}>
    <Route path="/client" element={<CustomerLayout />}>
      <Route index element={<CustomerHomePage />} />
      <Route path="catalog" element={<CustomerCatalogPage />} />
      <Route path="products" element={<CustomerCatalogPage />} />
    </Route>
  </Route>
);

export default CustomerRoutes;
