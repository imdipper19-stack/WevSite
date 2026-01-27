'use client';

import { useState } from 'react';
import { Bell, Send, CheckCircle } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';

export default function AdminNotificationsPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSend = async () => {
        if (!title || !content) return;

        if (!confirm('Вы уверены, что хотите отправить это уведомление ВСЕМ пользователям?')) return;

        setSending(true);
        try {
            const res = await fetch('/api/admin/notifications/global', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (res.ok) {
                const data = await res.json();
                setSuccess(true);
                setTitle('');
                setContent('');
                alert(`Уведомление отправлено ${data.count} пользователям.`);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                const data = await res.json();
                alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка сети');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Глобальные уведомления
            </h1>

            <Card>
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Отправка уведомления всем зарегистрированным пользователям сайта.
                        Уведомление появится в "колокольчике" в панели управления.
                    </p>

                    <div>
                        <label className="block text-sm font-medium mb-1">Заголовок</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Например: Важное обновление"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Текст уведомления</label>
                        <textarea
                            className="w-full min-h-[100px] p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Введите текст сообщения..."
                        />
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button
                            onClick={handleSend}
                            disabled={!title || !content || sending}
                            isLoading={sending}
                            leftIcon={success ? <CheckCircle size={18} /> : <Send size={18} />}
                        >
                            {success ? 'Отправлено!' : 'Отправить всем'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
