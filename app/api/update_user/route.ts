import { verifySession } from '@/app/lib/dal';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

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

        const changed_data = {
            title: body.title,
            description: body.description,
        }

        const user = await prisma.user.update({
            where: {
                id: session.userId
            },
            data: changed_data,
            include: {
                books: true
            }
        })

        return NextResponse.json(user);
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}