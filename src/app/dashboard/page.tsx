'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Coins,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    ShoppingCart,
    Clock,
    ChevronRight,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

interface UserData {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    role: string;
    balance: number;
    coins: number;
}

export default function DashboardPage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/api/user/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    const stats = [
        {
            title: 'Баланс',
            value: user?.balance?.toLocaleString('ru-RU') || '0',
            suffix: '₽',
            change: '',
            changePercent: '',
            isPositive: true,
            icon: TrendingUp,
        },
        {
            title: 'TikTok монеты',
            value: user?.coins?.toLocaleString('ru-RU') || '0',
            suffix: '',
            change: '',
            changePercent: '',
            isPositive: true,
            icon: Coins,
        },
        {
            title: 'Активные заказы',
            value: '0',
            suffix: '',
            change: 'Нет активных',
            changePercent: '',
            isPositive: true,
            icon: ShoppingCart,
        },
        {
            title: 'Всего заказов',
            value: '0',
            suffix: '',
            change: '',
            changePercent: '',
            isPositive: true,
            icon: Clock,
        },
    ];

    const statusColors: Record<string, string> = {
        processing: 'bg-[var(--info)]/10 text-[var(--info)]',
        awaiting: 'bg-[var(--warning)]/10 text-[var(--warning)]',
        completed: 'bg-[var(--success)]/10 text-[var(--success)]',
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        Добро пожаловать, {user?.firstName || 'Пользователь'}! 👋
                    </h1>
                    <p className="text-[var(--foreground-muted)]">Обзор вашего аккаунта</p>
                </div>
                <Link href="/dashboard/buy">
                    <Button variant="accent" rightIcon={<ArrowRight size={18} />}>
                        Купить монеты
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-[var(--foreground-muted)] mb-1">{stat.title}</p>
                                <p className="text-2xl font-bold">
                                    {stat.value}
                                    <span className="text-base text-[var(--foreground-muted)]">{stat.suffix}</span>
                                </p>
                                {stat.change && (
                                    <div className="flex items-center gap-1 mt-2">
                                        <span className="text-sm text-[var(--foreground-muted)]">{stat.change}</span>
                                    </div>
                                )}
                            </div>
                            <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                                <stat.icon className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[var(--primary)]/5 rounded-full blur-2xl" />
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transactions */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Последние транзакции</CardTitle>
                        <Link href="/dashboard/history" className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1">
                            Все <ChevronRight size={14} />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-[var(--foreground-muted)]">
                            <p>У вас пока нет транзакций</p>
                            <Link href="/dashboard/buy">
                                <Button variant="primary" size="sm" className="mt-4">
                                    Купить монеты
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Orders */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Активные заказы</CardTitle>
                        <Link href="/dashboard/orders" className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1">
                            Все <ChevronRight size={14} />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <ShoppingCart className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-3" />
                            <p className="text-[var(--foreground-muted)]">Нет активных заказов</p>
                            <Link href="/dashboard/buy">
                                <Button variant="primary" size="sm" className="mt-4">
                                    Купить монеты
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-[#6A11CB]/10 to-[#2575FC]/10 border-[var(--primary)]/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Нужны TikTok монеты?</h3>
                        <p className="text-[var(--foreground-muted)]">
                            Всего 1.5₽ за монету • Моментальная доставка • Поддержка 24/7
                        </p>
                    </div>
                    <Link href="/dashboard/buy">
                        <Button variant="accent" size="lg" rightIcon={<Coins size={18} />}>
                            Купить сейчас
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
