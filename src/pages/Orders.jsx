import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiFilter, FiEye, FiCalendar } from "react-icons/fi";
import { Card, Input, Select, Button, Table, Badge } from "../components";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      const mockOrders = [
        {
          id: "1001",
          customer: { name: "John Doe", email: "john@example.com" },
          date: "2023-11-25",
          total: 129.99,
          status: "Delivered",
          items: 3,
          paymentMethod: "Credit Card",
        },
        {
          id: "1002",
          customer: { name: "Jane Smith", email: "jane@example.com" },
          date: "2023-11-24",
          total: 89.95,
          status: "Processing",
          items: 2,
          paymentMethod: "PayPal",
        },
        {
          id: "1003",
          customer: { name: "Robert Johnson", email: "robert@example.com" },
          date: "2023-11-24",
          total: 45.5,
          status: "Shipped",
          items: 1,
          paymentMethod: "Credit Card",
        },
        {
          id: "1004",
          customer: { name: "Emily Davis", email: "emily@example.com" },
          date: "2023-11-23",
          total: 199.99,
          status: "Pending",
          items: 4,
          paymentMethod: "PayPal",
        },
        {
          id: "1005",
          customer: { name: "Michael Wilson", email: "michael@example.com" },
          date: "2023-11-22",
          total: 74.99,
          status: "Delivered",
          items: 2,
          paymentMethod: "Credit Card",
        },
        {
          id: "1006",
          customer: { name: "Sarah Brown", email: "sarah@example.com" },
          date: "2023-11-22",
          total: 149.95,
          status: "Cancelled",
          items: 3,
          paymentMethod: "Credit Card",
        },
        {
          id: "1007",
          customer: { name: "David Miller", email: "david@example.com" },
          date: "2023-11-20",
          total: 29.99,
          status: "Delivered",
          items: 1,
          paymentMethod: "PayPal",
        },
        {
          id: "1008",
          customer: { name: "Jessica Taylor", email: "jessica@example.com" },
          date: "2023-11-18",
          total: 59.99,
          status: "Delivered",
          items: 2,
          paymentMethod: "Credit Card",
        },
      ];
      setOrders(mockOrders);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter orders based on search, status, and date
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.includes(searchTerm) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    let matchesDate = true;
    const orderDate = new Date(order.date);
    const today = new Date();
    if (dateRange === "today") {
      const todayStr = today.toISOString().split("T")[0];
      matchesDate = order.date === todayStr;
    } else if (dateRange === "week") {
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      matchesDate = orderDate >= oneWeekAgo;
    } else if (dateRange === "month") {
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(today.getMonth() - 1);
      matchesDate = orderDate >= oneMonthAgo;
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Table Columns
  const orderColumns = [
    {
      header: "Order ID",
      field: "id",
      render: (value) => (
        <span className="text-primary-600 dark:text-primary-400">#{value}</span>
      ),
    },
    {
      header: "Customer",
      field: "customer",
      render: (customer) => (
        <div>
          <div className="text-sm font-medium text-secondary-900 dark:text-white">
            {customer.name}
          </div>
          <div className="text-sm text-secondary-500 dark:text-secondary-400">
            {customer.email}
          </div>
        </div>
      ),
    },
    { header: "Date", field: "date" },
    {
      header: "Total",
      field: "total",
      render: (value) => `$${value.toFixed(2)}`,
    },
    {
      header: "Status",
      field: "status",
      render: (status) => (
        <Badge
          variant={
            status === "Delivered"
              ? "success"
              : status === "Processing"
              ? "primary"
              : status === "Shipped"
              ? "accent"
              : status === "Pending"
              ? "warning"
              : "danger"
          }
          rounded
        >
          {status}
        </Badge>
      ),
    },
    { header: "Items", field: "items" },
    {
      header: "Actions",
      field: "id",
      className: "text-right",
      render: (id) => (
        <Link
          to={`/orders/${id}`}
          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 flex items-center justify-end"
        >
          <FiEye className="h-4 w-4 mr-1" /> View
        </Link>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Orders
        </h1>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={FiSearch}
            className="w-full md:w-64"
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "Pending", label: "Pending" },
                { value: "Processing", label: "Processing" },
                { value: "Shipped", label: "Shipped" },
                { value: "Delivered", label: "Delivered" },
                { value: "Cancelled", label: "Cancelled" },
              ]}
              icon={FiFilter}
              className="w-full sm:w-40"
            />
            <Select
              id="date-range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={[
                { value: "all", label: "All Time" },
                { value: "today", label: "Today" },
                { value: "week", label: "Last 7 Days" },
                { value: "month", label: "Last 30 Days" },
              ]}
              icon={FiCalendar}
              className="w-full sm:w-40"
            />
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table
          columns={orderColumns}
          data={filteredOrders}
          loading={loading}
          emptyMessage="No orders found."
          footer={
            <div className="px-4 py-3 flex items-center justify-between border-t border-secondary-200 dark:border-secondary-700">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button variant="secondary">Previous</Button>
                <Button variant="secondary">Next</Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <p className="text-sm text-secondary-700 dark:text-secondary-400">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">{filteredOrders.length}</span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredOrders.length}</span>{" "}
                  results
                </p>
                <nav
                  className="relative z-0 inline-flex rounded-md -space-x-px"
                  aria-label="Pagination"
                >
                  <Button variant="secondary" className="rounded-l-md" disabled>
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                  >
                    1
                  </Button>
                  <Button variant="secondary" className="rounded-r-md" disabled>
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          }
        />
      </Card>
    </div>
  );
}
