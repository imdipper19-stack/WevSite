'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    ArrowLeft,
    Globe,
    Loader2
} from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function AdminSeoPage() {
    const router = useRouter();
    const [pages, setPages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newSlug, setNewSlug] = useState('');
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/seo');
            if (res.ok) {
                const data = await res.json();
                setPages(data.pages || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newSlug || !newTitle) return;
        setIsCreating(true);
        try {
            const res = await fetch('/api/admin/seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: newSlug, title: newTitle })
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/admin/seo/${data.page.id}`);
            } else {
                const err = await res.json();
                alert(err.error || 'Ошибка создания');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string, slug: string) => {
        if (!confirm(`Вы уверены, что хотите удалить SEO настройки для "${slug}"?`)) return;

        try {
            const res = await fetch(`/api/admin/seo/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setPages(pages.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredPages = pages.filter(p =>
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/content">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">SEO Настройки</h1>
                    <p className="text-[var(--foreground-muted)]">Мета-теги для страниц сайта</p>
                </div>
            </div>

            {/* Create New Block */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Добавить страницу</h3>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-sm font-medium mb-1 block">Путь (Slug)</label>
                            <Input
                                placeholder="Например: / или /about"
                                value={newSlug}
                                onChange={(e) => setNewSlug(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-sm font-medium mb-1 block">Заголовок (Title)</label>
                            <Input
                                placeholder="Главная страница..."
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleCreate}
                            isLoading={isCreating}
                            disabled={!newSlug.trim() || !newTitle.trim()}
                        >
                            <Plus size={18} className="mr-2" />
                            Создать
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            <Card padding="none">
                <div className="p-4 border-b border-[var(--border)]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
                        <Input
                            placeholder="Поиск..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 className="animate-spin text-[var(--primary)]" />
                    </div>
                ) : filteredPages.length === 0 ? (
                    <div className="p-8 text-center text-[var(--foreground-muted)]">
                        Нет настроенных страниц
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--border)]">
                        {filteredPages.map((page) => (
                            <div key={page.id} className="p-4 flex items-center justify-between hover:bg-[var(--background-alt)] transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{page.title}</h4>
                                        <p className="text-sm text-[var(--foreground-muted)] font-mono">{page.slug}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/admin/seo/${page.id}`}>
                                        <Button variant="ghost" size="icon">
                                            <Edit2 size={16} />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(page.id, page.slug)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
