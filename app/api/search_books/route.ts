import { GoogleBooksApiResponse, BookItem } from '@/app/lib/definitions';
import { prisma } from '@/app/lib/prisma'
import { SearchBooksSchema } from '@/app/lib/api-schemas';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByIp } from '@/app/lib/rate-limit';

export async function POST(request: NextRequest) {
    const limit = await rateLimitByIp('search_books', 60_000, 20)
    if (!limit.success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    try {
        const body = await request.json();
        const validated = SearchBooksSchema.safeParse(body)
        if (!validated.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }
        const { userId, query, author } = validated.data

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { books: { select: { googleBookId: true } } }
        });
        const userBookIds = new Set(user?.books.map(book => book.googleBookId) || []);

        const apiKey = process.env.GOOGLE_API_KEY;
        const baseUrl = "https://www.googleapis.com/books/v1/volumes";
        let q = query;
        if (author) {
            q += `+inauthor:${author}`;
        }

        let foundBooks: BookItem[] = [];
        let currentPage = 1;
        const maxResults =  40;
        const maxPagesToFetch = 10;

        while (foundBooks.length < 20 && currentPage <= maxPagesToFetch) {
            const startIndex = (currentPage - 1) * maxResults;
            const url = `${baseUrl}?q=${encodeURIComponent(q)}&key=${apiKey}&langRestrict=de&maxResults=${maxResults}&startIndex=${startIndex}`;

            const response = await fetch(url);
            if (!response.ok) {
                break;
            }

            const data: GoogleBooksApiResponse = await response.json();

            if (!data.items || data.items.length === 0) {
                break;
            }

            const pageFilteredBooks = data.items.filter(book => !userBookIds.has(book.id));

            foundBooks.push(...pageFilteredBooks);

            currentPage++;
        }

        return NextResponse.json({
            kind: "books#volumes",
            totalItems: foundBooks.length,
            items: foundBooks,
        });

    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
