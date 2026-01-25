import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getCurrentUser();
        // Allow public read for some settings? No, keep it admin for now.
        // Frontend might need public config endpoint later.
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const settings = await db.setting.findMany();

        // Convert array to object { key: value }
        const settingsMap: Record<string, any> = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });

        // Return defaults if keys missing
        const defaults = {
            'ton_exchange_rate': 200, // 1 TON = 200 RUB
            'stars_price_rub': 1.5,
            'tiktok_coin_price_rub': 1.5,
            'ton_wallet_address': '', // Empty by default
            'ton_wallet_mnemonic': '', // Encrypted ideally, but for MVP plain JSON or hidden
            'admin_notification_email': '',
        };

        return NextResponse.json({ ...defaults, ...settingsMap });

    } catch (error) {
        console.error('Get settings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentUser();
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const settings = body; // { key: value, key2: value2 }

        const updates = Object.entries(settings).map(([key, value]) => {
            return db.setting.upsert({
                where: { key },
                update: { value: value as any },
                create: { key, value: value as any, description: 'Updated via Admin Panel' }
            });
        });

        await Promise.all(updates);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update settings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
