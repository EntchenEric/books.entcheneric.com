'use client'

import { useTransition } from 'react'
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
import { Loader2 } from 'lucide-react'

type SignupFormValues = z.infer<typeof SignupFormSchema>

export default function SignupForm() {
    const [isPending, startTransition] = useTransition()

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
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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