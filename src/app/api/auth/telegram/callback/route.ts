import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createUserViaTelegram, findUserByTelegramId } from '@/lib/db-helpers';
import { generateToken, setAuthCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        return await handleTelegramAuth(body);
    } catch (error) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const data: Record<string, string> = {};

        searchParams.forEach((value, key) => {
            data[key] = value;
        });

        const authData: any = { ...data };
        if (data.id) authData.id = parseInt(data.id);
        if (data.auth_date) authData.auth_date = parseInt(data.auth_date);

        const result = await handleTelegramAuth(authData);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vidlecta.com';

        if (result.status === 200) {
            return NextResponse.redirect(`${baseUrl}/dashboard`);
        } else {
            return NextResponse.redirect(`${baseUrl}/login?error=telegram_auth_failed`);
        }
    } catch (error) {
        console.error('Telegram redirect error:', error);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vidlecta.com';
        return NextResponse.redirect(`${baseUrl}/login?error=server_error`);
    }
}



async function handleTelegramAuth(body: any) {
    try {
        const { id, first_name, last_name, username, photo_url, auth_date, hash } = body;

        if (!id || !hash || !auth_date) {
            return NextResponse.json(
                { error: 'Invalid data' },
                { status: 400 }
            );
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            console.error('TELEGRAM_BOT_TOKEN is not set');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // 1. Check if auth_date is not too old (e.g. 5 min)
        const now = Math.floor(Date.now() / 1000);
        if (now - auth_date > 300) {
            return NextResponse.json(
                { error: 'Authentication expired' },
                { status: 401 }
            );
        }

        // 2. Verify Hash
        const data = { ...body };
        delete data.hash; // Remove hash from data to check

        const keys = Object.keys(data).sort();
        const checkString = keys.map(k => `${k}=${data[k]}`).join('\n');

        const secretKey = crypto.createHash('sha256').update(botToken).digest();
        const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

        console.log('[TG Auth Debug] Data:', JSON.stringify(data));
        console.log('[TG Auth Debug] Check String:', JSON.stringify(checkString));
        console.log('[TG Auth Debug] Hash:', hash);
        console.log('[TG Auth Debug] HMAC:', hmac);
        console.log('[TG Auth Debug] Match:', hmac === hash);

        if (hmac !== hash) {
            console.log('Hash mismatch', { received: hash, calculated: hmac });
            return NextResponse.json(
                { error: 'Invalid hash' },
                { status: 401 }
            );
        }

        // 3. Find or Create User
        const telegramId = id.toString();
        let user = await findUserByTelegramId(telegramId);

        if (!user) {
            user = await createUserViaTelegram({
                telegramId,
                firstName: first_name,
                lastName: last_name,
                username: username,
                photoUrl: photo_url,
            });
        }

        // 4. Generate Token
        const token = await generateToken({
            userId: user.id,
            email: user.email || '',
            role: user.role,
        });

        await setAuthCookie(token);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                telegramId: user.telegramId,
                firstName: user.firstName,
                role: user.role,
            }
        });

    } catch (error) {
        console.error('Telegram auth error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
