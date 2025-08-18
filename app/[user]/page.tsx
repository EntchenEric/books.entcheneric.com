"use client"

import { useEffect, useState, useCallback } from "react"
import type { Session, UserWithBooks, Book } from "@/app/lib/definitions"
import { verifySession } from "@/app/lib/dal"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import LoginButton from "../ui/login-button"
import LogoutButton from "../ui/logout-button"
import AddBookButton from "../ui/add-book-button"
import BookCard from "../ui/book-card"
import {
    Search, AlertTriangle, BookOpenCheck, Library, LibraryBig, SlidersHorizontal,
    ArrowUpDown, Heart, BookCheck, Book as BookIcon,
    Pencil, Check, X
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function ProfilePage({
    params,
}: {
    params: Promise<{ user: string }>
}) {
    const [dbUser, setDbUser] = useState<UserWithBooks | null>(null);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const [hasError, setHasError] = useState(false);
    const [reloadUser, setReloadUser] = useState(0);
    const [filter, setFilter] = useState("");
    const [sort, setSort] = useState("title-asc");
    const [wishlistStatus, setWishlistStatus] = useState("all");
    const [finishedStatus, setFinishedStatus] = useState("all");
    const [filteredAndSortedBooks, setFilteredAndSortedBooks] = useState<Book[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editableTitle, setEditableTitle] = useState("");
    const [editableDescription, setEditableDescription] = useState("");
    const [titleReloading, setTitleReloading] = useState(false);

    const isOwner = !!session && !!dbUser && session.userId === dbUser.id;

    const addBook = useCallback((book: Book) => {
        setReloadUser(prev => prev + 1);
    }, []);

    useEffect(() => {
        params.then((p) => {
            fetch('/api/get_user', {
                method: "POST",
                body: JSON.stringify({ url: p.user })
            })
                .then(async (res) => {
                    if (!res.ok) {
                        setHasError(true);
                    } else {
                        const userData = await res.json();
                        setDbUser(userData);
                        setFilteredAndSortedBooks(userData?.books || []);
                        setEditableTitle(userData.title || `${userData.url}'s Library`);
                        setEditableDescription(userData.description || "A great collection of books.");
                    }
                    setTitleReloading(false);
                })
                .catch(() => setHasError(true))
                .finally(() => setLoading(false));
        });

        verifySession().then(setSession);
    }, [params, reloadUser]);

    useEffect(() => {
        if (!dbUser?.books) return;
        let books = [...dbUser.books];

        if (filter) {
            books = books.filter(book =>
                book.title.toLowerCase().includes(filter.toLowerCase()) ||
                book.author.toLowerCase().includes(filter.toLowerCase())
            );
        }
        if (wishlistStatus === 'wishlisted') {
            books = books.filter(book => book.wishlisted);
        } else if (wishlistStatus === 'not-wishlisted') {
            books = books.filter(book => !book.wishlisted);
        }
        if (finishedStatus === 'finished') {
            books = books.filter(book => book.progress >= book.pages);
        } else if (finishedStatus === 'not-finished') {
            books = books.filter(book => book.progress < book.pages);
        }

        books.sort((a, b) => {
            switch (sort) {
                case "title-asc": return a.title.localeCompare(b.title);
                case "title-desc": return b.title.localeCompare(a.title);
                case "date-asc": return new Date(a.publicationYear).getTime() - new Date(b.publicationYear).getTime();
                case "date-desc": return new Date(b.publicationYear).getTime() - new Date(a.publicationYear).getTime();
                default: return 0;
            }
        });
        setFilteredAndSortedBooks(books);
    }, [dbUser, filter, sort, wishlistStatus, finishedStatus]);

    const updateUser = ({ title, description }: { title?: string, description?: string }) => {
        const id = toast.loading("Updating details...");
        fetch('/api/update_user', {
            method: "POST",
            body: JSON.stringify({ title, description })
        }).then(async (res) => {
            if (!res.ok) {
                const errorData = await res.json();
                toast.error(errorData.error || "Failed to update details.", { id });
            } else {
                toast.success("Details updated successfully!", { id });
                setReloadUser(prev => prev + 1);
            }
        })
    }

    const handleSave = () => {
        if (!dbUser) return;
        setTitleReloading(true)
        const originalTitle = dbUser.title || `${dbUser.url}'s Library`;
        const originalDescription = dbUser.description || "A great collection of books.";

        if (editableTitle !== originalTitle || editableDescription !== originalDescription) {
            updateUser({ title: editableTitle, description: editableDescription });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        if (!dbUser) return;
        // Reset fields to their original values
        setEditableTitle(dbUser.title || `${dbUser.url}'s Library`);
        setEditableDescription(dbUser.description || "A great collection of books.");
        setIsEditing(false);
    };

    if (loading) {
        return <ProfilePageSkeleton />;
    }

    if (hasError) {
        return (
            <div className="container mx-auto flex h-[80vh] items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Fehler</AlertTitle>
                    <AlertDescription>
                        Etwas ist schief gelaufen. Die Bibliothek konnte nicht geladen werden.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!dbUser) {
        return (
            <div className="container mx-auto flex h-[80vh] flex-col items-center justify-center p-4 text-center">
                <Library className="h-16 w-16 mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-semibold">Benutzer nicht gefunden</h2>
                <p className="text-muted-foreground">Das gesuchte Profil existiert nicht.</p>
            </div>
        );
    }

    return (
        <main className="container mx-auto p-4 md:p-8">
            {titleReloading ?
                <header className="mb-8 flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div>
                            <Skeleton className="h-10 w-64 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-24" />
                </header>
                : <header className="mb-8 flex flex-col items-start gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-full items-start gap-4">
                        <LibraryBig className="h-12 w-12 text-primary flex-shrink-0" />
                        <div className="flex-grow">
                            {isEditing ? (
                                <div className="flex flex-col gap-2">
                                    <Input
                                        value={editableTitle}
                                        onChange={(e) => setEditableTitle(e.target.value)}
                                        placeholder="Your Library Title"
                                        className="h-auto scroll-m-20 border-x-0 border-t-0 border-b-2 border-primary/50 bg-transparent p-0 text-4xl font-extrabold tracking-tight shadow-none focus-visible:ring-0 lg:text-5xl"
                                    />
                                    <Input
                                        value={editableDescription}
                                        onChange={(e) => setEditableDescription(e.target.value)}
                                        placeholder="A short description..."
                                        className="mt-1 h-auto border-x-0 border-t-0 border-b-2 border-primary/50 bg-transparent p-0 text-muted-foreground shadow-none focus-visible:ring-0"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                                        {dbUser.title || `${dbUser.url}'s Library`}
                                    </h1>
                                    <p className="mt-1 text-muted-foreground">
                                        {dbUser.description || "A great collection of books."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {isOwner && (
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <Button onClick={handleSave} size="icon" aria-label="Save changes">
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={handleCancel} size="icon" variant="outline" aria-label="Cancel editing">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setIsEditing(true)} size="icon" variant="outline" aria-label="Edit title and description">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="sm:ml-4">
                        {(session === null ? <LoginButton /> : <LogoutButton />)}
                    </div>
                </header>}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5" />
                        Filtern & Sortieren
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="relative sm:col-span-2 lg:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Nach Titel oder Autor filtern..."
                            className="pl-10"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>

                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger><div className="flex w-full items-center gap-2">
                            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                            <SelectValue />
                        </div></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="title-asc">Titel (A-Z)</SelectItem>
                            <SelectItem value="title-desc">Titel (Z-A)</SelectItem>
                            <SelectItem value="date-desc">Datum (Neueste)</SelectItem>
                            <SelectItem value="date-asc">Datum (Älteste)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={wishlistStatus} onValueChange={setWishlistStatus}>
                        <SelectTrigger><div className="flex w-full items-center gap-2">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            <SelectValue />
                        </div></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle (Wunschliste)</SelectItem>
                            <SelectItem value="wishlisted">Auf der Wunschliste</SelectItem>
                            <SelectItem value="not-wishlisted">In der Bibliothek</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={finishedStatus} onValueChange={setFinishedStatus}>
                        <SelectTrigger><div className="flex w-full items-center gap-2">
                            <BookCheck className="h-4 w-4 text-muted-foreground" />
                            <SelectValue />
                        </div></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle (Lesestatus)</SelectItem>
                            <SelectItem value="finished">Beendet</SelectItem>
                            <SelectItem value="not-finished">Nicht beendet</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <div>
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
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {filteredAndSortedBooks.map((book) => (
                            <BookCard frontendBook={book} key={book.id} isOwner={isOwner} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}

function ProfilePageSkeleton() {
    return (
        <main className="container mx-auto p-4 md:p-8 animate-pulse">
            <header className="mb-8 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div>
                        <Skeleton className="h-10 w-64 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <Skeleton className="h-10 w-24" />
            </header>
            <Card className="mb-8">
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Skeleton className="h-10 sm:col-span-2 lg:col-span-2" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                </CardContent>
            </Card>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                            <Skeleton className="h-40 w-full rounded-t-lg" />
                            <div className="p-6">
                                <Skeleton className="h-5 w-4/5 mb-2" />
                                <Skeleton className="h-4 w-3/g" />
                                <Skeleton className="h-10 w-full mt-4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}