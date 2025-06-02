import OrderStatus from "./OrderStatus";
import type { Order } from "./OrderStatus";

interface OrderList {
  orders: Order[];
}

const OrderStatusList: React.FC<OrderList> = ({ orders }) => {
  return (
    <div className="fixed top-4 right-4 z-50 min-w-75 p-2 max-h-1/2 overflow-y-auto border-2 rounded-md">
      <h1 className="text-xl font-bold mb-4 ml-2">Recent Orders</h1>
      {orders.length === 0 ? (
        <h3 className="text-l mb-4 ml-2 font-bold text-gray-500">
          No recent orders to show
        </h3>
      ) : (
        orders.map((order) => (
          <OrderStatus
            key={order.id}
            title={order.title}
            id={order.id}
            status={order.status}
            timestamp={order.timestamp}
          />
        ))
      )}
    </div>
  );
};

export default OrderStatusList;
