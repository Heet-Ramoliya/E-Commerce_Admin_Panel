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
import { Card, Select, Button, Table, Badge } from "../components";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockOrder = {
          id: id,
          customer: {
            name: "John Doe",
            email: "john@example.com",
            phone: "(555) 123-4567",
          },
          date: "2023-11-25",
          total: 129.99,
          subtotal: 119.99,
          tax: 10.0,
          shipping: 0.0,
          status: "Delivered",
          paymentMethod: "Credit Card",
          shippingAddress: {
            street: "123 Main St",
            city: "Anytown",
            state: "CA",
            zipCode: "90210",
            country: "USA",
          },
          billingAddress: {
            street: "123 Main St",
            city: "Anytown",
            state: "CA",
            zipCode: "90210",
            country: "USA",
          },
          items: [
            {
              id: "1",
              name: "Wireless Earbuds",
              price: 49.99,
              quantity: 1,
              image:
                "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            },
            {
              id: "2",
              name: "Smart Watch",
              price: 69.99,
              quantity: 1,
              image:
                "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            },
          ],
          timeline: [
            { status: "Order Placed", date: "2023-11-25 09:15 AM" },
            { status: "Payment Confirmed", date: "2023-11-25 09:17 AM" },
            { status: "Processing", date: "2023-11-25 10:30 AM" },
            { status: "Shipped", date: "2023-11-26 02:45 PM" },
            { status: "Delivered", date: "2023-11-28 11:20 AM" },
          ],
        };

        setOrder(mockOrder);
        setNewStatus(mockOrder.status);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to fetch order");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  // Update order status
  const updateOrderStatus = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setOrder({
        ...order,
        status: newStatus,
        timeline: [
          ...order.timeline,
          { status: newStatus, date: new Date().toLocaleString() },
        ],
      });
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
            alt={value}
            className="h-10 w-10 rounded object-cover mr-3"
          />
          <span className="text-sm font-medium text-secondary-900 dark:text-white">
            {value}
          </span>
        </div>
      ),
    },
    {
      header: "Quantity",
      field: "quantity",
      className: "text-center",
    },
    {
      header: "Price",
      field: "price",
      className: "text-right",
      render: (value) => `$${value.toFixed(2)}`,
    },
    {
      header: "Total",
      field: "",
      className: "text-right",
      render: (_, row) => `$${(row.price * row.quantity).toFixed(2)}`,
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
                  : order.status === "Pending" ||
                    order.status === "Order Placed" ||
                    order.status === "Payment Confirmed"
                  ? "warning"
                  : "danger"
              }
              rounded
            >
              {order.status}
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
              data={order.items}
              footer={
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-secondary-600 dark:text-secondary-400">
                      Subtotal
                    </span>
                    <span className="font-medium text-secondary-900 dark:text-white">
                      ${order.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-secondary-600 dark:text-secondary-400">
                      Tax
                    </span>
                    <span className="font-medium text-secondary-900 dark:text-white">
                      ${order.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-secondary-600 dark:text-secondary-400">
                      Shipping
                    </span>
                    <span className="font-medium text-secondary-900 dark:text-white">
                      {order.shipping > 0
                        ? `$${order.shipping.toFixed(2)}`
                        : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-secondary-900 dark:text-white pt-2 border-t border-secondary-200 dark:border-secondary-700">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              }
            />
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
                {order.customer.name}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                {order.customer.email}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                {order.customer.phone}
              </p>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Shipping Address
            </h2>
            <div className="space-y-1 text-sm text-secondary-600 dark:text-secondary-400">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </Card>

          {/* Billing Address */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Billing Address
            </h2>
            <div className="space-y-1 text-sm text-secondary-600 dark:text-secondary-400">
              <p>{order.billingAddress.street}</p>
              <p>
                {order.billingAddress.city}, {order.billingAddress.state}{" "}
                {order.billingAddress.zipCode}
              </p>
              <p>{order.billingAddress.country}</p>
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
                  {order.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                  Status
                </p>
                <p className="text-sm text-success-600 dark:text-success-400">
                  Paid
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
