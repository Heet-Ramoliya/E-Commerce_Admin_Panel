import { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  Input,
  Button,
  Card,
  Modal,
  Loading,
  UploadWidget,
} from "../components";
import { db } from "../Config/Firebase";
import {
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "", imageUrl: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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

  const toggleExpand = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const openEditModal = (category) => {
    setCurrentCategory(category);
    setNewCategory({
      name: category.name,
      imageUrl: category.imageUrl || "",
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category) => {
    setCurrentCategory(category);
    setShowDeleteModal(true);
  };

  const openAddSubModal = (category) => {
    setCurrentCategory(category);
    setNewCategory({ name: "", imageUrl: "" });
    setShowAddSubModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({
      ...newCategory,
      [name]: value,
    });
  };

  // Handle image upload success
  const handleImageUpload = (imageUrl) => {
    setNewCategory((prev) => ({ ...prev, imageUrl }));
    setIsUploading(false); // Reset upload status
  };

  // Handle upload start
  const handleUploadStart = () => {
    setIsUploading(true);
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setNewCategory((prev) => ({ ...prev, imageUrl: "" }));
    setIsUploading(false);
  };

  const addCategory = async () => {
    try {
      const nameTrimmed = newCategory.name.trim();
      if (!nameTrimmed) {
        toast.error("Category name cannot be empty.");
        return;
      }

      const nameFormatted =
        nameTrimmed.charAt(0).toUpperCase() +
        nameTrimmed.slice(1).toLowerCase();

      const q = query(
        collection(db, "categories"),
        where("name", "==", nameFormatted)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.error("Category name already exists in the system.");
        return;
      }

      await addDoc(collection(db, "categories"), {
        name: nameFormatted,
        imageUrl: newCategory.imageUrl || "",
        parentId: null,
      });
      toast.success("Successfully added category.");
      setShowAddModal(false);
      setNewCategory({ name: "", imageUrl: "" });
      setIsUploading(false);
    } catch (error) {
      toast.error("Failed to add category.");
      console.error(error);
    }
  };

  const addSubCategory = async () => {
    try {
      const nameTrimmed = newCategory.name.trim();
      if (!nameTrimmed) {
        toast.error("Subcategory name cannot be empty.");
        return;
      }

      const nameFormatted =
        nameTrimmed.charAt(0).toUpperCase() +
        nameTrimmed.slice(1).toLowerCase();

      const q = query(
        collection(db, "categories"),
        where("name", "==", nameFormatted)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.error("Category name already exists in the system.");
        return;
      }

      await addDoc(collection(db, "categories"), {
        name: nameFormatted,
        imageUrl: newCategory.imageUrl || "",
        parentId: currentCategory.id,
      });
      toast.success("Successfully added subcategory.");
      setShowAddSubModal(false);
      setNewCategory({ name: "", imageUrl: "" });
      setCurrentCategory(null);
      setIsUploading(false);
    } catch (error) {
      toast.error("Failed to add subcategory.");
      console.error(error);
    }
  };

  const updateCategory = async () => {
    try {
      const nameTrimmed = newCategory.name.trim();
      if (!nameTrimmed) {
        toast.error("Category name cannot be empty.");
        return;
      }

      const nameFormatted =
        nameTrimmed.charAt(0).toUpperCase() +
        nameTrimmed.slice(1).toLowerCase();

      const q = query(
        collection(db, "categories"),
        where("name", "==", nameFormatted)
      );
      const querySnapshot = await getDocs(q);

      if (
        !querySnapshot.empty &&
        querySnapshot.docs.some((doc) => doc.id !== currentCategory.id)
      ) {
        toast.error("Category name already exists in the system.");
        return;
      }

      await updateDoc(doc(db, "categories", currentCategory.id), {
        name: nameFormatted,
        imageUrl: newCategory.imageUrl || "",
      });
      toast.success("Successfully updated category.");
      setShowEditModal(false);
      setCurrentCategory(null);
      setNewCategory({ name: "", imageUrl: "" });
      setIsUploading(false);
    } catch (error) {
      toast.error("Failed to update category.");
      console.error(error);
    }
  };

  const deleteCategory = async () => {
    try {
      const subCategoriesQuery = query(
        collection(db, "categories"),
        where("parentId", "==", currentCategory.id)
      );
      const subCategoriesSnapshot = await getDocs(subCategoriesQuery);
      if (!subCategoriesSnapshot.empty) {
        toast.error("Cannot delete category with subcategories.");
        return;
      }

      await deleteDoc(doc(db, "categories", currentCategory.id));
      toast.success("Successfully deleted category.");
      setShowDeleteModal(false);
      setCurrentCategory(null);
    } catch (error) {
      toast.error("Failed to delete category.");
      console.error(error);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const buildCategoryTree = (categories, parentId = null, level = 0) => {
    return categories
      .filter((category) => category.parentId === parentId)
      .map((category) => {
        const subCategories = buildCategoryTree(
          categories,
          category.id,
          level + 1
        );
        return {
          ...category,
          subCategories,
          level,
        };
      });
  };

  const categoryTree = buildCategoryTree(filteredCategories);

  const renderCategoryRow = (category, idx) => (
    <tr
      key={category.id}
      className={`hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors ${
        idx === categoryTree.flatMap((c) => [c, ...c.subCategories]).length - 1
          ? ""
          : "border-b border-secondary-100 dark:border-secondary-700"
      } ${category.level > 0 ? "bg-secondary-50 dark:bg-secondary-900" : ""}`}
    >
      <td className="px-4 py-3">{idx + 1}</td>
      <td className="px-4 py-3">
        <div className="flex items-center relative">
          <span
            style={{ paddingLeft: `${category.level * 24}px` }}
            className={`flex items-center ${
              category.level > 0
                ? "text-secondary-600 dark:text-secondary-400 text-sm"
                : "text-secondary-900 dark:text-white font-medium"
            }`}
          >
            {category.level > 0 && (
              <span
                className="absolute left-0 h-full w-0.5 bg-secondary-300 dark:bg-secondary-600"
                style={{ left: `${category.level * 24 - 12}px` }}
              />
            )}
            {category.subCategories.length > 0 && (
              <FiChevronDown
                className={`mr-2 cursor-pointer transform transition-transform duration-200 ${
                  expandedCategories[category.id] ? "rotate-0" : "-rotate-90"
                } text-secondary-500 dark:text-secondary-400`}
                onClick={() => toggleExpand(category.id)}
              />
            )}
            {category.imageUrl && (
              <img
                src={`${category.imageUrl}?w=32&h=32&f=auto&q=80`}
                alt={category.name}
                className="w-8 h-8 object-cover rounded mr-2"
              />
            )}
            {category.name}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right space-x-2">
        <Button
          variant="secondary"
          icon={FiPlus}
          size="sm"
          onClick={() => openAddSubModal(category)}
          className="hover:bg-primary-600 hover:text-white transition-colors"
        >
          Add Sub
        </Button>
        <Button
          variant="secondary"
          icon={FiEdit2}
          size="sm"
          onClick={() => openEditModal(category)}
          className="hover:bg-primary-600 hover:text-white transition-colors"
        >
          Edit
        </Button>
        <Button
          variant="danger"
          icon={FiTrash2}
          size="sm"
          onClick={() => openDeleteModal(category)}
          className="hover:bg-red-700 transition-colors"
        >
          Delete
        </Button>
      </td>
    </tr>
  );

  const renderCategories = (categories, startIdx = 0) => {
    let idx = startIdx;
    return categories.flatMap((category) => {
      idx++;
      const rows = [renderCategoryRow(category, idx - 1)];
      if (
        expandedCategories[category.id] &&
        category.subCategories.length > 0
      ) {
        const subRows = renderCategories(category.subCategories, idx);
        idx += subRows.length;
        rows.push(...subRows);
      }
      return rows;
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Categories
        </h1>
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => setShowAddModal(true)}
          className="hover:bg-primary-600 transition-colors"
        >
          Add Category
        </Button>
      </div>
      <Card className="mb-6">
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={FiSearch}
          className="w-full md:w-64"
        />
      </Card>
      {loading ? (
        <Loading size="md" message="Loading categories..." />
      ) : categoryTree.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-secondary-600 dark:text-secondary-400">
            No categories found.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto shadow-sm">
          <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-200">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-200">
                  Name
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-secondary-700 dark:text-secondary-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>{renderCategories(categoryTree)}</tbody>
          </table>
        </Card>
      )}
      {/* Add Main Category Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewCategory({ name: "", imageUrl: "" });
          setIsUploading(false);
        }}
        title="Add New Category"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            id="name"
            name="name"
            type="text"
            value={newCategory.name}
            onChange={handleInputChange}
            required
            placeholder="Enter category name"
            disabled={isUploading}
          />
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-200 mb-1">
              Category Image
            </label>
            <div className="flex items-center space-x-3">
              {!newCategory.imageUrl && (
                <UploadWidget
                  onUploadSuccess={handleImageUpload}
                  onUploadStart={handleUploadStart}
                />
              )}
              {newCategory.imageUrl && (
                <>
                  <img
                    src={`${newCategory.imageUrl}?w=64&h=64&f=auto&q=80`}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="hover:bg-red-700 transition-colors"
                    disabled={isUploading}
                  >
                    Remove Image
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddModal(false);
              setNewCategory({ name: "", imageUrl: "" });
              setIsUploading(false);
            }}
            className="hover:bg-gray-400 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={addCategory}
            className="hover:bg-primary-600 transition-colors"
            disabled={isUploading}
          >
            Add Category
          </Button>
        </div>
      </Modal>
      {/* Add Subcategory Modal */}
      <Modal
        isOpen={showAddSubModal}
        onClose={() => {
          setShowAddSubModal(false);
          setNewCategory({ name: "", imageUrl: "" });
          setCurrentCategory(null);
          setIsUploading(false);
        }}
        title={`Add Subcategory to ${currentCategory?.name || ""}`}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Subcategory Name"
            id="sub-name"
            name="name"
            type="text"
            value={newCategory.name}
            onChange={handleInputChange}
            required
            placeholder="Enter subcategory name"
            disabled={isUploading}
          />
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-200 mb-1">
              Subcategory Image
            </label>
            <div className="flex items-center space-x-3">
              {!newCategory.imageUrl && (
                <UploadWidget
                  onUploadSuccess={handleImageUpload}
                  onUploadStart={handleUploadStart}
                />
              )}
              {newCategory.imageUrl && (
                <>
                  <img
                    src={`${newCategory.imageUrl}?w=64&h=64&f=auto&q=80`}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="hover:bg-red-700 transition-colors"
                    disabled={isUploading}
                  >
                    Remove Image
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddSubModal(false);
              setNewCategory({ name: "", imageUrl: "" });
              setCurrentCategory(null);
              setIsUploading(false);
            }}
            className="hover:bg-gray-400 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={addSubCategory}
            className="hover:bg-primary-600 transition-colors"
            disabled={isUploading}
          >
            Add Subcategory
          </Button>
        </div>
      </Modal>
      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setCurrentCategory(null);
          setNewCategory({ name: "", imageUrl: "" });
          setIsUploading(false);
        }}
        title="Edit Category"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            id="edit-name"
            name="name"
            type="text"
            value={newCategory.name}
            onChange={handleInputChange}
            required
            placeholder="Enter category name"
            disabled={isUploading}
          />
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-200 mb-1">
              Category Image
            </label>
            <div className="flex items-center space-x-3">
              {!newCategory.imageUrl && (
                <UploadWidget
                  onUploadSuccess={handleImageUpload}
                  onUploadStart={handleUploadStart}
                />
              )}
              {newCategory.imageUrl && (
                <>
                  <img
                    src={`${newCategory.imageUrl}?w=64&h=64&f=auto&q=80`}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="hover:bg-red-700 transition-colors"
                    disabled={isUploading}
                  >
                    Remove Image
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setShowEditModal(false);
              setCurrentCategory(null);
              setNewCategory({ name: "", imageUrl: "" });
              setIsUploading(false);
            }}
            className="hover:bg-gray-200 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={updateCategory}
            className="hover:bg-primary-600 transition-colors"
            disabled={isUploading}
          >
            Update Category
          </Button>
        </div>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCurrentCategory(null);
        }}
        title="Confirm Delete"
        size="md"
      >
        {currentCategory && (
          <>
            <p className="mb-6 text-secondary-600 dark:text-secondary-400">
              Are you sure you want to delete the category "
              {currentCategory.name}"?
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCurrentCategory(null);
                }}
                className="hover:bg-gray-400 transition-colors"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={deleteCategory}
                className="hover:bg-red-700 transition-colors"
              >
                Delete
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
