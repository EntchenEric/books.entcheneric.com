"use server";

import { Book, PrismaClient } from '@prisma/client'
import { AddBookFormSchema, AddBookFormState, BookItem } from '@/app/lib/definitions'
import { verifySession } from '../lib/dal';

const prisma = new PrismaClient()

export async function addbook(state: AddBookFormState, formData: FormData) : Promise<{ success: boolean, book?: Book, errors?: Record<string, string[]> }> {
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

    const isWishlisted = rawIsWishlisted === 'true';


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
            userId: session.userId
        },
        include: {
            user: true,
        }
    })

    return {
        success: true, book: book
    }
}