// Database helper functions for common operations
import { db } from './db';
import { hashPassword, verifyPassword } from './auth';
import { generateOrderNumber } from './encryption';
import { Prisma, UserRole, OrderStatus, TransactionType, TransactionStatus, NotificationType } from '@prisma/client';


// ==========================================
// User Operations
// ==========================================

export async function createUser(data: {
    email: string;
    firstName: string;
    phone?: string;
    password: string;
}) {
    const passwordHash = await hashPassword(data.password);

    return db.user.create({
        data: {
            email: data.email,
            firstName: data.firstName,
            phone: data.phone,
            passwordHash,
            role: UserRole.BUYER,
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            role: true,
            balance: true,
            coins: true,
            createdAt: true,
            telegramId: true,
        },
    });
}

export async function createUserViaTelegram(data: {
    telegramId: string;
    firstName: string;
    lastName?: string;
    username?: string;
    photoUrl?: string;
}) {
    return db.user.create({
        data: {
            telegramId: data.telegramId,
            firstName: data.firstName,
            lastName: data.lastName,
            avatarUrl: data.photoUrl,
            role: UserRole.BUYER,
            isVerified: true, // Telegram auth is verified by definition
        },
    });
}

export async function findUserByTelegramId(telegramId: string) {
    return db.user.findUnique({
        where: { telegramId },
    });
}

export async function findUserByEmail(email: string) {
    return db.user.findUnique({
        where: { email },
    });
}

export async function findUserById(id: string) {
    return db.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            balance: true,
            coins: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            twoFaEnabled: true,
            avatarUrl: true,
            createdAt: true,
        },
    });
}

export async function updateUser(id: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
}) {
    return db.user.update({
        where: { id },
        data,
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            balance: true,
            coins: true,
        },
    });
}

export async function validateUserCredentials(email: string, password: string) {
    const user = await findUserByEmail(email);
    if (!user || !user.passwordHash) return null;

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) return null;

    return user;
}

// ==========================================
// Order Operations
// ==========================================

export async function createOrder(data: {
    buyerId: string;
    coinsAmount: number;
    // paymentMethod removed as it's handled in Transaction
}) {
    // Use proper Decimal type
    const pricePerCoin = new Prisma.Decimal(1.5);
    const totalPrice = pricePerCoin.mul(data.coinsAmount);

    const orderNumber = generateOrderNumber();

    return db.order.create({
        data: {
            orderNumber,
            buyerId: data.buyerId,
            coinsAmount: data.coinsAmount,
            pricePerCoin,
            totalPrice,
            status: OrderStatus.PENDING_PAYMENT,
        },
    });
}

export async function getOrdersByUser(userId: string, status?: OrderStatus) {
    return db.order.findMany({
        where: {
            buyerId: userId,
            ...(status && { status }),
        },
        orderBy: { createdAt: 'desc' },
        include: {
            executor: {
                select: { id: true, firstName: true },
            },
        },
    });
}

export async function getOrderById(orderId: string) {
    return db.order.findUnique({
        where: { id: orderId },
        include: {
            buyer: {
                select: { id: true, firstName: true, email: true },
            },
            executor: {
                select: { id: true, firstName: true },
            },
            review: true,
        },
    });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, executorId?: string) {
    return db.order.update({
        where: { id: orderId },
        data: {
            status,
            ...(executorId && { executorId }),
            ...(status === OrderStatus.COMPLETED && { completedAt: new Date() }),
        },
    });
}

// ==========================================
// Transaction Operations
// ==========================================

export async function createTransaction(data: {
    userId: string;
    type: TransactionType;
    amount: number;
    orderId?: string;
    description?: string;
}) {
    return db.transaction.create({
        data: {
            userId: data.userId,
            type: data.type,
            amount: new Prisma.Decimal(data.amount),
            orderId: data.orderId,
            description: data.description,
            status: TransactionStatus.COMPLETED,
        },
    });
}

export async function getTransactionsByUser(userId: string) {
    return db.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
    });
}

// ==========================================
// Message Operations
// ==========================================

