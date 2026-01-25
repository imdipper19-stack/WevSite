'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface DashboardData {
    stats: {
        totalUsers: { value: number; change: string; isPositive: boolean };
        ordersToday: { value: number; change: string; isPositive: boolean };
        revenueToday: { value: number; change: string; isPositive: boolean };
        conversion: { value: string; change: string; isPositive: boolean };
    };
    recentOrders: Array<{
        id: string;
        user: string;
        coins: number;
        price: string; // serialized decimal
        status: string;
        time: string;
    }>;
    newUsers: Array<{
        name: string;
        email: string;
        date: string;
    }>;
}

const statusConfig: Record<string, { icon: any; color: string; text: string }> = {
    COMPLETED: { icon: CheckCircle, color: 'text-[var(--success)]', text: 'Выполнен' },
    PROCESSING: { icon: Clock, color: 'text-[var(--info)]', text: 'В работе' },
    IN_PROGRESS: { icon: Clock, color: 'text-[var(--info)]', text: 'В работе' },
    PENDING_PAYMENT: { icon: AlertCircle, color: 'text-[var(--warning)]', text: 'Ожидает оплаты' },
    AWAITING_CREDENTIALS: { icon: AlertCircle, color: 'text-[var(--warning)]', text: 'Ждет данные' },
    PAID: { icon: CheckCircle, color: 'text-[var(--success)]', text: 'Оплачен' },
    CANCELLED: { icon: XCircle, color: 'text-[var(--error)]', text: 'Отменён' },
    REFUNDED: { icon: XCircle, color: 'text-[var(--error)]', text: 'Возврат' },
};

function formatTimeAgo(isoString: string) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    return date.toLocaleDateString();
}

function formatCurrency(amount: string | number) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
    }).format(Number(amount));
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    if (!data) return null;

    const statsConfig = [
        {
            title: 'Всего пользователей',
            value: data.stats.totalUsers.value.toLocaleString(),
            change: data.stats.totalUsers.change,
            isPositive: data.stats.totalUsers.isPositive,
            icon: Users,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            title: 'Заказов сегодня',
            value: data.stats.ordersToday.value.toLocaleString(),
            change: data.stats.ordersToday.change,
            isPositive: data.stats.ordersToday.isPositive,
            icon: ShoppingCart,
            color: 'from-purple-500 to-pink-500'
        },
        {
            title: 'Выручка за день',
            value: formatCurrency(data.stats.revenueToday.value),
            change: formatCurrency(data.stats.revenueToday.change).replace('₽', ''), // Simplistic
            isPositive: data.stats.revenueToday.isPositive,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-500'
        },
        {
            title: 'Конверсия',
            value: data.stats.conversion.value,
            change: data.stats.conversion.change,
            isPositive: data.stats.conversion.isPositive,
            icon: TrendingUp,
            color: 'from-orange-500 to-amber-500'
        },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Панель управления</h1>
                <p className="text-[var(--foreground-muted)]">Обзор статистики и активности</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsConfig.map((stat, index) => (
                    <Card key={index} className="relative overflow-hidden">
                        <CardContent>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-[var(--foreground-muted)] mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        {stat.isPositive ? (
                                            <ArrowUpRight className="w-4 h-4 text-[var(--success)]" />
                                        ) : (
                                            <ArrowDownRight className="w-4 h-4 text-[var(--error)]" />
                                        )}
                                        <span className={`text-sm ${stat.isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                                            {stat.change}
                                        </span>
                                        <span className="text-sm text-[var(--foreground-muted)]">vs вчера</span>
                                    </div>
                                </div>
                                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Последние заказы</CardTitle>
                        <a href="/admin/orders" className="text-sm text-[var(--primary)] hover:underline">
                            Все заказы →
                        </a>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--border)]">
                                        <th className="text-left py-3 px-2 text-sm font-medium text-[var(--foreground-muted)]">ID</th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-[var(--foreground-muted)]">Клиент</th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-[var(--foreground-muted)]">Монеты</th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-[var(--foreground-muted)]">Сумма</th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-[var(--foreground-muted)]">Статус</th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-[var(--foreground-muted)]">Время</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recentOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-[var(--foreground-muted)]">Нет заказов</td>
                                        </tr>
                                    ) : (
                                        data.recentOrders.map((order) => {
                                            const status = statusConfig[order.status] || statusConfig['PENDING_PAYMENT'];
                                            const StatusIcon = status.icon;
                                            return (
                                                <tr key={order.id} className="border-b border-[var(--border)] hover:bg-[var(--background)]">
                                                    <td className="py-3 px-2 font-medium">#{order.id}</td>
                                                    <td className="py-3 px-2">{order.user}</td>
                                                    <td className="py-3 px-2">{order.coins.toLocaleString()}</td>
                                                    <td className="py-3 px-2">{formatCurrency(order.price)}</td>
                                                    <td className="py-3 px-2">
                                                        <span className={`inline-flex items-center gap-1 ${status.color}`}>
                                                            <StatusIcon size={14} />
                                                            {status.text}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 text-[var(--foreground-muted)]">{formatTimeAgo(order.time)}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* New Users */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Новые пользователи</CardTitle>
                        <a href="/admin/users" className="text-sm text-[var(--primary)] hover:underline">
                            Все →
                        </a>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.newUsers.length === 0 ? (
                                <p className="text-center text-[var(--foreground-muted)]">Нет новых пользователей</p>
                            ) : (
                                data.newUsers.map((user, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#6A11CB] to-[#2575FC] rounded-full flex items-center justify-center text-white font-semibold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{user.name}</p>
                                            <p className="text-sm text-[var(--foreground-muted)] truncate">{user.email || 'Нет email'}</p>
                                        </div>
                                        <span className="text-xs text-[var(--foreground-muted)] whitespace-nowrap">
                                            {new Date(user.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions - Static for now */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 hover:border-[var(--primary)]/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        <div>
                            <p className="font-medium">Управление пользователями</p>
                            <p className="text-sm text-[var(--foreground-muted)]">Блокировка, редактирование</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 hover:border-[var(--primary)]/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--warning)]/10 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-[var(--warning)]" />
                        </div>
                        <div>
                            <p className="font-medium">Модерация заказов</p>
                            <p className="text-sm text-[var(--foreground-muted)]">Просмотр всех заказов</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 hover:border-[var(--primary)]/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--success)]/10 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-[var(--success)]" />
                        </div>
                        <div>
                            <p className="font-medium">Выплаты исполнителям</p>
                            <p className="text-sm text-[var(--foreground-muted)]">Финансовая статистика</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
