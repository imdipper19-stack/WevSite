'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, ArrowLeft, Loader2, User, Shield } from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';
import Link from 'next/link';

export default function TicketDetailsPage() {
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
        // Polling for updates
        const interval = setInterval(fetchTicketDetails, 10000);
        return () => clearInterval(interval);
    }, [ticketId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchTicketDetails = async () => {
        try {
            const res = await fetch(`/api/tickets/${ticketId}`);
            if (res.ok) {
                const data = await res.json();
                setTicket(data.ticket);
                setMessages(data.ticket.messages);
            } else {
                if (isLoading) router.push('/dashboard/support');
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
        <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/support">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-xl font-bold flex items-center gap-3">
                        {ticket.subject}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                            {statusLabels[ticket.status]}
                        </span>
                    </h1>
                    <p className="text-sm text-[var(--foreground-muted)]">
                        Тикет #{ticket.id.slice(0, 8)} created at {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col overflow-hidden mb-4">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--background-alt)]">
                    {messages.map((msg) => {
                        const isMe = msg.sender.role !== 'ADMIN' && msg.sender.role !== 'EXECUTOR'; // Assuming I am the user. Actually safer to check msg.sender.id === ticket.authorId if I am the author
                        // Better: in user dashboard, "Me" is the current user.
                        // I don't have current user ID in client state easily here without context.
                        // Improv: Check if sender role is ADMIN (Support Agent).
                        const isAdmin = msg.sender.role === 'ADMIN';

                        return (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${isAdmin ? 'justify-start' : 'justify-end'}`}
                            >
                                {isAdmin && (
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Shield className="w-4 h-4 text-blue-600" />
                                    </div>
                                )}

                                <div className={`
                                    max-w-[80%] rounded-2xl px-4 py-3
                                    ${isAdmin
                                        ? 'bg-[var(--card-bg)] border border-[var(--border)]'
                                        : 'bg-[var(--primary)] text-white'
                                    }
                                `}>
                                    {isAdmin && (
                                        <div className="text-xs font-bold text-[var(--primary)] mb-1">
                                            Поддержка
                                        </div>
                                    )}
                                    <p className="text-sm keep-all break-words whitespace-pre-wrap">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isAdmin ? 'text-gray-400' : 'text-white/70'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                {!isAdmin && (
                                    <div className="w-8 h-8 bg-[var(--accent)]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-4 h-4 text-[var(--accent)]" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[var(--card-bg)] border-t border-[var(--border)]">
                    {ticket.status === 'CLOSED' ? (
                        <div className="text-center text-[var(--foreground-muted)] p-2 bg-[var(--background)] rounded-lg">
                            Тикет закрыт. Если у вас остались вопросы, создайте новый тикет.
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Напишите сообщение..."
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
                    )}
                </div>
            </Card>
        </div>
    );
}
