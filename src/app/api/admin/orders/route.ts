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
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            // Check if search looks like an ID
            if (search.startsWith('#') || search.length > 5) {
                const term = search.replace('#', '');
                where.OR = [
                    { orderNumber: { contains: term, mode: 'insensitive' } },
                    { id: { contains: term, mode: 'insensitive' } }
                ];
            } else {
                // Search by buyer name/email
                where.buyer = {
                    OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } }
                    ]
                };
            }
        }

        // Status mapping to enum
        // URL status might be lowercase, enum is uppercase
        if (status && status !== 'all') {
            const statusKey = status.toUpperCase().replace('-', '_');
            if (Object.values(OrderStatus).includes(statusKey as OrderStatus)) {
                where.status = statusKey as OrderStatus;
            }
        }

        const [orders, total] = await Promise.all([
            db.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    buyer: {
                        select: { firstName: true, lastName: true, email: true }
                    },
                    executor: {
                        select: { firstName: true, email: true }
                    }
                }
            }),
            db.order.count({ where })
        ]);

        return NextResponse.json({
            orders: orders.map(o => ({
                id: o.orderNumber, // Using orderNumber as ID for display
                buyer: `${o.buyer.firstName || ''} ${o.buyer.lastName || ''}`.trim() || o.buyer.email,
                executor: o.executor ? (`${o.executor.firstName || ''}`.trim() || o.executor.email) : null,
                coins: o.coinsAmount,
                price: o.totalPrice,
                status: o.status,
                createdAt: o.createdAt.toISOString()
            })),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Admin orders error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
