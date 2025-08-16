import { GoogleBooksApiResponse } from '@/app/lib/definitions';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();


export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const userId = body.userId;

        // Fetch user and their book IDs from your database
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            // Using `select` is slightly more precise here than `include`
            select: {
                books: {
                    select: {
                        googleBookId: true
                    }
                }
            }
        });

        // 1. Create a Set of the user's existing book IDs for efficient lookup ✅
        // A Set provides O(1) average time complexity for checking existence (.has()), which is faster than an array's .includes().
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

        // Ensure data.items exists before trying to filter it
        if (!data.items) {
             return NextResponse.json({ kind: data.kind, totalItems: 0, items: [] });
        }

        // 2. Filter the Google Books API results 💡
        // Keep only the books where the book's `id` is NOT in our `userBookIds` Set.
        const filteredBooks = data.items.filter(book => !userBookIds.has(book.id));

        // 3. Construct the new response object with the filtered books
        const filteredResponse = {
            ...data, // Copy other properties like 'kind'
            totalItems: filteredBooks.length,
            items: filteredBooks,
        };

        return NextResponse.json(filteredResponse);

    } catch (error) {
        console.error(error); // It's good practice to log the actual error on the server
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}