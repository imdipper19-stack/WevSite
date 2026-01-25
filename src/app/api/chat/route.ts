import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sendMessageSchema } from '@/lib/validators';
import { createMessage, getMessagesByOrder } from '@/lib/db-helpers';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/chat?orderId=xxx - Get messages for an order
export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json(
                { error: 'orderId обязателен' },
                { status: 400 }
            );
        }

        // Verify user has access to this order
        const order = await db.order.findUnique({
            where: { id: orderId },
            select: { buyerId: true, executorId: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
        }

        if (order.buyerId !== currentUser.userId && order.executorId !== currentUser.userId && currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }

        // Get messages
        const messages = await getMessagesByOrder(orderId);

        // Mark messages as read for others messages
        // This should ideally be done in a separate "read" action or here carefully.
        // For now, let's just mark them as read in background or here.
        // If I am the receiver, I mark sender's messages as read.
        await db.message.updateMany({
            where: {
                orderId,
                senderId: { not: currentUser.userId },
                isRead: false
            },
            data: { isRead: true }
        });

        return NextResponse.json({
            messages: messages.map(m => ({
                id: m.id,
                senderId: m.senderId,
                senderName: m.sender.firstName || 'Пользователь',
                senderRole: m.sender.role,
                content: m.content,
                isSystem: m.isSystem,
                isRead: m.senderId === currentUser.userId ? m.isRead : true, // If I'm reading, it's read now
                timestamp: m.createdAt.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                createdAt: m.createdAt,
            })),
        });
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}

// POST /api/chat - Send a message
export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input
        const validationResult = sendMessageSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Ошибка валидации',
                    details: validationResult.error.flatten().fieldErrors
                },
                { status: 400 }
            );
        }

        const { orderId, content } = validationResult.data;

        // Verify access
        const order = await db.order.findUnique({
            where: { id: orderId },
            select: { buyerId: true, executorId: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
        }

        if (order.buyerId !== currentUser.userId && order.executorId !== currentUser.userId && currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }

        // Create message
        const newMessage = await createMessage({
            orderId,
            senderId: currentUser.userId,
            content,
        });

        return NextResponse.json({
            success: true,
            message: {
                id: newMessage.id,
                content,
                timestamp: newMessage.createdAt.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                createdAt: newMessage.createdAt,
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
