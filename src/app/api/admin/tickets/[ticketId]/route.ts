import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface Context {
    params: Promise<{
        ticketId: string;
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
        const { status, priority } = body;

        const dataToUpdate: any = {};
        if (status) dataToUpdate.status = status;
        if (priority) dataToUpdate.priority = priority;

        const updatedTicket = await db.ticket.update({
            where: { id: params.ticketId },
            data: dataToUpdate,
        });

        return NextResponse.json({ success: true, ticket: updatedTicket });

    } catch (error) {
        console.error('Update ticket error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
