import React from 'react';
import Icon from '../Icon';
import { useTheme } from '../../../contexts/ThemeContext';

export function ThemeToggle() {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        p-2 rounded-lg border-2 transition-all duration-200 ease-in-out
        bg-card
        border-gray-200 dark:border-0
        text-foreground
        hover:bg-background dark:hover:bg-gray-700
        hover:border-gray-300 dark:hover:border-0
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        shadow-sm hover:shadow-md
        transform hover:scale-105 active:scale-95
      "
      title={`Alternar para tema ${themeMode === 'light' ? 'escuro' : 'claro'}`}
    >
      <Icon
        name={themeMode === 'light' ? 'moon' : 'sun'}
        size="md"
        className="transition-transform duration-300"
      />
    </button>
  );
}