import { BookX, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container mx-auto flex h-[80vh] flex-col items-center justify-center p-4 text-center">
      <BookX className="h-16 w-16 mb-4 text-muted-foreground" />
      <h2 className="text-2xl font-semibold mb-2">Seite nicht gefunden</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Die gesuchte Seite existiert leider nicht. Vielleicht hast du dich vertippt oder der Link ist veraltet.
      </p>
      <Link href="/">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Startseite
        </Button>
      </Link>
    </div>
  )
}
