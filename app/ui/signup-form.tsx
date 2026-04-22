'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SignupFormSchema } from '@/app/lib/definitions'
import { signup } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'

type SignupFormValues = z.infer<typeof SignupFormSchema>

export default function SignupForm() {
    const [isPending, startTransition] = useTransition()
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(SignupFormSchema),
        defaultValues: {
            name: "",
            password: "",
        },
    })

    async function onSubmit(values: SignupFormValues) {

        startTransition(async () => {
            const formData = new FormData()
            formData.append('name', values.name)
            formData.append('password', values.password)
            const result = await signup(undefined, formData)

            if (result?.errors) {
                if (result.errors.name) {
                    form.setError("name", {
                        type: "server",
                        message: result.errors.name[0],
                    })
                }
                if (result.errors.password) {
                    form.setError("password", {
                        type: "server",
                        message: result.errors.password.join(', '),
                    })
                }
                if (result.errors.form) {
                    form.setError("root", {
                        type: "server",
                        message: result.errors.form.join('\n'),
                    })
                }
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Dein Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Passwort</FormLabel>
                            <div className="relative">
                                <FormControl>
                                    <Input type={showPassword ? "text" : "password"} {...field} />
                                </FormControl>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {form.formState.errors.root?.type === "server" && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Fehler</AlertTitle>
                        <AlertDescription>
                            {form.formState.errors.root.message}
                        </AlertDescription>
                    </Alert>
                )}

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registrieren...
                        </>
                    ) : (
                        'Registrieren'
                    )}
                </Button>
            </form>
        </Form>
    )
}