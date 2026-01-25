import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { generateOrderNumber } from '@/lib/encryption';
import { db } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

// POST /api/orders/stars - Create new Telegram Stars order
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
        const { starsAmount, telegramUsername, paymentMethod } = body;

        // Validate input
        if (!starsAmount || starsAmount < 50 || starsAmount > 100000) {
            return NextResponse.json(
                { error: 'Неверное количество звёзд (50-100,000)' },
                { status: 400 }
            );
        }

        if (!telegramUsername || telegramUsername.trim().length === 0) {
            return NextResponse.json(
                { error: 'Укажите Telegram username получателя' },
                { status: 400 }
            );
        }

        // Clean username (remove @ if present)
        const cleanUsername = telegramUsername.trim().replace(/^@/, '');

        const settings = await getSettings();
        const pricePerStar = settings.starsPriceRub;
        const totalPrice = starsAmount * pricePerStar;
        const orderNumber = generateOrderNumber();

        const newOrder = await db.order.create({
            data: {
                orderNumber,
                buyerId: currentUser.userId,
                productType: 'TELEGRAM_STARS',
                coinsAmount: starsAmount, // Using coinsAmount for stars amount
                status: OrderStatus.PENDING_PAYMENT,
                telegramUsername: cleanUsername,
                pricePerCoin: pricePerStar,
                totalPrice: totalPrice,
                // @ts-ignore
                paymentMethod: paymentMethod || 'card',
            }
        });

        return NextResponse.json({
            success: true,
            order: {
                id: newOrder.id,
                orderNumber: newOrder.orderNumber,
                starsAmount: newOrder.coinsAmount,
                totalPrice: newOrder.totalPrice.toNumber(),
                telegramUsername: newOrder.telegramUsername,
                status: newOrder.status,
            },
        }, { status: 201 });

    } catch (error: any) {
        console.error('Create stars order error:', error);
        // Log to file for debugging
        const fs = require('fs');
        fs.appendFileSync('error.log', `[${new Date().toISOString()}] Error: ${JSON.stringify(error, null, 2)}\nStack: ${error.stack}\n`);

        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера: ' + (error.message || 'Unknown') },
            { status: 500 }
        );
    }
}

// GET /api/orders/stars - Get user's stars orders
export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            );
        }

        const orders = await db.order.findMany({
            where: {
                buyerId: currentUser.userId,
                productType: 'TELEGRAM_STARS',
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true,
                orderNumber: true,
                coinsAmount: true,
                totalPrice: true,
                status: true,
                telegramUsername: true,
                fragmentTxId: true,
                createdAt: true,
                completedAt: true,
                // @ts-ignore
                paymentMethod: true,
            }
        });

        return NextResponse.json({
            orders: orders.map(o => ({
                ...o,
                starsAmount: o.coinsAmount,
                totalPrice: o.totalPrice.toNumber(),
                // @ts-ignore
                paymentMethod: o.paymentMethod || 'card',
            })),
        });
    } catch (error) {
        console.error('Get stars orders error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
