import { Book, User } from "@/app/lib/definitions"
import { BookIcon, BookOpenCheck } from "lucide-react"
import AddBookButton from "../add-book-button"
import BookCard, { BookCardComponent } from "@/app/ui/book-card"

type BookDisplayProps = {
    readonly filteredAndSortedBooks: Book[],
    readonly isOwner: boolean,
    readonly addBook: (book: Book) => void,
    readonly dbUser: User
}

export default function BookDisplay({
    filteredAndSortedBooks,
    isOwner,
    addBook,
    dbUser
}: BookDisplayProps) {
    return <div>
        <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
                <BookIcon className="h-6 w-6" />
                <span>{filteredAndSortedBooks.length} {filteredAndSortedBooks.length === 1 ? "Buch" : "Bücher"} gefunden</span>
            </h2>
            {isOwner && <AddBookButton addBook={addBook} userId={dbUser.id} />}
        </div>

        {filteredAndSortedBooks.length <= 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 text-center p-12 h-80">
                <BookOpenCheck className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Keine Bücher gefunden</h3>
                <p className="text-muted-foreground max-w-sm">
                    {isOwner
                        ? "Deine Bibliothek ist leer. Füge ein Buch hinzu, um deine Sammlung zu starten!"
                        : `${dbUser.url} hat noch keine Bücher, die den Filtern entsprechen.`
                    }
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" id="AddedBooks">
                {filteredAndSortedBooks.map((book) => (
                    <div key={book.id} className="h-full">
                        {book.ISBNumber === "SERIES" ? (
                            <a href={`${dbUser.url}/${book.title}`} key={book.id} className="group">
                                <BookCardComponent book={book} key={book.id} progressPercentage={book?.progress != null && book?.pages != null && book?.pages > 0
                                    ? (book.progress / book.pages) * 100
                                    : 0} />
                            </a>
                        ) : (
                            <BookCard frontendBook={book} key={book.id} isOwner={isOwner} />
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
}