import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiSave, FiX, FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { Card, Input, Select, Button, Loading } from "../components";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../Config/Firebase";

const EditProduct = () => {
  const { id } = useParams();
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [previewImages, setPreviewImages] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setCategories(categoriesData);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("Failed to fetch categories.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setInitialLoading(true);
      try {
        const productRef = doc(db, "products", id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const data = productSnap.data();
          setProduct({
            ...data,
            price: data.price?.toString() || "",
            stock: data.stock?.toString() || "",
            images: [],
            category: data.category || "",
          });

          if (data.imageUrls) {
            setPreviewImages(
              data.imageUrls.map((url, index) => ({
                url,
                name: `Image ${index + 1}`,
                existing: true,
              }))
            );
          } else {
            setPreviewImages([]);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024;
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`Image ${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newPreviewImages = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    const currentImages = previewImages.filter((img) => img.existing);

    setPreviewImages([...currentImages, ...newPreviewImages]);

    setProduct({
      ...product,
      images: [...product.images, ...validFiles],
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !product.name ||
      !product.price ||
      !product.category ||
      !product.stock
    ) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const existingImageUrls = previewImages
        .filter((img) => img.existing)
        .map((img) => img.url);

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const newImageUrls = [];

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

        newImageUrls.push(data.secure_url);
      }

      const allImageUrls = [...existingImageUrls, ...newImageUrls];

      const productData = {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category: product.category,
        stock: parseInt(product.stock, 10),
        imageUrls: allImageUrls,
      };

      const productRef = doc(db, "products", id);
      await updateDoc(productRef, productData);

      toast.success("Product updated successfully");
      navigate("/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map((category) => ({
    value: category.name,
    label: category.name,
  }));

  if (initialLoading) {
    return <Loading size="md" message="Loading product..." />;
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
          disabled={loading}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                disabled={loading}
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
                disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <Select
                label="Category"
                id="category"
                name="category"
                value={product.category}
                onChange={handleChange}
                options={categoryOptions}
                required
                disabled={loading}
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Product Images
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-lg p-4">
                <div className="text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-secondary-400" />
                  <div className="mt-2">
                    <label
                      htmlFor="images"
                      className="inline-block cursor-pointer"
                    >
                      <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        Upload Images
                      </span>
                    </label>
                    <input
                      id="images"
                      name="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                      disabled={loading}
                    />
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
                        disabled={loading}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

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
};

export default EditProduct;
