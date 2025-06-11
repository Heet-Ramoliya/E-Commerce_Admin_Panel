import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiPrinter,
  FiDownload,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../Config/Firebase";
import { Card, Select, Button, Table, Badge } from "../components";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");

  // Fetch order data from Firestore
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, "orders", id);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
          throw new Error("Order not found");
        }

        const data = orderSnap.data();
        const orderData = {
          id: orderSnap.id,
          ...data,
          date: data.createdAt
            ? new Date(data.createdAt.seconds * 1000)
                .toISOString()
                .split("T")[0]
            : "N/A",
          timeline: data.timeline || [
            {
              status: data.status || "Order Placed",
              date: data.createdAt
                ? new Date(data.createdAt.seconds * 1000).toLocaleString()
                : "N/A",
            },
          ],
        };

        setOrder(orderData);
        setNewStatus(orderData.status || "Pending");
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to fetch order");
        navigate("/orders");
      }
    };

    fetchOrder();
  }, [id, navigate]);

  // Update order status
  const updateOrderStatus = async () => {
    try {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, {
        status: newStatus,
        timeline: [
          ...(order?.timeline || []),
          { status: newStatus, date: new Date().toLocaleString() },
        ],
      });
      setOrder((prev) => ({
        ...prev,
        status: newStatus,
        timeline: [
          ...prev.timeline,
          { status: newStatus, date: new Date().toLocaleString() },
        ],
      }));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  // Order Summary Table Columns
  const orderColumns = [
    {
      header: "Product",
      field: "name",
      render: (value, row) => (
        <div className="flex items-center">
          <img
            src={row.image}
            alt={value || "Product"}
            className="h-10 w-10 rounded object-cover mr-3"
            onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
          />
          <span className="text-sm font-medium text-secondary-900 dark:text-white">
            {value || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Quantity",
      field: "quantity",
      className: "text-center",
      render: (value) => value || "0",
    },
    {
      header: "Price",
      field: "price",
      className: "text-right",
      render: (value) =>
        typeof value === "number" ? `$${value.toFixed(2)}` : "N/A",
    },
    {
      header: "Total",
      field: "",
      className: "text-right",
      render: (_, row) =>
        typeof row.price === "number" && typeof row.quantity === "number"
          ? `$${(row.price * row.quantity).toFixed(2)}`
          : "N/A",
    },
  ];

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-secondary-600 dark:text-secondary-400">
          Loading order details...
        </p>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card className="p-8 text-center">
        <p className="text-secondary-600 dark:text-secondary-400">
          Order not found.
        </p>
        <Link
          to="/orders"
          className="text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block"
        >
          Back to Orders
        </Link>
      </Card>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            icon={FiArrowLeft}
            onClick={() => navigate("/orders")}
            className="mr-3"
          />
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
              Order #{order.id}
            </h1>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              Placed on {order.date}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" icon={FiPrinter}>
            Print
          </Button>
          <Button variant="secondary" icon={FiDownload}>
            Export
          </Button>
        </div>
      </div>

      {/* Order Status */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-1">
              Current Status
            </h2>
            <Badge
              variant={
                order.status === "Delivered"
                  ? "success"
                  : order.status === "Processing"
                  ? "primary"
                  : order.status === "Shipped"
                  ? "accent"
                  : order.status === "Pending"
                  ? "warning"
                  : "danger"
              }
              rounded
            >
              {order.status || "Unknown"}
            </Badge>
          </div>
          <div className="flex items-center space-x-3">
            <Select
              id="status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={[
                { value: "Pending", label: "Pending" },
                { value: "Processing", label: "Processing" },
                { value: "Shipped", label: "Shipped" },
                { value: "Delivered", label: "Delivered" },
                { value: "Cancelled", label: "Cancelled" },
              ]}
              className="w-40"
            />
            <Button
              variant="primary"
              onClick={updateOrderStatus}
              disabled={newStatus === order.status}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="md:col-span-2">
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Order Summary
            </h2>
            <Table
              columns={orderColumns}
              data={order.items || []}
              className="border-none"
              emptyMessage="No items in this order."
            />
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-secondary-600 dark:text-secondary-400">
                  Subtotal
                </span>
                <span className="font-medium text-secondary-900 dark:text-white">
                  {typeof order.subtotal === "number"
                    ? `$${order.subtotal.toFixed(2)}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-secondary-600 dark:text-secondary-400">
                  Tax
                </span>
                <span className="font-medium text-secondary-900 dark:text-white">
                  {typeof order.tax === "number"
                    ? `$${order.tax.toFixed(2)}`
                    : "N/A"}
                </span>
              </div>
              {/* <div className="flex justify-between text-sm">
                <span className="font-medium text-secondary-600 dark:text-secondary-400">
                  Shipping
                </span>
                <span className="font-medium text-secondary-900 dark:text-white">
                  {typeof order.shipping === "number"
                    ? order.shipping > 0
                      ? `$${order.shipping.toFixed(2)}`
                      : "Free"
                    : "N/A"}
                </span>
              </div> */}
              <div className="flex justify-between text-base font-bold text-secondary-900 dark:text-white pt-2 border-t border-secondary-200 dark:border-secondary-700">
                <span>Total</span>
                <span>
                  {typeof order.total === "number"
                    ? `$${order.total.toFixed(2)}`
                    : "N/A"}
                </span>
              </div>
            </div>
          </Card>

          {/* Order Timeline */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Order Timeline
            </h2>
            <div className="space-y-4">
              {order.timeline.map((event, index) => (
                <div key={index} className="relative pb-4 pl-8 last:pb-0">
                  {index < order.timeline.length - 1 && (
                    <div className="absolute top-0 left-3 ml-px h-full w-0.5 bg-primary-200 dark:bg-primary-800"></div>
                  )}
                  <div className="absolute top-0 left-0 rounded-full border-2 border-primary-600 dark:border-primary-400 bg-white dark:bg-secondary-800 p-1">
                    {event.status === "Order Placed" && (
                      <FiPackage className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                    )}
                    {event.status === "Processing" && (
                      <FiPackage className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                    )}
                    {event.status === "Shipped" && (
                      <FiTruck className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                    )}
                    {event.status === "Delivered" && (
                      <FiCheckCircle className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                    )}
                    {![
                      "Order Placed",
                      "Processing",
                      "Shipped",
                      "Delivered",
                    ].includes(event.status) && (
                      <div className="h-3 w-3 rounded-full bg-primary-600 dark:bg-primary-400"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-900 dark:text-white">
                      {event.status}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                      {event.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Customer and Shipping Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Customer Information
            </h2>
            <div className="space-y-3">
              <p className="text-sm font-medium text-secondary-900 dark:text-white">
                {order.customer
                  ? `${order.customer.firstName || ""} ${
                      order.customer.lastName || ""
                    }`.trim() || "N/A"
                  : "N/A"}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                {order.customer?.email || "N/A"}
              </p>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Shipping Address
            </h2>
            <div className="space-y-1 text-sm text-secondary-600 dark:text-secondary-400">
              <p>{order.shippingAddress?.street || "N/A"}</p>
              <p>
                {order.shippingAddress?.city || ""}
                {order.shippingAddress?.city ? ", " : ""}
                {order.shippingAddress?.state || ""}{" "}
                {order.shippingAddress?.zip ||
                  order.shippingAddress?.zipCode ||
                  ""}
              </p>
              <p>{order.shippingAddress?.country || "N/A"}</p>
            </div>
          </Card>

          {/* Payment Information */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Payment Information
            </h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                  Method
                </p>
                <p className="text-sm text-secondary-900 dark:text-white">
                  {order.paymentMethod || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                  Status
                </p>
                <p className="text-sm text-success-600 dark:text-success-400">
                  {order.paymentIntentId ? "Paid" : "Pending"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
