'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ShoppingCart,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronRight,
    MessageCircle,
    Loader2,
    CreditCard
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface Order {
    id: string;
    orderNumber: string;
    coinsAmount: number;
    totalPrice: number;
    status: string;
    createdAt: string;
    completedAt?: string;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bgColor: string; text: string }> = {
    PENDING_PAYMENT: { icon: CreditCard, color: 'text-[var(--warning)]', bgColor: 'bg-[var(--warning)]/10', text: 'Ожидает оплаты' },
    PAID: { icon: Clock, color: 'text-[var(--info)]', bgColor: 'bg-[var(--info)]/10', text: 'Оплачен' },
    PROCESSING: { icon: Clock, color: 'text-[var(--info)]', bgColor: 'bg-[var(--info)]/10', text: 'В обработке' },
    AWAITING_CREDENTIALS: { icon: AlertCircle, color: 'text-[var(--warning)]', bgColor: 'bg-[var(--warning)]/10', text: 'Ожидает данных' },
    IN_PROGRESS: { icon: Clock, color: 'text-[var(--info)]', bgColor: 'bg-[var(--info)]/10', text: 'Выполняется' },
    COMPLETED: { icon: CheckCircle, color: 'text-[var(--success)]', bgColor: 'bg-[var(--success)]/10', text: 'Выполнен' },
    CANCELLED: { icon: XCircle, color: 'text-[var(--error)]', bgColor: 'bg-[var(--error)]/10', text: 'Отменён' },
    REFUNDED: { icon: XCircle, color: 'text-[var(--error)]', bgColor: 'bg-[var(--error)]/10', text: 'Возврат' },
};

const filterOptions = [
    { value: 'all', label: 'Все' },
    { value: 'active', label: 'Активные' },
    { value: 'COMPLETED', label: 'Выполненные' },
    { value: 'CANCELLED', label: 'Отменённые' },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [pagination, setPagination] = useState({ total: 0, hasMore: false });

    useEffect(() => {
        fetchOrders();
    }, [activeFilter]);

    async function fetchOrders() {
        setLoading(true);
        try {
            const statusParam = activeFilter !== 'all' ? `&status=${activeFilter}` : '';
            const res = await fetch(`/api/orders?limit=20${statusParam}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
                setPagination(data.pagination || { total: 0, hasMore: false });
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    }

    const activeOrdersCount = orders.filter(o =>
        ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'AWAITING_CREDENTIALS', 'IN_PROGRESS'].includes(o.status)
    ).length;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Мои заказы</h1>
                    <p className="text-[var(--foreground-muted)]">
                        {pagination.total > 0
                            ? `Всего ${pagination.total} заказов`
                            : 'Нет заказов'
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
                        key={filter.value}
                        onClick={() => setActiveFilter(filter.value)}
                        className={`
              px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors
              ${activeFilter === filter.value
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--primary)]'
                            }
            `}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const config = statusConfig[order.status] || statusConfig.PROCESSING;
                        const StatusIcon = config.icon;
                        return (
                            <Card key={order.id} hover={false}>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        {/* Order Info */}
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bgColor}`}>
                                                <StatusIcon className={`w-6 h-6 ${config.color}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold">Заказ #{order.orderNumber}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                                                        {config.text}
                                                    </span>
                                                </div>
                                                <p className="text-[var(--foreground-muted)]">
                                                    {order.coinsAmount.toLocaleString()} монет • {order.totalPrice.toLocaleString()}₽
                                                </p>
                                                <p className="text-sm text-[var(--foreground-muted)]">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {['PROCESSING', 'AWAITING_CREDENTIALS', 'IN_PROGRESS'].includes(order.status) && (
                                                <Link href={`/dashboard/chat?order=${order.id}`}>
                                                    <Button variant="ghost" size="sm" leftIcon={<MessageCircle size={16} />}>
                                                        Чат
                                                    </Button>
                                                </Link>
                                            )}
                                            <Link href={`/dashboard/orders/${order.id}`}>
                                                <Button variant="secondary" size="sm" rightIcon={<ChevronRight size={16} />}>
                                                    Подробнее
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Progress bar for processing orders */}
                                    {order.status === 'PROCESSING' && (
                                        <div className="mt-4 pt-4 border-t border-[var(--border)]">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-[var(--foreground-muted)]">Прогресс выполнения</span>
                                                <span>В процессе</span>
                                            </div>
                                            <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                                <div className="h-full w-[50%] bg-gradient-to-r from-[#6A11CB] to-[#2575FC] rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Awaiting data message */}
                                    {order.status === 'AWAITING_CREDENTIALS' && (
                                        <div className="mt-4 p-3 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg">
                                            <p className="text-sm text-[var(--warning)]">
                                                ⚠️ Исполнитель ожидает данные от вашего TikTok аккаунта.
                                                <Link href={`/dashboard/chat?order=${order.id}`} className="underline ml-1">
                                                    Отправить данные
                                                </Link>
                                            </p>
                                        </div>
                                    )}

                                    {/* Payment required message */}
                                    {order.status === 'PENDING_PAYMENT' && (
                                        <div className="mt-4 p-3 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg">
                                            <p className="text-sm text-[var(--warning)]">
                                                💳 Заказ ожидает оплаты.
                                                {/* Correct link for Stars payment */}
                                                <Link href={`/dashboard/pay-stars/${order.id}`} className="underline ml-1">
                                                    Оплатить сейчас
                                                </Link>
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
                            {activeFilter === 'all'
                                ? 'У вас пока нет заказов. Сделайте первую покупку!'
                                : `Нет заказов с фильтром "${filterOptions.find(f => f.value === activeFilter)?.label}"`
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
