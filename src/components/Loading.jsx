import PropTypes from "prop-types";

const Loading = ({ size = "md", message = "Loading...", className = "" }) => {
  const sizeStyles = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-4",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div
      className={`
      flex flex-col items-center justify-center space-y-2
      bg-white dark:bg-secondary-900
      min-h-screen
      ${className}
    `}
    >
      <div
        className={`
          rounded-full
          border-t-primary-500 dark:border-t-primary-400
          border-secondary-300 dark:border-secondary-600
          animate-spin
          ${sizeStyles[size]}
        `}
      />
      <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
        {message}
      </p>
    </div>
  );
};

Loading.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  message: PropTypes.string,
  className: PropTypes.string,
};

export default Loading;
