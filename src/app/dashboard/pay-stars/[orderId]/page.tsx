'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Star,
    Wallet,
    Copy,
    Check,
    ExternalLink,
    Loader2,
    ArrowLeft,
    Shield,
    Clock,
    AlertCircle,
    CreditCard
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

const paymentMethods = [
    { id: 'card', name: 'Банковская карта', icon: CreditCard, description: 'Visa, MasterCard, МИР' },
    { id: 'sbp', name: 'СБП', icon: Wallet, description: 'Система быстрых платежей' },
];

interface Order {
    id: string;
    orderNumber: string;
    starsAmount: number;
    totalPrice: number;
    telegramUsername: string;
    status: string;
    paymentMethod?: string;
}

export default function PayStarsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'error'>('pending');
    const [selectedPayment, setSelectedPayment] = useState('card');

    // TODO: Replace with real TON wallet address from env
    const tonWalletAddress = 'UQD_YOUR_TON_WALLET_ADDRESS_HERE';

    // Calculate TON amount (approximate, needs real exchange rate)
    const tonAmount = order ? (order.totalPrice / 200).toFixed(2) : '0'; // Rough RUB to TON

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    async function fetchOrder() {
        try {
            const res = await fetch(`/api/orders/${orderId}`);
            if (res.ok) {
                const data = await res.json();
                setOrder({
                    id: data.order.id,
                    orderNumber: data.order.orderNumber,
                    starsAmount: data.order.coinsAmount,
                    totalPrice: data.order.totalPrice,
                    telegramUsername: data.order.telegramUsername || '',
                    status: data.order.status,
                    paymentMethod: data.order.paymentMethod,
                });
                if (data.order.paymentMethod) {
                    setSelectedPayment(data.order.paymentMethod);
                }
            } else {
                router.push('/dashboard/orders');
            }
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    }

    const copyAddress = () => {
        navigator.clipboard.writeText(tonWalletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openTonkeeper = () => {
        // Deep link to TonKeeper with payment details
        const tonkeeperUrl = `https://app.tonkeeper.com/transfer/${tonWalletAddress}?amount=${parseFloat(tonAmount) * 1e9}&text=Stars_${order?.orderNumber}`;
        window.open(tonkeeperUrl, '_blank');
        setPaymentStatus('processing');
    };

    const handlePaymentConfirmed = async () => {
        setIsProcessing(true);

        try {
            if (selectedPayment === 'sbp' || selectedPayment === 'card') { // Assuming both go through Platega for now
                // Create payment via Platega
                const res = await fetch('/api/payment/platega/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: order?.id
                    }),
                });

                const data = await res.json();

                if (res.ok && data.url) {
                    window.location.href = data.url;
                } else {
                    console.error('Platega Init Error:', data);
                    setPaymentStatus('error');
                    setIsProcessing(false);
                }
                return;
            }

            // Fallback for other methods if any (e.g. crypto manual)
            // But currently only Card/SBP are shown.
        } catch (error) {
            console.error('Payment initiation failed', error);
            setPaymentStatus('error');
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-16">
                <h2 className="text-xl font-semibold mb-4">Заказ не найден</h2>
                <Link href="/dashboard/orders">
                    <Button variant="primary">Перейти к заказам</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/buy-stars">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-500" />
                        Оплата заказа
                    </h1>
                    <p className="text-[var(--foreground-muted)]">
                        Заказ #{order.orderNumber}
                    </p>
                </div>
            </div>

            {/* Order Summary */}
            <Card>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
                            <span className="text-[var(--foreground-muted)]">Продукт</span>
                            <span className="font-medium flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                {order.starsAmount.toLocaleString()} Telegram Stars
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--foreground-muted)]">Получатель</span>
                            <span className="font-medium text-[#0088cc]">@{order.telegramUsername}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--foreground-muted)]">Сумма</span>
                            <span className="font-bold text-xl text-yellow-500">
                                {order.totalPrice.toLocaleString()}₽
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--foreground-muted)]">≈ в TON</span>
                            <span className="font-medium">{tonAmount} TON</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Method Selection */}
            {paymentStatus === 'pending' && (
                <Card>
                    <CardContent>
                        <h3 className="text-lg font-semibold mb-4">Способ оплаты</h3>
                        <div className="space-y-3">
                            {paymentMethods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedPayment(method.id)}
                                    className={`
                                        w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                                        ${selectedPayment === method.id
                                            ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                                            : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                                        }
                                    `}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPayment === method.id
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'bg-[var(--background)] text-[var(--foreground-muted)]'
                                        }`}>
                                        <method.icon size={24} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">{method.name}</p>
                                        <p className="text-sm text-[var(--foreground-muted)]">{method.description}</p>
                                    </div>
                                    {selectedPayment === method.id && (
                                        <Check className="w-5 h-5 text-[var(--primary)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Status */}
            {paymentStatus === 'success' ? (
                <Card className="bg-[var(--success)]/10 border-[var(--success)]/20">
                    <CardContent className="text-center py-8">
                        <div className="w-16 h-16 bg-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-[var(--success)] mb-2">
                            Оплата подтверждена!
                        </h3>
                        <p className="text-[var(--foreground-muted)]">
                            Звёзды будут отправлены на @{order.telegramUsername} в ближайшие минуты
                        </p>
                    </CardContent>
                </Card>
            ) : paymentStatus === 'error' ? (
                <Card className="bg-[var(--error)]/10 border-[var(--error)]/20">
                    <CardContent className="text-center py-8">
                        <AlertCircle className="w-16 h-16 text-[var(--error)] mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-[var(--error)] mb-2">
                            Ошибка оплаты
                        </h3>
                        <p className="text-[var(--foreground-muted)] mb-4">
                            Не удалось подтвердить транзакцию. Попробуйте ещё раз.
                        </p>
                        <Button variant="primary" onClick={() => setPaymentStatus('pending')}>
                            Попробовать снова
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Payment Instructions */}
                    <Card>
                        <CardContent>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                {selectedPayment === 'sbp' ? (
                                    <>
                                        <Wallet className="w-5 h-5 text-green-600" />
                                        Оплата через СБП
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5 text-[var(--primary)]" />
                                        Оплата картой
                                    </>
                                )}
                            </h3>

                            {selectedPayment === 'sbp' ? (
                                <>
                                    {/* SBP Details - REMOVED MANUAL DETAILS, Platega handles it */}
                                    <div className="bg-[var(--background)] rounded-xl p-4 mb-4 text-center">
                                        <p className="text-[var(--foreground-muted)]">
                                            Вы будете перенаправлены на защищенную страницу оплаты Platega.
                                        </p>
                                    </div>

                                    {/* Amount */}
                                    <div className="bg-yellow-500/10 rounded-xl p-4 mb-4 border border-yellow-500/20">
                                        <p className="text-sm text-[var(--foreground-muted)] mb-1">
                                            Сумма к оплате:
                                        </p>
                                        <p className="text-2xl font-bold text-yellow-500">
                                            {order.totalPrice.toLocaleString()}₽
                                        </p>
                                        <p className="text-xs text-[var(--foreground-muted)] mt-1">
                                            Обязательно укажите в комментарии: Stars_{order.orderNumber}
                                        </p>
                                    </div>

                                    {/* Instructions for Platega SBP */}
                                    <div className="space-y-2 text-sm text-[var(--foreground-muted)] mb-6">
                                        <p className="flex items-start gap-2">
                                            <span className="w-5 h-5 bg-[var(--primary)]/20 rounded-full flex items-center justify-center text-xs font-bold text-[var(--primary)]">1</span>
                                            Нажмите кнопку ниже для перехода к оплате
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <span className="w-5 h-5 bg-[var(--primary)]/20 rounded-full flex items-center justify-center text-xs font-bold text-[var(--primary)]">2</span>
                                            Оплатите через приложение вашего банка по СБП
                                        </p>
                                    </div>
                                </>
                            ) : (
                                // Card Payment Simulated Info
                                <div className="space-y-6">
                                    <div className="bg-[var(--background)] rounded-xl p-6 text-center border border-[var(--border)]">
                                        <div className="w-16 h-10 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg mx-auto mb-4 flex items-center justify-center text-white/50 text-xs">
                                            CARD
                                        </div>
                                        <p className="text-sm text-[var(--foreground-muted)] mb-2">
                                            Сумма к оплате
                                        </p>
                                        <p className="text-3xl font-bold mb-4">
                                            {order.totalPrice.toLocaleString()}₽
                                        </p>
                                        <p className="text-xs text-[var(--foreground-muted)]">
                                            Нажмите кнопку ниже для безопасной оплаты банковской картой.
                                            <br />
                                            Комиссия 0%
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Confirm Payment */}
                    <Card>
                        <CardContent>
                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={handlePaymentConfirmed}
                                isLoading={isProcessing}
                                className={selectedPayment === 'sbp' ? "!bg-yellow-500 hover:!bg-yellow-600 !text-black" : ""}
                            >
                                {selectedPayment === 'sbp' ? 'Перейти к оплате' : 'Оплатить картой'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Security Note */}
                    <div className="flex items-start gap-3 text-sm text-[var(--foreground-muted)]">
                        <Shield className="w-5 h-5 text-[var(--success)] flex-shrink-0" />
                        <p>
                            После проверки оплаты оператором, звезды будут отправлены автоматически.
                            Обычно это занимает 5-15 минут.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
