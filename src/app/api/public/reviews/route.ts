import { NextResponse } from 'next/server';
import { getApprovedReviews } from '@/lib/db-helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const reviews = await getApprovedReviews(limit);
        return NextResponse.json({
            reviews: reviews.map(r => ({
                id: r.id,
                authorName: r.author.firstName || 'Пользователь',
                rating: r.rating,
                content: r.content,
                createdAt: r.createdAt,
            }))
        });
    } catch (error) {
        console.error('Get public reviews error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
