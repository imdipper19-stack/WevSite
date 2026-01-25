'use client';

import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    CreditCard,
    Wallet,
    Download,
    Calendar
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

// Mock financial data
const stats = [
    { title: 'Выручка сегодня', value: '₽234,500', change: '+18%', isPositive: true },
    { title: 'Выручка за неделю', value: '₽1,456,200', change: '+12%', isPositive: true },
    { title: 'Выручка за месяц', value: '₽5,234,800', change: '+23%', isPositive: true },
    { title: 'К выплате исполнителям', value: '₽156,400', change: '12 человек', isPositive: null },
];

const recentPayments = [
    { id: 'PAY-001', user: 'Иван П.', type: 'deposit', amount: 5000, method: 'Банковская карта', date: '23 янв, 14:30', status: 'completed' },
    { id: 'PAY-002', user: 'Исп. #42', type: 'payout', amount: -7500, method: 'ЮMoney', date: '23 янв, 12:00', status: 'completed' },
    { id: 'PAY-003', user: 'Мария С.', type: 'deposit', amount: 10000, method: 'СБП', date: '23 янв, 10:45', status: 'completed' },
    { id: 'PAY-004', user: 'Дмитрий К.', type: 'refund', amount: -1500, method: 'Возврат', date: '22 янв, 18:20', status: 'completed' },
    { id: 'PAY-005', user: 'Исп. #38', type: 'payout', amount: -12000, method: 'Банковская карта', date: '22 янв, 15:00', status: 'pending' },
];

const pendingPayouts = [
    { executor: 'Исполнитель #42', amount: 45600, ordersCount: 28, rating: 4.9 },
    { executor: 'Исполнитель #38', amount: 23400, ordersCount: 15, rating: 4.8 },
    { executor: 'Исполнитель #35', amount: 18900, ordersCount: 12, rating: 4.7 },
];

const typeConfig: Record<string, { label: string; color: string }> = {
    deposit: { label: 'Пополнение', color: 'text-[var(--success)]' },
    payout: { label: 'Выплата', color: 'text-[var(--warning)]' },
    refund: { label: 'Возврат', color: 'text-[var(--error)]' },
};

export default function AdminFinancePage() {
    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Финансы</h1>
                    <p className="text-[var(--foreground-muted)]">Отчёты и выплаты</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" leftIcon={<Calendar size={16} />}>
                        Период
                    </Button>
                    <Button variant="secondary" leftIcon={<Download size={16} />}>
                        Экспорт
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent>
                            <p className="text-sm text-[var(--foreground-muted)] mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold mb-2">{stat.value}</p>
                            {stat.isPositive !== null ? (
                                <div className="flex items-center gap-1">
                                    {stat.isPositive ? (
                                        <TrendingUp className="w-4 h-4 text-[var(--success)]" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-[var(--error)]" />
                                    )}
                                    <span className={`text-sm ${stat.isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                                        {stat.change}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm text-[var(--foreground-muted)]">{stat.change}</span>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Payments */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Последние транзакции</CardTitle>
                        <Button variant="ghost" size="sm">Все →</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentPayments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${payment.type === 'deposit' ? 'bg-[var(--success)]/10' : 'bg-[var(--warning)]/10'
                                            }`}>
                                            {payment.type === 'deposit' ? (
                                                <ArrowUpRight className="w-5 h-5 text-[var(--success)]" />
                                            ) : (
                                                <DollarSign className="w-5 h-5 text-[var(--warning)]" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{payment.user}</p>
                                            <p className="text-sm text-[var(--foreground-muted)]">
                                                {typeConfig[payment.type].label} • {payment.method}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${payment.amount > 0 ? 'text-[var(--success)]' : ''}`}>
                                            {payment.amount > 0 ? '+' : ''}{payment.amount.toLocaleString()}₽
                                        </p>
                                        <p className="text-sm text-[var(--foreground-muted)]">{payment.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Payouts */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>К выплате</CardTitle>
                        <Button variant="accent" size="sm">Выплатить всем</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingPayouts.map((payout, index) => (
                                <div key={index} className="p-3 bg-[var(--background)] rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium">{payout.executor}</p>
                                            <p className="text-sm text-[var(--foreground-muted)]">
                                                {payout.ordersCount} заказов • ★ {payout.rating}
                                            </p>
                                        </div>
                                        <p className="font-bold">{payout.amount.toLocaleString()}₽</p>
                                    </div>
                                    <Button variant="secondary" size="sm" fullWidth>
                                        Выплатить
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Methods Stats */}
            <Card>
                <CardHeader>
                    <CardTitle>Способы оплаты</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { name: 'Банковские карты', icon: CreditCard, amount: '₽3,245,600', percent: 62 },
                            { name: 'ЮMoney', icon: Wallet, amount: '₽1,234,500', percent: 24 },
                            { name: 'СБП', icon: CreditCard, amount: '₽754,700', percent: 14 },
                        ].map((method, i) => (
                            <div key={i} className="p-4 bg-[var(--background)] rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                                        <method.icon className="w-5 h-5 text-[var(--primary)]" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{method.name}</p>
                                        <p className="text-sm text-[var(--foreground-muted)]">{method.percent}% от общего</p>
                                    </div>
                                </div>
                                <p className="text-xl font-bold">{method.amount}</p>
                                <div className="mt-2 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#6A11CB] to-[#2575FC] rounded-full"
                                        style={{ width: `${method.percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
