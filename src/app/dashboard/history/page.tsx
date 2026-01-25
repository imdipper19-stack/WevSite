'use client';

import { useState, useEffect } from 'react';
import { Clock, ArrowUpRight, ArrowDownRight, Coins, Loader2, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

interface Transaction {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'PURCHASE' | 'REFUND';
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: string;
    description: string;
}

export default function HistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await fetch('/api/transactions');
            if (res.ok) {
                const data = await res.json();
                setTransactions(data.transactions);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
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
            <div>
                <h1 className="text-2xl font-bold">История транзакций</h1>
                <p className="text-[var(--foreground-muted)]">
                    Все ваши операции в одном месте
                </p>
            </div>

            {/* Transactions List */}
            {transactions.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Clock className="w-16 h-16 text-[var(--foreground-muted)] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Нет транзакций</h3>
                        <p className="text-[var(--foreground-muted)] max-w-md mx-auto">
                            У вас пока нет ни одной транзакции. Совершите первую покупку монет,
                            и она появится здесь.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card padding="none">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                                    <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Тип</th>
                                    <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Сумма</th>
                                    <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Описание</th>
                                    <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Дата</th>
                                    <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => {
                                    const isPositive = tx.type === 'DEPOSIT' || tx.type === 'REFUND';
                                    const Icon = isPositive ? ArrowDownRight : ArrowUpRight;

                                    return (
                                        <tr key={tx.id} className="border-b border-[var(--border)] hover:bg-[var(--background)]">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                        }`}>
                                                        <Icon size={16} />
                                                    </div>
                                                    <span className="font-medium">
                                                        {tx.type === 'PURCHASE' ? 'Покупка' :
                                                            tx.type === 'DEPOSIT' ? 'Пополнение' :
                                                                tx.type === 'REFUND' ? 'Возврат' : 'Вывод'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-semibold">
                                                <span className={isPositive ? 'text-green-600' : 'text-[var(--foreground)]'}>
                                                    {isPositive ? '+' : '-'}{Number(tx.amount).toLocaleString()}₽
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-[var(--foreground-muted)]">
                                                {tx.description || 'Нет описания'}
                                            </td>
                                            <td className="p-4 text-sm text-[var(--foreground-muted)]">
                                                {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                        tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {tx.status === 'COMPLETED' ? 'Выполнено' :
                                                        tx.status === 'PENDING' ? 'В обработке' : 'Ошибка'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
