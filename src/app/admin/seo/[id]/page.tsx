'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Save,
    ArrowLeft,
    Loader2,
    Globe,
    Layout,
    Image as ImageIcon
} from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';

export default function AdminSeoEditPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [data, setData] = useState({
        slug: '',
        title: '',
        description: '',
        keywords: '',
        ogImage: ''
    });

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await fetch(`/api/admin/seo/${id}`);
            if (res.ok) {
                const json = await res.json();
                setData(json.page);
            } else {
                router.push('/admin/seo');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/seo/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                alert('Сохранено успешно!');
                router.push('/admin/seo');
            } else {
                alert('Ошибка сохранения');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/seo">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Редактирование SEO</h1>
                        <p className="text-[var(--foreground-muted)] font-mono">{data.slug}</p>
                    </div>
                </div>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    isLoading={isSaving}
                    leftIcon={<Save size={18} />}
                >
                    Сохранить
                </Button>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2 text-[var(--primary)]">
                            <Layout size={20} />
                            <h3 className="font-semibold">Основные мета-теги</h3>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Title (Заголовок)</label>
                            <Input
                                value={data.title}
                                onChange={(e) => setData({ ...data, title: e.target.value })}
                                placeholder="Заголовок страницы..."
                            />
                            <p className="text-xs text-[var(--foreground-muted)] mt-1">Отображается во вкладке браузера и в поиске. Рекомендуется до 60 символов.</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Description (Описание)</label>
                            <textarea
                                className="w-full min-h-[100px] px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                                value={data.description || ''}
                                onChange={(e) => setData({ ...data, description: e.target.value })}
                                placeholder="Краткое описание страницы..."
                            />
                            <p className="text-xs text-[var(--foreground-muted)] mt-1">Сниппет в выдаче поисковика. Рекомендуется до 160 символов.</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Keywords (Ключевые слова)</label>
                            <Input
                                value={data.keywords || ''}
                                onChange={(e) => setData({ ...data, keywords: e.target.value })}
                                placeholder="купить, tik tok, монеты..."
                            />
                            <p className="text-xs text-[var(--foreground-muted)] mt-1">Через запятую (устаревший, но иногда полезный тег).</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2 text-[var(--primary)]">
                            <ImageIcon size={20} />
                            <h3 className="font-semibold">Open Graph (Соцсети)</h3>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">OG Image URL</label>
                            <Input
                                value={data.ogImage || ''}
                                onChange={(e) => setData({ ...data, ogImage: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                            />
                            <p className="text-xs text-[var(--foreground-muted)] mt-1">Ссылка на картинку, которая будет при шеринге в Telegram/WhatsApp.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
