'use client'

import { signup } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionState } from 'react'
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"

export default function SignupForm() {
    const [state, action, pending] = useActionState(signup, undefined)

    return (
        <form action={action} className="*:mb-3">
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Name" />
            </div>
            {state?.errors?.name && <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>{state.errors.name}</AlertTitle>
            </Alert>}
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" />
            </div>
            {state?.errors?.password && <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Das Passwort muss:</AlertTitle>
                <AlertDescription>
                    <ul>
                        {state.errors.password.map((error) => (
                            <li key={error}>- {error}</li>
                        ))}
                    </ul>
                </AlertDescription>
            </Alert>}
            <Button disabled={pending} type="submit">
                Registrieren
            </Button>
        </form>
    )
}