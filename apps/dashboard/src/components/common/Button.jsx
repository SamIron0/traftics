import React from 'react';
export function Button({ children, variant = 'primary', size = 'md', isLoading, className, ...props }) {
    const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';
    const variantStyles = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-200',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300'
    };
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
    };
    return (<button className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
        ${className}
      `} disabled={isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>);
}
