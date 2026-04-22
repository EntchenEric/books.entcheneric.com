'use client'

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
        <h1 className="text-2xl font-bold mb-4">Kritischer Fehler</h1>
        <p className="mb-6 text-muted-foreground">Die Anwendung konnte nicht geladen werden.</p>
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Seite neu laden
        </button>
      </body>
    </html>
  )
}
