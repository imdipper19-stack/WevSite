import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validators';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { createUser, findUserByEmail } from '@/lib/db-helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validationResult = registerSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Ошибка валидации',
                    details: validationResult.error.flatten().fieldErrors
                },
                { status: 400 }
            );
        }

        const { firstName, email, phone, password } = validationResult.data;

        // Check if user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'Пользователь с таким email уже существует' },
                { status: 409 }
            );
        }

        // Create user
        const newUser = await createUser({
            email,
            firstName,
            phone,
            password,
        });

        // Generate JWT token
        const token = await generateToken({
            userId: newUser.id,
            email: newUser.email || '',
            role: newUser.role,
        });

        // Set auth cookie
        await setAuthCookie(token);

        // Return user data (without password)
        return NextResponse.json({
            success: true,
            user: newUser,
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
