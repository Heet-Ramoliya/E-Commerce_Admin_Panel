import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { Card, Input, Select, Button, Badge, Modal } from "../components";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const mockProducts = [
        {
          id: "1",
          name: "Wireless Earbuds",
          category: "Electronics",
          price: 49.99,
          stock: 45,
          image:
            "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          featured: true,
        },
        {
          id: "2",
          name: "Smart Watch",
          category: "Electronics",
          price: 99.99,
          stock: 32,
          image:
            "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          featured: true,
        },
        {
          id: "3",
          name: "Bluetooth Speaker",
          category: "Electronics",
          price: 59.99,
          stock: 27,
          image:
            "https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          featured: false,
        },
        {
          id: "4",
          name: "Laptop Backpack",
          category: "Accessories",
          price: 39.99,
          stock: 54,
          image:
            "https://images.pexels.com/photos/1546003/pexels-photo-1546003.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          featured: false,
        },
        {
          id: "5",
          name: "Mechanical Keyboard",
          category: "Electronics",
          price: 79.99,
          stock: 18,
          image:
            "https://images.pexels.com/photos/3937174/pexels-photo-3937174.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          featured: false,
        },
        {
          id: "6",
          name: "HD Webcam",
          category: "Electronics",
          price: 49.99,
          stock: 23,
          image:
            "https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          featured: false,
        },
        {
          id: "7",
          name: "Desk Lamp",
          category: "Home",
          price: 29.99,
          stock: 42,
          image:
            "https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          featured: true,
        },
        {
          id: "8",
          name: "Water Bottle",
          category: "Lifestyle",
          price: 19.99,
          stock: 67,
          image:
            "https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          featured: false,
        },
      ];
      setProducts(mockProducts);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const deleteProduct = () => {
    setProducts(products.filter((p) => p.id !== productToDelete.id));
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === "price") {
        return sortDirection === "asc" ? a.price - b.price : b.price - a.price;
      } else if (sortField === "stock") {
        return sortDirection === "asc" ? a.stock - b.stock : b.stock - a.stock;
      }
      return 0;
    });

  // Get unique categories for filter
  const categories = [
    { value: "all", label: "All Categories" },
    ...[...new Set(products.map((product) => product.category))].map(
      (category) => ({
        value: category,
        label: category,
      })
    ),
  ];

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <FiChevronUp className="inline ml-1" />
    ) : (
      <FiChevronDown className="inline ml-1" />
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Products
        </h1>
        <Link to="/products/add">
          <Button variant="primary" icon={FiPlus}>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={FiSearch}
            className="w-full md:w-64"
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={categories}
              icon={FiFilter}
              className="w-full sm:w-40"
            />
            <Select
              id="sort-order"
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split("-");
                setSortField(field);
                setSortDirection(direction);
              }}
              options={[
                { value: "name-asc", label: "Name A-Z" },
                { value: "name-desc", label: "Name Z-A" },
                { value: "price-asc", label: "Price: Low to High" },
                { value: "price-desc", label: "Price: High to Low" },
                { value: "stock-asc", label: "Stock: Low to High" },
                { value: "stock-desc", label: "Stock: High to Low" },
              ]}
              className="w-full sm:w-40"
            />
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-secondary-600 dark:text-secondary-400">
            Loading products...
          </p>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-secondary-600 dark:text-secondary-400">
            No products found.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col">
              <div className="relative h-48 bg-secondary-100 dark:bg-secondary-700 rounded-t-lg overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.featured && (
                  <Badge
                    variant="accent"
                    className="absolute top-2 left-2 text-xs font-bold"
                    rounded
                  >
                    Featured
                  </Badge>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  {product.name}
                </h3>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-2">
                  {product.category}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    ${product.price.toFixed(2)}
                  </span>
                  <Badge
                    variant={
                      product.stock > 10
                        ? "success"
                        : product.stock > 0
                        ? "warning"
                        : "danger"
                    }
                    className="text-sm font-medium"
                  >
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link to={`/products/edit/${product.id}`} className="flex-1">
                    <Button
                      variant="secondary"
                      icon={FiEdit2}
                      className="w-full"
                    >
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    icon={FiTrash2}
                    onClick={() => confirmDelete(product)}
                    className="flex-1 w-full"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <p className="mb-6 text-secondary-600 dark:text-secondary-400">
          Are you sure you want to delete "{productToDelete?.name}"? This action
          cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteProduct}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
