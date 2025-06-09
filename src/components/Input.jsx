import React from "react";
import PropTypes from "prop-types";

const Input = ({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  icon: Icon,
  rightIcon: RightIcon,
  className = "",
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1"
        >
          {label}
          {required && <span className="text-error-600 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-secondary-400" />
          </div>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full rounded-md shadow-sm border
            ${Icon ? "pl-10" : "pl-3"}
            ${RightIcon ? "pr-10" : "pr-3"}
            ${
              error
                ? "border-error-300 focus:border-error-500 focus:ring-error-500"
                : "border-secondary-300 focus:border-primary-500 focus:ring-primary-500"
            }
            ${
              disabled
                ? "bg-secondary-100 text-secondary-500 cursor-not-allowed"
                : "bg-white dark:bg-secondary-800"
            }
            dark:border-secondary-600 dark:text-white
            py-2 text-sm
            focus:outline-none focus:ring-2
          `}
          {...props}
        />

        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {RightIcon}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p
          className={`mt-1 text-sm ${
            error
              ? "text-error-600"
              : "text-secondary-500 dark:text-secondary-400"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.elementType,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
};

export default Input;
