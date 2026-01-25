'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Send,
    ArrowLeft,
    Check,
    CheckCheck,
    Loader2,
    Shield
} from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';

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

export default function AdminOrderChatPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([]);
    const [order, setOrder] = useState<Order | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (orderId) {
            fetchMessages();
            // Poll for new messages every 10 seconds
            const interval = setInterval(fetchMessages, 10000);
            return () => clearInterval(interval);
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
            } else {
                if (loading) {
                    console.error("Failed to load chat");
                }
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
        setIsSending(true);

        const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            senderId: currentUserId,
            senderName: 'Администратор',
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
                    m.id === tempMessage.id ? { ...data.message, senderName: 'Администратор' } : m
                ));
            }
        } catch (error) {
            console.error('Failed to send message:', error);
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

    if (!order) return <div className="p-8">Заказ не найден</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col animate-fadeIn max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
                <div className="flex items-center gap-3">
                    <Link href="/admin/orders">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-semibold text-lg flex items-center gap-2">
                            Чат заказа #{order.orderNumber}
                            <Shield size={16} className="text-[var(--primary)]" />
                        </h1>
                        <p className="text-sm text-[var(--foreground-muted)]">
                            Покупатель купил {order.coinsAmount.toLocaleString()} монет
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium rounded-full">
                        Администратор
                    </span>
                    <span className="px-2 py-1 bg-[var(--warning)]/10 text-[var(--warning)] text-xs font-medium rounded-full">
                        {statusLabels[order.status] || order.status}
                    </span>
                </div>
            </div>

            {/* Messages */}
            <Card className="flex-1 flex flex-col overflow-hidden mb-4">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--background-alt)]">
                    {messages.length === 0 ? (
                        <div className="text-center py-8 text-[var(--foreground-muted)]">
                            <p>Нет сообщений</p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isMe = message.senderId === currentUserId; // Admin is "Me"
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`
                                            max-w-[80%] rounded-2xl px-4 py-2.5
                                            ${message.isSystem
                                                ? 'bg-[var(--info)]/10 text-[var(--foreground)] border border-[var(--info)]/20 mx-auto'
                                                : isMe
                                                    ? 'bg-[var(--primary)] text-white'
                                                    : 'bg-[var(--card-bg)] border border-[var(--border)]'
                                            }
                                        `}
                                    >
                                        {!isMe && !message.isSystem && (
                                            <p className="text-xs font-bold text-[var(--foreground-muted)] mb-1">
                                                {message.senderName}
                                            </p>
                                        )}
                                        <p className="text-sm">{message.content}</p>
                                        <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-white/70' : 'text-[var(--foreground-muted)]'}`}>
                                            <span className="text-[10px]">{formatTime(message.createdAt)}</span>
                                            {isMe && (
                                                message.isRead ? <CheckCheck size={12} /> : <Check size={12} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[var(--card-bg)] border-t border-[var(--border)]">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Написать покупателю..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button
                            variant="primary"
                            size="icon"
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            isLoading={isSending}
                        >
                            <Send size={18} />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
