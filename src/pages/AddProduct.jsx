import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSave, FiX, FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { Input, Select, Button, Card, Loading } from "../components";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../Config/Firebase";

export default function AddProduct() {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const categoryOptions = [
          { value: "", label: "Select Category" },
          ...categoriesData.map((category) => ({
            value: category.name,
            label: category.name,
          })),
        ];
        setCategories(categoryOptions);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({
      ...product,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const newPreviewImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setPreviewImages([...previewImages, ...newPreviewImages]);

    setProduct({
      ...product,
      images: [...product.images, ...files],
    });
  };

  const removeImage = (index) => {
    const updatedPreviews = [...previewImages];
    const updatedImages = [...product.images];

    URL.revokeObjectURL(previewImages[index].url);

    updatedPreviews.splice(index, 1);
    updatedImages.splice(index, 1);

    setPreviewImages(updatedPreviews);
    setProduct({
      ...product,
      images: updatedImages,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !product.name ||
      !product.price ||
      !product.stock ||
      !product.category
    ) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const imageUrls = [];

      for (const image of product.images) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", uploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || "Image upload failed");
        }

        imageUrls.push(data.secure_url);
      }

      const productData = {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category: product.category,
        stock: parseInt(product.stock, 10),
        imageUrls: imageUrls,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "products"), productData);

      toast.success("Product added successfully");
      navigate("/products");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Add New Product
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
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  rows={4}
                  className="
                    w-full rounded-md shadow-sm border
                    border-secondary-300 focus:border-primary-500 focus:ring-primary-500
                    bg-white dark:bg-secondary-800 dark:border-secondary-600 dark:text-white
                    py-2 px-3 text-sm
                    focus:outline-none focus:ring-2
                  "
                />
              </div>
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
                      <span className="cursor-pointer bg-gray-200 px-4 py-2 rounded dark:bg-secondary-600">
                        Upload Images
                      </span>
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
            {loading ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
