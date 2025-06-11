import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiFilter, FiEye, FiCalendar } from "react-icons/fi";
import { Card, Input, Select, Button, Table, Badge } from "../components";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../Config/Firebase";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [debouncedSearch] = useDebounce(searchQuery, 300);

  // Fetch orders from Firestore and convert createdAt to date
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.createdAt
              ? new Date(data.createdAt.seconds * 1000)
                  .toISOString()
                  .split("T")[0]
              : null,
          };
        });
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Filter orders based on search, status, and date range
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.id || "").includes(debouncedSearch) ||
      `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`
        .toLowerCase()
        .trim()
        .includes(debouncedSearch.toLowerCase()) ||
      (order.customer?.email || "")
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    let matchesDate = true;
    const orderDate = order.date ? new Date(order.date) : null;
    const today = new Date();
    if (dateRange === "today") {
      matchesDate =
        orderDate &&
        orderDate.toISOString().split("T")[0] ===
          today.toISOString().split("T")[0];
    } else if (dateRange === "week") {
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      matchesDate = orderDate && orderDate >= oneWeekAgo;
    } else if (dateRange === "month") {
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(today.getMonth() - 1);
      matchesDate = orderDate && orderDate >= oneMonthAgo;
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Paginate filtered orders
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  // Table columns configuration
  const orderColumns = [
    {
      header: "Order ID",
      field: "id",
      render: (value) => (
        <span className="text-primary-600 dark:text-primary-400">
          #{value || "N/A"}
        </span>
      ),
    },
    {
      header: "Customer",
      field: "customer",
      render: (customer) => (
        <div>
          <div className="text-sm font-medium text-secondary-900 dark:text-white">
            {customer
              ? `${customer.firstName || ""} ${
                  customer.lastName || ""
                }`.trim() || "N/A"
              : "N/A"}
          </div>
          <div className="text-sm text-secondary-500 dark:text-secondary-400">
            {customer?.email || "N/A"}
          </div>
        </div>
      ),
    },
    {
      header: "Date",
      field: "date",
      render: (value) => (value ? value : "N/A"),
    },
    {
      header: "Total",
      field: "total",
      render: (value) =>
        typeof value === "number" ? `$${value.toFixed(2)}` : "N/A",
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
          {status || "Unknown"}
        </Badge>
      ),
    },
    {
      header: "Items",
      field: "items",
      render: (items, row) => {
        console.log("Rendering items for row:", row.id, items); // Debug log
        return Array.isArray(items)
          ? `${items.length} item${items.length !== 1 ? "s" : ""}`
          : "0 items";
      },
    },
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          data={paginatedOrders}
          loading={loading}
          emptyMessage="No orders found."
          className="border-none"
        />
        <div className="px-4 py-3 flex items-center justify-between border-t border-secondary-200 dark:border-secondary-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <p className="text-sm text-secondary-700 dark:text-secondary-400">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, filteredOrders.length)}
              </span>{" "}
              of <span className="font-medium">{filteredOrders.length}</span>{" "}
              results
            </p>
            <nav
              className="relative z-0 inline-flex rounded-md -space-x-px"
              aria-label="Pagination"
            >
              <Button
                variant="secondary"
                className="rounded-l-md"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index + 1}
                  variant={currentPage === index + 1 ? "primary" : "secondary"}
                  className={
                    currentPage === index + 1
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                      : ""
                  }
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
              <Button
                variant="secondary"
                className="rounded-r-md"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </nav>
          </div>
        </div>
      </Card>
    </div>
  );
}
