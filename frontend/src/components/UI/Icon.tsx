import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2x' | '3x';
}

const sizeClasses = {
  xs: 'fa-xs',
  sm: 'fa-sm',
  md: '',
  lg: 'fa-lg',
  xl: 'fa-2x',
  '2x': 'fa-2x',
  '3x': 'fa-3x'
};

/**
 * Icon component using Font Awesome icons
 * Requires Font Awesome to be loaded in the app
 */
const Icon: React.FC<IconProps> = ({ name, className = '', style, onClick, size = 'md' }) => {
  const sizeClass = sizeClasses[size] || '';
  
  return (
    <i 
      className={`fas fa-${name} ${sizeClass} ${className}`} 
      style={style}
      onClick={onClick}
      aria-hidden="true"
    />
  );
};

export default Icon;
