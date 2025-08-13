import { GoogleBooksApiResponse } from '@/app/lib/definitions';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();


export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const apiKey = process.env.GOOGLE_API_KEY;

        const baseUrl = "https://www.googleapis.com/books/v1/volumes"

        let q = body.query

        if (body.author) {
            q += "+inauthor:${body.author}"
        }

        const url = `${baseUrl}?q=${encodeURIComponent(q)}&key=${apiKey}&langRestrict=de&maxResults=40`;

        console.log("url: ", url)

        const response = await fetch(url);

        if (!response.ok) {
            const errorBody = await response.json();
            return NextResponse.json({ message: "Fehler bei der Google Books API", error: errorBody }, { status: response.status });
        }

        const data: GoogleBooksApiResponse = await response.json();

        console.log("data: ", data)

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}