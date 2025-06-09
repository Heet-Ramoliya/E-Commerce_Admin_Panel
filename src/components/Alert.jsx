import React from 'react';

const Alert = ({ 
  children, 
  variant = 'info',
  icon: Icon,
  onClose,
  className = ''
}) => {
  const variants = {
    info: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
    success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400',
    error: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400'
  };

  return (
    <div className={`
      rounded-lg p-4
      ${variants[variant]}
      ${className}
    `}>
      <div className="flex">
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className={`flex-1 ${Icon ? 'ml-3' : ''}`}>
          {children}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <span className="sr-only">Dismiss</span>
              <svg 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;