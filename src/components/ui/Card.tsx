'use client';

import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'gradient';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export function Card({
    children,
    className = '',
    variant = 'default',
    hover = true,
    padding = 'md',
}: CardProps) {
    const baseClasses = 'rounded-2xl transition-all duration-300';

    const variantClasses = {
        default: 'bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow)]',
        glass: 'bg-white/10 backdrop-blur-xl border border-white/20',
        gradient: 'bg-gradient-to-br from-[#6A11CB]/10 to-[#2575FC]/10 border border-[var(--primary)]/20',
    };

    const hoverClasses = hover
        ? 'hover:shadow-[var(--shadow-lg)] hover:-translate-y-1'
        : '';

    return (
        <div
            className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${hoverClasses}
        ${paddingClasses[padding]}
        ${className}
      `}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`mb-4 ${className}`}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: ReactNode;
    className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
    return (
        <h3 className={`text-xl font-bold text-[var(--foreground)] ${className}`}>
            {children}
        </h3>
    );
}

interface CardDescriptionProps {
    children: ReactNode;
    className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
    return (
        <p className={`text-sm text-[var(--foreground-muted)] mt-1 ${className}`}>
            {children}
        </p>
    );
}

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return <div className={className}>{children}</div>;
}

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`mt-4 pt-4 border-t border-[var(--border)] ${className}`}>
            {children}
        </div>
    );
}
