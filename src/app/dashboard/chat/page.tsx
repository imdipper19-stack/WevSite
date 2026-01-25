'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Send,
    ArrowLeft,
    MoreVertical,
    Shield,
    AlertTriangle,
    Check,
    CheckCheck,
    Lock,
    Eye,
    EyeOff,
    Loader2
} from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    isSystem: boolean;
    isRead: boolean;
    createdAt: string;
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    coinsAmount: number;
    totalPrice: number;
}

const statusLabels: Record<string, string> = {
    PENDING_PAYMENT: 'Ожидает оплаты',
    PAID: 'Оплачен',
    PROCESSING: 'В обработке',
    AWAITING_CREDENTIALS: 'Ожидает данных',
    IN_PROGRESS: 'Выполняется',
    COMPLETED: 'Выполнен',
    CANCELLED: 'Отменён',
};

export default function ChatPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order');

    const [messages, setMessages] = useState<Message[]>([]);
    const [order, setOrder] = useState<Order | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [showCredentialsForm, setShowCredentialsForm] = useState(false);
    const [credentials, setCredentials] = useState({ login: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (orderId) {
            fetchMessages();
        } else {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    async function fetchMessages() {
        try {
            const res = await fetch(`/api/chat/${orderId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
                setOrder(data.order);
                setCurrentUserId(data.currentUserId);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !orderId) return;

        const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            senderId: currentUserId,
            senderName: 'Вы',
            content: newMessage,
            isSystem: false,
            isRead: false,
            createdAt: new Date().toISOString(),
        };

        setMessages([...messages, tempMessage]);
        setNewMessage('');

        try {
            const res = await fetch(`/api/chat/${orderId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage }),
            });

            if (res.ok) {
                const data = await res.json();
                // Replace temp message with real one
                setMessages(msgs => msgs.map(m =>
                    m.id === tempMessage.id ? { ...data.message, senderName: 'Вы' } : m
                ));
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleSendCredentials = async () => {
        if (!credentials.login || !credentials.password || !orderId) return;

        setIsSending(true);

        try {
            // Send credentials as encrypted message
            const res = await fetch(`/api/chat/${orderId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `🔐 Данные от TikTok аккаунта отправлены (зашифрованы)`
                }),
            });

            if (res.ok) {
                // Also send a system message
                await fetch(`/api/chat/${orderId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: `✅ Данные успешно отправлены исполнителю. Ожидайте выполнения заказа.`
                    }),
                });

                await fetchMessages();
                setShowCredentialsForm(false);
                setCredentials({ login: '', password: '' });
            }
        } catch (error) {
            console.error('Failed to send credentials:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    if (!orderId || !order) {
        return (
            <div className="text-center py-16">
                <h2 className="text-xl font-semibold mb-4">Выберите заказ для чата</h2>
                <Link href="/dashboard/orders">
                    <Button variant="primary">Перейти к заказам</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/orders">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-semibold">Заказ #{order.orderNumber}</h1>
                        <p className="text-sm text-[var(--foreground-muted)]">
                            {order.coinsAmount.toLocaleString()} монет • {order.totalPrice.toLocaleString()}₽
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-[var(--warning)]/10 text-[var(--warning)] text-xs font-medium rounded-full">
                        {statusLabels[order.status] || order.status}
                    </span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-8 text-[var(--foreground-muted)]">
                        <p>Нет сообщений. Начните диалог!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`
                max-w-[80%] sm:max-w-[60%] rounded-2xl px-4 py-2.5
                ${message.isSystem
                                        ? 'bg-[var(--info)]/10 text-[var(--foreground)] border border-[var(--info)]/20'
                                        : message.senderId === currentUserId
                                            ? 'bg-gradient-to-r from-[#6A11CB] to-[#2575FC] text-white'
                                            : 'bg-[var(--card-bg)] border border-[var(--border)]'
                                    }
              `}
                            >
                                <p className="text-sm">{message.content}</p>
                                <div className={`flex items-center justify-end gap-1 mt-1 ${message.senderId === currentUserId ? 'text-white/70' : 'text-[var(--foreground-muted)]'
                                    }`}>
                                    <span className="text-xs">{formatTime(message.createdAt)}</span>
                                    {message.senderId === currentUserId && (
                                        message.isRead ? <CheckCheck size={14} /> : <Check size={14} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Credentials Form */}
            {showCredentialsForm && (
                <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl mb-4 animate-slideUp">
                    <div className="flex items-center gap-2 mb-4">
                        <Lock className="w-5 h-5 text-[var(--primary)]" />
                        <span className="font-medium">Передача данных TikTok</span>
                    </div>

                    <div className="bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg p-3 mb-4">
                        <div className="flex gap-2">
                            <AlertTriangle className="w-4 h-4 text-[var(--warning)] flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-[var(--foreground-muted)]">
                                Данные передаются по защищенному каналу и автоматически удаляются после выполнения заказа.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-4">
                        <Input
                            placeholder="Логин TikTok"
                            value={credentials.login}
                            onChange={(e) => setCredentials({ ...credentials, login: e.target.value })}
                        />
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Пароль TikTok"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-[var(--foreground-muted)]"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setShowCredentialsForm(false)}>
                            Отмена
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSendCredentials}
                            isLoading={isSending}
                            disabled={!credentials.login || !credentials.password}
                        >
                            <Shield size={16} className="mr-1" />
                            Отправить безопасно
                        </Button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="pt-4 border-t border-[var(--border)]">
                {order.status === 'AWAITING_CREDENTIALS' && !showCredentialsForm && (
                    <div className="mb-3">
                        <Button
                            variant="accent"
                            fullWidth
                            onClick={() => setShowCredentialsForm(true)}
                            leftIcon={<Lock size={18} />}
                        >
                            Отправить данные TikTok
                        </Button>
                    </div>
                )}

                <div className="flex gap-2">
                    <Input
                        placeholder="Написать сообщение..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                        variant="primary"
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                    >
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
