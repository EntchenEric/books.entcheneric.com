import React, { useState, useEffect } from 'react';
import { Book, PurchaseOption, BookItem } from '../lib/definitions';
import { PurchaseOptionCache } from '@prisma/client';

function formatCurrency(number: number): string {
    const formatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    });
    return formatter.format(number);
}


async function fetchSerpPurchaseOptions(bookId: string): Promise<PurchaseOption[] | undefined> {
    const result = await fetch('/api/fetch_purchase_options', {
        method: 'POST',
        body: JSON.stringify({ bookId })
    });

    if (result.ok) {
        const data: PurchaseOptionCache[] = await result.json();
        console.log("data: ", data)
        return data.map(item => ({
            storeName: item.retailerName,
            price: formatCurrency(Number(item.price)),
            url: item.url
        }));
    }
}

async function fetchPurchaseOptions(googleBookId: string, bookId: string): Promise<PurchaseOption[]> {
    const googleBookApiResult = await fetch('https://www.googleapis.com/books/v1/volumes/' + googleBookId);
    if (!googleBookApiResult.ok) {
        throw new Error("Failed to fetch book data");
    }
    const data: BookItem = await googleBookApiResult.json();

    const purchaseOptions: PurchaseOption[] = [];
    if (data.saleInfo.buyLink && data.saleInfo.retailPrice?.amount) {
        purchaseOptions.push({
            storeName: "google play",
            price: formatCurrency(data.saleInfo.retailPrice?.amount),
            url: data.saleInfo.buyLink
        });
    }

    const serpOptions = await fetchSerpPurchaseOptions(bookId);

    if (serpOptions) {
        serpOptions.forEach((option) => {
            if (!purchaseOptions.some(po => po.storeName === option.storeName)) {
                purchaseOptions.push(option);
            }
        });
    }

    return purchaseOptions;
}

type PurchaseOptionFetcherProps = {
    readonly book: Book
}

export default function PurchaseOptionsFetcher({ book }: PurchaseOptionFetcherProps) {
    const [options, setOptions] = useState<PurchaseOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (book.wishlisted) {
            setIsLoading(true);
            fetchPurchaseOptions(book.googleBookId, book.id)
                .then(setOptions)
                .catch(() => setError("Kaufoptionen konnten nicht geladen werden."))
                .finally(() => setIsLoading(false));
        }
    }, [book.title, book.wishlisted]);

    if (!book.wishlisted) return null;

    return (
        <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-3">Kaufoptionen</h4>
            {isLoading && <div className="text-sm text-gray-500">Suche Preise...</div>}
            {error && <div className="text-sm text-red-500">{error}</div>}
            {!isLoading && !error && (
                <>
                    {
                        options.length === 0 && (<div className="text-sm text-gray-500">Keine Kaufoptionen gefunden.</div>
                        )
                    }
                    <div className="space-y-2" id="BuyOptionList">
                        {options.map((opt) => (
                            <a href={opt.url} key={opt.storeName} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center bg-muted hover:bg-muted/50 p-2 rounded-md transition-colors">
                                <span className="text-muted-foreground">{opt.storeName}</span>
                                <span className="font-bold text-muted-foreground">{opt.price}</span>
                            </a>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}