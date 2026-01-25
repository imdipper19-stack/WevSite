import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createMessage, getMessagesByOrder, getOrderById } from '@/lib/db-helpers';

export const dynamic = 'force-dynamic';

// GET /api/chat/[orderId] - Get messages for an order
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ orderId: string }> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            );
        }

        const { orderId } = params;
        console.log('[API Chat] Request for order:', orderId);
        console.log('[API Chat] Current User:', currentUser);

        // Verify user has access to this order
        const order = await getOrderById(orderId);

        if (!order) {
            console.log('[API Chat] Order not found');
            return NextResponse.json(
                { error: 'Заказ не найден' },
                { status: 404 }
            );
        }

        console.log('[API Chat] Order found. Buyer:', order.buyerId, 'Exec:', order.executorId);

        // Check if user is buyer or executor of this order OR ADMIN
        const check = order.buyerId !== currentUser.userId && order.executorId !== currentUser.userId && currentUser.role !== 'ADMIN';
        console.log('[API Chat] Access Check:', { isBuyer: order.buyerId === currentUser.userId, isAdmin: currentUser.role === 'ADMIN', denied: check });

        if (check) {
            return NextResponse.json(
                { error: 'Нет доступа к этому заказу' },
                { status: 403 }
            );
        }

        const messages = await getMessagesByOrder(orderId);

        return NextResponse.json({
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                coinsAmount: order.coinsAmount,
                totalPrice: order.totalPrice.toNumber(),
            },
            messages: messages.map(m => ({
                id: m.id,
                senderId: m.senderId,
                senderName: m.sender.firstName || 'Пользователь',
                content: m.content,
                isSystem: m.isSystem,
                isRead: m.isRead,
                createdAt: m.createdAt,
            })),
            currentUserId: currentUser.userId,
        });
    } catch (error) {
        console.error('Get chat messages error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}

// POST /api/chat/[orderId] - Send a message
export async function POST(
    request: NextRequest,
    props: { params: Promise<{ orderId: string }> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            );
        }

        const { orderId } = params;
        const body = await request.json();
        const { content } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Сообщение не может быть пустым' },
                { status: 400 }
            );
        }

        // Verify user has access to this order
        const order = await getOrderById(orderId);
        if (!order) {
            return NextResponse.json(
                { error: 'Заказ не найден' },
                { status: 404 }
            );
        }

        if (order.buyerId !== currentUser.userId && order.executorId !== currentUser.userId && currentUser.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Нет доступа к этому заказу' },
                { status: 403 }
            );
        }

        const message = await createMessage({
            orderId,
            senderId: currentUser.userId,
            content: content.trim(),
        });

        return NextResponse.json({
            success: true,
            message: {
                id: message.id,
                senderId: message.senderId,
                content: message.content,
                isSystem: message.isSystem,
                createdAt: message.createdAt,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
