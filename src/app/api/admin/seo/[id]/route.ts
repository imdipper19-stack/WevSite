import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface Context {
    params: Promise<{
        id: string;
    }>;
}

// GET /api/admin/seo/[id] - Get details
export async function GET(req: NextRequest, context: Context) {
    try {
        const session = await getCurrentUser();
        const params = await context.params;
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const page = await db.seoPage.findUnique({
            where: { id: params.id }
        });

        if (!page) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ page });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// PATCH /api/admin/seo/[id] - Update
export async function PATCH(req: NextRequest, context: Context) {
    try {
        const session = await getCurrentUser();
        const params = await context.params;
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, keywords, ogImage } = body;

        const page = await db.seoPage.update({
            where: { id: params.id },
            data: {
                title,
                description,
                keywords,
                ogImage
            }
        });

        return NextResponse.json({ success: true, page });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// DELETE /api/admin/seo/[id] - Delete
export async function DELETE(req: NextRequest, context: Context) {
    try {
        const session = await getCurrentUser();
        const params = await context.params;
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await db.seoPage.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
