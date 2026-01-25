import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Disable in DB
        await db.user.update({
            where: { id: user.userId },
            data: {
                twoFaEnabled: false,
                twoFaSecret: null
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('2FA Disable Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
