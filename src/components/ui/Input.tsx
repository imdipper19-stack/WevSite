'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className = '',
            type = 'text',
            label,
            error,
            hint,
            leftIcon,
            rightIcon,
            disabled,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';

        return (
            <div className="w-full">
                {label && (
                    <label className="block mb-2 text-sm font-medium text-[var(--foreground)]">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        type={isPassword && showPassword ? 'text' : type}
                        className={`
              w-full px-4 py-3 text-[0.9375rem]
              bg-[var(--background-alt)] 
              border border-[var(--border)]
              rounded-[10px] 
              text-[var(--foreground)]
              placeholder:text-[var(--foreground-muted)]
              transition-all duration-200
              focus:outline-none focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgba(106,17,203,0.1)]
              disabled:opacity-60 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-10' : ''}
              ${isPassword || rightIcon ? 'pr-10' : ''}
              ${error ? 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[rgba(239,68,68,0.1)]' : ''}
              ${className}
            `}
                        ref={ref}
                        disabled={disabled}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                    {!isPassword && rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-[0.8125rem] text-[var(--error)]">{error}</p>
                )}
                {hint && !error && (
                    <p className="mt-1.5 text-[0.8125rem] text-[var(--foreground-muted)]">{hint}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
