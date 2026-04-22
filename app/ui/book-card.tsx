"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Book } from "../lib/definitions";
import { Check, Star, Trash2, Pencil, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import PurchaseOptionsFetcher from "./purchase-option-fetcher";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"
import {
    Card,
    CardDescription,
    CardHeader,
    CardContent,
    CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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

type WishlistButtonProps = {
    readonly book: Book,
    readonly setBook: React.Dispatch<React.SetStateAction<Book | null>>
}

function WishlistButton({ book, setBook }: WishlistButtonProps) {
    const [loading, setLoading] = useState(false);

    if (loading) return <Button disabled>Lädt...</Button>
    if (book.wishlisted) return <Button onClick={() => changeWishlistStatus(book.id, false, setBook, setLoading)}><ShoppingCart className="h-4 w-4 mr-2" /> Als gekauft markieren</Button>
    else return <Button onClick={() => changeWishlistStatus(book.id, true, setBook, setLoading)}><Star className="h-4 w-4 mr-2" /> Auf die Wunschliste</Button>
}

type PageProgressInput = {
    readonly book: Book,
    readonly setBook: React.Dispatch<React.SetStateAction<Book | null>>
}

function PageProgressInput({ book, setBook }: PageProgressInput) {
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
            <Input
                type="number"
                min={0}
                max={book.pages || 0}
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value, 10) || 0)}
                className="border rounded p-1"
                disabled={loading}
            />
            <span>/{book.pages}</span>
            <Button onClick={handleSave} disabled={loading || progress === book.progress}>
                {loading ? "Speichern..." : <><Pencil className="h-4 w-4 mr-1" />Speichern</>}
            </Button>
        </div>
    );
}

type DeleteButtonProps = {
    readonly bookId: string
    readonly setBook: React.Dispatch<React.SetStateAction<Book | null>>
}

function DeleteButton({ bookId, setBook }: DeleteButtonProps) {
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
                    {loading ? "Löschen..." : <><Trash2 className="h-4 w-4 mr-1" />Löschen</>}
                </Button>
            </DialogTrigger>
            <DialogContent id="BookDeleteConfirmDialog">
                <DialogHeader>
                    <DialogTitle>Buch löschen</DialogTitle>
                </DialogHeader>
                <p>Willst du dieses Buch wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={() => setOpen(false)} id="BookDeleteConfirmCancel">Abbrechen</Button>
                    <Button variant="destructive" onClick={handleDelete} className="ml-2" id="BookDeleteConfirmConfirm">Löschen</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

type ProgressBarProps = {
    readonly book: Book,
    readonly progressPercentage: number
}

function ProgressBar({ book, progressPercentage }: ProgressBarProps) {
    if (progressPercentage >= 100)
        return <div className="bg-green-100 rounded-lg p-2 text-center">
            <span className="font-bold text-sm text-green-700">Abgeschlossen! 🎉</span>
        </div>

    if (progressPercentage > 0)
        return <div>
            <div className="flex justify-between text-xs text-gray-500">
                <span>{book.publicationYear ? ` erschienen ${book.publicationYear}` : ''}</span>
            </div>
            <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-secondary-foreground">Fortschritt</span>
                <span className="text-xs font-medium text-secondary-foreground">{book.progress}/{book.pages} Seiten</span>
            </div>
            <Progress value={progressPercentage} />
        </div>

    return <div className="flex justify-between text-xs text-secondary-foreground">
        <span>{book.publicationYear ? ` erschienen ${book.publicationYear}` : ''}</span>
        <span>{book.pages ? `${book.pages} Seiten` : ''}</span>
    </div>
}

type BookCardComponentProps = {
    readonly book: Book,
    readonly progressPercentage: number
}

export function BookCardComponent({ book, progressPercentage }: BookCardComponentProps) {
    return <Card className="p-0 h-full cursor-pointer transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:drop-shadow-gray-400 hover:drop-shadow-xl">
        <CardHeader className="p-0 relative">
            <Image
                src={`/api/image-proxy?url=${encodeURIComponent(book.thumbnail.replaceAll("&zoom=1", "&zoom=2"))}`}
                alt={`${book.title} Cover`}
                width={400}
                height={160}
                className="w-full h-40 object-cover rounded-t-xl"
                unoptimized
            />
            <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
                {progressPercentage >= 100 && (
                    <span className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                        <Check className="h-3 w-3" />
                        Gelesen
                    </span>
                )}
                {book.wishlisted && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1"><Star className="h-3 w-3 fill-current" />Wunschliste</span>
                )}
            </div>
        </CardHeader>
        <CardContent>
            <CardTitle>
                {book.title}
                {book.author && (<p className="text-sm text-muted-foreground mb-4">{book.author}</p>)}
            </CardTitle>
            <CardDescription>
                <div className="h-10 flex flex-col justify-end pb-2 mt-auto">
                    <ProgressBar book={book} progressPercentage={progressPercentage} />
                </div>
            </CardDescription>
        </CardContent>
    </Card>
}

type BookCard = {
    readonly frontendBook: Book,
    readonly isOwner: boolean
}

export default function BookCard({ frontendBook, isOwner }: BookCard) {
    const [book, setBook] = useState<Book | null>(frontendBook)

    const progressPercentage =
        book?.progress != null && book?.pages != null && book?.pages > 0
            ? (book.progress / book.pages) * 100
            : 0;

    if (!book) {
        return null;
    }

    return (
        <Dialog>
            <DialogTrigger asChild className="h-full">
                <div
                    role="button"
                    tabIndex={0}
                    className="h-full cursor-pointer"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            (e.currentTarget as HTMLElement).click();
                        }
                    }}
                >
                    <BookCardComponent book={book} progressPercentage={progressPercentage} />
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 w-3xl">
                <div className="flex flex-col sm:flex-row">
                    <Image
                        src={`/api/image-proxy?url=${encodeURIComponent(book.thumbnail.replaceAll("&zoom=1", "&zoom=2"))}`}
                        alt={`${book.title} Cover`}
                        width={300}
                        height={400}
                        className="w-full sm:w-1/3 h-64 sm:h-auto object-cover"
                        unoptimized
                    />
                    <div className="p-6 flex-1">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-bold mb-1">{book.title}</DialogTitle>
                            <p className="text-lg text-secondary-foreground">{book.author}</p>
                            <p className="text-sm text-secondary-foreground">
                                {book.publicationYear} • {book.pages} Seiten
                            </p>
                        </DialogHeader>
                        <div className="my-4">
                            <div className="text-secondary-foreground leading-relaxed whitespace-pre-wrap">
                                {book.description || "Keine Beschreibung verfügbar."}
                            </div>
                        </div>
                        <PurchaseOptionsFetcher book={book} />
                        <Link
                            href={`https://books.google.de/books?id=${book.googleBookId}&pg=PT8&hl=de`}
                            className="text-primary hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Leseprobe
                        </Link>
                        {
                            isOwner &&
                            <div className="mt-6 pt-4 border-t grid gap-2 grid-cols-1" id="CardButtonActions">
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