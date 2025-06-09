import React from 'react';

const Card = ({ 
  children, 
  className = '',
  padding = true,
  hover = false
}) => {
  return (
    <div 
      className={`
        bg-white dark:bg-secondary-800 
        rounded-lg shadow-card
        ${padding ? 'p-6' : ''}
        ${hover ? 'transition-all duration-200 hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;