import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { UserRole, OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getCurrentUser();

        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Parallel queries
        const [
            totalUsers,
            usersYesterday,
            ordersToday,
            ordersYesterday,
            revenueTodayResult,
            revenueYesterdayResult,
            recentOrders,
            newUsers
        ] = await Promise.all([
            // User counts
            db.user.count(),
            db.user.count({ where: { createdAt: { lt: today } } }), // Approximation for "vs yesterday"

            // Order counts (Today vs Yesterday)
            db.order.count({ where: { createdAt: { gte: today } } }),
            db.order.count({ where: { createdAt: { gte: yesterday, lt: today } } }),

            // Revenue Today (Paid orders)
            db.order.aggregate({
                _sum: { totalPrice: true },
                where: {
                    createdAt: { gte: today },
                    status: { notIn: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED, OrderStatus.REFUNDED] }
                }
            }),
            // Revenue Yesterday
            db.order.aggregate({
                _sum: { totalPrice: true },
                where: {
                    createdAt: { gte: yesterday, lt: today },
                    status: { notIn: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED, OrderStatus.REFUNDED] }
                }
            }),

            // Recent Orders
            db.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    buyer: {
                        select: { firstName: true, lastName: true, email: true }
                    }
                }
            }),

            // New Users
            db.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { firstName: true, email: true, createdAt: true }
            })
        ]);

        // Revenue values
        const revenueToday = revenueTodayResult._sum.totalPrice?.toNumber() || 0;
        const revenueYesterday = revenueYesterdayResult._sum.totalPrice?.toNumber() || 0;

        // Calculate changes
        // Users (Total vs Total Yesterday is tricky, better: New Users Today vs New Users Yesterday)
        // For simplicity: just use today's new users count vs yesterday's new users count?
        // Let's refine:
        const newUsersToday = await db.user.count({ where: { createdAt: { gte: today } } });
        const newUsersYesterday = await db.user.count({ where: { createdAt: { gte: yesterday, lt: today } } });

        // Formatted Stats
        const stats = {
            totalUsers: {
                value: totalUsers,
                change: `+${newUsersToday}`, // Show new users today
                isPositive: true
            },
            ordersToday: {
                value: ordersToday,
                change: `${ordersToday - ordersYesterday}`, // Diff
                isPositive: ordersToday >= ordersYesterday
            },
            revenueToday: {
                value: revenueToday,
                change: `${revenueToday - revenueYesterday}`,
                isPositive: revenueToday >= revenueYesterday
            },
            conversion: {
                value: '0%', // Placeholder
                change: '0%',
                isPositive: true
            }
        };

        return NextResponse.json({
            stats,
            recentOrders: recentOrders.map(o => ({
                id: o.orderNumber,
                user: o.buyer.firstName || o.buyer.email,
                coins: o.coinsAmount,
                price: o.totalPrice,
                status: o.status,
                time: o.createdAt.toISOString()
            })),
            newUsers: newUsers.map(u => ({
                name: u.firstName || 'Без имени',
                email: u.email,
                date: u.createdAt.toISOString()
            }))
        });

    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
