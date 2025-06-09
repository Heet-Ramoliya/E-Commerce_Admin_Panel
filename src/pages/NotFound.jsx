import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900 p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">
          404
        </h1>
        <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mt-4">
          Page Not Found
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 mt-2">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary inline-flex items-center mt-6">
          <FiHome className="mr-2" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
