import { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiMail, FiEdit2, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  Card,
  Input,
  Select,
  Button,
  Table,
  Badge,
  Modal,
} from "../components";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const mockUsers = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          role: "Customer",
          orders: 8,
          lastLogin: "2023-11-25",
          avatar:
            "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          role: "Customer",
          orders: 5,
          lastLogin: "2023-11-24",
          avatar:
            "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
        },
        {
          id: "3",
          name: "Mike Johnson",
          email: "mike@example.com",
          role: "Admin",
          orders: 0,
          lastLogin: "2023-11-25",
          avatar:
            "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
        },
        {
          id: "4",
          name: "Sarah Williams",
          email: "sarah@example.com",
          role: "Customer",
          orders: 12,
          lastLogin: "2023-11-22",
          avatar:
            "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
        },
        {
          id: "5",
          name: "David Miller",
          email: "david@example.com",
          role: "Customer",
          orders: 3,
          lastLogin: "2023-11-20",
          avatar:
            "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg",
        },
        {
          id: "6",
          name: "Emily Davis",
          email: "emily@example.com",
          role: "Support",
          orders: 0,
          lastLogin: "2023-11-23",
          avatar:
            "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg",
        },
        {
          id: "7",
          name: "Robert Brown",
          email: "robert@example.com",
          role: "Customer",
          orders: 7,
          lastLogin: "2023-11-21",
          avatar:
            "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg",
        },
        {
          id: "8",
          name: "Lisa Anderson",
          email: "lisa@example.com",
          role: "Support",
          orders: 0,
          lastLogin: "2023-11-24",
          avatar:
            "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
        },
      ];
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle delete confirmation
  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Handle delete user
  const deleteUser = () => {
    setUsers(users.filter((u) => u.id !== userToDelete.id));
    setShowDeleteModal(false);
    setUserToDelete(null);
    toast.success("User deleted successfully");
  };

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Get unique roles for filter
  const roles = [
    { value: "all", label: "All Roles" },
    ...[...new Set(users.map((user) => user.role))].map((role) => ({
      value: role,
      label: role,
    })),
  ];

  // Table Columns
  const userColumns = [
    {
      header: "User",
      field: "name",
      render: (name, user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={user.avatar}
              alt={name}
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-secondary-900 dark:text-white">
              {name}
            </div>
            <div className="text-sm text-secondary-500 dark:text-secondary-400">
              ID: {user.id}
            </div>
          </div>
        </div>
      ),
    },
    { header: "Email", field: "email" },
    {
      header: "Role",
      field: "role",
      render: (role) => (
        <Badge
          variant={
            role === "Admin"
              ? "primary"
              : role === "Support"
              ? "accent"
              : "secondary"
          }
          rounded
        >
          {role}
        </Badge>
      ),
    },
    { header: "Orders", field: "orders" },
    { header: "Last Login", field: "lastLogin" },
    {
      header: "Actions",
      field: "id",
      className: "text-right",
      render: (_, user) => (
        <div className="flex justify-end space-x-3">
          <Button
            variant="ghost"
            icon={FiMail}
            onClick={() =>
              toast.info(
                "Email functionality will be implemented with Firebase"
              )
            }
            title="Send Email"
          />
          <Button
            variant="ghost"
            icon={FiEdit2}
            onClick={() =>
              toast.info("Edit functionality will be implemented with Firebase")
            }
            title="Edit User"
          />
          <Button
            variant="ghost"
            icon={FiTrash2}
            onClick={() => confirmDelete(user)}
            title="Delete User"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Users
        </h1>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={FiSearch}
            className="w-full md:w-64"
          />
          <Select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={roles}
            icon={FiFilter}
            className="w-full md:w-40"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={userColumns}
          data={filteredUsers}
          loading={loading}
          emptyMessage="No users found."
          footer={
            <div className="px-4 py-3 flex items-center justify-between border-t border-secondary-200 dark:border-secondary-700">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button variant="secondary">Previous</Button>
                <Button variant="secondary">Next</Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <p className="text-sm text-secondary-700 dark:text-secondary-400">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">{filteredUsers.length}</span> of{" "}
                  <span className="font-medium">{filteredUsers.length}</span>{" "}
                  results
                </p>
                <nav
                  className="relative z-0 inline-flex rounded-md -space-x-px"
                  aria-label="Pagination"
                >
                  <Button variant="secondary" className="rounded-l-md" disabled>
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                  >
                    1
                  </Button>
                  <Button variant="secondary" className="rounded-r-md" disabled>
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          }
        />
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <p className="mb-6 text-secondary-600 dark:text-secondary-400">
          Are you sure you want to delete the user "{userToDelete?.name}"? This
          action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteUser}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
