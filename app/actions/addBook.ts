"use server";

import { PrismaClient } from '@prisma/client'
import { AddBookFormSchema, AddBookFormState, BookItem } from '@/app/lib/definitions'
import { verifySession } from '../lib/dal';

const prisma = new PrismaClient()

export async function addbook(state: AddBookFormState, formData: FormData) {
    const session = await verifySession()

    if (!session) {
        return {
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
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { bookId, pageProgress: pageProgress } = validatedFields.data

    const resposne = await fetch("https://www.googleapis.com/books/v1/volumes/" + bookId);

    if (!resposne.ok) {
        return {
            errors: {
                bookId: ["Fehler beim hinzufügen des Buches. Bitte versuche es später noch einmal."]
            }
        }
    }

    const BookData: BookItem = await resposne.json()

    const book = await prisma.book.create({
        data: {
            title: BookData.volumeInfo.title,
            author: BookData.volumeInfo.authors.join(", "),
            wishlisted: isWishlisted,
            pages: BookData.volumeInfo.pageCount,
            progress: pageProgress,
            description: BookData.volumeInfo.description || null,
            publicationYear: parseInt(BookData.volumeInfo.publishedDate.split("-")[0]),
            thumbnail: BookData.volumeInfo.imageLinks.thumbnail,
            googleBookId: BookData.id,
            userId: session.userId
        }
    })

    return {
        success: true, book: book
    }
}