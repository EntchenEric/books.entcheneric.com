"use client"

import { useActionState, useEffect, useRef, useState } from "react";
import { addbook as apiAddBook } from "@/app/actions/addBook";
import { BookItem, Book } from "../lib/definitions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"


function SubmitButton({ pending }: { pending: boolean }) {
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird hinzugefügt...
                </>
            ) : (
                'Buch zur Bibliothek hinzufügen'
            )}
        </Button>
    );
}

export default function AddBookForm({ book, addBook, setKeepOpen }: { book: BookItem; addBook: (book: Book) => void; setKeepOpen: (keepOpen: boolean) => void; }) {
    const [state, formAction, pending] = useActionState(apiAddBook, undefined);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [addSeries, setAddSeries] = useState(false);
    const [markAllAsFinished, setMarkAllAsFinished] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (!pending && state) {
            toast.dismiss();
            if (state.success && state.books) {
                toast.success("Buch erfolgreich hinzugefügt!");
                state.books.forEach((book) => {
                    addBook(book as any);
                })
                formRef.current?.reset();
                setIsWishlisted(false);
            } else if (state.errors) {
                const errorMessages = Object.values(state.errors).flat().join("\n");
                toast.error("Fehler beim Hinzufügen", { description: errorMessages });
            } else {
                toast.error("Ein unbekannter Fehler ist aufgetreten.");
            }
        }
    }, [state, pending, addBook]);

    return (
        <form
            ref={formRef}
            action={(formData) => {
                toast.loading("Buch wird hinzugefügt...");
                formAction(formData);
            }}
            className="space-y-4 pt-2"
        >
            <input type="hidden" name="bookId" value={book.id} />

            <div>
                <Label htmlFor="pageProgress" className="font-medium">
                    Lesefortschritt (optional)
                </Label>
                <div className="flex items-center gap-2 mt-1.5">
                    <Input
                        id="pageProgress"
                        name="pageProgress"
                        type="number"
                        placeholder="0"
                        min={0}
                        max={book.volumeInfo.pageCount}
                        className="w-24"
                        disabled={isWishlisted || addSeries}
                    />
                    <span className="text-sm text-muted-foreground">
                        / {book.volumeInfo.pageCount ?? '?'} Seiten
                    </span>
                </div>
            </div>

            <Separator />

            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <Checkbox
                        id="isWishlisted"
                        checked={isWishlisted}
                        disabled={markAllAsFinished}
                        onCheckedChange={(checked) => {
                            const isChecked = checked === true;
                            setIsWishlisted(isChecked);
                            if (isChecked && formRef.current) {
                                const pageInput = formRef.current.elements.namedItem("pageProgress") as HTMLInputElement;
                                if (pageInput) pageInput.value = '0';
                            }
                        }}
                    />
                    <input type="hidden" name="isWishlisted" value={String(isWishlisted)} />
                    <Label htmlFor="isWishlisted" className="cursor-pointer text-sm font-normal">
                        Auf meine Wunschliste setzen
                    </Label>
                </div>

                <div className="flex items-center gap-3">
                    <Checkbox
                        id="addSeries"
                        checked={addSeries}
                        onCheckedChange={(checked) => {
                            const isChecked = checked === true;
                            setAddSeries(isChecked);
                            if (isChecked && formRef.current) {
                                const pageInput = formRef.current.elements.namedItem("pageProgress") as HTMLInputElement;
                                if (pageInput) pageInput.value = '0';
                            }
                        }}
                    />
                    <input type="hidden" name="addSeries" value={String(addSeries)} />
                    <Label htmlFor="addSeries" className="cursor-pointer text-sm font-normal">
                        Gesammte Buchserie hinzufügen
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-4 text-muted-foreground"/>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-sm">
                                    Es können unter umständen nicht alle Bücher hinzugefügt werden. <br /> Bitte überprüfe die Liste der hinzugefügten Bücher nach dem Hinzufügen.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </Label>
                </div>

                {
                    addSeries && <div className="flex items-center gap-3">
                        <Checkbox
                            id="markAllAsFinished"
                            checked={markAllAsFinished}
                            onCheckedChange={(checked) => {
                                const isChecked = checked === true;
                                setAddSeries(isChecked);
                                if (isChecked && formRef.current) {
                                    const pageInput = formRef.current.elements.namedItem("pageProgress") as HTMLInputElement;
                                    if (pageInput) pageInput.value = '0';
                                }
                            }}
                        />
                        <input type="hidden" name="markAllAsFinished" value={String(markAllAsFinished)} />
                        <Label htmlFor="markAllAsFinished" className="cursor-pointer text-sm font-normal">
                            Alle als gelesen markieren
                        </Label>
                    </div>}

                <div className="flex items-center gap-3">
                    <Checkbox
                        id="keepOpen"
                        onCheckedChange={(checked) => setKeepOpen(checked === true)}
                    />
                    <Label htmlFor="keepOpen" className="cursor-pointer text-sm font-normal">
                        Dialog für nächstes Buch offen lassen
                    </Label>
                </div>
            </div>

            <div className="pt-2">
                <SubmitButton pending={pending} />
            </div>
        </form>
    );
}