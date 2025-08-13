import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const changed_data = {
            finished: body.finished,
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
        console.error(error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}