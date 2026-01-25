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
    Copy,
    Info
} from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';

// Mock messages
const mockMessages = [
    {
        id: 1,
        senderId: 'executor',
        content: 'Здравствуйте! Я ваш исполнитель по заказу #1245. Готов начать работу.',
        timestamp: '12:30',
        isRead: true,
    },
    {
        id: 2,
        senderId: 'user',
        content: 'Привет! Отлично, что мне нужно сделать?',
        timestamp: '12:32',
        isRead: true,
    },
    {
        id: 3,
        senderId: 'executor',
        content: 'Пожалуйста, отправьте данные от вашего TikTok аккаунта: логин и пароль. После этого я смогу пополнить монеты.',
        timestamp: '12:33',
        isRead: true,
    },
    {
        id: 4,
        senderId: 'system',
        content: '🔒 Данные передаются по защищенному каналу и автоматически удаляются после выполнения заказа.',
        timestamp: '12:33',
        isRead: true,
        isSystem: true,
    },
];

const mockOrder = {
    id: '#1245',
    coins: 1000,
    price: 1500,
    status: 'awaiting',
    statusText: 'Ожидает данных',
    executor: {
        name: 'Исполнитель #42',
        rating: 4.9,
        completedOrders: 156,
    },
};

export default function ChatPage() {
    const [messages, setMessages] = useState(mockMessages);
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
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const message = {
            id: messages.length + 1,
            senderId: 'user',
            content: newMessage,
            timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
        };

        setMessages([...messages, message]);
        setNewMessage('');
    };

    const handleSendCredentials = async () => {
        if (!credentials.login || !credentials.password) return;

        setIsSending(true);

        // Simulate sending
        await new Promise(resolve => setTimeout(resolve, 1500));

        const systemMessage = {
            id: messages.length + 1,
            senderId: 'system',
            content: '✅ Данные успешно отправлены исполнителю. Ожидайте выполнения заказа.',
            timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            isRead: true,
            isSystem: true,
        };

        setMessages([...messages, systemMessage]);
        setShowCredentialsForm(false);
        setCredentials({ login: '', password: '' });
        setIsSending(false);
    };

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
                        <h1 className="font-semibold">Заказ {mockOrder.id}</h1>
                        <p className="text-sm text-[var(--foreground-muted)]">
                            {mockOrder.executor.name} • ★ {mockOrder.executor.rating}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-[var(--warning)]/10 text-[var(--warning)] text-xs font-medium rounded-full">
                        {mockOrder.statusText}
                    </span>
                    <Button variant="ghost" size="icon">
                        <MoreVertical size={20} />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`
                max-w-[80%] sm:max-w-[60%] rounded-2xl px-4 py-2.5
                ${message.isSystem
                                    ? 'bg-[var(--info)]/10 text-[var(--foreground)] border border-[var(--info)]/20'
                                    : message.senderId === 'user'
                                        ? 'bg-gradient-to-r from-[#6A11CB] to-[#2575FC] text-white'
                                        : 'bg-[var(--card-bg)] border border-[var(--border)]'
                                }
              `}
                        >
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${message.senderId === 'user' ? 'text-white/70' : 'text-[var(--foreground-muted)]'
                                }`}>
                                <span className="text-xs">{message.timestamp}</span>
                                {message.senderId === 'user' && (
                                    message.isRead ? <CheckCheck size={14} /> : <Check size={14} />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
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
                {mockOrder.status === 'awaiting' && !showCredentialsForm && (
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
