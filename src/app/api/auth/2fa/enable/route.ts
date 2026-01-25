import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
// @ts-ignore
const { authenticator } = require('@otplib/preset-default');

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { secret, code } = await req.json();

        if (!secret || !code) {
            return NextResponse.json({ error: 'Missing secret or code' }, { status: 400 });
        }

        // Verify token
        const isValid = authenticator.verify({
            token: code,
            secret: secret
        });

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
        }

        // Save to DB
        await db.user.update({
            where: { id: user.userId },
            data: {
                twoFaSecret: secret,
                twoFaEnabled: true
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('2FA Enable Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
