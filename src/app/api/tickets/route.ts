import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { TicketStatus, TicketPriority } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { subject, message, priority = 'MEDIUM' } = body;

        if (!subject || !message) {
            return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
        }

        const newTicket = await db.ticket.create({
            data: {
                subject,
                authorId: session.userId,
                priority: priority as TicketPriority,
                status: TicketStatus.OPEN,
                messages: {
                    create: {
                        content: message,
                        senderId: session.userId,
                    }
                }
            }
        });

        return NextResponse.json({ success: true, ticket: newTicket }, { status: 201 });

    } catch (error) {
        console.error('Create ticket error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getCurrentUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tickets = await db.ticket.findMany({
            where: {
                authorId: session.userId,
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { messages: true }
                }
            }
        });

        return NextResponse.json({ tickets });

    } catch (error) {
        console.error('Get tickets error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
