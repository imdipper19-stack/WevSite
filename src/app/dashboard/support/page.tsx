'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Plus, ChevronRight, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@/components/ui';

export default function SupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // New Ticket Form
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    // FAQ State
    const [faqs, setFaqs] = useState<any[]>([]);
    const [openFaq, setOpenFaq] = useState<string | null>(null);

    useEffect(() => {
        fetchTickets();
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const res = await fetch('/api/faq');
            if (res.ok) {
                const data = await res.json();
                setFaqs(data.faqs);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleFaq = (id: string) => {
        setOpenFaq(openFaq === id ? null : id);
    };

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/tickets');
            if (res.ok) {
                const data = await res.json();
                setTickets(data.tickets);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTicket = async () => {
        if (!subject.trim() || !message.trim()) return;
        setIsCreating(true);

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, message }),
            });

            if (res.ok) {
                setSubject('');
                setMessage('');
                fetchTickets(); // Refresh list
                alert('Тикет успешно создан');
            } else {
                alert('Ошибка создания тикета');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

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
        <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Поддержка</h1>
                    <p className="text-[var(--foreground-muted)]">
                        Ваши обращения и вопросы
                    </p>
                </div>
            </div>

            {/* Create Ticket */}
            <Card>
                <CardHeader>
                    <CardTitle>Создать новый тикет</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Input
                                placeholder="Тема обращения"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                        <div>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Опишите вашу проблему..."
                                className="w-full h-32 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg resize-none focus:outline-none focus:border-[var(--primary)]"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button
                                variant="primary"
                                onClick={handleCreateTicket}
                                isLoading={isCreating}
                                disabled={!subject || !message}
                                leftIcon={<Plus size={18} />}
                            >
                                Создать тикет
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Ticket List */}
            <h2 className="text-xl font-bold mt-8 mb-4">История обращений</h2>

            {isLoading ? (
                <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--primary)]" />
                </div>
            ) : tickets.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-[var(--foreground-muted)]">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>У вас пока нет обращений</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tickets.map((ticket) => (
                        <Link href={`/dashboard/support/${ticket.id}`} key={ticket.id}>
                            <Card className="hover:border-[var(--primary)] transition-colors cursor-pointer">
                                <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-2 h-2 mt-2 rounded-full ${ticket.status === 'OPEN' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1">{ticket.subject}</h3>
                                            <div className="flex items-center gap-3 text-sm text-[var(--foreground-muted)]">
                                                <span>#{ticket.id.slice(0, 8)}</span>
                                                <span>•</span>
                                                <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status] || 'bg-gray-100'}`}>
                                            {statusLabels[ticket.status] || ticket.status}
                                        </span>
                                        <ChevronRight className="text-[var(--foreground-muted)] w-5 h-5" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* FAQ Section */}
            {faqs.length > 0 && (
                <div className="pt-8">
                    <h2 className="text-xl font-bold mb-4">Часто задаваемые вопросы</h2>
                    <div className="space-y-3">
                        {faqs.map((faq) => (
                            <div key={faq.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(faq.id)}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--border)]/50 transition-colors"
                                >
                                    <span className="font-medium">{faq.question}</span>
                                    {openFaq === faq.id ? (
                                        <ChevronUp size={20} className="text-[var(--foreground-muted)]" />
                                    ) : (
                                        <ChevronDown size={20} className="text-[var(--foreground-muted)]" />
                                    )}
                                </button>
                                {openFaq === faq.id && (
                                    <div className="px-4 pb-4 text-[var(--foreground-muted)] border-t border-[var(--border)] pt-4">
                                        <div className="whitespace-pre-wrap">{faq.answer}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
