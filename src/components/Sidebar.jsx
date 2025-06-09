import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiX,
  FiHome,
  FiBox,
  FiTag,
  FiShoppingCart,
  FiUsers,
  FiLogOut,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});

  const menuItems = [
    {
      path: "/",
      name: "Dashboard",
      icon: <FiHome className="w-5 h-5" />,
    },
    {
      name: "Products",
      icon: <FiBox className="w-5 h-5" />,
      submenu: [
        { path: "/products", name: "All Products" },
        { path: "/products/add", name: "Add Product" },
      ],
    },
    {
      path: "/categories",
      name: "Categories",
      icon: <FiTag className="w-5 h-5" />,
    },
    {
      path: "/orders",
      name: "Orders",
      icon: <FiShoppingCart className="w-5 h-5" />,
    },
    {
      path: "/users",
      name: "Users",
      icon: <FiUsers className="w-5 h-5" />,
    },
  ];

  const toggleExpand = (name) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={`fixed top-0 left-0 z-40 h-full bg-white dark:bg-secondary-900 
      w-64 transform transition-transform duration-300 ease-in-out 
      ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 shadow-md`}
    >
      {/* Mobile Close Button */}
      <div className="md:hidden absolute right-3 top-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-secondary-200 dark:border-secondary-800 cursor-pointer">
        <span
          className="text-xl font-bold text-primary-600 dark:text-primary-400"
          onClick={() => navigate("/")}
        >
          E-Shop Admin
        </span>
      </div>

      {/* Menu Items */}
      <nav className="mt-5 px-3">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index} className="transition-all duration-200">
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-md 
                      hover:bg-secondary-100 dark:hover:bg-secondary-800 group 
                      transition-all duration-200 
                      ${
                        expandedMenus[item.name] ||
                        isActive(item.submenu[0].path)
                          ? "bg-secondary-100 dark:bg-secondary-800"
                          : ""
                      }`}
                  >
                    <div className="flex items-center">
                      <span className="text-secondary-600 dark:text-secondary-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {item.icon}
                      </span>
                      <span className="ml-3 text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {item.name}
                      </span>
                    </div>
                    {expandedMenus[item.name] ? (
                      <FiChevronUp className="w-4 h-4" />
                    ) : (
                      <FiChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {(expandedMenus[item.name] ||
                    item.submenu.some((subitem) => isActive(subitem.path))) && (
                    <ul className="pl-10 pr-3 py-2 space-y-1">
                      {item.submenu.map((subitem, subindex) => (
                        <li key={subindex}>
                          <Link
                            to={subitem.path}
                            className={`block px-3 py-2 rounded-md transition-all duration-200
                              ${
                                isActive(subitem.path)
                                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                                  : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 hover:text-primary-600 dark:hover:text-primary-400"
                              }`}
                            onClick={() =>
                              window.innerWidth < 768 && toggleSidebar()
                            }
                          >
                            {subitem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-md 
                    transition-all duration-200 group
                    ${
                      isActive(item.path)
                        ? "bg-primary-100 dark:bg-primary-900"
                        : "hover:bg-secondary-100 dark:hover:bg-secondary-800"
                    }`}
                  onClick={() => window.innerWidth < 768 && toggleSidebar()}
                >
                  <span
                    className={`${
                      isActive(item.path)
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-secondary-600 dark:text-secondary-300 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`ml-3 ${
                      isActive(item.path)
                        ? "text-primary-700 dark:text-primary-300 font-medium"
                        : "text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-5 w-full px-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 rounded-md 
            hover:bg-secondary-100 dark:hover:bg-secondary-800 
            text-secondary-700 dark:text-secondary-300 
            transition-all duration-200 group"
        >
          <FiLogOut className="w-5 h-5 text-secondary-600 dark:text-secondary-400 group-hover:text-error-600" />
          <span className="ml-3 group-hover:text-error-600">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
