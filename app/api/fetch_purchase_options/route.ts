import { verifySession } from '@/app/lib/dal';
import { Book, PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

const moreThanThreeDaysAgo = (date: Date) => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return date < threeDaysAgo;
}

const updatePurchaseOptions = async (book: Book) => {
    await prisma.purchaseOptionCache.deleteMany({
        where: {
            bookId: book.id
        }
    })
    const result = await fetch(`https://serpapi.com/search?q=${book.title}&hl=de&gl=de&api_key=${process.env.SERP_API_KEY}`, {
        method: 'GET'
    })
    if (result.ok) {
        const data = await result.json();
        if (data.search_metadata?.status == "Success") {
            data.organic_results.map(async (item: any) => {
                if (!!item.rich_snippet?.bottom?.detected_extensions?.price) {
                    await prisma.purchaseOptionCache.create({
                        data: {
                            bookId: book.id,
                            retailerName: item.source,
                            price: item.rich_snippet.bottom.detected_extensions.price,
                            url: item.link
                        }
                    });
                }
            })
        }
    }
    await prisma.book.update({
        where: {
            id: book.id
        },
        data: {
            lastPurchaseOptionUpdatedAt: new Date()
        }
    })
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const book = await prisma.book.findUnique({
            where: {
                id: body.bookId
            },
            include: {
                purchaseOptions: true
            }
        })

        if (book && book.lastPurchaseOptionUpdatedAt) {
            if (moreThanThreeDaysAgo(book.lastPurchaseOptionUpdatedAt)) {
                await updatePurchaseOptions(book);
            }
        } else {
            return NextResponse.json({ message: "Book not found" }, { status: 404 });
        }

        const purchaseOptions = await prisma.purchaseOptionCache.findMany({
            where: {
                bookId: book.id
            }
        });
        return NextResponse.json(purchaseOptions);
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}