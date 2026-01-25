import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-jwt-secret-key-min-32-chars!'
);

// Routes that don't require authentication
const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/reset-password',
];

const publicApiRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/reset-password',
    '/api/reviews',
    '/api/auth/telegram', // Explicitly allow telegram auth
];

// Routes that require admin role
const adminRoutes = ['/admin'];

async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { userId: string; email: string; role: string };
    } catch {
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    console.log(`[Middleware] ${request.method} ${pathname}`);

    // Allow public routes
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Allow public API routes
    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Allow static files and assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Get auth token
    const token = request.cookies.get('auth-token')?.value;

    // Check if user is authenticated for protected routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/users') || pathname.startsWith('/api/orders') || pathname.startsWith('/api/chat')) {
        if (!token) {
            if (!pathname.startsWith('/api/')) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user) {
            if (!pathname.startsWith('/api/')) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
            return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 });
        }
    }

    // Check admin routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
        if (!token) {
            if (!pathname.startsWith('/api/')) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || user.role !== 'ADMIN') {
            if (!pathname.startsWith('/api/')) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};
