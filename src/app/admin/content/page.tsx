'use client';

import Link from 'next/link';
import { HelpCircle, MessageSquare, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

export default function AdminContentPage() {
    const modules = [
        {
            title: 'FAQ (Вопросы и ответы)',
            description: 'Управление разделом частых вопросов',
            icon: HelpCircle,
            href: '/admin/faq',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        {
            title: 'Отзывы',
            description: 'Модерация отзывов пользователей',
            icon: MessageSquare,
            href: '/admin/reviews',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10'
        },
        // Placeholder for future modules
        {
            title: 'SEO Настройки',
            description: 'Мета-теги и настройки страниц (Скоро)',
            icon: FileText,
            href: '#',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10'
        }
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h1 className="text-2xl font-bold mb-2">Управление контентом</h1>
                <p className="text-[var(--foreground-muted)]">
                    Выберите раздел для редактирования
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                    <Link key={module.title} href={module.href}>
                        <Card className="h-full hover:border-[var(--primary)] transition-colors cursor-pointer group">
                            <CardContent className="p-6 flex flex-col h-full">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${module.bgColor}`}>
                                    <module.icon className={`w-6 h-6 ${module.color}`} />
                                </div>
                                <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--primary)] transition-colors">
                                    {module.title}
                                </h3>
                                <p className="text-sm text-[var(--foreground-muted)] mb-4 flex-1">
                                    {module.description}
                                </p>
                                <div className="flex items-center text-sm font-medium text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                                    Перейти <ChevronRight size={16} className="ml-1" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
