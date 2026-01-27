import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PlategaClient, CallbackPayload } from '@/lib/platega';
import { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const secretHeader = request.headers.get('X-Secret') || '';
        const body: CallbackPayload = await request.json();

        console.log('--- Platega Callback Start ---');
        console.log('Body:', JSON.stringify(body, null, 2));

        // Verify signature
        if (!PlategaClient.verifyCallback(body, secretHeader)) {
            console.warn(`Signature verification failed. secretHeader: ${secretHeader ? '***' : 'null'}`);
            // Force 403 unless secret is misconfigured/empty
            if (process.env.PLATEGA_API_KEY) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
            }
        }

        // Strategy 1: External ID
        let orderId = body.externalId;
        if (orderId) console.log(`Strategy 1 (ExternalID): Found ${orderId}`);

        // Strategy 2: Payload (JSON)
        if (!orderId && body.payload) {
            try {
                const p = typeof body.payload === 'string' ? JSON.parse(body.payload) : body.payload;
                if (p && p.orderId) {
                    orderId = p.orderId;
                    console.log(`Strategy 2 (Payload): Found ${orderId}`);
                }
            } catch (e) {
                console.error('Strategy 2 Error parsing payload:', e);
            }
        }

        let order;

        // Strategy 4: Lookup by Transaction Payment ID (body.id) - The Most Robust Way
        // Platega callback returns `id` which is the transaction ID.
        if (body.id) {
            console.log(`Strategy 4 (Transaction Lookup): Searching for paymentId ${body.id}`);
            const transaction = await db.transaction.findFirst({
                where: { paymentId: body.id },
                include: { order: true }
            });

            if (transaction && transaction.order) {
                console.log(`Strategy 4: Found Order ${transaction.order.id} via Transaction ${transaction.id}`);
                order = transaction.order;
                orderId = order.id;
            } else {
                console.log(`Strategy 4: No transaction found for paymentId ${body.id}`);
            }
        }

        // Try Lookup by ID (if strategies 1-2 found it)
        if (orderId && !order) {
            order = await db.order.findUnique({ where: { id: orderId } });
            if (!order) console.log(`Lookup by ID ${orderId} returned null`);
        }

        // Strategy 3: Description Regex (Fallback)
        if (!order && body.description) {
            console.log(`Strategy 3 (Description): Analyzing "${body.description}"`);
            // Regex to find #VID-...
            // Matches #VID- until space or end of string
            const match = body.description.match(/#(VID-[A-Z0-9-]+)/i);
            if (match && match[1]) {
                const orderNumber = match[1].toUpperCase(); // Ensure uppercase
                console.log(`Strategy 3: Extracted OrderNumber ${orderNumber}`);

                order = await db.order.findFirst({
                    where: {
                        orderNumber: {
                            equals: orderNumber,
                            mode: 'insensitive' // key to avoiding case issues
                        }
                    }
                });

                if (order) {
                    console.log(`Strategy 3: Found Order via OrderNumber! ID: ${order.id}`);
                    orderId = order.id;
                } else {
                    console.log(`Strategy 3: DB lookup for OrderNumber ${orderNumber} returned null`);
                    // Debug: list recent orders to see format?
                    // Too expensive/risky for prod.
                }
            } else {
                console.log('Strategy 3: No regex match in description');
            }
        }

        if (!order) {
            console.error('!!!!!! ORDER NOT FOUND !!!!!!');
            console.error('Search attempts failed.');
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        console.log(`Processing Order: ${order.id} (Status: ${order.status})`);

        // Update Status
        if (body.status === 'CONFIRMED') {
            if (order.status !== OrderStatus.COMPLETED) {
                await db.order.update({
                    where: { id: order.id },
                    data: {
                        status: OrderStatus.COMPLETED,
                        completedAt: new Date(),
                    }
                });
                console.log('Order marked as COMPLETED');
            } else {
                console.log('Order already COMPLETED');
            }
        } else if (body.status === 'CANCELED') {
            if (order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.COMPLETED) {
                await db.order.update({
                    where: { id: order.id },
                    data: { status: OrderStatus.CANCELLED }
                });
                console.log('Order marked as CANCELLED');
            }
        }

        console.log('--- Callback Processed Successfully ---');
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Platega callback CRITICAL error:', error);
        return NextResponse.json(
            { error: 'Callback processing failed', details: error.message },
            { status: 500 }
        );
    }
}
