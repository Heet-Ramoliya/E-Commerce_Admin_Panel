import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("adminUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    if (
      email === import.meta.env.VITE_ADMIN_EMAIL &&
      password === import.meta.env.VITE_ADMIN_PASSWORD
    ) {
      const user = {
        id: "1",
        email: email,
        name: "Admin",
        role: "admin",
      };
      setCurrentUser(user);
      localStorage.setItem("adminUser", JSON.stringify(user));
      return Promise.resolve(user);
    } else {
      return Promise.reject(new Error("Invalid email or password"));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("adminUser");
    return Promise.resolve();
  };

  const value = {
    currentUser,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
