'use client'

import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionState } from 'react'
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
function LoginButton({ pending }: { pending: boolean }) {
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Anmelden...
                </>
            ) : (
                'Anmelden'
            )}
        </Button>
    )
}

export default function LoginForm() {
    const [state, action, pending] = useActionState(login, undefined)

    return (
        <form action={action} className="grid gap-4 pt-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="dein.name" required />
                {state?.errors?.name && (
                    <p className="text-sm font-medium text-destructive">{state.errors.name}</p>
                )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Passwort</Label>
                <Input id="password" name="password" type="password" required />
            </div>
            {state?.errors?.password && state.errors.password.length > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Das Passwort ist ungültig</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5">
                            {state.errors.password.map((error) => (
                                <li key={error} className="text-xs">{error}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
            <LoginButton pending={pending} />
        </form>
    )
}
