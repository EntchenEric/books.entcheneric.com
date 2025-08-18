import { GoogleBooksApiResponse } from '@/app/lib/definitions';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();


export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const userId = body.userId;

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                books: {
                    select: {
                        googleBookId: true
                    }
                }
            }
        });

        const userBookIds = new Set(user?.books.map(book => book.googleBookId) || []);

        const apiKey = process.env.GOOGLE_API_KEY;
        const baseUrl = "https://www.googleapis.com/books/v1/volumes"
        let q = body.query

        if (body.author) {
            q += `+inauthor:${body.author}`
        }

        const url = `${baseUrl}?q=${encodeURIComponent(q)}&key=${apiKey}&langRestrict=de&maxResults=40`;
        const response = await fetch(url);

        if (!response.ok) {
            const errorBody = await response.json();
            return NextResponse.json({ message: "Fehler bei der Google Books API", error: errorBody }, { status: response.status });
        }

        const data: GoogleBooksApiResponse = await response.json();

        if (!data.items) {
             return NextResponse.json({ kind: data.kind, totalItems: 0, items: [] });
        }

        const filteredBooks = data.items.filter(book => !userBookIds.has(book.id));

        const filteredResponse = {
            ...data,
            totalItems: filteredBooks.length,
            items: filteredBooks,
        };

        return NextResponse.json(filteredResponse);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}