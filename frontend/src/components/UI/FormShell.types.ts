import { ReactNode } from 'react';

export interface FormShellProps {
  /**
   * Main title displayed at the top of the form
   */
  title: string;
  
  /**
   * Optional subtitle or description below the title
   */
  subtitle?: string;
  
  /**
   * Optional icon name to display next to the title
   */
  headerIcon?: string;
  
  /**
   * Optional color for the header icon
   */
  headerColor?: string;
  
  /**
   * Action buttons displayed in the footer (e.g., Save, Cancel)
   */
  actions?: ReactNode;
  
  /**
   * Main content of the form
   */
  children: ReactNode;
  
  /**
   * When true, renders the form in a modal overlay with centered positioning
   * When false, renders as a standard page layout
   */
  isModal?: boolean;
  
  /**
   * Maximum width of the form container (e.g., 'md', 'lg', 'xl', '2xl', '4xl', '6xl')
   * Default: 'xl'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  
  /**
   * Additional CSS classes to apply to the root container
   */
  className?: string;
  
  /**
   * Optional loading state to show a spinner or skeleton
   */
  loading?: boolean;
  
  /**
   * Optional error message to display at the top
   */
  error?: string | null;
  
  /**
   * Callback when modal overlay is clicked (only applies when isModal=true)
   */
  onClose?: () => void;
}

export interface ListShellProps {
  /**
   * Main title displayed at the top of the list
   */
  title: string;
  
  /**
   * Optional subtitle or description below the title
   */
  subtitle?: string;
  
  /**
   * Action buttons displayed in the header (e.g., Add New, Import, Export)
   */
  headerActions?: ReactNode;
  
  /**
   * Filter/search components displayed below the header
   */
  filters?: ReactNode;
  
  /**
   * Main content of the list (table, cards, etc.)
   */
  children: ReactNode;
  
  /**
   * Additional CSS classes to apply to the root container
   */
  className?: string;
  
  /**
   * Optional loading state to show a spinner or skeleton
   */
  loading?: boolean;
  
  /**
   * Optional error message to display
   */
  error?: string | null;
}
