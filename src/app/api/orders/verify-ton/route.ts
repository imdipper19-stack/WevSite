import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';
import { verifyTonTransaction } from '@/lib/fragment-api';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
        }

        const order = await db.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.buyerId !== session.userId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        if (order.productType !== 'TELEGRAM_STARS') {
            return NextResponse.json({ error: 'Not a Stars order' }, { status: 400 });
        }

        if (order.status !== OrderStatus.PENDING_PAYMENT) {
            return NextResponse.json({
                success: true,
                message: 'Order already processed',
                status: order.status
            });
        }

        // Get wallet from env or use the same hardcoded one displayed on frontend
        // TODO: Move to env variable TON_WALLET_ADDRESS
        const walletAddress = process.env.TON_WALLET_ADDRESS || 'UQD_YOUR_TON_WALLET_ADDRESS_HERE';

        // Convert Price to TON. 
        // In a real app, you should store the expected TON amount in the DB at creation time 
        // to avoid rate fluctuations. For now, we recalculate using the same fixed rate (200).
        const tonRate = 200;
        const expectedTonAmount = order.totalPrice.toNumber() / tonRate;
        const comment = `Stars_${order.orderNumber}`;

        const isVerified = await verifyTonTransaction(walletAddress, expectedTonAmount, comment);

        if (isVerified) {
            // Update order status
            await db.order.update({
                where: { id: order.id },
                data: {
                    status: OrderStatus.PROCESSING, // Ready for Fragment API execution
                    paidAt: new Date(),
                }
            });

            // Trigger background job (hypothetically) here to call Fragment API

            return NextResponse.json({ success: true, verified: true, status: OrderStatus.PROCESSING });
        } else {
            return NextResponse.json({
                success: true,
                verified: false,
                message: 'Transaction not found or mismatch. Please wait a few moments if you just sent it.'
            });
        }

    } catch (error) {
        console.error('Verify payment error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
