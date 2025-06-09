import React from "react";
import PropTypes from "prop-types";
import { FiChevronDown } from "react-icons/fi";

const Select = ({
  label,
  id,
  value,
  onChange,
  options,
  error,
  helperText,
  required = false,
  disabled = false,
  icon: Icon,
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

        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full rounded-md shadow-sm border
            appearance-none
            ${Icon ? "pl-10" : "pl-3"}
            pr-10
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
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <FiChevronDown className="h-5 w-5 text-secondary-400" />
        </div>
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

Select.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.elementType,
  className: PropTypes.string,
};

export default Select;
