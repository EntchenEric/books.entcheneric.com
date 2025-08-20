"use server";

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { SignupFormSchema, FormState } from '@/app/lib/definitions'
import { createSession } from '@/app/lib/session'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export async function signup(state: FormState, formData: FormData) {
    const validatedFields = SignupFormSchema.safeParse({
        name: formData.get('name'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { name, password } = validatedFields.data
    const hashedPassword = await bcrypt.hash(password, 10)

    const oldUser = await prisma.user.findUnique({
        where: {
            url: name.toLowerCase()
        }
    })

    if (oldUser) {
        return {
            errors: {
                name: [
                    "Ein Nutzer mit diesen Namen existiert bereits."
                ]
            }
        }
    }

    

    const user = await prisma.user.create({
        data: {
            url: name.toLowerCase(),
            passwordHash: hashedPassword
        }
    })

    await createSession(user.id)
    redirect('/' + user.url)
}


export async function login(state: FormState, formData: FormData) {
    const validatedFields = SignupFormSchema.safeParse({
        name: formData.get('name'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { name, password } = validatedFields.data
    const dbUser = await prisma.user.findUnique({
        where: {
            url: name.toLowerCase()
        }
    })

    if (!dbUser || !bcrypt.compare(password, dbUser?.passwordHash)) {
        return {
            errors: {
                password: [
                    "Name oder Passwort ist falsch."
                ]
            }
        }
    }

    await createSession(dbUser.id)
    redirect('/' + dbUser.url)
}
