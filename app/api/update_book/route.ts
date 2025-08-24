import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/app/lib/dal';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const session = await verifySession()

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const b = await prisma.book.findUnique({
            where: {
                id: body.id
            },
            include: {
                user: true
            }
        });

        if (!b) {
            return NextResponse.json(
                { error: 'Book not found' },
                { status: 404 }
            );
        }

        if (b?.user.id !== session.userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const changed_data = {
            progress: body.progress,
            wishlisted: body.wishlisted
        }

        const book = await prisma.book.update({
            where: {
                id: body.id
            },
            data: changed_data,
            include: {
                user: true
            }
        })

        return NextResponse.json(book);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}