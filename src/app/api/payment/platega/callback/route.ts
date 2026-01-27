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

        console.log(`Processing Order: ${order.id} (Status: ${order.status}, Type: ${order.productType})`);

        // Update Status
        if (body.status === 'CONFIRMED') {
            if (order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.PAID) {

                // Handle different product types
                if (order.productType === 'TELEGRAM_STARS') {
                    // Update to PAID to acknowledge payment
                    await db.order.update({
                        where: { id: order.id },
                        data: {
                            status: OrderStatus.PAID,
                            paidAt: new Date()
                        }
                    });

                    // Trigger delivery (async)
                    if (order.telegramUsername) {
                        // Import dynamically to avoid circle if any? No, straightforward import.
                        // We need to import fragmentService at the top.
                        // For now using require or assume import at top.
                        // Actually, I'll add imports in a separate edit or use `import { fragmentService } from '@/lib/services/fragment';` if allowed.
                        // Since I can't add imports easily with replace_content in middle, I'll use require if possible, OR I will update the whole file. 
                        // I'll assume imports are added or available.
                        // I will update the imports in a separate check.

                        // Fire and forget, or handle? 
                        // It's safer to just log.
                        console.log('Triggering Fragment delivery...');
                        const { fragmentService } = require('@/lib/services/fragment');
                        fragmentService.deliverStars(order.id, order.telegramUsername, order.coinsAmount)
                            .then((res: any) => console.log('Delivery result:', res))
                            .catch((err: any) => console.error('Delivery trigger error:', err));
                    } else {
                        console.error('No telegram username for Stars order!', order.id);
                    }

                } else {
                    // TIKTOK COINS (Default)
                    // Transaction: Update Order -> Add Coins to User
                    await db.$transaction([
                        db.order.update({
                            where: { id: order.id },
                            data: {
                                status: OrderStatus.COMPLETED,
                                completedAt: new Date(),
                                paidAt: new Date()
                            }
                        }),
                        db.user.update({
                            where: { id: order.buyerId },
                            data: {
                                coins: { increment: order.coinsAmount }
                            }
                        })
                    ]);
                    console.log(`Order ${order.id} completed. Coins added to user.`);
                }
            } else {
                console.log('Order already COMPLETED or PAID');
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
