const { PrismaClient } = require('@prisma/client');

async function promoteToAdmin() {
    const prisma = new PrismaClient();

    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: 'im.dipper19@gmail.com' }
        });

        if (!user) {
            console.log('User not found!');
            return;
        }

        console.log('Found user:', user.firstName, user.email);

        // Update to ADMIN role
        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
        });

        console.log('Successfully promoted to ADMIN:', updated.email, updated.role);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

promoteToAdmin();
