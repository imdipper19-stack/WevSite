import { db } from '@/lib/db';
import { Metadata } from 'next';

export async function getSeoMetadata(slug: string, fallback?: Metadata): Promise<Metadata> {
    try {
        const page = await db.seoPage.findUnique({
            where: { slug }
        });

        if (!page) return fallback || {};

        return {
            title: page.title,
            description: page.description,
            keywords: page.keywords?.split(',').map(k => k.trim()),
            openGraph: {
                title: page.title,
                description: page.description || undefined,
                images: page.ogImage ? [{ url: page.ogImage }] : undefined,
            },
            ...fallback
        };
    } catch (error) {
        console.error('Failed to fetch SEO metadata:', error);
        return fallback || {};
    }
}
