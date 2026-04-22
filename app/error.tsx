'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error)
    }
  }, [error])

  return (
    <div className="container mx-auto flex h-[80vh] flex-col items-center justify-center p-4 text-center">
      <AlertTriangle className="h-16 w-16 mb-4 text-destructive" />
      <h2 className="text-2xl font-semibold mb-2">Etwas ist schief gelaufen</h2>
      <p className="text-muted-foreground mb-6">
        Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
      </p>
      <Button onClick={reset}>Erneut versuchen</Button>
    </div>
  )
}