export async function createMessage(data: {
    orderId: string;
    senderId: string;
    content: string;
    isSystem?: boolean;
}) {
    return db.message.create({
        data: {
            orderId: data.orderId,
            senderId: data.senderId,
            content: data.content,
            isSystem: data.isSystem || false,
        },
        include: {
            sender: {
                select: { id: true, firstName: true, role: true },
            },
        },
    });
}

export async function getMessagesByOrder(orderId: string) {
    return db.message.findMany({
        where: { orderId },
        orderBy: { createdAt: 'asc' },
        include: {
            sender: {
                select: { id: true, firstName: true, role: true },
            },
        },
    });
}

// ==========================================
// Review Operations
// ==========================================

export async function createReview(data: {
    orderId: string;
    authorId: string;
    rating: number;
    content?: string;
}) {
    return db.review.create({
        data: {
            orderId: data.orderId,
            authorId: data.authorId,
            rating: data.rating,
            content: data.content,
            isApproved: false,
            isVisible: true,
        },
    });
}

export async function getApprovedReviews(limit = 10, offset = 0) {
    return db.review.findMany({
        where: {
            isApproved: true,
            isVisible: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
            author: {
                select: { firstName: true },
            },
        },
    });
}

// ==========================================
// Admin Operations
// ==========================================

export async function getAllUsers(options: {
    search?: string;
    role?: UserRole;
    isBanned?: boolean;
    limit?: number;
    offset?: number;
}) {
    const where = {
        ...(options.search && {
            OR: [
                { firstName: { contains: options.search, mode: 'insensitive' as const } },
                { email: { contains: options.search, mode: 'insensitive' as const } },
            ],
        }),
        ...(options.role && { role: options.role }),
        ...(options.isBanned !== undefined && { isBanned: options.isBanned }),
    };

    const [users, total] = await Promise.all([
        db.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: options.limit || 20,
            skip: options.offset || 0,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                balance: true,
                isBanned: true,
                createdAt: true,
                _count: {
                    select: { orders: true },
                },
            },
        }),
        db.user.count({ where }),
    ]);

    return { users, total };
}

export async function banUser(userId: string, ban: boolean) {
    return db.user.update({
        where: { id: userId },
        data: { isBanned: ban },
    });
}

export async function getAllOrders(options: {
    status?: OrderStatus;
    limit?: number;
    offset?: number;
}) {
    const where = {
        ...(options.status && { status: options.status }),
    };

    const [orders, total] = await Promise.all([
        db.order.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: options.limit || 20,
            skip: options.offset || 0,
            include: {
                buyer: { select: { firstName: true, email: true } },
                executor: { select: { firstName: true } },
            },
        }),
        db.order.count({ where }),
    ]);

    return { orders, total };
}

export async function getPublicStats() {
    const [usersCount, coinsSoldAgg, reviewsAgg] = await Promise.all([
        db.user.count({ where: { role: UserRole.BUYER } }),
        db.order.aggregate({
            _sum: { coinsAmount: true },
            where: { status: OrderStatus.COMPLETED }
        }),
        db.review.aggregate({
            _avg: { rating: true },
            where: { isApproved: true, isVisible: true }
        })
    ]);

    return {
        clients: usersCount,
        coinsSold: coinsSoldAgg._sum.coinsAmount || 0,
        averageRating: reviewsAgg._avg.rating?.toFixed(1) || '5.0',
    };
}

// ==========================================
// Notification Operations
// ==========================================

export async function getUserNotifications(userId: string, limit = 20) {
    return db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
}

export async function getUnreadNotificationsCount(userId: string) {
    return db.notification.count({
        where: {
            userId,
            isRead: false,
        },
    });
}

export async function markNotificationAsRead(id: string) {
    return db.notification.update({
        where: { id },
        data: { isRead: true },
    });
}

export async function markAllNotificationsAsRead(userId: string) {
    return db.notification.updateMany({
        where: {
            userId,
            isRead: false,
        },
        data: { isRead: true },
    });
}

export async function createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    content: string;
    data?: any;
}) {
    return db.notification.create({
        data: {
            userId: data.userId,
            type: data.type,
            title: data.title,
            content: data.content,
            data: data.data || {},
        },
    });
}
