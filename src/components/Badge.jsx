import React from 'react';

const Badge = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  rounded = false,
  className = ''
}) => {
  const variants = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
    secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400',
    success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400',
    danger: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400',
    accent: 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-400'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span className={`
      inline-flex items-center font-medium
      ${variants[variant]}
      ${sizes[size]}
      ${rounded ? 'rounded-full' : 'rounded'}
      ${className}
    `}>
      {children}
    </span>
  );
};

export default Badge;