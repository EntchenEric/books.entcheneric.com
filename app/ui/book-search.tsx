"use client"

import * as React from "react"
import { Check, Search } from "lucide-react"
import {
    Command,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { BookItem, GoogleBooksApiResponse } from "../lib/definitions"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

const cn = (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ');
}

const fetchOptionsFromApi = (query: string, userId: string): Promise<GoogleBooksApiResponse> => {
    return fetch("/api/search_books", {
        method: "POST",
        body: JSON.stringify({
            query: query,
            userId: userId
        })
    }).then((result) => {
        if (!result.ok) {
            return { items: [] };
        }
        return result.json();
    }).catch(() => {
        return { items: [] };
    });
};



function BookResultCard({ book, handleSelectOption, value }: { book: BookItem, handleSelectOption: (option: BookItem) => void, value: string }) {
    return <button
        onClick={() => handleSelectOption(book)}
        className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-primary-foreground text-left"
    >
        <Check
            className={cn(
                "mr-2 h-4 w-4",
                value === book.id ? "opacity-100" : "opacity-0"
            )}
        />
        {book.volumeInfo.imageLinks?.smallThumbnail ? (
            <img
                src={book.volumeInfo.imageLinks.smallThumbnail}
                className="mr-2 h-10 w-7 object-cover rounded"
            />
        ) : <img
            src={'https://books.google.com/googlebooks/images/no_cover_thumb.gif'}
            className="mr-2 h-10 w-7 object-cover rounded"
        />}
        <div className="flex flex-col min-w-0">
            <span className="font-medium truncate max-w-xs">
                {book.volumeInfo.title || "Unbekannter Titel"}
            </span>
            <span className="text-xs text-gray-500 truncate max-w-xs">
                {book.volumeInfo.authors?.join(", ") || "Unbekannter Autor"}
                {book.volumeInfo.publishedDate
                    ? ` • ${book.volumeInfo.publishedDate.slice(0, 4)}`
                    : ""}
            </span>
            {book.volumeInfo.description && (
                <span className="text-xs text-gray-400 truncate max-w-xs">
                    {book.volumeInfo.description.length > 80
                        ? book.volumeInfo.description.slice(0, 77) + "..."
                        : book.volumeInfo.description}
                </span>
            )}
        </div>
    </button>
}

function SearchResults({ options, handleSelectOption, value }: { options: BookItem[], handleSelectOption: (book: BookItem) => void, value: string }) {
    if (options?.length < 0)
        return <p className="p-4 text-center text-sm text-muted-foreground">
            Keine Bücher gefunden.
        </p>
    return  options.filter((o) => o.volumeInfo?.title && o.volumeInfo?.authors).map((book, index) => (
            <CommandItem key={book.id}>
                <BookResultCard book={book} handleSelectOption={handleSelectOption} value={value} />
            </CommandItem>
        ))
}

export default function BookSearch({ selectedBook, setSelectedBook, userId }: { selectedBook: BookItem | null, setSelectedBook: (book: BookItem | null) => void, userId: string }) {
    const [value, setValue] = React.useState<string>("");
    const [inputValue, setInputValue] = React.useState("");
    const [options, setOptions] = React.useState<BookItem[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const isSelectionChange = React.useRef(false);

    React.useEffect(() => {
        if (selectedBook === null) {
            setValue("");
            setInputValue("");
        } else if (selectedBook) {
            setInputValue(selectedBook.volumeInfo.title ?? "Unbekanntes Buch");
            setValue(selectedBook.id);
        }
    }, [selectedBook]);

    React.useEffect(() => {
        if (isSelectionChange.current) {
            isSelectionChange.current = false;
            return;
        }

        if (inputValue.trim() === "") {
            setOptions([]);
            return;
        }

        const handler = setTimeout(() => {
            setIsLoading(true);
            fetchOptionsFromApi(inputValue, userId).then(newOptions => {
                setOptions(newOptions.items ?? []);
                setIsLoading(false);
            });
        }, 750);

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue]);

    const handleSelectOption = (option: BookItem) => {
        isSelectionChange.current = true;
        setValue(option.id);
        setInputValue(option.volumeInfo.title ?? "Unbekanntes Buch");
        setSelectedBook(option)
    }


    return (
        <Command>
            <div className="relative">
                <Input
                    placeholder="Suche ein Buch..."
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        if (selectedBook) {
                            setSelectedBook(null);
                        }
                    }}
                    className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
            <CommandList>
                {isLoading ? (
                    <>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i}>
                                <div className="relative flex w-full items-center py-1.5 px-2">
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 opacity-0"
                                        )}
                                    />
                                    <Skeleton className="mr-2 h-10 w-7 object-cover rounded" />
                                    <div>
                                        <Skeleton className="h-4 w-32 mb-1" />
                                        <Skeleton className="h-3 w-24" />
                                        <Skeleton className="h-3 w-20 mt-1" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : <SearchResults
                    handleSelectOption={handleSelectOption}
                    options={options}
                    value={value}
                />}
            </CommandList>
        </Command>
    )
}