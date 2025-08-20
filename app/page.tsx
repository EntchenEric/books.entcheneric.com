import { CardHeader, Card, CardContent, CardTitle } from "@/components/ui/card";
import { Library, BookHeart, LockKeyhole, Code2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">

      <header className="min-h-screen flex flex-col justify-center items-center text-center py-20">
        <BookHeart className="h-20 w-20 mb-6 text-primary" />
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          Deine Bücher. Dein Universum.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Verliere nie wieder den Überblick über deine Lesereise. Sammle, organisiere und entdecke deine Lieblingsbücher - alles an einem Ort.
        </p>
        <a href="/register">
          <Button size="lg" className="group">
            Jetzt kostenlos starten <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </a>
      </header>

      <div className="grid md:grid-cols-3 gap-8 my-20">
        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Library className="h-6 w-6 text-primary" />
              Was ist das hier?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Dein digitales Bücherregal. Trage ein, was du liest, gelesen hast oder noch auf deiner Wunschliste steht. So weißt du im Buchladen immer genau, welches Schätzchen dir in der Sammlung noch fehlt.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Code2 className="h-6 w-6 text-primary" />
              Wer steckt dahinter?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Ein Hobbyprojekt von mir, mit Liebe in der Freizeit gecodet. Hier geht's nicht ums Geld, sondern um die Leidenschaft für Bücher und Code. Der Quellcode ist auf <a href="https://github.com/EntchenEric/books.entcheneric.com" className="font-semibold text-primary underline" target="_blank" rel="noopener noreferrer">GitHub</a> einsehbar. Mehr über mich? Schau auf <a href="https://entcheneric.com" className="font-semibold text-primary underline" target="_blank" rel="noopener noreferrer">meinem Portfolio</a> vorbei.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <LockKeyhole className="h-6 w-6 text-primary" />
              Und meine Daten?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Deine Daten gehören dir. Alles wird sicher gespeichert, dein Passwort natürlich verschlüsselt (gehasht). Kein Tracking, keine Weitergabe an Dritte. Versprochen.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}