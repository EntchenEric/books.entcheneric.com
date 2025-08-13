"use client"

import { useEffect, useState } from "react"
import { Session, User } from "@/app/lib/definitions";
import LoginButton from "../ui/login-button";
import { verifySession } from "../lib/dal";
import AddBookButton from "../ui/add-book-button";
import BookCard from "../ui/book-card";
import LogoutButton from "../ui/logout-button";
import { Input } from "@/components/ui/input";

export default function ProfilePage({
    params,
}: {
    params: Promise<{ user: string }>
}) {

    const [dbUser, setDbUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<(null | Session)>(null);
    const [hasError, setHasError] = useState(false);
    const [filter, setFilter] = useState("");
    const [sort, setSort] = useState("title-asc");
    const [filteredAndSortedBooks, setFilteredAndSortedBooks] = useState(dbUser?.books || []);
    const [showOnlyWishlisted, setShowOnlyWishlisted] = useState(false);
    const [showOnlyNotWishlisted, setShowOnlyNotWishlisted] = useState(false);
    const [showOnlyFinished, setShowOnlyFinished] = useState(false);
    const [showOnlyNotFinished, setShowOnlyNotFinished] = useState(false);

    useEffect(() => {
        params.then((p) => {
            const user = p.user
            fetch('/api/get_user', {
                method: "POST",
                body: JSON.stringify({
                    url: user
                })
            })
                .then(async (res) => {
                    if (!res.ok) {
                        setHasError(true)
                    } else {
                        setDbUser(await res.json())
                    }
                    setLoading(false)
                })
        })

        verifySession().then((session) => {
            setSession(session);
        })
    }, []);

    useEffect(() => {
        if (!dbUser) return;

        let books = [...dbUser.books];

        if (filter) {
            books = books.filter(book => book.title.toLowerCase().includes(filter.toLowerCase()));
        }

        if (showOnlyWishlisted) {
            books = books.filter(book => book.wishlisted === true);
        }
        if (showOnlyNotWishlisted) {
            books = books.filter(book => book.wishlisted === false);
        }

        if (showOnlyFinished) {
            books = books.filter(book => book.progress >= book.pages);
        }
        if (showOnlyNotFinished) {
            books = books.filter(book => book.progress < book.pages);
        }

        books.sort((a, b) => {
            if (sort === "title-asc") return a.title.localeCompare(b.title);
            if (sort === "title-desc") return b.title.localeCompare(a.title);
            if (sort === "date-asc") return new Date(a.publicationYear).getTime() - new Date(b.publicationYear).getTime();
            if (sort === "date-desc") return new Date(b.publicationYear).getTime() - new Date(a.publicationYear).getTime();
            return 0;
        });

        setFilteredAndSortedBooks(books);
    }, [dbUser, filter, sort, showOnlyWishlisted, showOnlyNotWishlisted, showOnlyFinished, showOnlyNotFinished]);

    if (hasError) {
        return <div>
            Etwas ist schief gelaufen. Bitte versuche es später noch einal.
        </div>
    }
    if (loading) {
        return <div>
            loading...
        </div>
    }
    else if (dbUser == null) {
        return <div>
            No user found.
        </div>
    } else {
        return <div>
            <div className="mb-4 flex items-center justify-between border-b pb-2 ">
                <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
                    Bücherliste von {dbUser.url}
                </h2>
                {
                    session == null ? <LoginButton /> : <LogoutButton />
                }
            </div>

            <div className="mb-4 flex gap-4 items-center flex-wrap">
                <Input
                    type="text"
                    placeholder="Filter nach Titel..."
                    className="border px-2 py-1 rounded"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
                <select
                    className="border px-2 py-1 rounded"
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                >
                    <option value="title-asc">Titel (A-Z)</option>
                    <option value="title-desc">Titel (Z-A)</option>
                    <option value="date-asc">Erscheinungsjahr (Alt zuerst)</option>
                    <option value="date-desc">Erscheinungsjahr (Neu zuerst)</option>
                </select>
                <select
                    className="border px-2 py-1 rounded"
                    value={
                        showOnlyWishlisted
                            ? "wishlisted"
                            : showOnlyNotWishlisted
                            ? "not-wishlisted"
                            : "all"
                    }
                    onChange={e => {
                        setShowOnlyWishlisted(e.target.value === "wishlisted");
                        setShowOnlyNotWishlisted(e.target.value === "not-wishlisted");
                    }}
                >
                    <option value="all">Alle Bücher</option>
                    <option value="wishlisted">Nur Wunschliste</option>
                    <option value="not-wishlisted">Nicht auf Wunschliste</option>
                </select>
                <select
                    className="border px-2 py-1 rounded"
                    value={
                        showOnlyFinished
                            ? "finished"
                            : showOnlyNotFinished
                            ? "not-finished"
                            : "all"
                    }
                    onChange={e => {
                        setShowOnlyFinished(e.target.value === "finished");
                        setShowOnlyNotFinished(e.target.value === "not-finished");
                    }}
                >
                    <option value="all">Alle Bücher</option>
                    <option value="finished">Nur beendete</option>
                    <option value="not-finished">Nicht beendete</option>
                </select>
            </div>

            {
                filteredAndSortedBooks.length <= 0 ? <div>
                    {
                        session == null ?
                            <p className="leading-7 [&:not(:first-child)]:mt-6">
                                {dbUser.url} hat leider noch keine Bücher in die Liste eingetragen.
                            </p>
                            : <div>
                                <p className="leading-7 [&:not(:first-child)]:mt-6">
                                    Du hast noch keine Bücher in deine Liste eingetragen.
                                </p>
                                <AddBookButton />
                            </div>
                    }
                </div> : <div>
                    <div className="flex gap-3 flex-wrap">
                        {filteredAndSortedBooks.map((book) => (
                            <BookCard frontendBook={book} key={book.id} sessionUser={dbUser} />
                        ))}
                    </div>
                    {
                        session != null &&
                        <div className="mt-6">
                            <AddBookButton />
                        </div>
                    }
                </div>
            }
        </div>
    }
}