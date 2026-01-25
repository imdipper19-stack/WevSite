'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Copy,
    MessageCircle,
    CreditCard,
    Loader2,
    Star
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ReviewModal } from '@/components/ReviewModal';

interface Order {
    id: string;
    orderNumber: string;
    coinsAmount: number;
    totalPrice: number;
    status: string;
    productType: string;
    telegramUsername?: string;
    tiktokLogin?: string;
    createdAt: string;
    paymentMethod?: string;
    review?: {
        rating: number;
        content: string;
        createdAt: string;
        isApproved: boolean;
    };
}

const statusConfig: Record<string, { icon: any; color: string; bgColor: string; text: string }> = {
    PENDING_PAYMENT: { icon: CreditCard, color: 'text-[var(--warning)]', bgColor: 'bg-[var(--warning)]/10', text: 'Ожидает оплаты' },
    PAID: { icon: Clock, color: 'text-[var(--info)]', bgColor: 'bg-[var(--info)]/10', text: 'Оплачен' },
    PROCESSING: { icon: Clock, color: 'text-[var(--info)]', bgColor: 'bg-[var(--info)]/10', text: 'В обработке' },
    AWAITING_CREDENTIALS: { icon: AlertCircle, color: 'text-[var(--warning)]', bgColor: 'bg-[var(--warning)]/10', text: 'Ожидает данных' },
    IN_PROGRESS: { icon: Clock, color: 'text-[var(--info)]', bgColor: 'bg-[var(--info)]/10', text: 'Выполняется' },
    COMPLETED: { icon: CheckCircle, color: 'text-[var(--success)]', bgColor: 'bg-[var(--success)]/10', text: 'Выполнен' },
    CANCELLED: { icon: XCircle, color: 'text-[var(--error)]', bgColor: 'bg-[var(--error)]/10', text: 'Отменён' },
    REFUNDED: { icon: XCircle, color: 'text-[var(--error)]', bgColor: 'bg-[var(--error)]/10', text: 'Возврат' },
};

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params?.orderId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${orderId}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data.order);
            } else {
                setError('Заказ не найден');
            }
        } catch (err) {
            setError('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
    );

    if (error || !order) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <XCircle className="w-12 h-12 text-[var(--error)]" />
            <h2 className="text-xl font-bold">{error || 'Заказ не найден'}</h2>
            <Link href="/dashboard/orders">
                <Button variant="outline">К списку заказов</Button>
            </Link>
        </div>
    );

    const config = statusConfig[order.status] || statusConfig.PROCESSING;
    const StatusIcon = config.icon;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 animate-fadeIn">
            <Link href="/dashboard/orders" className="inline-flex items-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-6 transition-colors">
                <ChevronLeft size={20} />
                <span>Все заказы</span>
            </Link>

            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Заказ #{order.orderNumber}
                        <button
                            onClick={() => copyToClipboard(order.orderNumber)}
                            className="text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors"
                        >
                            <Copy size={18} />
                        </button>
                    </h1>
                    <p className="text-[var(--foreground-muted)] mt-1">
                        от {new Date(order.createdAt).toLocaleString('ru-RU')}
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${config.bgColor} ${config.color}`}>
                    <StatusIcon size={20} />
                    <span className="font-semibold">{config.text}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Информация о заказе</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-[var(--border)]">
                            <span className="text-[var(--foreground-muted)]">Услуга</span>
                            <span className="font-medium">
                                {order.productType === 'TELEGRAM_STARS' ? 'Telegram Stars' : 'TikTok Coins'}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[var(--border)]">
                            <span className="text-[var(--foreground-muted)]">Количество</span>
                            <span className="font-medium">{order.coinsAmount} шт.</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[var(--border)]">
                            <span className="text-[var(--foreground-muted)]">Сумма</span>
                            <span className="font-bold text-lg">{order.totalPrice} ₽</span>
                        </div>
                        {order.telegramUsername && (
                            <div className="flex justify-between py-2 border-b border-[var(--border)]">
                                <span className="text-[var(--foreground-muted)]">Получатель</span>
                                <span className="font-medium text-[var(--primary)]">@{order.telegramUsername}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Status & Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Действия</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Payment Button */}
                        {order.status === 'PENDING_PAYMENT' && (
                            <div className="p-4 bg-[var(--warning)]/10 rounded-xl border border-[var(--warning)]/20">
                                <h3 className="font-semibold text-[var(--warning)] mb-2">Оплата не завершена</h3>
                                <p className="text-sm text-[var(--foreground-muted)] mb-4">
                                    Для начала выполнения заказа необходимо произвести оплату.
                                </p>
                                <Link
                                    href={order.productType === 'TELEGRAM_STARS'
                                        ? `/dashboard/pay-stars/${order.id}`
                                        : `/payment/${order.id}` // Fallback/TODO for TikTok
                                    }
                                >
                                    <Button className="w-full">
                                        Оплатить {order.totalPrice} ₽
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Review Button */}
                        {order.status === 'COMPLETED' && !order.review && (
                            <Button
                                variant="accent"
                                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:opacity-90 border-none"
                                leftIcon={<Star size={18} fill="currentColor" />}
                                onClick={() => setShowReviewModal(true)}
                            >
                                Оставить отзыв
                            </Button>
                        )}

                        {/* Chat Button */}
                        <Link href={`/dashboard/chat?order=${order.id}`}>
                            <Button variant="outline" className="w-full" leftIcon={<MessageCircle size={18} />}>
                                Чат с поддержкой
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Review Display */}
                {order.review && (
                    <Card className="md:col-span-2 border-yellow-500/20 bg-yellow-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="text-yellow-400" fill="currentColor" />
                                Ваш отзыв
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} size={16} className={s <= order.review!.rating ? "text-yellow-400" : "text-gray-300"} fill={s <= order.review!.rating ? "currentColor" : "none"} />
                                ))}
                                <span className="text-sm text-[var(--foreground-muted)] ml-2">
                                    {new Date(order.review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-[var(--foreground)]">{order.review.content}</p>
                            {!order.review.isApproved && (
                                <p className="text-sm text-[var(--warning)] mt-2 flex items-center gap-1">
                                    <Clock size={14} /> На модерации
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <ReviewModal
                orderId={order.id}
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                onSuccess={() => {
                    fetchOrder();
                }}
            />
        </div>
    );
}
