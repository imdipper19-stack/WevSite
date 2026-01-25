'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ShoppingCart,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronRight,
    MessageCircle,
    Eye,
    Filter
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

// Mock orders data
const mockOrders = [
    {
        id: '#1245',
        coins: 1000,
        price: 1500,
        status: 'processing',
        statusText: 'В обработке',
        createdAt: '23 янв 2024, 12:34',
        executor: 'Исполнитель #42',
    },
    {
        id: '#1244',
        coins: 500,
        price: 750,
        status: 'awaiting',
        statusText: 'Ожидает данных',
        createdAt: '22 янв 2024, 18:22',
        executor: 'Исполнитель #38',
    },
    {
        id: '#1243',
        coins: 5000,
        price: 7500,
        status: 'completed',
        statusText: 'Выполнен',
        createdAt: '20 янв 2024, 15:10',
        completedAt: '20 янв 2024, 15:25',
        executor: 'Исполнитель #42',
    },
    {
        id: '#1242',
        coins: 100,
        price: 150,
        status: 'completed',
        statusText: 'Выполнен',
        createdAt: '19 янв 2024, 11:05',
        completedAt: '19 янв 2024, 11:18',
        executor: 'Исполнитель #35',
    },
    {
        id: '#1241',
        coins: 1000,
        price: 1500,
        status: 'cancelled',
        statusText: 'Отменён',
        createdAt: '18 янв 2024, 09:30',
        executor: null,
    },
];

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bgColor: string }> = {
    processing: { icon: Clock, color: 'text-[var(--info)]', bgColor: 'bg-[var(--info)]/10' },
    awaiting: { icon: AlertCircle, color: 'text-[var(--warning)]', bgColor: 'bg-[var(--warning)]/10' },
    completed: { icon: CheckCircle, color: 'text-[var(--success)]', bgColor: 'bg-[var(--success)]/10' },
    cancelled: { icon: XCircle, color: 'text-[var(--error)]', bgColor: 'bg-[var(--error)]/10' },
};

const filterOptions = ['Все', 'Активные', 'Выполненные', 'Отменённые'];

export default function OrdersPage() {
    const [activeFilter, setActiveFilter] = useState('Все');

    const filteredOrders = mockOrders.filter(order => {
        if (activeFilter === 'Все') return true;
        if (activeFilter === 'Активные') return ['processing', 'awaiting'].includes(order.status);
        if (activeFilter === 'Выполненные') return order.status === 'completed';
        if (activeFilter === 'Отменённые') return order.status === 'cancelled';
        return true;
    });

    const activeOrdersCount = mockOrders.filter(o => ['processing', 'awaiting'].includes(o.status)).length;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Мои заказы</h1>
                    <p className="text-[var(--foreground-muted)]">
                        {activeOrdersCount > 0
                            ? `${activeOrdersCount} активных заказов`
                            : 'Нет активных заказов'
                        }
                    </p>
                </div>
                <Link href="/dashboard/buy">
                    <Button variant="accent">
                        Новый заказ
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {filterOptions.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`
              px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors
              ${activeFilter === filter
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--primary)]'
                            }
            `}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const StatusIcon = statusConfig[order.status].icon;
                        return (
                            <Card key={order.id} hover={false}>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        {/* Order Info */}
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig[order.status].bgColor}`}>
                                                <StatusIcon className={`w-6 h-6 ${statusConfig[order.status].color}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold">Заказ {order.id}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].bgColor} ${statusConfig[order.status].color}`}>
                                                        {order.statusText}
                                                    </span>
                                                </div>
                                                <p className="text-[var(--foreground-muted)]">
                                                    {order.coins.toLocaleString()} монет • {order.price.toLocaleString()}₽
                                                </p>
                                                <p className="text-sm text-[var(--foreground-muted)]">
                                                    {order.createdAt}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {['processing', 'awaiting'].includes(order.status) && (
                                                <Button variant="ghost" size="sm" leftIcon={<MessageCircle size={16} />}>
                                                    Чат
                                                </Button>
                                            )}
                                            <Button variant="secondary" size="sm" rightIcon={<ChevronRight size={16} />}>
                                                Подробнее
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Progress bar for active orders */}
                                    {order.status === 'processing' && (
                                        <div className="mt-4 pt-4 border-t border-[var(--border)]">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-[var(--foreground-muted)]">Прогресс выполнения</span>
                                                <span>60%</span>
                                            </div>
                                            <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                                <div className="h-full w-[60%] bg-gradient-to-r from-[#6A11CB] to-[#2575FC] rounded-full" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Awaiting data message */}
                                    {order.status === 'awaiting' && (
                                        <div className="mt-4 p-3 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg">
                                            <p className="text-sm text-[var(--warning)]">
                                                ⚠️ Исполнитель ожидает данные от вашего TikTok аккаунта.
                                                <Link href="#" className="underline ml-1">Отправить данные</Link>
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-12">
                        <ShoppingCart className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Нет заказов</h3>
                        <p className="text-[var(--foreground-muted)] mb-6">
                            {activeFilter === 'Все'
                                ? 'У вас пока нет заказов. Сделайте первую покупку!'
                                : `Нет заказов с фильтром "${activeFilter}"`
                            }
                        </p>
                        <Link href="/dashboard/buy">
                            <Button variant="accent">
                                Купить монеты
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
