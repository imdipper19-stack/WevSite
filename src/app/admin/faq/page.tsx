'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';

interface FaqItem {
    id: string;
    question: string;
    answer: string;
    order: number;
    isVisible: boolean;
}

export default function AdminFaqPage() {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Edit/Create State
    const [editingId, setEditingId] = useState<string | null>(null); // null = none, 'new' = creating
    const [formData, setFormData] = useState<Partial<FaqItem>>({});

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/faq');
            if (res.ok) {
                const data = await res.json();
                setFaqs(data.faqs);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (faq: FaqItem) => {
        setEditingId(faq.id);
        setFormData(faq);
    };

    const handleCreate = () => {
        setEditingId('new');
        setFormData({ question: '', answer: '', order: faqs.length + 1, isVisible: true });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({});
    };

    const handleSave = async () => {
        if (!formData.question || !formData.answer) return alert('Заполните вопрос и ответ');

        try {
            let res;
            if (editingId === 'new') {
                res = await fetch('/api/admin/faq', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            } else {
                res = await fetch(`/api/admin/faq/${editingId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            }

            if (res.ok) {
                fetchFaqs(); // Refresh
                handleCancel();
            } else {
                alert('Ошибка сохранения');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить этот вопрос?')) return;
        try {
            const res = await fetch(`/api/admin/faq/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setFaqs(prev => prev.filter(f => f.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleVisibility = async (faq: FaqItem) => {
        try {
            const res = await fetch(`/api/admin/faq/${faq.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVisible: !faq.isVisible }),
            });
            if (res.ok) {
                setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, isVisible: !f.isVisible } : f));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Управление FAQ</h1>
                    <p className="text-[var(--foreground-muted)]">
                        Вопросы и ответы для пользователей
                    </p>
                </div>
                {!editingId && (
                    <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleCreate}>
                        Добавить вопрос
                    </Button>
                )}
            </div>

            {/* Editor Form */}
            {editingId && (
                <Card className="border-l-4 border-l-[var(--primary)]">
                    <CardContent className="space-y-4 pt-6">
                        <h3 className="font-semibold text-lg">{editingId === 'new' ? 'Новый вопрос' : 'Редактирование'}</h3>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Вопрос</label>
                                <Input
                                    value={formData.question || ''}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    placeholder="Например: Как купить монеты?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ответ</label>
                                <textarea
                                    className="w-full h-24 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                                    value={formData.answer || ''}
                                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                    placeholder="Подробный ответ..."
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="w-24">
                                    <label className="block text-sm font-medium mb-1">Порядок</label>
                                    <Input
                                        type="number"
                                        value={formData.order || 0}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isVisible || false}
                                            onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-300"
                                        />
                                        <span>Отображать на сайте</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <Button variant="ghost" onClick={handleCancel} leftIcon={<X size={16} />}>
                                Отмена
                            </Button>
                            <Button variant="primary" onClick={handleSave} leftIcon={<Save size={16} />}>
                                Сохранить
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* List */}
            {isLoading ? (
                <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--primary)]" />
                </div>
            ) : faqs.length === 0 && !editingId ? (
                <div className="text-center py-12 text-[var(--foreground-muted)] border border-dashed border-[var(--border)] rounded-xl">
                    Список пуст. Создайте первый вопрос.
                </div>
            ) : (
                <div className="grid gap-4">
                    {faqs.map((faq) => (
                        <Card key={faq.id} className={`${!faq.isVisible ? 'opacity-60' : ''}`}>
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className="w-8 h-8 flex items-center justify-center bg-[var(--background)] rounded-full text-sm font-bold text-[var(--foreground-muted)]">
                                    {faq.order}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium mb-1 flex items-center gap-2">
                                        {faq.question}
                                        {!faq.isVisible && (
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Скрыто</span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">{faq.answer}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => toggleVisibility(faq)} title={faq.isVisible ? 'Скрыть' : 'Показать'}>
                                        {faq.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(faq)} title="Редактировать">
                                        <Edit2 size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(faq.id)} title="Удалить">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
