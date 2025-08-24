import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        if (body.url) {

            const user = await prisma.user.findUnique({
                where: {
                    url: body.url
                },
                include: {
                    books: {
                        include: {
                            user: true
                        }
                    }
                }
            })

            return NextResponse.json(user);
        }
        else if (body.userId) {
            const user = await prisma.user.findUnique({
                where: {
                    id: body.userId
                },
                include: {
                    books: true
                }
            })

            return NextResponse.json(user);
        }
        else {
            return NextResponse.json({ error: "No user found" }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}