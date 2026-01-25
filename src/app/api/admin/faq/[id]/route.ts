import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface Context {
    params: Promise<{
        id: string; // faq id
    }>;
}

export async function PATCH(req: NextRequest, context: Context) {
    try {
        const session = await getCurrentUser();
        // Await params prior to usage
        const params = await context.params;

        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();

        // Destructure only allowed fields
        const { question, answer, order, isVisible, category } = body;

        const updatedFaq = await db.faqItem.update({
            where: { id: params.id },
            data: {
                question,
                answer,
                order,
                isVisible,
                category
            }
        });

        return NextResponse.json({ faq: updatedFaq });

    } catch (error) {
        console.error('Update FAQ error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: Context) {
    try {
        const session = await getCurrentUser();
        const params = await context.params;

        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await db.faqItem.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete FAQ error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
