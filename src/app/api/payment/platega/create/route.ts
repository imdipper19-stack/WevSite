import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PlategaClient } from '@/lib/platega';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const order = await db.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.buyerId !== currentUser.userId && currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (order.status !== 'PENDING_PAYMENT') {
            return NextResponse.json({ error: 'Order is not in pending state' }, { status: 400 });
        }

        const totalPrice = order.totalPrice.toNumber();
        const description = `Оплата заказа #${order.orderNumber} (Vidlecta)`;

        // Determine product type for return URL or just use generic dashboard/orders
        // Or pay-stars/[id]
        let returnUrl = 'https://vidlecta.com/dashboard/orders';
        if (order.productType === 'TELEGRAM_STARS') {
            returnUrl = `https://vidlecta.com/dashboard/pay-stars/${order.id}`;
        }

        // We can pass currentUser.email if we have it, but Platega might not use it.

        const payment = await PlategaClient.createPayment({
            amount: totalPrice,
            description,
            orderId: order.id,
            paymentMethod: 2, // SBP Force
            successUrl: returnUrl,
            failUrl: returnUrl,
        });

        // Save Transaction to link Platega ID (payment.transactionId) with Order ID
        if (payment.transactionId) {
            await db.transaction.create({
                data: {
                    userId: currentUser.userId,
                    orderId: order.id,
                    type: 'PURCHASE',
                    status: 'PENDING',
                    amount: order.totalPrice,
                    paymentMethod: 'PLATEGA',
                    paymentId: payment.transactionId, // <-- The key to finding it later
                    description: description
                }
            });
        } else {
            console.warn('Platega did not return transactionId. Callback lookup via ID will fail.');
        }

        return NextResponse.json({
            success: true,
            url: payment.redirect || payment.paymentDetails
        });

    } catch (error: any) {
        console.error('Platega create payment error:', error);
        return NextResponse.json(
            { error: 'Payment creation failed: ' + (error.message || 'Unknown') },
            { status: 500 }
        );
    }
}
