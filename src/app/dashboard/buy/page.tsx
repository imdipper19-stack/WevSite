'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Coins,
    CreditCard,
    Wallet,
    ChevronRight,
    Shield,
    Zap,
    Check,
    Info,
    Loader2
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

const coinPackages = [
    { amount: 30, price: 45 },
    { amount: 100, price: 150 },
    { amount: 500, price: 750 },
    { amount: 1000, price: 1500, popular: true },
    { amount: 5000, price: 7500 },
    { amount: 10000, price: 15000 },
    { amount: 50000, price: 75000 },
    { amount: 100000, price: 150000 },
];

const paymentMethods = [
    { id: 'card', name: 'Банковская карта', icon: CreditCard, description: 'Visa, MasterCard, МИР' },
    { id: 'yoomoney', name: 'ЮMoney', icon: Wallet, description: 'Кошелек ЮMoney' },
    { id: 'sbp', name: 'СБП', icon: Wallet, description: 'Система быстрых платежей' },
];

export default function BuyCoinsPage() {
    const router = useRouter();
    const [selectedAmount, setSelectedAmount] = useState(1000);
    const [customAmount, setCustomAmount] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [pricePerCoin, setPricePerCoin] = useState(1.5); // Default, updated from API

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.tiktokCoinPriceRub) {
                    setPricePerCoin(data.tiktokCoinPriceRub);
                }
            })
            .catch(console.error);
    }, []);

    const currentAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;
    const totalPrice = currentAmount * pricePerCoin;

    // Recalculate packages based on dynamic price
    const dynamicPackages = coinPackages.map(pkg => ({
        ...pkg,
        price: pkg.amount * pricePerCoin
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

    const handlePurchase = async () => {
        if (currentAmount < 30) {
            setError('Минимум 30 монет');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coinsAmount: currentAmount,
                    paymentMethod: selectedPayment,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Ошибка при создании заказа');
                return;
            }

            // Order created successfully
            alert(`Заказ #${data.order.orderNumber} успешно создан!\n\nСумма: ${data.order.totalPrice}₽\nСтатус: Ожидает оплаты\n\nВ демо-версии оплата не реализована.`);

            // Redirect to orders page
            router.push('/dashboard/orders');
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
                <h1 className="text-2xl font-bold mb-2">Купить TikTok монеты</h1>
                <p className="text-[var(--foreground-muted)]">
                    Выберите количество монет и способ оплаты
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Amount Selection */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Package Selection */}
                    <Card>
                        <CardContent>
                            <h3 className="text-lg font-semibold mb-4">Количество монет</h3>

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
                                                ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                                                : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                                            }
                    `}
                                    >
                                        {pkg.popular && (
                                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--accent)] text-white text-[10px] font-medium rounded-full whitespace-nowrap">
                                                Популярный
                                            </span>
                                        )}
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <Coins className="w-4 h-4 text-[var(--accent)]" />
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
                                        placeholder="От 30 до 100,000"
                                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)]"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[var(--foreground-muted)]">
                                        <Coins className="w-4 h-4" />
                                        <span>монет</span>
                                    </div>
                                </div>
                                <p className="text-xs text-[var(--foreground-muted)] mt-2">
                                    Минимум: 30 монет • Максимум: 100,000 монет
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
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
                                    <span className="font-medium">{currentAmount.toLocaleString()} монет</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--foreground-muted)]">Цена за монету</span>
                                    <span className="font-medium">{pricePerCoin}₽</span>
                                </div>
                                <div className="border-t border-[var(--border)] pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Итого</span>
                                        <span className="text-2xl font-bold gradient-text">
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
                                disabled={currentAmount < 30 || isProcessing}
                                onClick={handlePurchase}
                                rightIcon={!isProcessing ? <ChevronRight size={18} /> : undefined}
                            >
                                {isProcessing ? 'Создание заказа...' : 'Оформить заказ'}
                            </Button>

                            {currentAmount < 30 && currentAmount > 0 && (
                                <p className="text-sm text-[var(--error)] text-center mt-3">
                                    Минимум 30 монет
                                </p>
                            )}

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t border-[var(--border)] space-y-3">
                                <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                                    <Shield className="w-4 h-4 text-[var(--success)]" />
                                    <span>Безопасный платеж</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                                    <Zap className="w-4 h-4 text-[var(--accent)]" />
                                    <span>Моментальная доставка</span>
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
                                        После оплаты вам будет назначен исполнитель. Передайте ему данные от TikTok аккаунта, и монеты будут зачислены в течение нескольких минут.
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
