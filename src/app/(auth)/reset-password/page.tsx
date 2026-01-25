'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';

const resetSchema = z.object({
    email: z.string().email('Введите корректный email'),
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<ResetFormData>({
        resolver: zodResolver(resetSchema),
    });

    const onSubmit = async (data: ResetFormData) => {
        setIsLoading(true);
        console.log('Reset password for:', data.email);
        // TODO: Implement actual password reset
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="animate-fadeIn text-center">
                <div className="w-16 h-16 bg-[var(--success)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-[var(--success)]" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Проверьте почту</h1>
                <p className="text-[var(--foreground-muted)] mb-2">
                    Мы отправили инструкции по восстановлению пароля на:
                </p>
                <p className="font-medium mb-8">{getValues('email')}</p>

                <div className="space-y-3">
                    <Button variant="primary" fullWidth onClick={() => setIsSubmitted(false)}>
                        Отправить повторно
                    </Button>
                    <Link href="/login">
                        <Button variant="ghost" fullWidth leftIcon={<ArrowLeft size={18} />}>
                            Вернуться к входу
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Back Link */}
            <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-8 transition-colors"
            >
                <ArrowLeft size={18} />
                <span>Назад к входу</span>
            </Link>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Восстановление пароля</h1>
                <p className="text-[var(--foreground-muted)]">
                    Введите email, указанный при регистрации. Мы отправим вам ссылку для сброса пароля.
                </p>
            </div>

            {/* Reset Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                    type="email"
                    placeholder="Email"
                    leftIcon={<Mail size={18} />}
                    error={errors.email?.message}
                    {...register('email')}
                />

                <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                    {isLoading ? 'Отправка...' : 'Отправить инструкции'}
                </Button>
            </form>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-[var(--info)]/10 border border-[var(--info)]/20 rounded-xl">
                <p className="text-sm text-[var(--foreground-muted)]">
                    <strong className="text-[var(--foreground)]">Не получили письмо?</strong>
                    <br />
                    Проверьте папку "Спам" или попробуйте отправить повторно через несколько минут.
                </p>
            </div>
        </div>
    );
}
