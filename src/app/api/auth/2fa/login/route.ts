import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
// @ts-ignore
const { authenticator } = require('@otplib/preset-default');
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { userId, code } = await req.json();

        if (!userId || !code) {
            return NextResponse.json({ error: 'Missing userId or code' }, { status: 400 });
        }

        const user = await db.user.findUnique({
            where: { id: userId }
        });

        if (!user || !user.twoFaEnabled || !user.twoFaSecret) {
            return NextResponse.json({ error: '2FA not enabled or user not found' }, { status: 400 });
        }

        // Verify token
        const isValid = authenticator.verify({
            token: code,
            secret: user.twoFaSecret
        });

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
        }

        // Login success - Generate Token
        const token = await generateToken({
            userId: user.id,
            email: user.email || '',
            role: user.role
        });

        await setAuthCookie(token);

        // Update last login
        await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });

        return NextResponse.json({ success: true, role: user.role });

    } catch (error) {
        console.error('2FA Login Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
