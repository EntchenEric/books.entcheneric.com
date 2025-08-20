import React, { useState, useEffect } from "react";
import { Book, Session } from "../lib/definitions";
import { CheckIcon, StarFilledIcon, TrashIcon, Pencil1Icon, StarIcon } from "@radix-ui/react-icons"
import { ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import PurchaseOptionsFetcher from "./purchaseOptionFetcher";
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

function WishlistButton({ book, setBook }: { book: Book, setBook: React.Dispatch<React.SetStateAction<Book | null>> }) {
    const [loading, setLoading] = useState(false);

    if (loading) return <Button disabled>Lädt...</Button>
    if (book.wishlisted) return <Button onClick={() => changeWishlistStatus(book.id, false, setBook, setLoading)}><ShoppingCart /> Als gekauft makieren</Button>
    else return <Button onClick={() => changeWishlistStatus(book.id, true, setBook, setLoading)}><StarIcon /> Auf die Wunschliste</Button>
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
                {loading ? "Speichern..." : <><Pencil1Icon />Speichern</>}
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
                    {loading ? "Löschen..." : <><TrashIcon />Löschen</>}
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

function ProgressBar({ book, progressPercentage }: { book: Book, progressPercentage: number }) {
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

export function BookCardComponent({ book, progressPercentage }: { book: Book, progressPercentage: number }) {
    return <Card className="p-0 h-full cursor-pointer transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:drop-shadow-gray-400 hover:drop-shadow-xl">
        <CardHeader className="p-0 relative">
            <img
                src={`/api/image-proxy?url=${encodeURIComponent(book.thumbnail.replaceAll("&zoom=1", "&zoom=2"))}`} alt={`${book.title} Cover`}
                className="w-full h-40 object-cover rounded-t-xl" />
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
        </CardHeader>
        <CardContent>
            <CardTitle>
                {book.title}
                {book.author && (<p className="text-sm text-muted-foreground mb-4">{book.author}</p>)}
            </CardTitle>
            <CardDescription>
                <div className="h-10 flex flex-col justify-end pb-2 mt-auto">
                    <ProgressBar book={book} progressPercentage={progressPercentage}/>
                </div>
            </CardDescription>
        </CardContent>
    </Card>
}

export default function BookCard({ frontendBook, isOwner }: { frontendBook: Book, isOwner: boolean }) {
    const [book, setBook] = useState<Book | null>(frontendBook)

    const progressPercentage =
        book?.progress != null && book?.pages != null && book?.pages > 0
            ? (book.progress / book.pages) * 100
            : 0;

    if (!book) {
        return <></>
    }

    return (
        <Dialog>
            <DialogTrigger asChild className="h-full">
                <div className="h-full">
                    <BookCardComponent book={book} progressPercentage={progressPercentage} />
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 w-3xl">
                <div className="flex flex-col sm:flex-row">
                    <img src={`/api/image-proxy?url=${encodeURIComponent(book.thumbnail.replaceAll("&zoom=1", "&zoom=2"))}`} alt={`${book.title} Cover`} className="w-full sm:w-1/3 h-64 sm:h-auto object-cover" />
                    <div className="p-6 flex-1">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-bold mb-1">{book.title}</DialogTitle>
                            <p className="text-lg text-secondary-foreground">{book.author}</p>
                            <p className="text-sm text-secondary-foreground">
                                {book.publicationYear} • {book.pages} Seiten
                            </p>
                        </DialogHeader>
                        <div className="my-4">
                            <div
                                className="text-secondary-foreground leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: book.description || "Keine Beschreibung verfügbar." }}
                            />
                        </div>
                        <PurchaseOptionsFetcher book={book} />
                        <a
                            href={`https://books.google.de/books?id=${book.googleBookId}&pg=PT8&hl=de`}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                        >
                            Leseprobe
                        </a>
                        {
                            isOwner &&
                            <div className="mt-6 pt-4 border-t grid gap-2 grid-cols-1">
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