"use client"

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { addbook as apiAddBook } from "@/app/actions/addBook";
import { BookItem, Book } from "../lib/definitions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Loader2, Info } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { AddBookFormSchema } from "../lib/definitions";

type AddBookFormValues = z.infer<typeof AddBookFormSchema>;

function SubmitButton({ pending }: { readonly pending: boolean }) {
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

type AddBookFormProps = {
    readonly book: BookItem
    readonly addBook: (book: Book) => void,
    readonly setKeepOpen: (keepOpen: boolean) => void
}

export default function AddBookForm({ book, addBook, setKeepOpen }: AddBookFormProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<AddBookFormValues>({
        //@ts-ignore
        resolver: zodResolver(AddBookFormSchema),
        defaultValues: {
            bookId: book.id,
            pageProgress: 0,
            isWishlisted: false,
            addSeries: false,
            markAllAsFinished: false,
            keepOpen: false,
        },
    });

    const watchIsWishlisted = form.watch("isWishlisted");
    const watchAddSeries = form.watch("addSeries");
    const watchMarkAllAsFinished = form.watch("markAllAsFinished");

    useEffect(() => {
        if (watchIsWishlisted || watchAddSeries) {
            form.setValue("pageProgress", 0);
        }
    }, [watchIsWishlisted, watchAddSeries, form]);

    useEffect(() => {
        setKeepOpen(form.getValues("keepOpen"));
    }, [form.watch("keepOpen"), setKeepOpen, form]);


    async function onSubmit(values: AddBookFormValues) {
        const toastId = toast.loading("Buch wird hinzugefügt...");

        startTransition(async () => {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, String(value));
            });

            const state = await apiAddBook(undefined, formData);

            toast.dismiss(toastId);
            if (state?.success && state.books) {
                toast.success("Buch erfolgreich hinzugefügt!");
                state.books.forEach((book) => addBook(book as any));
                if (!values.keepOpen) {
                    form.reset();
                }
            } else if (state?.errors) {
                const errorMessages = Object.values(state.errors).flat().join("\n");
                toast.error("Fehler beim Hinzufügen", { description: errorMessages });
            } else {
                toast.error("Ein unbekannter Fehler ist aufgetreten.");
            }
        });
    }

    return (
        <Form {...form}>
            {/*@ts-ignore*/}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <FormField
                    //@ts-ignore
                    control={form.control}
                    name="bookId"
                    render={({ field }) => <input type="hidden" {...field} />}
                />

                <FormField
                    //@ts-ignore
                    control={form.control}
                    name="pageProgress"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-medium">Lesefortschritt (optional)</FormLabel>
                            <div className="flex items-center gap-2 mt-1.5">
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        min={0}
                                        max={book.volumeInfo.pageCount}
                                        className="w-24"
                                        disabled={watchIsWishlisted || watchAddSeries}
                                        {...field}
                                    />
                                </FormControl>
                                <span className="text-sm text-muted-foreground">
                                    / {book.volumeInfo.pageCount ?? '?'} Seiten
                                </span>
                            </div>
                        </FormItem>
                    )}
                />

                <Separator />

                <div className="space-y-3">
                    <FormField
                        //@ts-ignore
                        control={form.control}
                        name="isWishlisted"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        name="Wishlisted"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={watchMarkAllAsFinished}
                                    />
                                </FormControl>
                                <FormLabel className="cursor-pointer text-sm font-normal">
                                    Auf meine Wunschliste setzen
                                </FormLabel>
                            </FormItem>
                        )}
                    />

                    <FormField
                        //@ts-ignore
                        control={form.control}
                        name="addSeries"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        name="EntireSeries"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormLabel className="cursor-pointer text-sm font-normal flex items-center gap-1.5">
                                    Gesamte Buchserie hinzufügen
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="w-4 h-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Es können unter Umständen nicht alle Bücher hinzugefügt werden.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </FormLabel>
                            </FormItem>
                        )}
                    />

                    {watchAddSeries && (
                        <FormField
                            //@ts-ignore
                            control={form.control}
                            name="markAllAsFinished"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-3 space-y-0 pl-4">
                                    <FormControl>
                                        <Checkbox
                                            name="MarkAllAsFinished"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel className="cursor-pointer text-sm font-normal">
                                        Alle als gelesen markieren
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        //@ts-ignore
                        control={form.control}
                        name="keepOpen"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        name="KeepOpen"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormLabel className="cursor-pointer text-sm font-normal">
                                    Dialog für nächstes Buch offen lassen
                                </FormLabel>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="pt-2">
                    <SubmitButton pending={isPending} />
                </div>
            </form>
        </Form>
    );
}