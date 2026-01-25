import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

// GET /api/admin/seo - List all SEO pages
export async function GET(req: NextRequest) {
    try {
        const session = await getCurrentUser();
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const pages = await db.seoPage.findMany({
            orderBy: { slug: 'asc' }
        });

        return NextResponse.json({ pages });
    } catch (error) {
        console.error('Admin SEO list error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/seo - Create a new SEO page config
export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentUser();
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { slug, title, description, keywords, ogImage } = body;

        if (!slug || !title) {
            return NextResponse.json({ error: 'Slug and Title are required' }, { status: 400 });
        }

        const existing = await db.seoPage.findUnique({
            where: { slug }
        });

        if (existing) {
            return NextResponse.json({ error: 'Page with this slug already exists' }, { status: 409 });
        }

        const page = await db.seoPage.create({
            data: {
                slug,
                title,
                description,
                keywords,
                ogImage
            }
        });

        return NextResponse.json({ success: true, page });

    } catch (error) {
        console.error('Admin SEO create error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
