import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOrderById } from '@/lib/db-helpers';

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
        if (order.buyerId !== currentUser.userId && currentUser.role !== 'ADMIN') {
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
                tiktokLogin: order.tiktokLogin ? '***скрыто***' : null,
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
