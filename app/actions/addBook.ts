"use server";

import { Book, PrismaClient } from '@prisma/client'
import { AddBookFormSchema, AddBookFormState, BookItem } from '@/app/lib/definitions'
import { verifySession } from '../lib/dal';

const prisma = new PrismaClient()

export async function addbook(state: AddBookFormState, formData: FormData): Promise<{ success: boolean, books?: Book[], errors?: Record<string, string[]> }> {
    const session = await verifySession()

    if (!session) {
        return {
            success: false,
            errors: {
                bookId: ["Du bist nicht angemeldet. Bitte lade die seite neu und melde dich an."]
            }
        }
    }

    const rawIsWishlisted = formData.get('isWishlisted');

    const rawAddSeries = formData.get('addSeries');

    const rawMarkAllAsFinished = formData.get('markAllAsFinished');

    const isWishlisted = rawIsWishlisted === 'true';

    const addSeries = rawAddSeries === 'true';

    const markAllAsFinished = rawMarkAllAsFinished != undefined && rawMarkAllAsFinished === 'true';


    const validatedFields = AddBookFormSchema.safeParse({
        bookId: formData.get('bookId'),
        isWishlisted: isWishlisted,
        pageProgress: formData.get("pageProgress"),
    })

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { bookId, pageProgress: pageProgress } = validatedFields.data

    const resposne = await fetch("https://www.googleapis.com/books/v1/volumes/" + bookId);

    if (!resposne.ok) {
        return {
            success: false,
            errors: {
                bookId: ["Fehler beim hinzufügen des Buches. Bitte versuche es später noch einmal."]
            }
        }
    }

    const BookData: BookItem = await resposne.json()

    if (!addSeries) {

        const book = await prisma.book.create({
            data: {
                title: BookData.volumeInfo?.title ?? "unbekannter Titel",
                author: BookData.volumeInfo?.authors?.join(", ") ?? "unbekannter Autor",
                wishlisted: isWishlisted,
                pages: BookData.volumeInfo?.pageCount ?? 0,
                progress: pageProgress,
                description: BookData.volumeInfo?.description || null,
                publicationYear: parseInt(BookData.volumeInfo?.publishedDate?.split("-")[0] ?? "0"),
                thumbnail: BookData.volumeInfo?.imageLinks?.thumbnail ?? "https://books.google.com/googlebooks/images/no_cover_thumb.gif",
                googleBookId: BookData.id,
                ISBNumber: BookData.volumeInfo?.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier ?? null,
                userId: session.userId
            },
            include: {
                user: true,
            }
        })

        return {
            success: true, books: [book]
        }
    }

    const searchResults = await fetch("http://localhost:3000//api/search_books", {
        method: 'POST',
        body: JSON.stringify({
            query: BookData.volumeInfo?.title?.slice(0, Math.floor(BookData.volumeInfo.title.length * 0.7)),
            userId: session.userId,
        })
    });

    if (!searchResults.ok) {
        return {
            success: false,
            errors: {
                bookId: ["Fehler beim hinzufügen des Buches. Bitte versuche es später noch einmal."]
            }
        }
    }

    const searchData = await searchResults.json();

    if (!searchData.items || searchData.items.length === 0) {
        return {
            success: false,
            errors: {
                bookId: ["Buch nicht gefunden. Bitte versuche es später noch einmal."]
            }
        }
    }

    function similarity(a: string, b: string): number {
        if (!a || !b) return 0;
        const length = Math.max(a.length, b.length);
        let distance = 0;
        const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                if (a[i - 1] === b[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j - 1] + 1
                    );
                }
            }
        }
        distance = matrix[a.length][b.length];
        return 1 - distance / length;
    }

    const booksInSeries = searchData.items.filter((item: BookItem) => {
        const titleA = item.volumeInfo?.title?.toLowerCase() || "";
        const titleB = BookData.volumeInfo?.title?.toLowerCase() || "";
        const authorA = (item.volumeInfo?.authors?.[0] || "").toLowerCase();
        const authorB = (BookData.volumeInfo?.authors?.[0] || "").toLowerCase();

        return (
            similarity(titleA, titleB) >= 0.7 &&
            authorA === authorB
        );
    });

    if (booksInSeries.length === 0) {
        return {
            success: false,
            errors: {
                bookId: ["Buch nicht gefunden. Bitte versuche es später noch einmal."]
            }
        }
    }

    await prisma.book.createMany({
        data: booksInSeries.map((item: BookItem) => ({
            title: item.volumeInfo?.title ?? "unbekannter Titel",
            author: item.volumeInfo?.authors?.join(", ") ?? "unbekannter Autor",
            wishlisted: isWishlisted,
            pages: item.volumeInfo?.pageCount ?? 0,
            progress: markAllAsFinished ? item.volumeInfo?.pageCount ?? 0 : 0,
            description: item.volumeInfo?.description || null,
            publicationYear: parseInt(item.volumeInfo?.publishedDate?.split("-")[0] ?? "0"),
            thumbnail: item.volumeInfo?.imageLinks?.thumbnail ?? "https://books.google.com/googlebooks/images/no_cover_thumb.gif",
            googleBookId: item.id,
            ISBNumber: item.volumeInfo?.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier ?? null,
            userId: session.userId
        }))
    })

    const books = await prisma.book.findMany({
        where: {
            googleBookId: {
                in: booksInSeries.map((item: BookItem) => item.id)
            },
            userId: session.userId
        },
        include: {
            user: true,
        }
    });

    if (books.length === 0) {
        return {
            success: false,
            errors: {
                bookId: ["Buch nicht gefunden. Bitte versuche es später noch einmal."]
            }
        }
    }

    return {
        success: true, books: books
    }
}