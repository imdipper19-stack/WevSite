import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createReviewSchema } from '@/lib/validators';
import { createReview, getApprovedReviews } from '@/lib/db-helpers';
import { db } from '@/lib/db';

// GET /api/reviews - Get approved reviews (or all for Admin)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');
        const status = searchParams.get('status'); // approved, pending, all

        const currentUser = await getCurrentUser();
        const isAdmin = currentUser?.role === 'ADMIN';

        const where: any = {
            isVisible: true,
        };

        if (isAdmin) {
            // Admin filters
            if (status === 'pending') {
                where.isApproved = false;
            } else if (status === 'approved') {
                where.isApproved = true;
            } else {
                // all (remove isVisible constraint if needed, but schema defaults isVisible=true)
                delete where.isVisible; // Admin sees hidden too?
            }
        } else {
            // Public filters
            where.isApproved = true;
            where.isVisible = true;
        }

        const [reviews, total] = await Promise.all([
            db.review.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
                include: {
                    author: {
                        select: { firstName: true, email: true },
                    },
                    order: {
                        select: { orderNumber: true }
                    }
                },
            }),
            db.review.count({ where })
        ]);

        return NextResponse.json({
            reviews: reviews.map(r => ({
                id: r.id,
                authorName: r.author.firstName || 'Пользователь',
                authorEmail: isAdmin ? r.author.email : undefined,
                orderNumber: r.order.orderNumber,
                rating: r.rating,
                content: r.content,
                images: r.images,
                isApproved: r.isApproved,
                isVisible: r.isVisible,
                createdAt: r.createdAt,
            })),
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            },
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}

// POST /api/reviews - Create a review for completed order
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

        // Validate input
        const validationResult = createReviewSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Ошибка валидации',
                    details: validationResult.error.flatten().fieldErrors
                },
                { status: 400 }
            );
        }

        const { orderId, rating, content, images } = validationResult.data;

        // Check if review already exists for this order
        const existingReview = await db.review.findUnique({
            where: { orderId }
        });

        if (existingReview) {
            return NextResponse.json(
                { error: 'Отзыв для этого заказа уже существует' },
                { status: 409 }
            );
        }

        // Create review (db-helpers createReview doesn't support images yet, 
        // let's use db directly or update helper. Using db directly here is fine).
        // Actually createReview in db-helpers accepts content but not images.
        // I can update `createReview` usage here.

        const review = await db.review.create({
            data: {
                orderId,
                authorId: currentUser.userId,
                rating,
                content,
                images: images || [],
                isApproved: false, // Requires moderation
                isVisible: true,
            },
        });

        return NextResponse.json({
            success: true,
            review: {
                id: review.id,
                rating,
                content,
                message: 'Отзыв отправлен на модерацию',
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Create review error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
