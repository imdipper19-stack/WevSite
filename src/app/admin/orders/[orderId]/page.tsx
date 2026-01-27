'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft,
    CheckCircle,
    XCircle,
    User,
    MessageCircle,
    Copy,
    Save
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

interface UserItem {
    id: string;
    name: string;
    email: string;
}

interface OrderDetail {
    id: string;
    orderNumber: string;
    status: string;
    buyerId: string;
    executorId?: string | null;
    coinsAmount: number;
    pricePerCoin: string;
    totalPrice: string;
    tiktokLogin?: string;
    tiktokPassword?: string;
    telegramUsername?: string;
    createdAt: string;
    buyer: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
    };
    executor?: {
        id: string;
        firstName?: string;
        lastName?: string;
    };
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [executors, setExecutors] = useState<UserItem[]>([]);
    const [selectedExecutor, setSelectedExecutor] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [orderId]);

    const fetchData = async () => {
        try {
            // Fetch order (we might need a dedicated GET endpoint or use the list endpoint logic? 
            // Admin list endpoint doesn't return full details usually. 
            // Let's assume we can GET /api/admin/orders/[id] which usually exists or we check if GET is implemented in route.ts.
            // Wait, I only modified PATCH in route.ts. Default GET usually isn't there unless I added it.
            // I should check route.ts again. If GET is missing, I need to add it!

            // Assuming I will add GET support to route.ts in next step if missing.
            const orderRes = await fetch(`/api/admin/orders/${orderId}`);
            if (orderRes.ok) {
                const data = await orderRes.json();
                setOrder(data.order);
                setSelectedExecutor(data.order.executorId || '');
            }

            // Fetch executors
            const execRes = await fetch('/api/admin/users?role=EXECUTOR&limit=100');
            if (execRes.ok) {
                const data = await execRes.json();
                setExecutors(data.users);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignExecutor = async () => {
        if (!order) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ executorId: selectedExecutor || null })
            });
            if (res.ok) {
                alert('Исполнитель назначен');
                fetchData(); // Refresh
            } else {
                alert('Ошибка при назначении');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!confirm('Изменить статус?')) return;
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchData();
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="p-8">Загрузка...</div>;
    if (!order) return <div className="p-8">Заказ не найден</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
            <div className="flex items-center gap-4">
                <Link href="/admin/orders">
                    <Button variant="ghost" size="icon"><ChevronLeft /></Button>
                </Link>
                <h1 className="text-2xl font-bold">Заказ #{order.orderNumber}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-bold mb-4">Информация о заказе</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Статус</span>
                            <span className="font-medium">{order.status}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Монеты</span>
                            <span className="font-medium">{order.coinsAmount}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Сумма</span>
                            <span className="font-medium">{Number(order.totalPrice).toFixed(0)} ₽</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Дата</span>
                            <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        {order.tiktokLogin && (
                            <div className="pt-2">
                                <p className="text-sm text-gray-500">Данные TikTok:</p>
                                <p className="font-mono bg-gray-100 p-2 rounded selectable">
                                    Login: {order.tiktokLogin}<br />
                                    Pass: {order.tiktokPassword}
                                </p>
                            </div>
                        )}
                        {order.telegramUsername && (
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Telegram</span>
                                <span className="font-medium">@{order.telegramUsername}</span>
                            </div>
                        )}
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-bold mb-4">Управление</h3>
                    <div className="space-y-6">
                        {/* Executor Assignment */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Исполнитель</label>
                            <div className="flex gap-2">
                                <select
                                    className="flex-1 p-2 bg-[var(--background)] border rounded"
                                    value={selectedExecutor}
                                    onChange={(e) => setSelectedExecutor(e.target.value)}
                                >
                                    <option value="">Не назначен</option>
                                    {executors.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                                <Button onClick={handleAssignExecutor} disabled={saving} leftIcon={<Save size={16} />}>
                                    Сохранить
                                </Button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t space-y-2">
                            <Link href={`/admin/orders/${orderId}/chat`} className="block">
                                <Button variant="outline" className="w-full" leftIcon={<MessageCircle size={16} />}>
                                    Открыть чат
                                </Button>
                            </Link>

                            {['PROCESSING', 'PENDING_PAYMENT', 'PAID'].includes(order.status) && (
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleStatusUpdate('COMPLETED')}
                                    >
                                        Выполнить
                                    </Button>
                                    <Button
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                        onClick={() => handleStatusUpdate('CANCELLED')}
                                    >
                                        Отменить
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
