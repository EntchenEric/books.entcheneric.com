import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import BookSearch from "./book-search";
import { useState } from "react";
import { BookItem } from "../lib/definitions";
import AddBookForm from "./add-book-form";

export default function AddBookButton() {
    const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

    return <Dialog>
        <DialogTrigger asChild>
            <Button>Buch hinzufügen</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Buch hinzufügen</DialogTitle>
                <DialogDescription>
                    Suche das Buch, das du hinzufügen möchtest
                </DialogDescription>
            </DialogHeader>
            <BookSearch setSelectedBook={setSelectedBook} />
            {
                selectedBook != null ?
                    <div>
                        <AddBookForm bookId={selectedBook.id} />
                    </div> :
                    <p className="leading-7 [&:not(:first-child)]:mt-6">
                        Bitte wähle ein Buch aus, das du hinzufügen möchtest.
                    </p>
            }
        </DialogContent>
    </Dialog>
}