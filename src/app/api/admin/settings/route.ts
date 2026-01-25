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
        // Return defaults if keys missing
        const defaults = {
            'ton_exchange_rate': 200,
            'stars_price_rub': 1.5,
            'tiktok_coin_price_rub': 1.5,
            'ton_wallet_address': 'UQCEteRJDa9--KaeMmG8lCaxTn3NDlRz4BdDVsCP3P1ScJdr',
            'ton_wallet_mnemonic': 'verb push toddler execute oil pigeon stable ceiling swift impose shed retreat vessel spoon wrist chuckle metal deer carry derive program adapt picture minute',
            'fragment_hash': '390bc6dad2e1e75434',
            'fragment_cookie': 'stel_ssid=30d08c4d6c7bfb8cc4_15772389599455901386; stel_dt=-180; stel_token=d1a6a1e783c54d2bb92a60617de2ab30d1a6a1fdd1a6aac787b6e50370dad016e1768; stel_ton_token=TzivBNbGKAGbwXtaaRdNy8_5M643D6o_d0UbXjVQs25ghazRAlBzC3mIMeBRSjVKOt6oL3BVKfk3txry57Df4lFOrlGXsK2HNXRoJTbgGQe6kWogjCZ3cxGB9aUJVGotleTSW9KhC4lJ-4w_gXu6-hnOA362ajKI7dJPjsk94zcwUoYxTmnby_zjZX1-9CvlZRPtDKyK',
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
