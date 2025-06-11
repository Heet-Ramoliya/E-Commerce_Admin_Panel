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
    stock: "",
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [previewImages, setPreviewImages] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const categories = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          parentId: doc.data().parentId || null,
        }));
        setAllCategories(categories);
      },
      () => {
        toast.error("Failed to fetch categories.");
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
            name: data.name || "",
            description: data.description || "",
            price: data.price?.toString() || "",
            stock: data.stock?.toString() || "",
            images: [],
            category: data.category || "",
          });

          const categoryPath = [];
          let currentCategory = allCategories.find(
            (cat) => cat.name === data.category
          );
          while (currentCategory) {
            categoryPath.unshift(currentCategory.name);
            currentCategory = allCategories.find(
              (cat) => cat.id === currentCategory.parentId
            );
          }
          setSelectedCategories(categoryPath);

          if (data.imageUrls) {
            setPreviewImages(
              data.imageUrls.map((url, index) => ({
                url,
                name: `Image ${index + 1}`,
                existing: true,
              }))
            );
          }
        } else {
          toast.error("Product not found");
          navigate("/products");
        }
      } catch (error) {
        toast.error("Failed to fetch product");
        navigate("/products");
      } finally {
        setInitialLoading(false);
      }
    };

    if (allCategories.length > 0) {
      fetchProduct();
    }
  }, [id, navigate, allCategories]);

  const updateInput = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const updateCategory = (level, value) => {
    setSelectedCategories((prev) => {
      const newSelections = [...prev.slice(0, level), value];
      return newSelections;
    });
  };

  const getOptions = (level) => {
    if (level === 0) {
      return [
        { value: "", label: "Select Category" },
        ...allCategories
          .filter((cat) => cat.parentId === null)
          .map((cat) => ({ value: cat.name, label: cat.name })),
      ];
    }

    const parentName = selectedCategories[level - 1];
    const parent = allCategories.find((cat) => cat.name === parentName);
    if (!parent) return [{ value: "", label: "Select Subcategory" }];

    const subCategories = allCategories.filter(
      (cat) => cat.parentId === parent.id
    );
    if (!subCategories.length)
      return [{ value: "", label: "No Subcategories" }];

    return [
      { value: "", label: "Select Subcategory" },
      ...subCategories.map((cat) => ({ value: cat.name, label: cat.name })),
    ];
  };

  const getDropdowns = () => {
    const dropdowns = [];

    for (let level = 0; level <= selectedCategories.length; level++) {
      if (level > 0 && !selectedCategories[level - 1]) break;

      const options = getOptions(level);

      dropdowns.push({
        level,
        label: level === 0 ? "Category" : `Subcategory`,
        value: selectedCategories[level] || "",
        options,
      });

      if (selectedCategories[level]) {
        const currentCat = allCategories.find(
          (cat) => cat.name === selectedCategories[level]
        );
        const hasSubCategories = allCategories.some(
          (cat) => cat.parentId === currentCat?.id
        );
        if (!hasSubCategories) break;
      }
    }

    return dropdowns;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const maxSize = 10 * 1024 * 1024;
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`Image ${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    const newPreviews = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    const currentImages = previewImages.filter((img) => img.existing);
    setPreviewImages([...currentImages, ...newPreviews]);
    setProduct({ ...product, images: [...product.images, ...validFiles] });
  };

  const removeImage = (index) => {
    const updatedPreviews = [...previewImages];
    if (!updatedPreviews[index].existing) {
      URL.revokeObjectURL(updatedPreviews[index].url);
      const updatedImages = [...product.images];
      const imageIndex =
        index - previewImages.filter((img) => img.existing).length;
      updatedImages.splice(imageIndex, 1);
      setProduct({ ...product, images: updatedImages });
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
      !product.stock ||
      !selectedCategories[0]
    ) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const existingImageUrls = previewImages
        .filter((img) => img.existing)
        .map((img) => img.url);

      const newImageUrls = [];
      for (const image of product.images) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error("Image upload failed");
        newImageUrls.push(data.secure_url);
      }

      const allImageUrls = [...existingImageUrls, ...newImageUrls];

      const finalCategory =
        selectedCategories[selectedCategories.length - 1] ||
        selectedCategories[0];

      const productData = {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category: finalCategory,
        stock: parseInt(product.stock, 10),
        imageUrls: allImageUrls,
      };

      const productRef = doc(db, "products", id);
      await updateDoc(productRef, productData);

      toast.success("Product updated!");
      navigate("/products");
    } catch (error) {
      toast.error("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <Loading size="md" message="Loading product..." />;
  }

  return (
    <div className="p-6">
      {/* Title and Cancel Button */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Details */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              {/* Name */}
              <Input
                label="Product Name"
                id="name"
                name="name"
                type="text"
                value={product.name}
                onChange={updateInput}
                required
                placeholder="Enter product name"
                disabled={loading}
              />
              {/* Description */}
              <Input
                label="Description"
                id="description"
                name="description"
                type="textarea"
                value={product.description}
                onChange={updateInput}
                rows="4"
                placeholder="Enter product description"
                disabled={loading}
              />
              {/* Price and Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Price ($)"
                  id="price"
                  name="price"
                  type="number"
                  value={product.price}
                  onChange={updateInput}
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
                  onChange={updateInput}
                  required
                  min="0"
                  placeholder="0"
                  disabled={loading}
                />
              </div>
              {/* Category Dropdowns */}
              {getDropdowns().map((dropdown) => (
                <Select
                  key={dropdown.level}
                  label={dropdown.label}
                  id={`category-${dropdown.level}`}
                  name={`category-${dropdown.level}`}
                  value={dropdown.value}
                  onChange={(e) =>
                    updateCategory(dropdown.level, e.target.value)
                  }
                  options={dropdown.options}
                  required={dropdown.level === 0}
                  disabled={loading}
                />
              ))}
            </div>
          </Card>

          {/* Images */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Product Images
            </h2>
            <div className="space-y-4">
              {/* Upload Area */}
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
              {/* Image Previews */}
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

        {/* Save and Cancel Buttons */}
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
