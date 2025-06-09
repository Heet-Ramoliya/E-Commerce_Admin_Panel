import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import { Input, Button, Card, Modal, Loading } from "../components";
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
  const [currentCategory, setCurrentCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [searchTerm, setSearchTerm] = useState("");

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

  const openEditModal = (category) => {
    setCurrentCategory(category);
    setNewCategory({
      name: category.name,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category) => {
    setCurrentCategory(category);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({
      ...newCategory,
      [name]: value,
    });
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
        toast.error("Category name already exists.");
        return;
      }

      await addDoc(collection(db, "categories"), {
        name: nameFormatted,
      });
      toast.success("Successfully added category.");
      setShowAddModal(false);
      setNewCategory({ name: "" });
    } catch (error) {
      toast.error("Failed to add category.");
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
        toast.error("Category name already exists.");
        return;
      }

      await updateDoc(doc(db, "categories", currentCategory.id), {
        name: nameFormatted,
      });
      toast.success("Successfully updated category.");
      setShowEditModal(false);
      setCurrentCategory(null);
      setNewCategory({ name: "" });
    } catch (error) {
      toast.error("Failed to update category.");
      console.error(error);
    }
  };

  const deleteCategory = async () => {
    try {
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
        >
          Add Category
        </Button>
      </div>
      {/* Search */}
      <Card className="mb-6">
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={FiSearch}
          className="w-full md:w-64"
        />
      </Card>
      {/* Categories Table  */}
      {loading ? (
        <Loading size="md" message="Loading categories..." />
      ) : filteredCategories.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-secondary-600 dark:text-secondary-400">
            No categories found.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-200">
                  #
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-200">
                  Name
                </th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-secondary-700 dark:text-secondary-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category, idx) => (
                <tr
                  key={category.id}
                  className={
                    idx === filteredCategories.length - 1
                      ? ""
                      : "border-b border-secondary-100 dark:border-secondary-700"
                  }
                >
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{category.name}</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <Button
                      variant="secondary"
                      icon={FiEdit2}
                      size="sm"
                      onClick={() => openEditModal(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      icon={FiTrash2}
                      size="sm"
                      onClick={() => openDeleteModal(category)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewCategory({ name: "" });
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
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddModal(false);
              setNewCategory({ name: "" });
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={addCategory}>
            Add Category
          </Button>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setCurrentCategory(null);
          setNewCategory({ name: "" });
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
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setShowEditModal(false);
              setCurrentCategory(null);
              setNewCategory({ name: "" });
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={updateCategory}>
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
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={deleteCategory}>
                Delete
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
