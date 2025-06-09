import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { Card, Input, Button, Alert } from "../components";
import { auth } from "../Config/Firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  if (currentUser) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await login(email, password);
      toast.success("Login successful");
      navigate("/");
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to login");
      toast.error(
        error.message || "Failed to login. Please check your credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900 p-4">
      <Card className="max-w-md w-full animate-fade-in">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-1">
            Welcome Back
          </h2>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Login to access your admin dashboard
          </p>
        </div>

        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              icon={FiMail}
              required
              disabled={loading}
              error={error}
            />

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              icon={FiLock}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center justify-center h-5 w-5"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-secondary-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-secondary-400" />
                  )}
                </button>
              }
              required
              disabled={loading}
              error={error}
            />
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
