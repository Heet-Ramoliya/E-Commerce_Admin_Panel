import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSave, FiX, FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { Input, Select, Button, Card, Loading } from "../components";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../Config/Firebase";

const AddProduct = () => {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const categories = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          parentId: doc.data().parentId || null,
        }));
        setAllCategories(categories);
        setLoading(false);
      },
      () => {
        toast.error("Failed to load categories.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

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
    let showNext = true;

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

  const addImages = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const previews = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setPreviewImages([...previewImages, ...previews]);
    setProduct({ ...product, images: [...product.images, ...files] });
  };

  const removeImage = (index) => {
    const newPreviews = [...previewImages];
    const newImages = [...product.images];

    URL.revokeObjectURL(previewImages[index].url);
    newPreviews.splice(index, 1);
    newImages.splice(index, 1);

    setPreviewImages(newPreviews);
    setProduct({ ...product, images: newImages });
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !product.name ||
      !product.price ||
      !product.stock ||
      !selectedCategories[0]
    ) {
      toast.error("Please fill all required fields");
      setLoading(false);
      return;
    }

    try {
      const imageUrls = [];
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
          { method: "POST", body: formData }
        );

        const data = await response.json();
        if (!response.ok) throw new Error("Image upload failed");
        imageUrls.push(data.secure_url);
      }

      const finalCategory =
        selectedCategories[selectedCategories.length - 1] ||
        selectedCategories[0];

      await addDoc(collection(db, "products"), {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category: finalCategory,
        stock: parseInt(product.stock, 10),
        imageUrls,
        createdAt: new Date(),
      });

      toast.success("Product added!");
      navigate("/products");
    } catch (error) {
      toast.error("Failed to add product.");
    }
    setLoading(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      {/* Title and Cancel Button */}
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

      {/* Form */}
      <form onSubmit={saveProduct} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Details */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Product Details
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
              />
              {/* Description */}
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
                  onChange={updateInput}
                  placeholder="Enter product description"
                  rows={4}
                  className="w-full rounded-md shadow-sm border border-secondary-300 focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-secondary-800 dark:border-secondary-600 dark:text-white py-2 px-3 text-sm focus:outline-none focus:ring-2"
                />
              </div>
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
                        onChange={addImages}
                        className="sr-only"
                      />
                    </label>
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
            {loading ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
