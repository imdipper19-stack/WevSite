import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword, verifyPassword } from '@/lib/auth';
import { db } from '@/lib/db';
import { changePasswordSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const session = await getCurrentUser();

        if (!session) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input
        const validationResult = changePasswordSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Ошибка валидации',
                    details: validationResult.error.flatten().fieldErrors
                },
                { status: 400 }
            );
        }

        const { currentPassword, newPassword } = validationResult.data;

        // Get user
        const user = await db.user.findUnique({
            where: { id: session.userId },
            select: { id: true, passwordHash: true }
        });

        if (!user || !user.passwordHash) {
            return NextResponse.json(
                { error: 'Пользователь не найден' },
                { status: 404 }
            );
        }

        // Verify current password
        const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Неверный текущий пароль' },
                { status: 400 }
            );
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password
        await db.user.update({
            where: { id: session.userId },
            data: { passwordHash: newPasswordHash }
        });

        return NextResponse.json({ success: true, message: 'Пароль успешно изменен' });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
