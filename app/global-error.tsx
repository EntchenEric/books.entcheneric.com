'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <AlertTriangle className="h-16 w-16 mb-4 text-destructive" />
        <h1 className="text-2xl font-bold mb-4">Kritischer Fehler</h1>
        <p className="mb-6 text-muted-foreground">Die Anwendung konnte nicht geladen werden.</p>
        <Button onClick={reset}>
          Seite neu laden
        </Button>
      </body>
    </html>
  )
}
