import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import BookSearch from "./book-search";
import { useState } from "react";
import { BookItem, Book } from "../lib/definitions";
import AddBookForm from "./add-book-form";
import { PlusIcon, ArrowLeftIcon } from "lucide-react";

export default function AddBookButton({ addBook, userId }: { addBook: (book: Book) => void, userId: string }) {
    const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
    const [keepOpen, setKeepOpen] = useState(false);
    const [open, setOpen] = useState(false);

    const handleBookAdded = (book: Book) => {
        addBook(book);
        setSelectedBook(null);
        if (!keepOpen) {
            setOpen(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setSelectedBook(null);
            setKeepOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Buch hinzufügen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                {!selectedBook ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Neues Buch finden</DialogTitle>
                            <DialogDescription>
                                Suche nach Titel, Autor oder ISBN, um dein nächstes Buch hinzuzufügen.
                            </DialogDescription>
                        </DialogHeader>
                        <BookSearch
                            selectedBook={selectedBook}
                            setSelectedBook={setSelectedBook}
                            userId={userId}
                        />
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-7 w-7"
                                    onClick={() => setSelectedBook(null)}
                                >
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    <span className="sr-only">Zurück</span>
                                </Button>
                                Buchdetails hinzufügen
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex items-start gap-4 rounded-md border p-4">
                            <img
                                src={selectedBook.volumeInfo.imageLinks?.thumbnail ?? 'https://books.google.com/googlebooks/images/no_cover_thumb.gif'}
                                alt={`Cover of ${selectedBook.volumeInfo.title}`}
                                className="h-28 w-auto rounded-sm shadow-md"
                            />
                            <div>
                                <h3 className="font-semibold tracking-tight">{selectedBook.volumeInfo.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {selectedBook.volumeInfo.authors?.join(', ') ?? 'Unbekannter Autor'}
                                </p>
                            </div>
                        </div>

                        <AddBookForm
                            book={selectedBook}
                            addBook={handleBookAdded}
                            setKeepOpen={setKeepOpen}
                        />
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}