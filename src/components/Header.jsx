import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiSun, FiMoon, FiBell } from "react-icons/fi";
import { RiAdminFill, RiAdminLine } from "react-icons/ri";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const Header = ({ toggleSidebar }) => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 h-16 flex items-center px-4 sticky top-0 z-30">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 rounded-md text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800"
      >
        <FiMenu className="w-6 h-6" />
      </button>

      {/* Spacer */}
      <div className="flex-grow md:ml-64"></div>

      {/* Right Side Menu */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800 
            transition-all duration-200"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <FiSun className="w-5 h-5 text-yellow-400" />
          ) : (
            <FiMoon className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800 
              transition-all duration-200 relative"
            aria-label="Notifications"
          >
            <FiBell className="w-5 h-5" />
            <span className="absolute top-0 right-0 h-4 w-4 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-secondary-800 rounded-md shadow-lg py-1 z-50 border border-secondary-200 dark:border-secondary-700">
              <div className="px-4 py-2 border-b border-secondary-200 dark:border-secondary-700">
                <h3 className="text-sm font-medium text-secondary-900 dark:text-white">
                  Notifications
                </h3>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="px-4 py-3 hover:bg-secondary-50 dark:hover:bg-secondary-700 border-b border-secondary-200 dark:border-secondary-700 last:border-b-0"
                  >
                    <p className="text-sm font-medium text-secondary-900 dark:text-white">
                      New order received
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                      Order #{1000 + item} has been placed
                    </p>
                    <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
                      10 minutes ago
                    </p>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 border-t border-secondary-200 dark:border-secondary-700">
                <a
                  href="#"
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View all notifications
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center"
          >
            <div className="p-1 rounded-full object-cover border-2 border-secondary-200 dark:border-secondary-700">
              {theme === "dark" ? (
                <RiAdminLine className="w-5 h-5" />
              ) : (
                <RiAdminFill className="w-5 h-5" />
              )}
            </div>

            <span className="ml-2 text-sm font-medium text-secondary-900 dark:text-white hidden sm:block">
              {currentUser?.name}
            </span>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-md shadow-lg py-1 z-50 border border-secondary-200 dark:border-secondary-700">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                onClick={() => setShowProfileMenu(false)}
              >
                Your Profile
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                onClick={() => setShowProfileMenu(false)}
              >
                Settings
              </Link>
              <div className="border-t border-secondary-200 dark:border-secondary-700 my-1"></div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  // Handle logout
                }}
                className="block w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-secondary-100 dark:hover:bg-secondary-700"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
