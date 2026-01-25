import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getCurrentUser();
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const faqs = await db.faqItem.findMany({
            orderBy: { order: 'asc' },
        });

        return NextResponse.json({ faqs });

    } catch (error) {
        console.error('Admin get FAQs error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentUser();
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { question, answer, order = 0, isVisible = true, category } = body;

        if (!question || !answer) {
            return NextResponse.json({ error: 'Question and answer required' }, { status: 400 });
        }

        const newFaq = await db.faqItem.create({
            data: {
                question,
                answer,
                order,
                isVisible,
                category
            }
        });

        return NextResponse.json({ faq: newFaq });

    } catch (error) {
        console.error('Create FAQ error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
