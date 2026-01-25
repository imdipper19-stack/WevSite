'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, ArrowLeft, Loader2, User, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';
import Link from 'next/link';

export default function AdminTicketDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = params.ticketId as string;

    const [ticket, setTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTicketDetails();
        const interval = setInterval(fetchTicketDetails, 10000);
        return () => clearInterval(interval);
    }, [ticketId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const fetchTicketDetails = async () => {
        try {
            const res = await fetch(`/api/tickets/${ticketId}`);
            if (res.ok) {
                const data = await res.json();
                setTicket(data.ticket);
                // Check if new messages arrived to prevent scroll jump if I wanted, but simple set is ok
                setMessages(data.ticket.messages);
            } else {
                if (isLoading) router.push('/admin/support');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        setIsSending(true);

        try {
            // Reply uses standard ticket endpoint. Auth handles Admin role.
            const res = await fetch(`/api/tickets/${ticketId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage }),
            });

            if (res.ok) {
                setNewMessage('');
                fetchTicketDetails();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const handleUpdateStatus = async (status: string) => {
        if (!confirm(`Изменить статус на ${status}?`)) return;
        try {
            const res = await fetch(`/api/admin/tickets/${ticketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                fetchTicketDetails();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    if (!ticket) return null;

    const statusColors: any = {
        OPEN: 'bg-blue-100 text-blue-700',
        IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
        RESOLVED: 'bg-green-100 text-green-700',
        CLOSED: 'bg-gray-100 text-gray-700',
    };

    const statusLabels: any = {
        OPEN: 'Открыт',
        IN_PROGRESS: 'В работе',
        RESOLVED: 'Решен',
        CLOSED: 'Закрыт',
    };

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-100px)] flex gap-6 animate-fadeIn">

            {/* Main Chat Column */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/admin/support">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-3">
                            {ticket.subject}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                                {statusLabels[ticket.status]}
                            </span>
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                            <User size={14} />
                            <span>{ticket.author.firstName} ({ticket.author.email})</span>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <Card className="flex-1 flex flex-col overflow-hidden mb-4">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--background-alt)]">
                        {messages.map((msg) => {
                            const isAdmin = msg.sender.role === 'ADMIN';
                            // Admin view: I am Admin. So my messages (Admin) are Right. User messages are Left.

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!isAdmin && (
                                        <div className="w-8 h-8 bg-[var(--accent)]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-[var(--accent)]" />
                                        </div>
                                    )}

                                    <div className={`
                                        max-w-[80%] rounded-2xl px-4 py-3
                                        ${isAdmin
                                            ? 'bg-[var(--primary)] text-white'
                                            : 'bg-[var(--card-bg)] border border-[var(--border)]'
                                        }
                                    `}>
                                        {!isAdmin && (
                                            <div className="text-xs font-bold text-[var(--foreground-muted)] mb-1">
                                                {msg.sender.firstName || 'User'}
                                            </div>
                                        )}
                                        <p className="text-sm keep-all break-words whitespace-pre-wrap">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 text-right ${isAdmin ? 'text-white/70' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    {isAdmin && (
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Shield className="w-4 h-4 text-blue-600" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-[var(--card-bg)] border-t border-[var(--border)]">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ответ администратора..."
                                className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                            />
                            <Button
                                variant="primary"
                                size="icon"
                                onClick={handleSendMessage}
                                isLoading={isSending}
                                disabled={!newMessage.trim()}
                            >
                                <Send size={18} />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Right Sidebar (Controls) */}
            <div className="w-64 hidden lg:block space-y-4 pt-16">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <h3 className="font-semibold text-sm uppercase text-[var(--foreground-muted)]">Действия</h3>

                        {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                            <Button
                                variant="outline"
                                fullWidth
                                className="justify-start text-green-600 border-green-200 hover:bg-green-50"
                                leftIcon={<CheckCircle size={16} />}
                                onClick={() => handleUpdateStatus('RESOLVED')}
                            >
                                Решить тикет
                            </Button>
                        )}

                        {ticket.status !== 'CLOSED' ? (
                            <Button
                                variant="outline"
                                fullWidth
                                className="justify-start text-red-600 border-red-200 hover:bg-red-50"
                                leftIcon={<XCircle size={16} />}
                                onClick={() => handleUpdateStatus('CLOSED')}
                            >
                                Закрыть тикет
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                fullWidth
                                className="justify-start"
                                leftIcon={<AlertCircle size={16} />}
                                onClick={() => handleUpdateStatus('OPEN')}
                            >
                                Открыть заново
                            </Button>
                        )}

                        {ticket.status === 'OPEN' && (
                            <Button
                                variant="outline"
                                fullWidth
                                className="justify-start"
                                leftIcon={<Shield size={16} />}
                                onClick={() => handleUpdateStatus('IN_PROGRESS')}
                            >
                                Взять в работу
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold text-sm uppercase text-[var(--foreground-muted)] mb-2">Информация</h3>
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-[var(--foreground-muted)]">Создан:</span>
                                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--foreground-muted)]">Сообщений:</span>
                                <span>{messages.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--foreground-muted)]">ID:</span>
                                <span className="font-mono text-xs">{ticket.id.slice(0, 6)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
