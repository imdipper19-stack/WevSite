import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { TransactionType, TransactionStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/finance - Get financial stats and transactions
export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || !isAdmin(currentUser)) {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        let whereClause: any = {};

        if (type && type !== 'all') {
            if (Object.values(TransactionType).includes(type.toUpperCase() as TransactionType)) {
                whereClause.type = type.toUpperCase() as TransactionType;
            }
        }

        // Transactions
        const [transactions, total] = await Promise.all([
            db.transaction.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
                include: {
                    user: { select: { firstName: true, email: true } }
                }
            }),
            db.transaction.count({ where: whereClause })
        ]);

        // Stats calculations
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const revenueTodayAgg = await db.transaction.aggregate({
            _sum: { amount: true },
            where: {
                type: TransactionType.DEPOSIT,
                status: TransactionStatus.COMPLETED,
                createdAt: { gte: today }
            }
        });

        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 7);

        const revenueWeekAgg = await db.transaction.aggregate({
            _sum: { amount: true },
            where: {
                type: TransactionType.DEPOSIT,
                status: TransactionStatus.COMPLETED,
                createdAt: { gte: weekStart }
            }
        });

        // Pending Payouts (Executors with balance > 0)
        // This is a bit complex as we need to aggregate balance from users table or transactions?
        // User table has `balance` field.
        // Executors are Users with role EXECUTOR.
        const executors = await db.user.findMany({
            where: {
                role: 'EXECUTOR',
                balance: { gt: 0 }
            },
            include: {
                executor: true // to get details if needed
            }
        });

        const pendingPayouts = executors.map(e => ({
            executorId: e.id,
            executorName: e.firstName || e.email,
            amount: e.balance.toNumber(),
            ordersCount: e.executor?.completedOrders || 0,
            rating: e.executor?.rating.toNumber() || 0
        }));

        return NextResponse.json({
            stats: {
                revenueToday: revenueTodayAgg._sum.amount?.toNumber() || 0,
                revenueWeek: revenueWeekAgg._sum.amount?.toNumber() || 0,
                pendingPayouts: pendingPayouts.reduce((sum, p) => sum + p.amount, 0),
                pendingPayoutsCount: pendingPayouts.length,
            },
            transactions: transactions.map(t => ({
                id: t.id,
                userId: t.userId,
                userName: t.user.firstName || t.user.email,
                type: t.type,
                amount: t.amount.toNumber(),
                method: t.paymentMethod || 'Unknown',
                status: t.status,
                createdAt: t.createdAt
            })),
            pendingPayouts,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            },
        });
    } catch (error) {
        console.error('Get finance error:', error);
        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}

// POST /api/admin/finance - Process payout to executor
export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || !isAdmin(currentUser)) {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }

        const { executorId, amount } = await request.json();

        if (!executorId || !amount) {
            return NextResponse.json({ error: 'executorId и amount обязательны' }, { status: 400 });
        }

        // Use transaction to update balance and create transaction record
        await db.$transaction(async (tx) => {
            // Decrease balance
            await tx.user.update({
                where: { id: executorId },
                data: {
                    balance: { decrement: amount }
                }
            });

            // Create transaction record
            await tx.transaction.create({
                data: {
                    userId: executorId,
                    type: TransactionType.PAYOUT,
                    amount: -Math.abs(amount), // Negative for payout
                    status: TransactionStatus.COMPLETED,
                    paymentMethod: 'Manual Payout',
                    description: 'Admin triggered payout'
                }
            });
        });

        // We can fetch updated balance if needed, but for now just success
        return NextResponse.json({
            success: true,
            message: `Выплата ${amount}₽ успешно обработана`,
        });
    } catch (error) {
        console.error('Process payout error:', error);
        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}
