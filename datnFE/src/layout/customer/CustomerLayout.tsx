import React from "react";
import { Outlet } from "react-router-dom";
import ChatWidget from "../../Pages/client/ChatWidget";

interface CustomerLayoutProps {
  children?: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = () => {
  return (
    <div className="customer-layout">
      <main className="flex-grow" style={{ minHeight: "calc(100vh - 200px)" }}>
        <Outlet />
      </main>
      <ChatWidget />
    </div>
  );
};

export default CustomerLayout;
