import type { ReactNode } from 'react';
import clsx from 'clsx';
type TButtonProps = {
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'dropdown' | 'primary-disabled';
  className?: string;
};

export function Button({
  type = 'button',
  disabled = false,
  onClick,
  children,
  variant = 'primary',
  className,
  ...props
}: TButtonProps) {
  const variantClasses = {
    primary:
      'hover:bg-blue-dark bg-blue text-white focus-visible:outline focus-visible:outline-grey-dark min-w-[14rem]',
    'primary-disabled':
      'bg-blue-light text-white pointer-events-none cursor-not-allowed min-w-[14rem]',
    secondary:
      'bg-white text-blue hover:text-blue-dark min-w-0 focus-visible:outline-2 focus-visible:outline-blue',
    dropdown:
      'bg-white outline outline-1 outline-blue font-normal text-grey-dark hover:text-blue-dark focus-visible:outline-blue-dark min-w-[14rem]',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        'focus-visible:outline-offset hover:shadow-button inline-flex select-none items-center justify-center rounded-md p-4 font-semibold',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
