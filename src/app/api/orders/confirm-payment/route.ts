import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';
import { fragmentService } from '@/lib/services/fragment';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { orderId } = body;

        const order = await db.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.buyerId !== session.userId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Simulate payment verification (SBP)
        // In real app, we'd wait for webhook or admin approval.
        // Here we assume "I Paid" implies success for demo/MVP automated flow.

        await db.order.update({
            where: { id: order.id },
            data: {
                status: OrderStatus.PROCESSING,
                paidAt: new Date(),
            }
        });

        // Create Transaction Record
        await db.transaction.create({
            data: {
                userId: session.userId,
                orderId: order.id,
                type: 'PURCHASE',
                status: 'COMPLETED',
                amount: order.totalPrice,
                paymentMethod: 'SBP',
                description: `Payment for Order #${order.orderNumber}`,
            }
        });

        // Trigger Auto-Buy from Fragment (Only for Stars)
        if (order.productType === 'TELEGRAM_STARS') {
            console.log(`Triggering Auto-Buy for Order ${order.orderNumber}`);
            require('fs').appendFileSync('debug.log', `[${new Date().toISOString()}] Triggering Auto-Buy for ${order.orderNumber}\n`);

            // Non-blocking call in background
            (async () => {
                try {
                    const result = await fragmentService.deliverStars(
                        order.id,
                        order.telegramUsername!,
                        order.coinsAmount
                    );

                    if (result.success) {
                        await db.order.update({
                            where: { id: order.id },
                            data: {
                                status: OrderStatus.COMPLETED,
                                completedAt: new Date(),
                                fragmentTxId: result.txHash || 'simulated_tx',
                            }
                        });
                        console.log(`Order ${order.orderNumber} completed. Tx: ${result.txHash}`);
                    } else {
                        console.error(`Auto-buy failed for ${order.orderNumber}: ${result.error}`);
                        // Keep status PROCESSING for admin to retry
                    }
                } catch (bgError: any) {
                    console.error('Background task error', bgError);
                    require('fs').appendFileSync('debug.log', `[${new Date().toISOString()}] Background task error: ${bgError.message}\n${bgError.stack}\n`);
                }
            })();
        }

        return NextResponse.json({ success: true, status: OrderStatus.PROCESSING });

    } catch (error) {
        console.error('Confirm payment error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
