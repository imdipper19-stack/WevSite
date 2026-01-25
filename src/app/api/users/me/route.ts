import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateProfileSchema } from '@/lib/validators';
import { findUserById, updateUser } from '@/lib/db-helpers';
import { db } from '@/lib/db'; // Direct db access for delete if helper not enough

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/users/me - Get current user profile
export async function GET() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            );
        }

        const user = await findUserById(currentUser.userId);

        if (!user) {
            return NextResponse.json(
                { error: 'Пользователь не найден' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}

// PATCH /api/users/me - Update current user profile
export async function PATCH(request: NextRequest) {
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
        const validationResult = updateProfileSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Ошибка валидации',
                    details: validationResult.error.flatten().fieldErrors
                },
                { status: 400 }
            );
        }

        const user = await findUserById(currentUser.userId);

        if (!user) {
            return NextResponse.json(
                { error: 'Пользователь не найден' },
                { status: 404 }
            );
        }

        // Update user
        const updatedUser = await updateUser(currentUser.userId, validationResult.data);

        return NextResponse.json({
            success: true,
            user: updatedUser,
        });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}

// DELETE /api/users/me - Delete account
export async function DELETE() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            );
        }

        // Delete user (cascade will handle relations if configured, checking schema...)
        // Schema says: 
        // Session -> onDelete: Cascade
        // Notifications -> onDelete: Cascade
        // Executor -> onDelete: Cascade
        // Orders/Transactions might restrict delete if not configured. 
        // Usually soft delete is better, but for now hard delete as requested.
        // If there are orders, foreign key constraint might fail if not cascade.
        // Let's check schema for orders relation. 
        // Order.buyer -> onDelete: No Action (default).
        // So we can't delete user if they have orders unless we delete orders first.
        // Safe approach: delete user and let database handle it (or fail).

        await db.user.delete({
            where: { id: currentUser.userId },
        });

        return NextResponse.json({
            success: true,
            message: 'Аккаунт успешно удален',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        // If FK constraint fails
        if ((error as any).code === 'P2003') {
            return NextResponse.json(
                { error: 'Невозможно удалить аккаунт с активными заказами' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
