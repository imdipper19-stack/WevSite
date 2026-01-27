import { db } from '@/lib/db';

export interface AppSettings {
    tonExchangeRate: number;
    starsPriceRub: number;
    tiktokCoinPriceRub: number;
    tonWalletAddress: string;
    tonWalletMnemonic: string;
    fragmentHash: string;
    fragmentCookie: string;
    // ... other settings
}

const DEFAULTS: AppSettings = {
    tonExchangeRate: 200,
    starsPriceRub: 1.5,
    tiktokCoinPriceRub: 1.5,
    tonWalletAddress: '', // Configure via Admin Panel
    tonWalletMnemonic: '', // Configure via Admin Panel or ENV
    fragmentHash: '390bc6dad2e1e75434', // From AvtoStars
    fragmentCookie: 'stel_ssid=30d08c4d6c7bfb8cc4_15772389599455901386; stel_dt=-180; stel_token=d1a6a1e783c54d2bb92a60617de2ab30d1a6a1fdd1a6aac787b6e50370dad016e1768; stel_ton_token=TzivBNbGKAGbwXtaaRdNy8_5M643D6o_d0UbXjVQs25ghazRAlBzC3mIMeBRSjVKOt6oL3BVKfk3txry57Df4lFOrlGXsK2HNXRoJTbgGQe6kWogjCZ3cxGB9aUJVGotleTSW9KhC4lJ-4w_gXu6-hnOA362ajKI7dJPjsk94zcwUoYxTmnby_zjZX1-9CvlZRPtDKyK', // From AvtoStars
};

export async function getSettings(): Promise<AppSettings> {
    try {
        const settings = await db.setting.findMany();
        const settingsMap: Record<string, string> = {};
        settings.forEach(s => {
            settingsMap[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value);
        });

        return {
            tonExchangeRate: Number(settingsMap['ton_exchange_rate']) || DEFAULTS.tonExchangeRate,
            starsPriceRub: Number(settingsMap['stars_price_rub']) || DEFAULTS.starsPriceRub,
            tiktokCoinPriceRub: Number(settingsMap['tiktok_coin_price_rub']) || DEFAULTS.tiktokCoinPriceRub,
            tonWalletAddress: process.env.TON_WALLET_ADDRESS || settingsMap['ton_wallet_address'] || DEFAULTS.tonWalletAddress,
            tonWalletMnemonic: process.env.TON_WALLET_MNEMONIC || settingsMap['ton_wallet_mnemonic'] || DEFAULTS.tonWalletMnemonic,
            fragmentHash: settingsMap['fragment_hash'] || DEFAULTS.fragmentHash,
            fragmentCookie: settingsMap['fragment_cookie'] || DEFAULTS.fragmentCookie,
        };
    } catch (error) {
        console.error('Failed to load settings:', error);
        return DEFAULTS;
    }
}
