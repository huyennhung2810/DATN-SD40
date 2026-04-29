import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrderDetailEmbed from "./OrderDetailEmbed";

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return null;
  return (
    <OrderDetailEmbed orderId={id} onBack={() => navigate("/client/orders")} />
  );
};

export default OrderDetailPage;
