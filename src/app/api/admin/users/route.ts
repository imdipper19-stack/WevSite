import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { UserRole, OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getCurrentUser();

        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (role && role !== 'all') {
            where.role = role.toUpperCase();
        }

        const [users, total] = await Promise.all([
            db.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { orders: true }
                    },
                    orders: {
                        where: { status: OrderStatus.COMPLETED },
                        select: { totalPrice: true }
                    }
                }
            }),
            db.user.count({ where })
        ]);

        return NextResponse.json({
            users: users.map(u => ({
                id: u.id,
                name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Без имени',
                email: u.email,
                phone: u.phone,
                role: u.role.toLowerCase(),
                balance: u.balance,
                ordersCount: u._count.orders,
                totalSpent: u.orders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
                status: u.isBanned ? 'banned' : 'active',
                createdAt: u.createdAt.toISOString()
            })),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Admin users error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
