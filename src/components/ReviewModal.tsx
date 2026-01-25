
'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { X, Star, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReviewModalProps {
    orderId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ReviewModal({ orderId, isOpen, onClose, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    rating,
                    content
                }),
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                alert(data.error || 'Ошибка отправки отзыва');
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка сети');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-scaleIn">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-bold">Оставить отзыв</h3>
                    <button onClick={onClose} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Rating Stars */}
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                                <Star size={32} fill={star <= rating ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-muted)]">Комментарий</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Напишите, как прошел заказ..."
                            className="w-full h-32 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl resize-none focus:outline-none focus:border-[var(--primary)] transition-all"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="secondary" onClick={onClose} className="flex-1">
                            Отмена
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={!content.trim() || isSubmitting}
                            isLoading={isSubmitting}
                            className="flex-1"
                        >
                            Отправить отзыв
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
