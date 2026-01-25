'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Loader2,
    RefreshCcw
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function AdminFinancePage() {
    const [stats, setStats] = useState<any>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
                setRecentOrders(data.recentOrders || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    const cards = [
        { title: 'Выручка сегодня', data: stats?.revenueToday },
        { title: 'Заказов сегодня', data: stats?.ordersToday },
        { title: 'Новых пользователей', data: stats?.totalUsers },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Финансы</h1>
                    <p className="text-[var(--foreground-muted)]">Отчёты и статистика</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" leftIcon={<RefreshCcw size={16} />} onClick={fetchStats}>
                        Обновить
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card, index) => (
                    <Card key={index}>
                        <CardContent>
                            <p className="text-sm text-[var(--foreground-muted)] mb-1">{card.title}</p>
                            <p className="text-2xl font-bold mb-2">{card.data?.value?.toLocaleString() || 0}</p>
                            {card.data && (
                                <div className="flex items-center gap-1">
                                    {card.data.isPositive ? (
                                        <TrendingUp className="w-4 h-4 text-[var(--success)]" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-[var(--error)]" />
                                    )}
                                    <span className={`text-sm ${card.data.isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                                        {card.data.change}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions (Orders) */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Последние транзакции (Заказы)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentOrders.length === 0 ? (
                                <p className="text-[var(--foreground-muted)] text-center py-4">Транзакций пока нет</p>
                            ) : (
                                recentOrders.map((order: any) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--success)]/10">
                                                <ArrowUpRight className="w-5 h-5 text-[var(--success)]" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{order.user}</p>
                                                <p className="text-sm text-[var(--foreground-muted)]">
                                                    Заказ #{order.id} • {order.coins} монет
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-[var(--success)]">
                                                +{Number(order.price).toLocaleString()}₽
                                            </p>
                                            <p className="text-sm text-[var(--foreground-muted)]">
                                                {new Date(order.time).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Информация</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 bg-[var(--info)]/10 border border-[var(--info)]/20 rounded-lg">
                            <p className="text-sm text-[var(--info)]">
                                Раздел выплат исполнителям находится в разработке. Сейчас выплаты производятся вручную.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
