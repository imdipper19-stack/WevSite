import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface Context {
    params: Promise<{
        ticketId: string;
    }>;
}

// GET /api/tickets/[ticketId] - Get details + messages
export async function GET(req: NextRequest, context: Context) {
    try {
        const session = await getCurrentUser();
        // Await params before usage
        const params = await context.params;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const ticket = await db.ticket.findUnique({
            where: { id: params.ticketId },
            include: {
                author: {
                    select: { id: true, firstName: true, email: true, role: true }
                },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: {
                            select: { id: true, firstName: true, role: true }
                        }
                    }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Access control: Author or Admin
        if (ticket.authorId !== session.userId && session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        return NextResponse.json({ ticket });

    } catch (error) {
        console.error('Get ticket details error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/tickets/[ticketId] - Reply
export async function POST(req: NextRequest, context: Context) {
    try {
        const session = await getCurrentUser();
        const params = await context.params;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ error: 'Message content required' }, { status: 400 });
        }

        const ticket = await db.ticket.findUnique({
            where: { id: params.ticketId },
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        if (ticket.authorId !== session.userId && session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const newMessage = await db.ticketMessage.create({
            data: {
                ticketId: ticket.id,
                senderId: session.userId,
                content,
            }
        });

        // Update ticket updated_at
        await db.ticket.update({
            where: { id: ticket.id },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json({ success: true, message: newMessage });

    } catch (error) {
        console.error('Reply ticket error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
