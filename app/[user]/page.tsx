"use client"

import { useEffect, useState, useCallback } from "react"
import type { Session, UserWithBooks, Book } from "@/app/lib/definitions"
import { verifySession } from "@/app/lib/dal"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import LoginButton from "@/app/ui/login-button"
import LogoutButton from "@/app/ui/logout-button"
import {
    AlertTriangle, Library, LibraryBig, Pencil, Check, X
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import ProfilePageSkeleton from "@/app/ui/profile/skeleton"
import SortAndFilter from "../ui/profile/sortAndFilter"
import BookDisplay from "../ui/profile/bookDisplay"

type ProfilePageProps = {
    readonly params: Promise<{ user: string }>;
};

export default function ProfilePage({
    params,
}: ProfilePageProps) {
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

    const isOwner = session && dbUser && session.userId === dbUser.id;

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
        if (!dbUser?.books) {
            setFilteredAndSortedBooks([]);
            return;
        }

        const seriesMap = dbUser.books.reduce((acc, book) => {
            const baseTitle = book.title.replace(/\s+(?:Vol\.?|#)?\d+$/i, '').trim();
            const seriesKey = `${book.author.toLowerCase()}-${baseTitle.toLowerCase()}`;
            if (!acc[seriesKey]) {
                acc[seriesKey] = [];
            }
            acc[seriesKey].push(book);
            return acc;
        }, {} as Record<string, Book[]>);

        let combinedItems: Book[] = Object.values(seriesMap).flatMap(group => {
            if (group.length > 1) {
                group.sort((a, b) => {
                    const numA = parseInt(a.title.match(/\d+$/)?.[0] || '0');
                    const numB = parseInt(b.title.match(/\d+$/)?.[0] || '0');
                    return numA - numB;
                });

                const firstBook = group[0];
                const baseTitle = firstBook.title.replace(/\s+(?:Vol\.?|#)?\d+$/i, '').trim();

                const seriesObject: Book = {
                    id: `series-${baseTitle.replace(/\s/g, '-')}`,
                    title: baseTitle,
                    author: firstBook.author,
                    description: `A series containing ${group.length} books. The first book is "${firstBook.title}".`,
                    publicationYear: firstBook.publicationYear,
                    wishlisted: group.some(book => book.wishlisted),
                    pages: group.reduce((sum, book) => sum + book.pages, 0),
                    progress: group.reduce((sum, book) => sum + book.progress, 0),
                    thumbnail: firstBook.thumbnail,
                    googleBookId: firstBook.googleBookId,
                    ISBNumber: "SERIES",
                    user: firstBook.user,
                };
                return [seriesObject];
            } else {
                return group;
            }
        });

        if (filter) {
            combinedItems = combinedItems.filter(item =>
                item.title.toLowerCase().includes(filter.toLowerCase()) ||
                item.author.toLowerCase().includes(filter.toLowerCase())
            );
        }
        if (wishlistStatus === 'wishlisted') {
            combinedItems = combinedItems.filter(item => item.wishlisted);
        } else if (wishlistStatus === 'not-wishlisted') {
            combinedItems = combinedItems.filter(item => !item.wishlisted);
        }
        if (finishedStatus === 'finished') {
            combinedItems = combinedItems.filter(item => item.progress >= item.pages && item.pages > 0);
        } else if (finishedStatus === 'not-finished') {
            combinedItems = combinedItems.filter(item => item.progress < item.pages);
        }

        combinedItems.sort((a, b) => {
            switch (sort) {
                case "title-asc": return a.title.localeCompare(b.title);
                case "title-desc": return b.title.localeCompare(a.title);
                case "date-asc": return new Date(a.publicationYear).getTime() - new Date(b.publicationYear).getTime();
                case "date-desc": return new Date(b.publicationYear).getTime() - new Date(a.publicationYear).getTime();
                default: return 0;
            }
        });

        setFilteredAndSortedBooks(combinedItems);

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
                        {(session === null ? <LoginButton name={dbUser.url} /> : <LogoutButton />)}
                    </div>
                </header>}

            <SortAndFilter
                filter={filter}
                setFilter={setFilter}
                sort={sort}
                setSort={setSort}
                finishedStatus={finishedStatus}
                setFinishedStatus={setFinishedStatus}
                wishlistStatus={wishlistStatus}
                setWishlistStatus={setWishlistStatus}
            />

            <BookDisplay
                addBook={addBook}
                dbUser={dbUser}
                filteredAndSortedBooks={filteredAndSortedBooks}
                isOwner={isOwner || false}
            />
        </main>
    )
}