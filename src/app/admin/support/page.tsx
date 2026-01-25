'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    MessageSquare,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchTickets();
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchQuery, statusFilter, page]);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '15',
                status: statusFilter
            });
            const res = await fetch(`/api/admin/tickets?${params}`);
            if (res.ok) {
                const data = await res.json();
                setTickets(data.tickets);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const statusColors: any = {
        OPEN: 'bg-blue-100 text-blue-700',
        IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
        RESOLVED: 'bg-green-100 text-green-700',
        CLOSED: 'bg-gray-100 text-gray-700 gray-badge',
    };

    const statusLabels: any = {
        OPEN: 'Открыт',
        IN_PROGRESS: 'В работе',
        RESOLVED: 'Решен',
        CLOSED: 'Закрыт',
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold mb-2">Техническая поддержка</h1>
                <p className="text-[var(--foreground-muted)]">
                    Управление обращениями пользователей
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search - For future implementation on backend */}
                <div className="flex-1 relative hidden">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
                    <input
                        type="text"
                        placeholder="Поиск по теме..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                    />
                </div>

                <div className="flex gap-2">
                    {['ALL', 'OPEN', 'CLOSED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(1); }}
                            className={`
                                px-4 py-2 rounded-lg font-medium text-sm transition-colors
                                ${statusFilter === status
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--primary)]'
                                }
                            `}
                        >
                            {status === 'ALL' ? 'Все' : statusLabels[status] || status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <Card padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">ID</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Тема</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Пользователь</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Статус</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Сообщения</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Обновлено</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--primary)]" />
                                    </td>
                                </tr>
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-[var(--foreground-muted)]">
                                        Обращений не найдено
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id} className="border-b border-[var(--border)] hover:bg-[var(--background)]">
                                        <td className="p-4 text-sm font-mono text-[var(--foreground-muted)]">
                                            #{ticket.id.slice(0, 6)}
                                        </td>
                                        <td className="p-4 font-medium">{ticket.subject}</td>
                                        <td className="p-4">
                                            <div>
                                                <div className="font-medium text-sm">{ticket.author.firstName || 'User'}</div>
                                                <div className="text-xs text-[var(--foreground-muted)]">{ticket.author.email}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                                                {statusLabels[ticket.status] || ticket.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center gap-1 text-sm text-[var(--foreground-muted)]">
                                                <MessageSquare size={14} />
                                                {ticket._count.messages}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-[var(--foreground-muted)]">
                                            {new Date(ticket.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link href={`/admin/support/${ticket.id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Eye size={16} />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
                    <p className="text-sm text-[var(--foreground-muted)]">
                        Страница {page} из {totalPages || 1}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
