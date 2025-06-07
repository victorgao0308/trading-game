import { Box, Modal } from "@mui/material";
import { useState } from "react";

export interface Order {
  id: string;
  status: string;
  title: string;
  timestamp: string;
}

const OrderStatus: React.FC<Order> = ({ id, status, title, timestamp }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <>
      <div className={`bg-white shadow-md rounded-md p-2 mb-2 w-64 border border-gray-200 m-1 transition-transform duration-50 hover:scale-105 cursor-pointer ${status == "Order Filled" ? "!bg-lime-500/33" : ""} `} onClick={handleOpen}>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-gray-600">Status: {status}</div>
      </div>

      <Modal open={open} onClose={handleClose}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-md shadow-lg p-6 w-full max-w-1/2 max-h-1/2 overflow-y-auto">
          <h1 className="text-xl font-bold mb-4">Order ID: {id}</h1>
          <h2>{title}</h2>
          <h2>Order Status: {status}</h2>
          <h2>Timestamp: {timestamp}</h2>
        </Box>
      </Modal>
    </>
  );
};

export default OrderStatus;
