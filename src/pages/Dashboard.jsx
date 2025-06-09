import { useState, useEffect } from "react";
import {
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
  FiUsers,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, Select, Table, Badge } from "../components";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRecentOrders([
        {
          id: "1001",
          customer: "John Doe",
          date: "2023-11-25",
          total: "$129.99",
          status: "Delivered",
        },
        {
          id: "1002",
          customer: "Jane Smith",
          date: "2023-11-24",
          total: "$89.95",
          status: "Processing",
        },
        {
          id: "1003",
          customer: "Robert Johnson",
          date: "2023-11-24",
          total: "$45.50",
          status: "Shipped",
        },
        {
          id: "1004",
          customer: "Emily Davis",
          date: "2023-11-23",
          total: "$199.99",
          status: "Pending",
        },
        {
          id: "1005",
          customer: "Michael Wilson",
          date: "2023-11-23",
          total: "$74.99",
          status: "Delivered",
        },
      ]);
      setTopProducts([
        { id: "1", name: "Wireless Earbuds", sales: 145, revenue: "$7,250" },
        { id: "2", name: "Smart Watch", sales: 132, revenue: "$13,200" },
        { id: "3", name: "Bluetooth Speaker", sales: 97, revenue: "$4,850" },
        { id: "4", name: "Phone Case", sales: 89, revenue: "$1,780" },
        { id: "5", name: "USB-C Cable", sales: 76, revenue: "$1,140" },
      ]);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const salesData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Sales",
        data: [30, 40, 35, 50, 49, 60, 70, 91, 86, 95, 110, 120],
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14, 165, 233, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const categoryData = {
    labels: [
      "Electronics",
      "Clothing",
      "Accessories",
      "Home & Kitchen",
      "Books",
    ],
    datasets: [
      {
        label: "Revenue by Category",
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          "rgba(14, 165, 233, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const orderStatusData = {
    labels: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    datasets: [
      {
        label: "Orders by Status",
        data: [12, 19, 15, 45, 9],
        backgroundColor: [
          "rgba(245, 158, 11, 0.7)",
          "rgba(14, 165, 233, 0.7)",
          "rgba(168, 85, 247, 0.7)",
          "rgba(34, 197, 94, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: "#64748b",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(226, 232, 240, 0.5)",
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: "#64748b",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: "#64748b",
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: "#64748b",
        },
      },
    },
  };

  const orderColumns = [
    {
      header: "Order ID",
      field: "id",
      render: (value) => (
        <span className="text-primary-600 dark:text-primary-400">#{value}</span>
      ),
    },
    { header: "Customer", field: "customer" },
    { header: "Date", field: "date" },
    { header: "Total", field: "total" },
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
  ];

  const productColumns = [
    { header: "Product", field: "name" },
    { header: "Units Sold", field: "sales" },
    { header: "Revenue", field: "revenue" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Dashboard
        </h1>
        <Select
          id="time-range"
          value="Last 30 days"
          options={[
            { value: "Last 30 days", label: "Last 30 days" },
            { value: "Last 7 days", label: "Last 7 days" },
            { value: "Last 90 days", label: "Last 90 days" },
            { value: "This Year", label: "This Year" },
          ]}
          onChange={() => {}}
          className="w-40"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
              Total Products
            </h3>
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <FiPackage className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-semibold text-secondary-900 dark:text-white">
                2,509
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs font-medium flex items-center text-success-600">
                  <FiArrowUp className="mr-1" /> 12.5%
                </span>
                <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-1">
                  vs last month
                </span>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
              Total Orders
            </h3>
            <div className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30">
              <FiShoppingCart className="h-5 w-5 text-accent-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-semibold text-secondary-900 dark:text-white">
                1,245
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs font-medium flex items-center text-success-600">
                  <FiArrowUp className="mr-1" /> 8.2%
                </span>
                <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-1">
                  vs last month
                </span>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
              Total Revenue
            </h3>
            <div className="p-2 rounded-lg bg-success-100 dark:bg-success-900/30">
              <FiDollarSign className="h-5 w-5 text-success-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-semibold text-secondary-900 dark:text-white">
                $48,295
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs font-medium flex items-center text-success-600">
                  <FiArrowUp className="mr-1" /> 5.4%
                </span>
                <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-1">
                  vs last month
                </span>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
              Total Customers
            </h3>
            <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-900/30">
              <FiUsers className="h-5 w-5 text-warning-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-semibold text-secondary-900 dark:text-white">
                892
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs font-medium flex items-center text-error-600">
                  <FiArrowDown className="mr-1" /> 2.8%
                </span>
                <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-1">
                  vs last month
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            Sales Overview
          </h3>
          <div className="h-80">
            <Line data={salesData} options={chartOptions} />
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            Revenue by Category
          </h3>
          <div className="h-80">
            <Bar data={categoryData} options={chartOptions} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <Card className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
              Recent Orders
            </h3>
            <a
              href="/orders"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View All
            </a>
          </div>
          <Table
            columns={orderColumns}
            data={recentOrders}
            emptyMessage="No orders found"
            loading={recentOrders.length === 0}
          />
        </Card>

        {/* Orders by Status */}
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            Orders by Status
          </h3>
          <div className="h-64">
            <Doughnut data={orderStatusData} options={doughnutOptions} />
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
            Top Selling Products
          </h3>
          <a
            href="/products"
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            View All Products
          </a>
        </div>
        <Table
          columns={productColumns}
          data={topProducts}
          emptyMessage="No products found"
          loading={topProducts.length === 0}
        />
      </Card>
    </div>
  );
}
