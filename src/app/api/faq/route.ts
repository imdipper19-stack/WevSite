import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const faqs = await db.faqItem.findMany({
            where: { isVisible: true },
            orderBy: { order: 'asc' },
        });

        return NextResponse.json({ faqs });

    } catch (error) {
        console.error('Get FAQ error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
