import React, { useState, useEffect } from "react";
import { Book, BookItem, User } from "../lib/definitions";
import { CheckIcon, StarFilledIcon } from "@radix-ui/react-icons"


import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"

type PurchaseOption = {
    storeName: string;
    price: string;
    url: string;
};

async function fetchPurchaseOptions(googleBookId: string): Promise<PurchaseOption[]> {
    const googleBookApiResult = await fetch('https://www.googleapis.com/books/v1/volumes/' + googleBookId);
    if (!googleBookApiResult.ok) {
        throw new Error("Failed to fetch book data");
    }

    const data: BookItem = await googleBookApiResult.json();

    const purchaseOptions: PurchaseOption[] = [];
    if (data.saleInfo.buyLink && data.saleInfo.retailPrice?.amount) {
        purchaseOptions.push({
            storeName: "google play",
            price: data.saleInfo.retailPrice?.amount.toString(),
            url: data.saleInfo.buyLink
        })
    }



    return purchaseOptions
}

function PurchaseOptionsFetcher({ book }: { book: Book }) {
    const [options, setOptions] = useState<PurchaseOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (book.wishlisted) {
            setIsLoading(true);
            fetchPurchaseOptions(book.title)
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
                <div className="space-y-2">
                    {options.map((opt) => (
                        <a href={opt.url} key={opt.storeName} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-2 rounded-md transition-colors">
                            <span className="text-gray-700">{opt.storeName}</span>
                            <span className="font-bold text-blue-600">{opt.price}</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

const changeWishlistStatus = (bookId: string, wishlistStatus: boolean, setBook: React.Dispatch<React.SetStateAction<Book | null>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
    setLoading(true);
    fetch("/api/update_book", {
        method: "POST",
        body: JSON.stringify({
            id: bookId,
            wishlisted: wishlistStatus
        })
    }).then((response) => {
        if (!response.ok) {
            toast("Etwas ist schief gelaufen.", {
                description: "Der Wunschlistenstatus konnte nicht geändert werden. Versuche es später bitte noch einmal."
            })
            setLoading(false)
        } else {
            response.json().then((book) => {
                setBook(book)
                setLoading(false)
            })
        }
    })
}

function WishlistButton({ book, setBook }: { book: Book, setBook: React.Dispatch<React.SetStateAction<Book | null>> }) {
    const [loading, setLoading] = useState(false);

    if (loading) return <Button disabled>Lädt...</Button>
    if (book.wishlisted) return <Button onClick={() => changeWishlistStatus(book.id, false, setBook, setLoading)}>Als gekauft makieren</Button>
    else return <Button onClick={() => changeWishlistStatus(book.id, true, setBook, setLoading)}>Auf die Wunschliste</Button>
}

function PageProgressInput({ book, setBook }: { book: Book, setBook: React.Dispatch<React.SetStateAction<Book | null>> }) {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState<number>(book.progress || 0);

    useEffect(() => {
        setProgress(book.progress || 0);
    }, [book.progress]);

    const handleSave = () => {
        if (progress >= 0 && progress <= (book.pages || 0)) {
            setLoading(true);
            fetch("/api/update_book", {
                method: "POST",
                body: JSON.stringify({
                    id: book.id,
                    progress: progress
                })
            }).then((response) => {
                if (!response.ok) {
                    toast("Etwas ist schief gelaufen.", {
                        description: "Der Fortschritt konnte nicht aktualisiert werden. Versuche es später bitte noch einmal."
                    });
                    setLoading(false);
                } else {
                    response.json().then((updatedBook) => {
                        setBook(updatedBook);
                        setLoading(false);
                    });
                }
            });
        }
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="number"
                min={0}
                max={book.pages || 0}
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value, 10) || 0)}
                className="border rounded p-1 w-24"
                disabled={loading}
            />
            <span>/{book.pages}</span>
            <Button onClick={handleSave} disabled={loading || progress === book.progress}>
                {loading ? "Speichern..." : "Speichern"}
            </Button>
        </div>
    );
}

function DeleteButton({ bookId, setBook }: { bookId: string, setBook: React.Dispatch<React.SetStateAction<Book | null>> }) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        setLoading(true);
        fetch("/api/delete_book", {
            method: "POST",
            body: JSON.stringify({ id: bookId })
        }).then((response) => {
            if (!response.ok) {
                toast("Etwas ist schief gelaufen.", {
                    description: "Das Buch konnte nicht gelöscht werden. Versuche es später bitte noch einmal."
                });
                setLoading(false);
            } else {
                setBook(null);
                setLoading(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" disabled={loading}>
                    {loading ? "Löschen..." : "Löschen"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Buch löschen</DialogTitle>
                </DialogHeader>
                <p>Willst du dieses Buch wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
                    <Button variant="destructive" onClick={handleDelete} className="ml-2">Löschen</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
export default function BookCard({ frontendBook, sessionUser }: { frontendBook: Book, sessionUser: User | null }) {
    const [book, setBook] = useState<Book | null>(frontendBook)

    const progressPercentage =
        book?.progress != null && book?.pages != null && book?.pages > 0
            ? (book.progress / book.pages) * 100
            : 0;

    const ownPage = sessionUser?.url === book?.user.url;

    if (!book) {
        return <></>
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="max-w-xs w-full font-sans rounded-lg bg-white shadow-lg overflow-hidden flex flex-col group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
                    <div className="relative">
                        <img src={book.thumbnail} alt={`${book.title} Cover`} className="w-full h-40 object-cover" />
                        <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
                            {progressPercentage >= 100 && (
                                <span className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                    <CheckIcon />
                                    Gelesen
                                </span>
                            )}
                            {book.wishlisted && (
                                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex"><StarFilledIcon />Wunschliste</span>
                            )}
                        </div>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{book.title}</h3>
                        {book.author && (<p className="text-sm text-gray-500 mb-4">{book.author}</p>)}
                        <div className="flex-grow" />
                        <div className="mt-2 h-10 flex flex-col justify-end">
                            {progressPercentage >= 100 ? (
                                <div className="bg-green-100 rounded-lg p-2 text-center">
                                    <span className="font-bold text-sm text-green-700">Abgeschlossen! 🎉</span>
                                </div>
                            ) : progressPercentage > 0 ? (
                                <div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>{book.publicationYear ? ` erschienen ${book.publicationYear}` : ''}</span>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-600">Fortschritt</span>
                                        <span className="text-xs font-medium text-gray-600">{book.progress}/{book.pages} Seiten</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{book.publicationYear ? ` erschienen ${book.publicationYear}` : ''}</span>
                                    <span>{book.pages ? `${book.pages} Seiten` : ''}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 w-3xl">
                <div className="flex flex-col sm:flex-row">
                    <img src={book.thumbnail} alt={`${book.title} Cover`} className="w-full sm:w-1/3 h-64 sm:h-auto object-cover" />
                    <div className="p-6 flex-1">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-bold mb-1">{book.title}</DialogTitle>
                            <p className="text-lg text-gray-600">{book.author}</p>
                            <p className="text-sm text-gray-400">
                                {book.publicationYear} • {book.pages} Seiten
                            </p>
                        </DialogHeader>
                        <div className="my-4">
                            <div
                                className="text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: book.description || "Keine Beschreibung verfügbar." }}
                            />
                        </div>
                        {/*<PurchaseOptionsFetcher book={book} />*/}
                        <a
                            href={`https://books.google.de/books?id=${book.googleBookId}&pg=PT8&hl=de`}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                        >
                            Leseprobe
                        </a>
                        {
                            ownPage &&
                            <div className="mt-6 pt-4 border-t grid gap-2 grid-cols-1 sm:grid-cols-2">
                                <WishlistButton book={book} setBook={setBook} />
                                <PageProgressInput book={book} setBook={setBook} />
                                <DeleteButton bookId={book.id} setBook={setBook} />
                            </div>
                        }
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}