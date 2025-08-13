"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Book, BookItem, GoogleBooksApiResponse } from "../lib/definitions"

const cn = (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ');
}

const fetchOptionsFromApi = (query: string): Promise<GoogleBooksApiResponse> => {
    return fetch("/api/search_books", {
        method: "POST",
        body: JSON.stringify({
            query: query
        })
    }).then((result) => {
        if (!result.ok) {
            return []
        }

        return result.json() ?? []
    })
};


export default function BookSearch({ setSelectedBook }: { setSelectedBook: (book: BookItem) => void }) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState<string>("");
    const [inputValue, setInputValue] = React.useState("");
    const [options, setOptions] = React.useState<BookItem[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const isSelectionChange = React.useRef(false);

    React.useEffect(() => {
        if (isSelectionChange.current) {
            isSelectionChange.current = false;
            return;
        }

        const handler = setTimeout(() => {
            setIsLoading(true);
            fetchOptionsFromApi(inputValue).then(newOptions => {
                setOptions(newOptions.items);
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
        setInputValue(option.volumeInfo.title);
        setOpen(false);
        setSelectedBook(option)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className="relative">
                <PopoverTrigger asChild>
                    <input
                        type="text"
                        role="combobox"
                        aria-expanded={open}
                        value={inputValue}
                        onFocus={() => setOpen(true)}
                        onChange={(e) => {
                            setOpen(true);
                            setInputValue(e.target.value)
                        }}
                        placeholder="Suche ein Buch..."
                        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white pl-3 pr-10 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder-gray-400 dark:focus:ring-gray-800"
                    />
                </PopoverTrigger>
                <ChevronsUpDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 opacity-50 cursor-pointer"
                    onClick={() => setOpen(!open)}
                />
            </div>

            {open && (
                <PopoverContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="w-[--radix-popover-trigger-width] mt-1 p-0 z-50"
                    sideOffset={5}
                    align="start"
                >
                    <div className="rounded-md border bg-white text-gray-950 shadow-md dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50">
                        <div className="max-h-[300px] overflow-y-auto p-1">
                            {isLoading ? (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                                    <span className="ml-2 text-sm text-gray-500">Lade...</span>
                                </div>
                            ) : !!options && options.length > 0 ? (
                                options.map((option) => (
                                    <div
                                        key={option.id}
                                        onClick={() => handleSelectOption(option)}
                                        className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option.volumeInfo.imageLinks?.smallThumbnail && (
                                            <img
                                                src={option.volumeInfo.imageLinks.smallThumbnail}
                                                alt={option.volumeInfo.title}
                                                className="mr-2 h-10 w-7 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium truncate max-w-xs">
                                                {option.volumeInfo.title.length > 40
                                                    ? option.volumeInfo.title.slice(0, 37) + "..."
                                                    : option.volumeInfo.title}
                                            </span>
                                            <span className="text-xs text-gray-500 truncate max-w-xs">
                                                {option.volumeInfo.authors?.join(", ").length > 40
                                                    ? option.volumeInfo.authors?.join(", ").slice(0, 37) + "..."
                                                    : option.volumeInfo.authors?.join(", ")}
                                                {option.volumeInfo.publishedDate
                                                    ? ` • ${option.volumeInfo.publishedDate.slice(0, 4)}`
                                                    : ""}
                                            </span>
                                            {option.volumeInfo.description && (
                                                <span className="text-xs text-gray-400 truncate max-w-xs">
                                                    {option.volumeInfo.description.length > 80
                                                        ? option.volumeInfo.description.slice(0, 77) + "..."
                                                        : option.volumeInfo.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="p-4 text-center text-sm text-gray-500">
                                    Keine Bücher gefunden.
                                </p>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            )}
        </Popover>
    );
}