'use client';

import Link from 'next/link';
import {
    Coins,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    ShoppingCart,
    Clock,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

// Mock data
const stats = [
    {
        title: 'Баланс',
        value: '12,450',
        suffix: '₽',
        change: '+2,340',
        changePercent: '+23%',
        isPositive: true,
        icon: TrendingUp,
    },
    {
        title: 'TikTok монеты',
        value: '8,300',
        suffix: '',
        change: '+1,500',
        changePercent: 'сегодня',
        isPositive: true,
        icon: Coins,
    },
    {
        title: 'Активные заказы',
        value: '2',
        suffix: '',
        change: 'В процессе',
        changePercent: '',
        isPositive: true,
        icon: ShoppingCart,
    },
    {
        title: 'Всего заказов',
        value: '15',
        suffix: '',
        change: 'Выполнено',
        changePercent: '',
        isPositive: true,
        icon: Clock,
    },
];

const recentTransactions = [
    { id: 1, type: 'purchase', description: 'Покупка 1000 монет', amount: -1500, date: '23 янв, 12:34', status: 'completed' },
    { id: 2, type: 'deposit', description: 'Пополнение баланса', amount: 5000, date: '22 янв, 18:22', status: 'completed' },
    { id: 3, type: 'purchase', description: 'Покупка 500 монет', amount: -750, date: '21 янв, 09:15', status: 'completed' },
    { id: 4, type: 'deposit', description: 'Пополнение баланса', amount: 10000, date: '20 янв, 14:45', status: 'completed' },
];

const activeOrders = [
    {
        id: '#1245',
        coins: 1000,
        status: 'processing',
        statusText: 'В обработке',
        progress: 60,
        createdAt: '23 янв, 12:34'
    },
    {
        id: '#1244',
        coins: 500,
        status: 'awaiting',
        statusText: 'Ожидает данных',
        progress: 30,
        createdAt: '22 янв, 18:22'
    },
];

const statusColors: Record<string, string> = {
    processing: 'bg-[var(--info)]/10 text-[var(--info)]',
    awaiting: 'bg-[var(--warning)]/10 text-[var(--warning)]',
    completed: 'bg-[var(--success)]/10 text-[var(--success)]',
};

export default function DashboardPage() {
    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Добро пожаловать, Александр! 👋</h1>
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
                                <div className="flex items-center gap-1 mt-2">
                                    {stat.isPositive ? (
                                        <ArrowUpRight className="w-4 h-4 text-[var(--success)]" />
                                    ) : (
                                        <ArrowDownRight className="w-4 h-4 text-[var(--error)]" />
                                    )}
                                    <span className={`text-sm ${stat.isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-sm text-[var(--foreground-muted)]">{stat.changePercent}</span>
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                                <stat.icon className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                        </div>
                        {/* Decorative gradient */}
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
                        <div className="space-y-3">
                            {recentTransactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.amount > 0
                                                ? 'bg-[var(--success)]/10 text-[var(--success)]'
                                                : 'bg-[var(--primary)]/10 text-[var(--primary)]'
                                            }`}>
                                            {tx.amount > 0 ? <ArrowUpRight size={20} /> : <Coins size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-medium">{tx.description}</p>
                                            <p className="text-sm text-[var(--foreground-muted)]">{tx.date}</p>
                                        </div>
                                    </div>
                                    <span className={`font-semibold ${tx.amount > 0 ? 'text-[var(--success)]' : ''}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('ru-RU')} ₽
                                    </span>
                                </div>
                            ))}
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
                        {activeOrders.length > 0 ? (
                            <div className="space-y-4">
                                {activeOrders.map((order) => (
                                    <div key={order.id} className="p-4 bg-[var(--background)] rounded-lg">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-medium">Заказ {order.id}</p>
                                                <p className="text-sm text-[var(--foreground-muted)]">{order.coins} монет</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                                {order.statusText}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[var(--foreground-muted)]">Прогресс</span>
                                                <span>{order.progress}%</span>
                                            </div>
                                            <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#6A11CB] to-[#2575FC] rounded-full transition-all"
                                                    style={{ width: `${order.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <ShoppingCart className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-3" />
                                <p className="text-[var(--foreground-muted)]">Нет активных заказов</p>
                                <Link href="/dashboard/buy">
                                    <Button variant="primary" size="sm" className="mt-4">
                                        Купить монеты
                                    </Button>
                                </Link>
                            </div>
                        )}
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
