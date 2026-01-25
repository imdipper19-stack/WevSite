
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PATCH /api/reviews/[reviewId] - Approve/Hide review
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }

        const { reviewId } = await params;
        const body = await request.json();
        const { isApproved, isVisible } = body;

        const review = await db.review.update({
            where: { id: reviewId },
            data: {
                ...(isApproved !== undefined && { isApproved }),
                ...(isVisible !== undefined && { isVisible }),
            },
        });

        return NextResponse.json({ success: true, review });
    } catch (error) {
        console.error('Update review error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}

// DELETE /api/reviews/[reviewId] - Delete review
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }

        const { reviewId } = await params;

        await db.review.delete({
            where: { id: reviewId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete review error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
