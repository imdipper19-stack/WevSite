import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { UserRole, NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentUser();
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { title, content } = body;

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
        }

        // Fetch all user IDs
        const users = await db.user.findMany({ select: { id: true } });

        if (users.length === 0) {
            return NextResponse.json({ success: true, count: 0 });
        }

        // Create notifications in batches properly
        // Prisma createMany is supported for Postgres
        const notifications = users.map(u => ({
            userId: u.id,
            type: NotificationType.SYSTEM,
            title,
            content,
            isRead: false
        }));

        await db.notification.createMany({
            data: notifications
        });

        return NextResponse.json({ success: true, count: users.length });

    } catch (error) {
        console.error('Global notification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
