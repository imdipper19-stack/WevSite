'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed',
    {
        variants: {
            variant: {
                primary: 'bg-gradient-to-r from-[#6A11CB] to-[#2575FC] text-white shadow-[0_4px_14px_rgba(106,17,203,0.3)] hover:shadow-[0_6px_20px_rgba(106,17,203,0.4)] hover:-translate-y-0.5',
                accent: 'bg-[#FF7E00] text-white shadow-[0_4px_14px_rgba(255,126,0,0.3)] hover:bg-[#FF9A33] hover:shadow-[0_6px_20px_rgba(255,126,0,0.4)] hover:-translate-y-0.5',
                secondary: 'bg-[var(--background-alt)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--border)]',
                ghost: 'bg-transparent text-[var(--foreground)] hover:bg-[var(--border)]',
                danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626]',
                outline: 'border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white',
            },
            size: {
                sm: 'px-4 py-2 text-sm rounded-lg',
                md: 'px-6 py-3 text-[0.9375rem] rounded-[10px]',
                lg: 'px-8 py-4 text-base rounded-xl',
                icon: 'p-2.5 rounded-lg',
            },
            fullWidth: {
                true: 'w-full',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className = '',
            variant,
            size,
            fullWidth,
            isLoading,
            leftIcon,
            rightIcon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <button
                className={buttonVariants({ variant, size, fullWidth, className })}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    leftIcon
                )}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
