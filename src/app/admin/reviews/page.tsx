
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { Check, X, Trash2, Eye, Star, Loader2, AlertCircle } from 'lucide-react';

interface Review {
    id: string;
    authorName: string;
    authorEmail: string;
    orderNumber: string;
    rating: number;
    content: string;
    isApproved: boolean;
    isVisible: boolean;
    createdAt: string;
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved

    useEffect(() => {
        fetchReviews();
    }, [filter]);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/reviews?status=${filter}&limit=50`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews);
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string, isApproved: boolean) => {
        try {
            const res = await fetch(`/api/reviews/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isApproved }),
            });
            if (res.ok) {
                // Optimistic update
                setReviews(reviews.map(r => r.id === id ? { ...r, isApproved } : r));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return;
        try {
            const res = await fetch(`/api/reviews/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setReviews(reviews.filter(r => r.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Отзывы</h1>
                    <p className="text-[var(--foreground-muted)]">Модерация отзывов пользователей</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        Все
                    </Button>
                    <Button
                        variant={filter === 'pending' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('pending')}
                    >
                        На модерации
                    </Button>
                    <Button
                        variant={filter === 'approved' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('approved')}
                    >
                        Опубликованные
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
                </div>
            ) : reviews.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-[var(--foreground-muted)]">
                        <p>Отзывов не найдено</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {reviews.map((review) => (
                        <Card key={review.id} className={`border-l-4 ${review.isApproved ? 'border-l-[var(--success)]' : 'border-l-[var(--warning)]'}`}>
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} size={16} className={s <= review.rating ? "text-yellow-400" : "text-gray-300"} fill={s <= review.rating ? "currentColor" : "none"} />
                                                ))}
                                            </div>
                                            <span className="font-semibold">{review.authorName}</span>
                                            <span className="text-sm text-[var(--foreground-muted)]">({review.authorEmail})</span>
                                        </div>
                                        <div className="text-sm text-[var(--foreground-muted)]">
                                            Заказ #{review.orderNumber} • {new Date(review.createdAt).toLocaleDateString()}
                                        </div>
                                        <p className="py-2">{review.content}</p>

                                        {!review.isApproved && (
                                            <div className="flex items-center gap-2 text-[var(--warning)] text-sm">
                                                <AlertCircle size={16} />
                                                <span>Требует проверки</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex sm:flex-col gap-2 justify-center sm:min-w-[140px]">
                                        {!review.isApproved ? (
                                            <Button
                                                variant="outline"
                                                className="text-green-600 border-green-600 hover:bg-green-50"
                                                size="sm"
                                                onClick={() => handleApprove(review.id, true)}
                                                leftIcon={<Check size={16} />}
                                            >
                                                Одобрить
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleApprove(review.id, false)}
                                                leftIcon={<X size={16} />}
                                            >
                                                Скрыть
                                            </Button>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-[var(--error)] hover:bg-[var(--error)]/10"
                                            onClick={() => handleDelete(review.id)}
                                            leftIcon={<Trash2 size={16} />}
                                        >
                                            Удалить
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
