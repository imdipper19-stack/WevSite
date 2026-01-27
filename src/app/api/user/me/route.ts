import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { findUserById } from '@/lib/db-helpers';
import { db } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getCurrentUser();

        if (!session) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            );
        }

        const user = await findUserById(session.userId);

        if (!user) {
            return NextResponse.json(
                { error: 'Пользователь не найден' },
                { status: 404 }
            );
        }

        // Calculate stats
        const stats = await db.order.aggregate({
            where: {
                buyerId: user.id,
                status: OrderStatus.COMPLETED
            },
            _sum: {
                totalPrice: true
            },
            _count: {
                _all: true
            }
        });

        return NextResponse.json({
            user: {
                ...user,
                totalSpent: stats._sum.totalPrice?.toNumber() || 0,
                completedOrders: stats._count._all || 0
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
