'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '@/components/ui';

const registerSchema = z.object({
    firstName: z.string().min(2, 'Минимум 2 символа'),
    email: z.string().email('Введите корректный email'),
    phone: z.string().optional(),
    password: z.string()
        .min(8, 'Минимум 8 символов')
        .regex(/[a-zA-Z]/, 'Должна быть хотя бы одна буква')
        .regex(/[0-9]/, 'Должна быть хотя бы одна цифра'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, 'Необходимо принять условия'),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            acceptTerms: false,
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                // Handle specific field errors if available
                if (result.details) {
                    // Assuming result.details is { field: [error1, error2] }
                    Object.keys(result.details).forEach((key) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (errors as any)[key] = { message: result.details[key][0] };
                    });
                    // Using alert for fallback global error if needed, or stick to field errors
                    if (result.error) alert(result.error);
                } else {
                    alert(result.error || 'Ошибка при регистрации');
                }
            } else {
                // Success - redirect to dashboard (API sets cookie)
                window.location.href = '/dashboard';
            }
        } catch (error) {
            console.error(error);
            alert('Произошла ошибка сети');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Создать аккаунт</h1>
                <p className="text-[var(--foreground-muted)]">
                    Регистрация займет всего минуту
                </p>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    type="text"
                    placeholder="Имя"
                    leftIcon={<User size={18} />}
                    error={errors.firstName?.message}
                    {...register('firstName')}
                />

                <Input
                    type="email"
                    placeholder="Email"
                    leftIcon={<Mail size={18} />}
                    error={errors.email?.message}
                    {...register('email')}
                />

                <Input
                    type="tel"
                    placeholder="Телефон (необязательно)"
                    leftIcon={<Phone size={18} />}
                    {...register('phone')}
                />

                <div className="relative">
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Пароль (мин. 8 символов)"
                        leftIcon={<Lock size={18} />}
                        error={errors.password?.message}
                        {...register('password')}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Подтвердите пароль"
                    leftIcon={<Lock size={18} />}
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                />

                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-4 h-4 mt-0.5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                        {...register('acceptTerms')}
                    />
                    <span className="text-sm text-[var(--foreground-muted)]">
                        Я принимаю{' '}
                        <Link href="/terms" className="text-[var(--primary)] hover:underline">
                            Условия использования
                        </Link>{' '}
                        и{' '}
                        <Link href="/privacy" className="text-[var(--primary)] hover:underline">
                            Политику конфиденциальности
                        </Link>
                    </span>
                </label>
                {errors.acceptTerms && (
                    <p className="text-sm text-[var(--error)]">{errors.acceptTerms.message}</p>
                )}

                <Button type="submit" variant="accent" size="lg" fullWidth isLoading={isLoading}>
                    {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
            </form>

            {/* Login Link */}
            <p className="mt-8 text-center text-[var(--foreground-muted)]">
                Уже есть аккаунт?{' '}
                <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
                    Войти
                </Link>
            </p>
        </div>
    );
}
