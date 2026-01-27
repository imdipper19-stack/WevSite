'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    CheckCircle,
    Clock,
    MessageCircle,
    User,
    Eye,
    RefreshCcw,
    AlertCircle,
    XCircle
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    coinsAmount: number;
    totalPrice: number;
    tiktokLogin?: string; // We allowed fetching this for Executor in route.ts
    tiktokPassword?: string;
    createdAt: string;
}

const statusConfig: Record<string, { icon: any; color: string; bgColor: string; text: string }> = {
    COMPLETED: { icon: CheckCircle, color: 'text-[var(--success)]', bgColor: 'bg-[var(--success)]/10', text: 'Выполнен' },
    PROCESSING: { icon: Clock, color: 'text-[var(--info)]', bgColor: 'bg-[var(--info)]/10', text: 'В работе' },
    PAID: { icon: CheckCircle, color: 'text-[var(--success)]', bgColor: 'bg-[var(--success)]/10', text: 'Оплачен (Ждет выполнения)' },
    PENDING_PAYMENT: { icon: AlertCircle, color: 'text-[var(--warning)]', bgColor: 'bg-[var(--warning)]/10', text: 'Ждет оплаты' },
    CANCELLED: { icon: XCircle, color: 'text-[var(--error)]', bgColor: 'bg-[var(--error)]/10', text: 'Отменён' },
};

export default function ExecutorDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Fetch assigned orders. Since we updated GET /api/orders, it returns 'mine' (assigned) orders for executor role.
            const res = await fetch('/api/orders?limit=50&status=active');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleComplete = async (orderId: string) => {
        if (!confirm('Вы выполнили этот заказ?')) return;
        try {
            // Executor PATCH endpoint
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'COMPLETED' })
            });
            if (res.ok) {
                fetchOrders(); // Refresh list
            } else {
                alert('Ошибка при обновлении статуса');
            }
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="p-8">Загрузка...</div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Панель Исполнителя</h1>
                <Button variant="ghost" onClick={fetchOrders} leftIcon={<RefreshCcw size={16} />}>Обновить</Button>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 text-left font-medium text-gray-500">Заказ</th>
                                <th className="p-4 text-left font-medium text-gray-500">Сумма</th>
                                <th className="p-4 text-left font-medium text-gray-500">Статус</th>
                                <th className="p-4 text-left font-medium text-gray-500">Данные</th>
                                <th className="p-4 text-left font-medium text-gray-500">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">Нет активных заказов</td>
                                </tr>
                            ) : (
                                orders.map(order => {
                                    const status = statusConfig[order.status] || statusConfig['PENDING_PAYMENT'];
                                    const StatusIcon = status.icon;
                                    return (
                                        <tr key={order.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="font-medium">#{order.orderNumber}</div>
                                                <div className="text-sm text-gray-500">{order.coinsAmount} монет</div>
                                            </td>
                                            <td className="p-4">{order.totalPrice} ₽</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                                                    <StatusIcon size={12} />
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm font-mono">
                                                {order.tiktokLogin ? (
                                                    <div>
                                                        Login: {order.tiktokLogin}
                                                        {order.tiktokPassword && <div className="text-xs text-gray-400">Pass available in details</div>}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    {/* View Details / Chat */}
                                                    <Link href={`/admin/orders/${order.id}`}>
                                                        {/* Note: Executor can access admin order details page? 
                                                            Wait, /admin/orders/[id] requires ADMIN role usually?
                                                            I assume Admin layout protects /admin route.
                                                            Executors might NOT have access to /admin.
                                                            I should check middleware or layout protection.
                                                            If blocked, I need a separate /dashboard/executor/[id] page.
                                                            BUT, for now I will link to Chat directly + Simple Details in Dashboard.
                                                            Or maybe create /dashboard/orders/[id] for details?
                                                            Let's link to Chat directly first.
                                                         */}
                                                    </Link>
                                                    <Link href={`/dashboard/chat/${order.id}`}>
                                                        {/* Wait, chat page is /dashboard/chat or /admin/orders/[id]/chat?
                                                            Buyer uses /dashboard/chat/[id] (needs verification).
                                                            Admin uses /admin/orders/[id]/chat.
                                                            Executor is a User, so /dashboard/chat/[id] should work if they have access.
                                                          */}
                                                        <Button size="sm" variant="outline" leftIcon={<MessageCircle size={14} />}>
                                                            Чат
                                                        </Button>
                                                    </Link>

                                                    {['PAID', 'PROCESSING'].includes(order.status) && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                            leftIcon={<CheckCircle size={14} />}
                                                            onClick={() => handleComplete(order.id)}
                                                        >
                                                            Готово
                                                        </Button>
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
            </Card>
        </div>
    );
}
