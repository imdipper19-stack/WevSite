import { NextResponse } from 'next/server';
import { getPublicStats } from '@/lib/db-helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
    try {
        const stats = await getPublicStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Get public stats error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
