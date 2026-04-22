import { Book } from '@prisma/client';
import { prisma } from '@/app/lib/prisma'
import { NextRequest, NextResponse } from 'next/server';
import { FetchPurchaseOptionsSchema } from '@/app/lib/api-schemas';
import { rateLimitByIp } from '@/app/lib/rate-limit';

const moreThanThreeDaysAgo = (date: Date) => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return date < threeDaysAgo;
}

const updatePurchaseOptions = async (book: Book) => {
    const query = encodeURIComponent(book.ISBNumber || book.title);
    const result = await fetch(`https://serpapi.com/search?q=${query}&hl=de&gl=de&api_key=${process.env.SERP_API_KEY}`, {
        method: 'GET'
    })
    if (result.ok) {
        const data = await result.json();
        if (data.search_metadata?.status === "Success" && Array.isArray(data.organic_results)) {
            const entries = data.organic_results
                .filter((item: any) => item.rich_snippet?.bottom?.detected_extensions?.price)
                .map((item: any) => ({
                    bookId: book.id,
                    retailerName: item.source,
                    price: item.rich_snippet.bottom.detected_extensions.price,
                    url: item.link
                }));

            await prisma.$transaction(async (tx) => {
                await tx.purchaseOptionCache.deleteMany({
                    where: { bookId: book.id }
                });
                if (entries.length > 0) {
                    await tx.purchaseOptionCache.createMany({ data: entries });
                }
                await tx.book.update({
                    where: { id: book.id },
                    data: { lastPurchaseOptionUpdatedAt: new Date() }
                });
            });
            return;
        }
    }
}

export async function POST(request: NextRequest) {
    const limit = await rateLimitByIp('purchase_options', 60_000, 10)
    if (!limit.success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    try {
        const body = await request.json()
        const validated = FetchPurchaseOptionsSchema.safeParse(body)
        if (!validated.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }
        const { bookId } = validated.data

        const book = await prisma.book.findUnique({
            where: { id: bookId },
            include: { purchaseOptions: true }
        })

        if (!book) {
            return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }

        if (book?.lastPurchaseOptionUpdatedAt) {
            if (moreThanThreeDaysAgo(book.lastPurchaseOptionUpdatedAt)) {
                await updatePurchaseOptions(book);
            }
        }

        const purchaseOptions = await prisma.purchaseOptionCache.findMany({
            where: { bookId: book.id }
        });
        return NextResponse.json(purchaseOptions);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
