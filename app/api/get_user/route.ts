import { prisma } from '@/app/lib/prisma'
import { NextRequest, NextResponse } from 'next/server';
import { GetUserSchema } from '@/app/lib/api-schemas';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validated = GetUserSchema.safeParse(body)
        if (!validated.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }

        if ('url' in validated.data) {
            const user = await prisma.user.findUnique({
                where: { url: validated.data.url },
                include: { books: true }
            })

            if (!user) {
                return NextResponse.json({ error: "No user found" }, { status: 404 });
            }

            const { passwordHash, ...safeUser } = user;
            return NextResponse.json(safeUser);
        }
        else {
            const user = await prisma.user.findUnique({
                where: { id: validated.data.userId },
                include: { books: true }
            })

            if (!user) {
                return NextResponse.json({ error: "No user found" }, { status: 404 });
            }

            const { passwordHash, ...safeUser } = user;
            return NextResponse.json(safeUser);
        }
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
