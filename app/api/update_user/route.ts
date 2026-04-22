import { verifySession } from '@/app/lib/dal';
import { prisma } from '@/app/lib/prisma'
import { UpdateUserSchema } from '@/app/lib/api-schemas';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validated = UpdateUserSchema.safeParse(body)
        if (!validated.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }
        const { title, description } = validated.data

        const session = await verifySession()

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const changed_data: { title?: string; description?: string } = {}
        if (title !== undefined) changed_data.title = title
        if (description !== undefined) changed_data.description = description

        const user = await prisma.user.update({
            where: {
                id: session.userId
            },
            data: changed_data,
            include: {
                books: true
            }
        })

        const { passwordHash, ...safeUser } = user;
        return NextResponse.json(safeUser);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
