'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SignupFormSchema } from '@/app/lib/definitions'
import { login } from '@/app/actions/auth'
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
} from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

type LoginFormValues = z.infer<typeof SignupFormSchema>

function LoginButton({ pending }: { readonly pending: boolean }) {
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

type LoginFormProps = {
    readonly name: string
}

export default function LoginForm({name}: LoginFormProps) {
    const [isPending, startTransition] = useTransition()

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(SignupFormSchema),
        defaultValues: {
            name: "",
            password: "",
        },
    })

    async function onSubmit(values: LoginFormValues) {
        startTransition(async () => {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('password', values.password);
            
            const result = await login(undefined, formData);

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
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 pt-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="dein.name" {...field} />
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
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {form.formState.errors.password?.type === "server" && (
                     <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Das Passwort ist ungültig</AlertTitle>
                        <AlertDescription>
                            {form.formState.errors.password.message}
                        </AlertDescription>
                    </Alert>
                )}
                
                <LoginButton pending={isPending} />
            </form>
        </Form>
    )
}