import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header, Sidebar } from "../components";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-white">
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity md:hidden 
          ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="md:ml-64 flex flex-col min-h-screen">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>

        <footer className="py-4 px-6 border-t border-secondary-200 dark:border-secondary-800">
          <p className="text-xs text-center text-secondary-500 dark:text-secondary-400">
            &copy; {new Date().getFullYear()} E-Shop Admin. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
