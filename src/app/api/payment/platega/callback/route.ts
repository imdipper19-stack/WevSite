import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PlategaClient, CallbackPayload } from '@/lib/platega';
import { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const secretHeader = request.headers.get('X-Secret') || '';
        const body: CallbackPayload = await request.json();

        console.log('Platega Callback received:', JSON.stringify(body));

        // Verify signature (optional based on user request but good practice)
        if (!PlategaClient.verifyCallback(body, secretHeader)) {
            console.warn('Platega callback signature verification failed');
            // If user said secret is not needed, we might allow it?
            // But PlategaClient logic returns true if no secret set.
            // If secret IS set, we must verify.
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        // Check if order exists
        // Platega sends our orderId as `externalId` (if we passed it) or we can match by something else.
        // But the docs for callback payload show `externalId`.
        // Let's assume we passed it.
        // If not, we might need to parse `description` or something.

        let orderId = body.externalId;

        // Fallback: try to find orderId in description "Description #<orderId>"? 
        // Or if we didn't pass externalId? 
        // My createRoute PASSED externalId: order.id. So it should be there.

        if (!orderId) {
            // Try to parse from payload if we sent it there
            try {
                // If payload is a string (JSON), parse it. If object, use as is.
                console.log('Parsing payload for orderId:', body.payload);
                const p = typeof body.payload === 'string' ? JSON.parse(body.payload) : body.payload;

                if (p && p.orderId) {
                    orderId = p.orderId;
                }
            } catch (e) {
                console.error('Failed to parse payload:', e);
            }
        }

        if (!orderId) {
            // Try to parse from payload if we sent it there
            try {
                // If payload is a string (JSON), parse it. If object, use as is.
                console.log('Parsing payload for orderId:', body.payload);
                const p = typeof body.payload === 'string' ? JSON.parse(body.payload) : body.payload;

                if (p && p.orderId) {
                    orderId = p.orderId;
                }
            } catch (e) {
                console.error('Failed to parse payload:', e);
            }
        }

        let order;

        if (orderId) {
            order = await db.order.findUnique({
                where: { id: orderId }
            });
        }

        // Fallback: Try to find by Order Number from description if ID not found
        // Description format: "Оплата заказа #VID-XXXX-XXXX (Vidlecta)" or similar
        if (!order && body.description) {
            console.log('Trying to find order by description:', body.description);
            // Match #VID-XXXX...
            const match = body.description.match(/#(VID-[A-Z0-9-]+)/);
            if (match && match[1]) {
                const orderNumber = match[1];
                console.log('Found orderNumber in description:', orderNumber);
                order = await db.order.findUnique({
                    where: { orderNumber: orderNumber }
                });
                if (order) {
                    orderId = order.id; // Ensure orderId is set for status update log
                }
            }
        }

        if (!order) {
            console.error(`Platega callback: Order not found. ID: ${orderId}, Desc: ${body.description}`);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Check status
        if (body.status === 'CONFIRMED') {
            // Update order status
            if (order.status !== OrderStatus.COMPLETED) {
                await db.order.update({
                    where: { id: orderId },
                    data: {
                        status: OrderStatus.COMPLETED,
                        completedAt: new Date(),
                        // Maybe save transaction ID?
                    }
                });
                console.log(`Order ${orderId} completed via Platega`);
            }
        } else if (body.status === 'CANCELED') {
            if (order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.COMPLETED) {
                await db.order.update({
                    where: { id: orderId },
                    data: {
                        status: OrderStatus.CANCELLED
                    }
                });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Platega callback error:', error);
        return NextResponse.json(
            { error: 'Callback processing failed' },
            { status: 500 }
        );
    }
}
