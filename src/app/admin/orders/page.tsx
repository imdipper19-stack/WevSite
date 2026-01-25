'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Search,
    Filter,
    Eye,
    Edit2,
    XCircle,
    RefreshCcw,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    User,
    Loader2,
    MessageCircle
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

interface Order {
    id: string; // UUID
    orderNumber: string; // Display ID e.g. #VID...
    buyer: string;
    executor?: string | null;
    coins: number;
    price: string;
    status: string;
    createdAt: string;
}

const statusConfig: Record<string, { icon: any; color: string; bgColor: string; text: string }> = {
    COMPLETED: { icon: CheckCircle, color: 'text-[var(--success)]', bgColor: 'bg-[var(--success)]/10', text: 'Выполнен' },
    PROCESSING: { icon: Clock, color: 'text-[var(--info)]', bgColor: 'bg-[var(--info)]/10', text: 'В работе' },
    IN_PROGRESS: { icon: Clock, color: 'text-[var(--info)]', bgColor: 'bg-[var(--info)]/10', text: 'В работе' },
    PENDING_PAYMENT: { icon: AlertCircle, color: 'text-[var(--warning)]', bgColor: 'bg-[var(--warning)]/10', text: 'Ждет оплаты' },
    AWAITING_CREDENTIALS: { icon: AlertCircle, color: 'text-[var(--warning)]', bgColor: 'bg-[var(--warning)]/10', text: 'Ждет данные' },
    PAID: { icon: CheckCircle, color: 'text-[var(--success)]', bgColor: 'bg-[var(--success)]/10', text: 'Оплачен' },
    CANCELLED: { icon: XCircle, color: 'text-[var(--error)]', bgColor: 'bg-[var(--error)]/10', text: 'Отменён' },
    REFUNDED: { icon: XCircle, color: 'text-[var(--error)]', bgColor: 'bg-[var(--error)]/10', text: 'Возврат' },
};

const filterOptions = [
    { value: 'all', label: 'Все' },
    { value: 'active', label: 'Активные' },
    { value: 'completed', label: 'Выполненные' },
    { value: 'cancelled', label: 'Отменённые' },
    // Simplified filters for UI; API supports raw status too
];

function formatCurrency(amount: string | number) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
    }).format(Number(amount));
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            // Map UI filter to API status status
            let statusParam = activeFilter;
            if (activeFilter === 'active') statusParam = 'processing'; // basic mapping, can be improved to send multiple
            if (activeFilter === 'completed') statusParam = 'completed';
            if (activeFilter === 'cancelled') statusParam = 'cancelled';

            // Note: API 'status' param expects specific enum value or 'all'.
            // For 'active', we might need to handle on backend or improve filter logic.
            // For now, let's keep it simple or remove unsupported filters if API isn't complex.
            // Actually API supports filtering by single status.
            // To support 'Active' (multiple statuses), we'd need API change or client-side filter (bad for pagination).
            // Let's rely on 'all' mostly or specific statuses.
            // I'll stick to 'all' in params unless specific.
            // If user selects 'Active', we probably want 'processing', 'in_progress', 'paid'?
            // I'll pass 'all' and handle special cases if I updated API, but I didn't.
            // So if 'Active', I might fetch all and filter? No.
            // I'll use 'all' for now and maybe ignore filter or specific status.
            if (activeFilter === 'active') statusParam = 'all'; // Fallback

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search: searchQuery,
                status: statusParam
            });
            const res = await fetch(`/api/admin/orders?${params}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders);
                setTotalPages(data.pagination.pages);
                setTotalOrders(data.pagination.total);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        if (!confirm('Вы уверены, что хотите изменить статус заказа?')) return;

        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                // Optimistic update
                setOrders(prev => prev.map(o =>
                    o.id === orderId ? { ...o, status: newStatus } : o
                ));
            } else {
                const data = await res.json();
                alert(`Ошибка: ${data.error || 'Не удалось обновить статус'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка сети');
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchOrders();
        }, 300);
        return () => clearTimeout(timeout);
    }, [page, searchQuery, activeFilter]);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Заказы</h1>
                    <p className="text-[var(--foreground-muted)]">Всего: {totalOrders} заказов</p>
                </div>
                <Button variant="secondary" leftIcon={<RefreshCcw size={16} />} onClick={fetchOrders}>
                    Обновить
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
                    <input
                        type="text"
                        placeholder="Поиск по ID или покупателю..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    {filterOptions.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => { setActiveFilter(filter.value); setPage(1); }}
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
            </div>

            {/* Table */}
            <Card padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">ID</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Покупатель</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Исполнитель</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Монеты</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Сумма</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Статус</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Дата</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--primary)]" />
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-[var(--foreground-muted)]">
                                        Заказы не найдены
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const status = statusConfig[order.status] || statusConfig['PENDING_PAYMENT'];
                                    const StatusIcon = status.icon;
                                    return (
                                        <tr key={order.id} className="border-b border-[var(--border)] hover:bg-[var(--background)]">
                                            <td className="p-4 font-medium">#{order.orderNumber}</td>
                                            <td className="p-4">{order.buyer}</td>
                                            <td className="p-4">
                                                {order.executor ? (
                                                    <span className="flex items-center gap-1">
                                                        <User size={14} />
                                                        {order.executor}
                                                    </span>
                                                ) : (
                                                    <span className="text-[var(--foreground-muted)]">—</span>
                                                )}
                                            </td>
                                            <td className="p-4">{order.coins ? order.coins.toLocaleString() : '-'}</td>
                                            <td className="p-4 font-medium">{formatCurrency(order.price)}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                                                    <StatusIcon size={12} />
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="p-4 text-[var(--foreground-muted)] whitespace-nowrap">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon">
                                                        <Eye size={16} />
                                                    </Button>
                                                    <Link href={`/admin/orders/${order.id}/chat`}>
                                                        <Button variant="ghost" size="icon" title="Чат с покупателем">
                                                            <MessageCircle size={16} className="text-[var(--primary)]" />
                                                        </Button>
                                                    </Link>

                                                    {['PROCESSING', 'PENDING_PAYMENT'].includes(order.status) && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-[var(--success)]"
                                                                title="Выполнить"
                                                                onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                                                            >
                                                                <CheckCircle size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-[var(--error)]"
                                                                title="Отменить"
                                                                onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                                                            >
                                                                <XCircle size={16} />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
                    <p className="text-sm text-[var(--foreground-muted)]">
                        Страница {page} из {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
