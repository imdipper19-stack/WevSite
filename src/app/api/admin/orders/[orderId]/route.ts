import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { UserRole, OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface Context {
    params: Promise<{
        orderId: string;
    }>;
}

// PATCH /api/admin/orders/[orderId] - Update order status
export async function PATCH(
    req: NextRequest,
    context: Context
) {
    try {
        const session = await getCurrentUser();
        const params = await context.params;

        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { status, executorId } = body;

        // Status validation
        if (status && !Object.values(OrderStatus).includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const dataToUpdate: any = {};
        if (status) dataToUpdate.status = status;
        if (executorId !== undefined) dataToUpdate.executorId = executorId; // Allow null to unassign

        // If completing, set completedAt
        if (status === OrderStatus.COMPLETED) {
            dataToUpdate.completedAt = new Date();
        }

        const updatedOrder = await db.order.update({
            where: { id: params.orderId },
            data: dataToUpdate,
        });

        return NextResponse.json({ success: true, order: updatedOrder });

    } catch (error) {
        console.error('Update order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
