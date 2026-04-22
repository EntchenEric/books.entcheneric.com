"use server";

import { Book } from '@prisma/client'
import { AddBookFormSchema, AddBookFormState, BookItem } from '@/app/lib/definitions'
import { verifySession } from '../lib/dal';
import { prisma } from '@/app/lib/prisma'
import { similarity } from '@/app/lib/levenshtein'

function safeParseYear(dateStr: string | undefined): number {
    if (!dateStr) return 0;
    const year = parseInt(dateStr.split("-")[0] ?? "0", 10);
    return isNaN(year) ? 0 : year;
}

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

    const isWishlisted = formData.get('isWishlisted') === 'true';
    const addSeries = formData.get('addSeries') === 'true';
    const markAllAsFinished = formData.get('markAllAsFinished') === 'true';


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

    const { bookId, pageProgress } = validatedFields.data

    const response = await fetch("https://www.googleapis.com/books/v1/volumes/" + bookId);

    if (!response.ok) {
        return {
            success: false,
            errors: {
                bookId: ["Fehler beim hinzufügen des Buches. Bitte versuche es später noch einmal."]
            }
        }
    }

    const BookData: BookItem = await response.json()

    if (!addSeries) {

        const book = await prisma.book.create({
            data: {
                title: BookData.volumeInfo?.title ?? "unbekannter Titel",
                author: BookData.volumeInfo?.authors?.join(", ") ?? "unbekannter Autor",
                wishlisted: isWishlisted,
                pages: BookData.volumeInfo?.pageCount ?? 0,
                progress: pageProgress,
                description: BookData.volumeInfo?.description || null,
                publicationYear: safeParseYear(BookData.volumeInfo?.publishedDate),
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

    const searchResults = await fetch(`${process.env.NEXTAUTH_URL}/api/search_books`, {
        method: 'POST',
        body: JSON.stringify({
            query: BookData.volumeInfo?.title?.slice(0, Math.floor(BookData.volumeInfo.title.length * 0.85)),
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
                bookId: ["Buch leider nicht gefunden. Bitte versuche es später noch einmal."]
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
            publicationYear: safeParseYear(item.volumeInfo?.publishedDate),
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
                bookId: ["Buch wurde nicht gefunden. Bitte versuche es später noch einmal."]
            }
        }
    }

    return {
        success: true, books: books
    }
}