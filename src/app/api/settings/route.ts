import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const settings = await getSettings();

        // Only return public settings
        return NextResponse.json({
            starsPriceRub: settings.starsPriceRub,
            tiktokCoinPriceRub: settings.tiktokCoinPriceRub,
            tonExchangeRate: settings.tonExchangeRate,
        });
    } catch (error) {
        console.error('Settings API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
