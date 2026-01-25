'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';

import { TelegramLoginButton } from '@/components/auth/TelegramLoginButton';

const loginSchema = z.object({
    email: z.string().email('Введите корректный email'),
    password: z.string().min(1, 'Введите пароль'),
    remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    // const [isTelegramLoading, setIsTelegramLoading] = useState(false); // Removed
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState<'login' | '2fa'>('login');
    const [userId, setUserId] = useState('');
    const [twoFaCode, setTwoFaCode] = useState('');

    const handleTelegramAuth = async (user: any) => {
        try {
            console.log('Telegram Auth Data:', user);
            const res = await fetch('/api/auth/telegram/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            });

            if (res.ok) {
                const data = await res.json();
                console.log('TG Login Success:', data);
                // Redirect
                window.location.href = '/dashboard';
            } else {
                console.error('TG Login Failed');
                alert('Ошибка авторизации через Telegram');
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка сети при входе через Telegram');
        }
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.error || 'Ошибка при входе');
            } else if (result.require2fa) {
                setUserId(result.userId);
                setStep('2fa');
            } else {
                // Success - redirect to dashboard
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
                <h1 className="text-3xl font-bold mb-2">Добро пожаловать!</h1>
                <p className="text-[var(--foreground-muted)]">
                    Войдите в аккаунт, чтобы продолжить
                </p>
            </div>

            {/* Login Form */}
            {step === 'login' ? (
                <>
                    <div className="mb-8">
                        <div className="flex justify-center w-full">
                            {process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ? (
                                <TelegramLoginButton
                                    botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME}
                                    authUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/telegram/callback`}
                                    className="w-full flex justify-center"
                                />
                            ) : (
                                <div className="text-sm text-red-500 text-center border p-2 rounded w-full">
                                    Bot Name not configured (NEXT_PUBLIC_TELEGRAM_BOT_NAME)
                                </div>
                            )}
                        </div>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-[var(--border)]"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[var(--card-bg)] px-2 text-[var(--foreground-muted)]">Или через Email</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <Input
                                type="email"
                                placeholder="Email"
                                leftIcon={<Mail size={18} />}
                                error={errors.email?.message}
                                {...register('email')}
                            />
                        </div>

                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Пароль"
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

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                    {...register('remember')}
                                />
                                <span className="text-sm text-[var(--foreground-muted)]">Запомнить меня</span>
                            </label>

                            <Link
                                href="/reset-password"
                                className="text-sm text-[var(--primary)] hover:underline"
                            >
                                Забыли пароль?
                            </Link>
                        </div>

                        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                            {isLoading ? 'Вход...' : 'Войти'}
                        </Button>
                    </form>
                </>
            ) : (
                <div className="space-y-6">
                    <div className="mb-8">
                        <Link href="#" onClick={() => setStep('login')} className="text-sm text-[var(--foreground-muted)] flex items-center gap-1 mb-4 hover:text-[var(--foreground)]">
                            ← Назад
                        </Link>
                        <h1 className="text-3xl font-bold mb-2">2FA Аутентификация</h1>
                        <p className="text-[var(--foreground-muted)]">
                            Введите 6-значный код из приложения аутентификатора
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <Input
                            placeholder="000 000"
                            value={twoFaCode}
                            onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="text-center text-2xl tracking-[0.5em] h-16 w-64"
                            maxLength={6}
                        />
                    </div>

                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        isLoading={isLoading}
                        disabled={twoFaCode.length !== 6}
                        onClick={async () => {
                            setIsLoading(true);
                            try {
                                const res = await fetch('/api/auth/2fa/login', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userId, code: twoFaCode }),
                                });
                                const result = await res.json();
                                if (res.ok) {
                                    window.location.href = '/dashboard';
                                } else {
                                    alert(result.error || 'Неверный код');
                                }
                            } catch (e) {
                                alert('Ошибка сети');
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                    >
                        {isLoading ? 'Проверка...' : 'Подтвердить'}
                    </Button>
                </div>
            )}

            {/* Register Link */}
            <p className="mt-8 text-center text-[var(--foreground-muted)]">
                Нет аккаунта?{' '}
                <Link href="/register" className="text-[var(--primary)] font-medium hover:underline">
                    Зарегистрироваться
                </Link>
            </p>
        </div>
    );
}
