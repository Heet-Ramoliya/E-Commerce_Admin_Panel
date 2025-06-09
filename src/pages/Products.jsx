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
import {
  Card,
  Input,
  Select,
  Button,
  Badge,
  Modal,
  Loading,
} from "../components";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../Config/Firebase";
import { toast } from "react-toastify";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("Failed to fetch products.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
      const imagePublicIds = (productToDelete.imageUrls || []).map((url) => {
        const parts = url.split("/");
        const fileName = parts[parts.length - 1].split(".")[0];
        return `products/${productToDelete.id}/${fileName}`;
      });

      for (const publicId of imagePublicIds) {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
        const signature = await crypto.subtle.digest(
          "SHA-1",
          new TextEncoder().encode(stringToSign)
        );
        const signatureHex = Array.from(new Uint8Array(signature))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        const formData = new FormData();
        formData.append("public_id", publicId);
        formData.append("signature", signatureHex);
        formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);
        formData.append("timestamp", timestamp);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (!response.ok) {
          console.error(`Failed to delete image ${publicId}:`, data);
        }
      }

      const productRef = doc(db, "products", productToDelete.id);
      await deleteDoc(productRef);

      setProducts(products.filter((p) => p.id !== productToDelete.id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product. Please try again.");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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
          : b.name.localeCompare(b.name);
      } else if (sortField === "price") {
        return sortDirection === "asc" ? a.price - b.price : b.price - a.price;
      } else if (sortField === "stock") {
        return sortDirection === "asc" ? a.stock - b.stock : b.stock - a.stock;
      }
      return 0;
    });

  const categories = [
    { value: "all", label: "All Categories" },
    ...[...new Set(products.map((product) => product.category))].map(
      (category) => ({
        value: category,
        label: category,
      })
    ),
  ];

  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <FiChevronUp className="inline ml-1" />
    ) : (
      <FiChevronDown className="inline ml-1" />
    );
  };

  if (loading) {
    return <Loading size="md" message="Loading products..." />;
  }

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

      {filteredProducts.length === 0 ? (
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
                  src={
                    product.imageUrls && product.imageUrls.length > 0
                      ? product.imageUrls[0]
                      : "https://via.placeholder.com/150"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
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
                      disabled={deleteLoading}
                    >
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    icon={FiTrash2}
                    onClick={() => confirmDelete(product)}
                    className="flex-1 w-full"
                    disabled={deleteLoading}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={deleteProduct}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
