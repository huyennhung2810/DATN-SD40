import React from "react";
import { Outlet } from "react-router-dom";
import CustomerHeader from "../../components/customer/CustomerHeader";
import CustomerFooter from "../../components/customer/CustomerFooter";

interface CustomerLayoutProps {
  children?: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = () => {
  return (
    <div className="customer-layout">
      <CustomerHeader />
      <main className="flex-grow" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Outlet />
      </main>
      <CustomerFooter />
    </div>
  );
};

export default CustomerLayout;

