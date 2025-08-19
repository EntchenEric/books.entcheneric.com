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


export function Providers({ children }: { children: React.ReactNode }) {
    return <ThemeProvider
        attribute="class"
        defaultTheme='system'
        enableSystem
        themes={themes}
    >{children}</ThemeProvider>
}