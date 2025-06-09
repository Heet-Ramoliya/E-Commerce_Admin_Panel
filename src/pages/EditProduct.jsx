import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiSave, FiX, FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { Card, Input, Select, Button } from "../components";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    featured: false,
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [previewImages, setPreviewImages] = useState([]);

  // Available categories - would be fetched from Firebase in production
  const categories = [
    { value: "", label: "Select Category" },
    { value: "Electronics", label: "Electronics" },
    { value: "Accessories", label: "Accessories" },
    { value: "Home", label: "Home" },
    { value: "Lifestyle", label: "Lifestyle" },
    { value: "Clothing", label: "Clothing" },
  ];

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock product data - would be fetched from Firebase in production
        const mockProducts = [
          {
            id: "1",
            name: "Wireless Earbuds",
            description:
              "High-quality wireless earbuds with noise cancellation.",
            category: "Electronics",
            price: 49.99,
            stock: 45,
            featured: true,
            image:
              "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          },
          {
            id: "2",
            name: "Smart Watch",
            description: "Smart watch with health tracking features.",
            category: "Electronics",
            price: 99.99,
            stock: 32,
            featured: true,
            image:
              "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          },
        ];

        const foundProduct = mockProducts.find((p) => p.id === id);

        if (foundProduct) {
          setProduct({
            ...foundProduct,
            price: foundProduct.price.toString(),
            stock: foundProduct.stock.toString(),
            images: [],
          });

          if (foundProduct.image) {
            setPreviewImages([
              {
                url: foundProduct.image,
                name: "Current image",
                existing: true,
              },
            ]);
          }
        } else {
          toast.error("Product not found");
          navigate("/products");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to fetch product");
        navigate("/products");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({
      ...product,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const newPreviewImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    const currentImages = previewImages.filter((img) => img.existing);

    setPreviewImages([...currentImages, ...newPreviewImages]);

    setProduct({
      ...product,
      images: [...product.images, ...files],
    });
  };

  // Remove preview image
  const removeImage = (index) => {
    const updatedPreviews = [...previewImages];

    if (!updatedPreviews[index].existing) {
      URL.revokeObjectURL(updatedPreviews[index].url);
      const updatedImages = [...product.images];
      updatedImages.splice(index - (previewImages[0]?.existing ? 1 : 0), 1);
      setProduct({
        ...product,
        images: updatedImages,
      });
    }

    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !product.name ||
      !product.price ||
      !product.category ||
      !product.stock
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Product to update:", product);
      toast.success("Product updated successfully");
      navigate("/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-secondary-600 dark:text-secondary-400">
          Loading product...
        </p>
      </Card>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Edit Product
        </h1>
        <Button
          variant="secondary"
          onClick={() => navigate("/products")}
          icon={FiX}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <Input
                label="Product Name"
                id="name"
                name="name"
                type="text"
                value={product.name}
                onChange={handleChange}
                required
                placeholder="Enter product name"
              />
              <Input
                label="Description"
                id="description"
                name="description"
                type="textarea"
                value={product.description}
                onChange={handleChange}
                rows="4"
                placeholder="Enter product description"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Price ($)"
                  id="price"
                  name="price"
                  type="number"
                  value={product.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                <Input
                  label="Stock"
                  id="stock"
                  name="stock"
                  type="number"
                  value={product.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="0"
                />
              </div>
              <Select
                label="Category"
                id="category"
                name="category"
                value={product.category}
                onChange={handleChange}
                options={categories}
                required
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={product.featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label
                  htmlFor="featured"
                  className="ml-2 text-sm font-medium text-secondary-700 dark:text-secondary-300"
                >
                  Featured Product
                </label>
              </div>
            </div>
          </Card>

          {/* Product Images */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Product Images
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-lg p-4">
                <div className="text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-secondary-400" />
                  <div className="mt-2">
                    <label htmlFor="images">
                      <Button
                        variant="secondary"
                        as="span"
                        className="cursor-pointer"
                      >
                        Upload Images
                      </Button>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              {previewImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {previewImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-secondary-100 dark:bg-secondary-800">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="object-cover w-full h-32"
                        />
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                        icon={FiX}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/products")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            icon={FiSave}
          >
            {loading ? "Saving..." : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
