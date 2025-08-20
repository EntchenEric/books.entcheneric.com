'use client'

import { ThemeProvider } from 'next-themes'

const themes = [
    'light',
    'dark',
    'high-contrast-dark',
    'crimson-red',
    'ocean-blue',
    'hacker-green',
    'fluffy-pink',
    'baby-blue',
]

type ProvidersProps = {
    readonly children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
    return <ThemeProvider
        attribute="class"
        defaultTheme='system'
        enableSystem
        themes={themes}
    >{children}</ThemeProvider>
}