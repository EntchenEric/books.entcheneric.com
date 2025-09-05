import { CardHeader, Card, CardContent, CardTitle } from "@/components/ui/card";
import { Library, BookHeart, LockKeyhole, Code2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations } from 'next-intl/server';
import {Link} from '@/i18n/navigation';

export default async function Home() {
  const t = await getTranslations('HomePage');

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <header className="min-h-screen flex flex-col justify-center items-center text-center py-20">
        <BookHeart className="h-20 w-20 mb-6 text-primary" />
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {t('subtitle')}
        </p>
        <Link href="/register">
          <Button size="lg" className="group">
            {t('startFree')} <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </header>

      <div className="grid md:grid-cols-3 gap-8 my-20">
        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Library className="h-6 w-6 text-primary" />
              {t('faqQuestion1Title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('faqQuestion1Answer')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Code2 className="h-6 w-6 text-primary" />
              {t('faqQuestion2Title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t.rich('faqQuestion2Answer', {
                githubLink: (chunks) => (
                  <a
                    href="https://github.com/EntchenEric/books.entcheneric.com"
                    className="font-semibold text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {chunks}
                  </a>
                ),
                portfolioLink: (chunks) => (
                  <a
                    href="https://entcheneric.com"
                    className="font-semibold text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <LockKeyhole className="h-6 w-6 text-primary" />
              {t('faqQuestion3Title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('faqQuestion3Answer')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}