'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Star,
    CreditCard,
    Wallet,
    ChevronRight,
    Shield,
    Zap,
    Check,
    Info,
    Send,
    ExternalLink
} from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';

const starsPackages = [
    { amount: 50, price: 75 },
    { amount: 100, price: 150 },
    { amount: 250, price: 375 },
    { amount: 500, price: 750, popular: true },
    { amount: 1000, price: 1500 },
    { amount: 2500, price: 3750 },
    { amount: 5000, price: 7500 },
    { amount: 10000, price: 15000 },
];

export default function BuyStarsPage() {
    const router = useRouter();
    const [selectedAmount, setSelectedAmount] = useState(500);
    const [customAmount, setCustomAmount] = useState('');
    const [telegramUsername, setTelegramUsername] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [pricePerStar, setPricePerStar] = useState(1.5); // Default, updated from API

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.starsPriceRub) {
                    setPricePerStar(data.starsPriceRub);
                }
            })
            .catch(console.error);
    }, []);

    const currentAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;
    const totalPrice = currentAmount * pricePerStar;

    // Recalculate packages based on dynamic price
    const dynamicPackages = starsPackages.map(pkg => ({
        ...pkg,
        price: pkg.amount * pricePerStar
    }));

    const handleCustomAmountChange = (value: string) => {
        const numValue = value.replace(/\D/g, '');
        if (numValue === '' || (parseInt(numValue) >= 0 && parseInt(numValue) <= 100000)) {
            setCustomAmount(numValue);
            if (numValue) {
                setSelectedAmount(0);
            }
        }
    };

    const handleUsernameChange = (value: string) => {
        // Remove @ if user adds it
        const cleaned = value.startsWith('@') ? value.slice(1) : value;
        setTelegramUsername(cleaned);
    };

    const handlePurchase = async () => {
        if (currentAmount < 50) {
            setError('Минимум 50 звёзд');
            return;
        }

        if (!telegramUsername.trim()) {
            setError('Введите Telegram username получателя');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const res = await fetch('/api/orders/stars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    starsAmount: currentAmount,
                    telegramUsername: telegramUsername.trim(),
                    paymentMethod: selectedPayment,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Ошибка при создании заказа');
                return;
            }

            // Order created successfully - redirect to payment
            router.push(`/dashboard/pay-stars/${data.order.id}`);
        } catch (err) {
            console.error(err);
            setError('Произошла ошибка сети');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Star className="w-7 h-7 text-yellow-500" />
                    Купить Telegram Stars
                </h1>
                <p className="text-[var(--foreground-muted)]">
                    Мгновенная доставка через Fragment • Оплата TON
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Amount Selection */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Package Selection */}
                    <Card>
                        <CardContent>
                            <h3 className="text-lg font-semibold mb-4">Количество звёзд</h3>

                            {/* Preset Amounts */}
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                {dynamicPackages.map((pkg) => (
                                    <button
                                        key={pkg.amount}
                                        onClick={() => {
                                            setSelectedAmount(pkg.amount);
                                            setCustomAmount('');
                                        }}
                                        className={`
                      relative p-3 rounded-xl border-2 transition-all duration-200 text-center
                      ${selectedAmount === pkg.amount && !customAmount
                                                ? 'border-yellow-500 bg-yellow-500/5'
                                                : 'border-[var(--border)] hover:border-yellow-500/50'
                                            }
                    `}
                                    >
                                        {pkg.popular && (
                                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-medium rounded-full whitespace-nowrap">
                                                Популярный
                                            </span>
                                        )}
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            <span className="font-bold">{pkg.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="text-xs text-[var(--foreground-muted)]">
                                            {pkg.price.toLocaleString()}₽
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Custom Amount */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Или введите своё количество</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={customAmount}
                                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                                        placeholder="От 50 до 100,000"
                                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-yellow-500"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[var(--foreground-muted)]">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span>звёзд</span>
                                    </div>
                                </div>
                                <p className="text-xs text-[var(--foreground-muted)] mt-2">
                                    Минимум: 50 звёзд • Максимум: 100,000 звёзд
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Telegram Username */}
                    <Card>
                        <CardContent>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Send className="w-5 h-5 text-[#0088cc]" />
                                Получатель звёзд
                            </h3>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">@</span>
                                <input
                                    type="text"
                                    value={telegramUsername}
                                    onChange={(e) => handleUsernameChange(e.target.value)}
                                    placeholder="username"
                                    className="w-full px-4 py-3 pl-8 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[#0088cc]"
                                />
                            </div>
                            <p className="text-xs text-[var(--foreground-muted)] mt-2">
                                Введите Telegram username аккаунта, на который нужно отправить звёзды
                            </p>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card>
                        <CardContent>
                            <h3 className="text-lg font-semibold mb-4">Способ оплаты</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setSelectedPayment('card')}
                                    className={`
                                        w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                                        ${selectedPayment === 'card'
                                            ? 'border-yellow-500 bg-yellow-500/5'
                                            : 'border-[var(--border)] hover:border-yellow-500/50'
                                        }
                                    `}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPayment === 'card'
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-[var(--background)] text-[var(--foreground-muted)]'
                                        }`}>
                                        <CreditCard size={24} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">Банковская карта</p>
                                        <p className="text-sm text-[var(--foreground-muted)]">Visa, MasterCard, МИР</p>
                                    </div>
                                    {selectedPayment === 'card' && (
                                        <Check className="w-5 h-5 text-yellow-500" />
                                    )}
                                </button>

                                <button
                                    onClick={() => setSelectedPayment('sbp')}
                                    className={`
                                        w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                                        ${selectedPayment === 'sbp'
                                            ? 'border-yellow-500 bg-yellow-500/5'
                                            : 'border-[var(--border)] hover:border-yellow-500/50'
                                        }
                                    `}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPayment === 'sbp'
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-[var(--background)] text-[var(--foreground-muted)]'
                                        }`}>
                                        <Wallet size={24} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">СБП</p>
                                        <p className="text-sm text-[var(--foreground-muted)]">Система быстрых платежей</p>
                                    </div>
                                    {selectedPayment === 'sbp' && (
                                        <Check className="w-5 h-5 text-yellow-500" />
                                    )}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Order Summary */}
                <div className="space-y-6">
                    {/* Order Summary Card */}
                    <Card className="sticky top-6">
                        <CardContent>
                            <h3 className="text-lg font-semibold mb-4">Ваш заказ</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-[var(--foreground-muted)]">Количество</span>
                                    <span className="font-medium flex items-center gap-1">
                                        {currentAmount.toLocaleString()}
                                        <Star className="w-4 h-4 text-yellow-500" />
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--foreground-muted)]">Цена за звезду</span>
                                    <span className="font-medium">{pricePerStar}₽</span>
                                </div>
                                {telegramUsername && (
                                    <div className="flex justify-between">
                                        <span className="text-[var(--foreground-muted)]">Получатель</span>
                                        <span className="font-medium text-[#0088cc]">@{telegramUsername}</span>
                                    </div>
                                )}
                                <div className="border-t border-[var(--border)] pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Итого</span>
                                        <span className="text-2xl font-bold text-yellow-500">
                                            {totalPrice.toLocaleString()}₽
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-[var(--error)] text-center mb-3">
                                    {error}
                                </p>
                            )}

                            <Button
                                variant="accent"
                                size="lg"
                                fullWidth
                                isLoading={isProcessing}
                                disabled={currentAmount < 50 || !telegramUsername.trim() || isProcessing}
                                onClick={handlePurchase}
                                rightIcon={!isProcessing ? <ChevronRight size={18} /> : undefined}
                                className="!bg-yellow-500 hover:!bg-yellow-600 !text-black"
                            >
                                {isProcessing ? 'Создание заказа...' : 'Перейти к оплате'}
                            </Button>

                            {currentAmount < 50 && currentAmount > 0 && (
                                <p className="text-sm text-[var(--error)] text-center mt-3">
                                    Минимум 50 звёзд
                                </p>
                            )}

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t border-[var(--border)] space-y-3">
                                <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                                    <Shield className="w-4 h-4 text-[var(--success)]" />
                                    <span>Безопасная транзакция</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    <span>Автоматическая доставка</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Card */}
                    <Card className="bg-[var(--info)]/10 border-[var(--info)]/20">
                        <CardContent>
                            <div className="flex gap-3">
                                <Info className="w-5 h-5 text-[var(--info)] flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-[var(--foreground)] mb-1">Как это работает?</p>
                                    <p className="text-[var(--foreground-muted)]">
                                        1. Укажите количество звёзд и username получателя<br />
                                        2. Оплатите заказ через TonKeeper<br />
                                        3. Звёзды автоматически отправятся через Fragment
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
