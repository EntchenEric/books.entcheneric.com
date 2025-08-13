"use client"

import { useActionState, useState } from "react"
import { addbook } from "@/app/actions/addBook"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Alert,
    AlertTitle,
} from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"

export default function AddBookForm({ bookId }: { bookId: string }) {
    const [state, action, pending] = useActionState(addbook, undefined)
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [finished, setFinished] = useState(false)

    return <form action={action} className="*:mb-3">
        <input hidden={true} id="bookId" name="bookId" value={bookId} readOnly />
        {state?.errors?.bookId && <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{state.errors.bookId}</AlertTitle>
        </Alert>}

        <div className="flex items-center gap-3">
            <Checkbox
                id="isWishlisted"
                checked={isWishlisted}
                onCheckedChange={(checked) => setIsWishlisted(checked === true)}
            />
            <input type="hidden" name="isWishlisted" value={String(isWishlisted)} />
            <Label htmlFor="isWishlisted">Auf die Wunschliste</Label>
        </div>
        {state?.errors?.isWishlisted && <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{state.errors.isWishlisted}</AlertTitle>
        </Alert>}

        <div>
            <Label htmlFor="pageProgress">Seiten gelesen</Label>
            <Input id="pageProgress" name="pageProgress" type="number" defaultValue={0} />
        </div>
        {state?.errors?.pageProgress && <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{state.errors.pageProgress}</AlertTitle>
        </Alert>}
        <Button disabled={pending} type="submit">Buch hinzufügen</Button>
    </form>
}