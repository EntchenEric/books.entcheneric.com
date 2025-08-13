import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        await prisma.book.delete({
            where: {
                id: body.id
            }
        })

        return NextResponse.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}