import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createOrderSchema } from '@/lib/validators';
import { getSettings } from '@/lib/settings';
import { createOrder, getOrdersByUser } from '@/lib/db-helpers';
import { generateOrderNumber } from '@/lib/encryption';
import { db } from '@/lib/db';
import { Prisma, OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            );
        }

        // Get query params for filtering
        const { searchParams } = new URL(request.url);
        const statusParam = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');

        let statusString: OrderStatus | undefined;
        if (statusParam && statusParam !== 'all') {
            // Map frontend "active" status to actual DB statuses is handled in db-helpers if we passed a custom type, 
            // but db-helpers `getOrdersByUser` expects `OrderStatus`.
            // We can do custom filtering here or enhance db-helper.
            // Let's do it here with prisma logic directly or reuse helper if simple.
            // The helper `getOrdersByUser` takes specific status.
            // If statusParam is 'active', we want multiple statuses.
            // Let's use db directly for flexibility here or update helper. 
            // Using db directly here is fine for specific filtering logic.

            // Actually, `getOrdersByUser` in db-helpers is simple. I can rewrite logic here.
        }

        let whereClause: any = {
            buyerId: currentUser.userId,
        };

        if (statusParam && statusParam !== 'all') {
            if (statusParam === 'active') {
                whereClause.status = {
                    in: [
                        OrderStatus.PENDING_PAYMENT,
                        OrderStatus.PAID,
                        OrderStatus.PROCESSING,
                        OrderStatus.AWAITING_CREDENTIALS,
                        OrderStatus.IN_PROGRESS
                    ]
                };
            } else {
                // Should validate if statusParam is valid enum
                if (Object.values(OrderStatus).includes(statusParam as OrderStatus)) {
                    whereClause.status = statusParam as OrderStatus;
                }
            }
        }

        const [orders, total] = await Promise.all([
            db.order.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
                select: {
                    id: true,
                    orderNumber: true,
                    coinsAmount: true,
                    totalPrice: true,
                    status: true,
                    createdAt: true,
                    completedAt: true,
                    productType: true,
                    telegramUsername: true,
                }
            }),
            db.order.count({ where: whereClause })
        ]);

        return NextResponse.json({
            orders: orders.map(o => ({
                ...o,
                totalPrice: o.totalPrice.toNumber(), // Decimal to number
            })),
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            },
        });
    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}

// POST /api/orders - Create new order
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
        const validationResult = createOrderSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Ошибка валидации',
                    details: validationResult.error.flatten().fieldErrors
                },
                { status: 400 }
            );
        }

        const { coinsAmount, paymentMethod } = validationResult.data;

        // Use transaction to ensure order number generation and creation works
        // Or just create. `db-helpers.createOrder` generates order via UUID default, 
        // but schema has `orderNumber` which is String @unique.
        // `db-helpers.ts` `createOrder` doesn't set `orderNumber`!
        // The schema says `orderNumber String @unique`.
        // I need to generate it.

        const orderNumber = generateOrderNumber();
        const settings = await getSettings();
        const pricePerCoin = settings.tiktokCoinPriceRub;
        const totalPrice = coinsAmount * pricePerCoin;

        const newOrder = await db.order.create({
            data: {
                orderNumber,
                buyerId: currentUser.userId,
                coinsAmount,
                pricePerCoin: pricePerCoin as any,
                totalPrice: totalPrice as any,
                status: OrderStatus.PENDING_PAYMENT,
            }
        });

        return NextResponse.json({
            success: true,
            order: {
                id: newOrder.id,
                orderNumber: newOrder.orderNumber,
                coinsAmount: newOrder.coinsAmount,
                totalPrice: newOrder.totalPrice.toNumber(),
                status: newOrder.status,
                paymentUrl: `/payment/${newOrder.id}?method=${paymentMethod}`, // Mock payment URL
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
