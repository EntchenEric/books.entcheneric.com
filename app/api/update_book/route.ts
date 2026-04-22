import { prisma } from '@/app/lib/prisma'
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/app/lib/dal';
import { UpdateBookSchema } from '@/app/lib/api-schemas';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validated = UpdateBookSchema.safeParse(body)
        if (!validated.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }
        const { id, progress, wishlisted } = validated.data

        const session = await verifySession()

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const b = await prisma.book.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!b) {
            return NextResponse.json(
                { error: 'Book not found' },
                { status: 404 }
            );
        }

        if (b.userId !== session.userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const changed_data: { progress?: number; wishlisted?: boolean } = {}
        if (progress !== undefined) changed_data.progress = progress
        if (wishlisted !== undefined) changed_data.wishlisted = wishlisted

        const book = await prisma.book.update({
            where: { id },
            data: changed_data,
            include: { user: true }
        })

        return NextResponse.json(book);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
