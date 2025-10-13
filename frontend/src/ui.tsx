import React from 'react'

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: 'sm'|'default'|'lg', variant?: string }> = ({ children, className = '', size = 'default', ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${
      size === 'lg' ? 'h-11 px-8' : size === 'sm' ? 'h-9 px-3' : 'h-10 px-4'
    } ${className}`}
  >
    {children}
  </button>
)

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
)

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => (
  <textarea
    {...props}
    className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
)

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className = '', ...props }) => (
  <label {...props} className={`text-sm font-medium leading-none ${className}`}>
    {children}
  </label>
)

export const Icon: React.FC<{ name: string; size?: 'sm'|'md'|'lg'|'xl'; className?: string; style?: React.CSSProperties }> = ({ name, size = 'md', className = '', style = {} }) => (
  <i className={`fas fa-${name} ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : size === 'xl' ? 'text-xl' : 'text-base'} ${className}`} style={style} />
)

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div {...props} className={`rounded-lg bg-white dark:bg-slate-800 ${className}`}>
    {children}
  </div>
)

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div {...props} className={className}>
    {children}
  </div>
)

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div {...props} className={className}>
    {children}
  </div>
)

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h3 {...props} className={className}>
    {children}
  </h3>
)

export const CardDescription: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div {...props} className={className}>
    {children}
  </div>
)

export default {
  Button,
  Input,
  Label,
  Icon,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
}
