
import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Finding stuck PROCESSING orders...');

    const orders = await prisma.order.findMany({
        where: {
            status: 'PROCESSING',
            productType: 'TELEGRAM_STARS'
        },
        include: {
            buyer: true
        }
    });

    console.log(`Found ${orders.length} processing orders.`);

    for (const order of orders) {
        if (!order.buyer) {
            console.log(`Skipping order ${order.orderNumber} (no buyer found)`);
            continue;
        }
        console.log(`Updating Order #${order.orderNumber} (${order.totalPrice} RUB) for ${order.buyer.email || order.buyer.id}...`);

        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });

        console.log(`Order #${order.orderNumber} marked as COMPLETED.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
