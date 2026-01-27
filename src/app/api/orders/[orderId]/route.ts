import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOrderById } from '@/lib/db-helpers';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/orders/[orderId] - Get single order details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            );
        }

        const { orderId } = await params;
        const order = await getOrderById(orderId);

        if (!order) {
            return NextResponse.json(
                { error: 'Заказ не найден' },
                { status: 404 }
            );
        }

        // Check if user has access to this order
        const isExecutor = order.executorId === currentUser.userId;
        const isAdmin = currentUser.role === 'ADMIN';
        const isBuyer = order.buyerId === currentUser.userId;

        if (!isBuyer && !isAdmin && !isExecutor) {
            return NextResponse.json(
                { error: 'Нет доступа к этому заказу' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                productType: order.productType,
                coinsAmount: order.coinsAmount,
                pricePerCoin: order.pricePerCoin.toNumber(),
                totalPrice: order.totalPrice.toNumber(),
                status: order.status,
                telegramUsername: order.telegramUsername,
                tiktokLogin: (isAdmin || isExecutor) ? order.tiktokLogin : order.tiktokLogin ? '***скрыто***' : null,
                tiktokPassword: (isAdmin || isExecutor) ? order.tiktokPassword : null, // Executors need credentials
                fragmentTxId: order.fragmentTxId,
                tonTxHash: order.tonTxHash,
                // @ts-ignore
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt,
                paidAt: order.paidAt,
                completedAt: order.completedAt,
                review: order.review,
            },
        });
    } catch (error) {
        console.error('Get order error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}

// PATCH /api/orders/[orderId] - Update status (For Executors)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { orderId } = await params;
        const body = await request.json();
        const { status } = body;

        const order = await getOrderById(orderId);
        if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Only assigned executor or admin can update
        if (order.executorId !== currentUser.userId && currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Executor can only mark as COMPLETED
        if (currentUser.role !== 'ADMIN' && status !== 'COMPLETED') {
            return NextResponse.json({ error: 'Executors can only mark as COMPLETED' }, { status: 400 });
        }

        const updated = await db.order.update({
            where: { id: orderId },
            data: {
                status: status, // Validation handled by Prisme Enum or we should check
                completedAt: status === 'COMPLETED' ? new Date() : undefined
            }
        });

        return NextResponse.json({ success: true, order: updated });

    } catch (error) {
        console.error('Update order error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
