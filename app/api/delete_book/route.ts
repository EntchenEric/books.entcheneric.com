import { prisma } from '@/app/lib/prisma'
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/app/lib/dal';
import { DeleteBookSchema } from '@/app/lib/api-schemas';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validated = DeleteBookSchema.safeParse(body)
        if (!validated.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }
        const { id } = validated.data

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

        await prisma.book.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Book deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
