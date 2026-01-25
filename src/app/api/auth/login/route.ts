import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validators';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { validateUserCredentials } from '@/lib/db-helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validationResult = loginSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Ошибка валидации',
                    details: validationResult.error.flatten().fieldErrors
                },
                { status: 400 }
            );
        }

        const { email, password } = validationResult.data;

        // Validate credentials
        const user = await validateUserCredentials(email, password);
        if (!user) {
            return NextResponse.json(
                { error: 'Неверный email или пароль' },
                { status: 401 }
            );
        }

        // Check 2FA
        if (user.twoFaEnabled) {
            return NextResponse.json({
                success: true,
                require2fa: true,
                userId: user.id
            });
        }

        // Generate JWT token
        const token = await generateToken({
            userId: user.id,
            email: user.email || '',
            role: user.role,
        });

        // Set auth cookie
        await setAuthCookie(token);

        // Return user data
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                role: user.role,
                balance: user.balance,
                coins: user.coins,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
