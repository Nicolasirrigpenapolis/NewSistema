import React from 'react';

interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color,
  className = '',
  style = {}
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const iconClasses = `fas fa-${name} ${sizeClasses[size]} ${className}`.trim();

  const iconStyle = {
    ...style,
    ...(color && { color })
  };

  return <i className={iconClasses} style={iconStyle} />;
};

export default Icon;