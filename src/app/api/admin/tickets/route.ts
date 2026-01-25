import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getCurrentUser();
        if (!session || session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status && status !== 'ALL') {
            where.status = status;
        }

        const [tickets, total] = await db.$transaction([
            db.ticket.findMany({
                where,
                include: {
                    author: {
                        select: { firstName: true, email: true }
                    },
                    _count: { select: { messages: true } }
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            db.ticket.count({ where })
        ]);

        return NextResponse.json({
            tickets,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page
            }
        });

    } catch (error) {
        console.error('Admin get tickets error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
