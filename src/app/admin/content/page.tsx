'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { FileText, Settings, Construction } from 'lucide-react';

export default function AdminContentPage() {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h1 className="text-2xl font-bold">Управление контентом</h1>
                <p className="text-[var(--foreground-muted)]">
                    SEO страницы, FAQ, отзывы
                </p>
            </div>

            <Card>
                <CardContent className="py-16 text-center">
                    <Construction className="w-16 h-16 text-[var(--warning)] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">В разработке</h3>
                    <p className="text-[var(--foreground-muted)] max-w-md mx-auto">
                        Раздел управления контентом находится в разработке.
                        Здесь будет возможность редактировать SEO страницы, FAQ и модерировать отзывы.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
