import { memo } from 'react';

// Reusable UI Components

export const Button = memo(({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 focus:ring-blue-500'
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export const Card = memo(({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
    {...props}
  >
    {children}
  </div>
));

Card.displayName = 'Card';

export const LoadingSpinner = memo(({
  size = 'medium',
  className = ''
}: {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} ${className}`}></div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';