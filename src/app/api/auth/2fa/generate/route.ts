import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
// @ts-ignore
const { authenticator } = require('@otplib/preset-default');
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Generate secret
        const secret = authenticator.generateSecret();

        // Generate otpauth URL
        const email = user.email || 'user@vidlecta.com';
        const otpauth = authenticator.keyuri(email, 'Vidlecta', secret);

        // Generate QR Code
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        return NextResponse.json({
            secret,
            qrCodeUrl
        });

    } catch (error) {
        console.error('2FA Generate Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
