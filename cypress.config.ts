import { defineConfig } from "cypress";
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineConfig({
  projectId: '662cgp',
  retries: 4,
  execTimeout: 10000,
  taskTimeout: 12000,
  pageLoadTimeout: 12000,
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        async 'db:seed'() {
          await prisma.book.deleteMany();
          await prisma.user.deleteMany();
          await prisma.purchaseOptionCache.deleteMany();

          await prisma.user.create({
            data: {
              id: "1",
              url: "testUser",
              passwordHash: await bcrypt.hash("TestPasswort", 10)
            },
          });
          return null;
        },
        async 'db:dummybook'() {
          await prisma.book.create({
            data: {
              id: "1",
              title: "Attack on Titan 2",
              author: "Hajime Isayama",
              description: "<p> <b>Dieser einzigartige Manga um den verzweifelten Kampf der Menschheit gegen übermächtige Titanen vereint Action, Fantasy und Horror in einer mitreißenden Geschichte. Attack on Titan gilt weltweit als einer der beliebtesten Titel und sorgt auch als Anime, Realfilm und mit diversen Videospielen für Furore!</b> <br>Die Erde gehört riesigen Menschenfressern: den TITANEN! <br>Fünf Jahre nach dem Fall der Mauer Maria greifen die Titanen noch einmal die letzten Menschen an. Als sich die neuen Rekruten den Monstern entgegenstellen, wird Eren von einem Titan verschlungen. Das Ende scheint nah. <br> </p> <ul> <li>Für Leser*innen ab 16 Jahren</li> <li>Abgeschlossen in 34 Bänden</li> <li>Edle Deluxe-Edition im Hardcover erhältlich</li> <li>Mehrere Spin-off-Serien und Guidebooks</li> <li>Anime, Filme sowie diverse Videospiele</li> </ul> <p> <br> </p>",
              publicationYear: 2017,
              wishlisted: false,
              pages: 190,
              progress: 0,
              thumbnail: "http://books.google.com/books/publisher/content?id=njMyDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE73vwoEOEQtAIVif62F4HITTUcAoy6pD13eFAUvFWxAeFFyoMFBzeS6-_xqAO6AbdoG_E2Re4iRM_LoQMGjgJPrT-1dUqBLnTbVfEhCKx9CBlcnO_8SCEHFcuV3nPQ5lQCmh3mPb&source=gbs_api",
              googleBookId: "njMyDwAAQBAJ",
              userId: "1",
              ISBNumber: "9783646709087"
            }
          })
          return null;
        },
        async 'db:dummybook2'() {
          await prisma.book.create({
            data: {
              id: "2",
              title: "Death Note 7",
              author: "Tsugumi Ohba",
              description: "<p> <b>Dieser einzigartige Manga um den verzweifelten Kampf der Menschheit gegen übermächtige Titanen vereint Action, Fantasy und Horror in einer mitreißenden Geschichte. Attack on Titan gilt weltweit als einer der beliebtesten Titel und sorgt auch als Anime, Realfilm und mit diversen Videospielen für Furore!</b> <br>Die Erde gehört riesigen Menschenfressern: den TITANEN! <br>Fünf Jahre nach dem Fall der Mauer Maria greifen die Titanen noch einmal die letzten Menschen an. Als sich die neuen Rekruten den Monstern entgegenstellen, wird Eren von einem Titan verschlungen. Das Ende scheint nah. <br> </p> <ul> <li>Für Leser*innen ab 16 Jahren</li> <li>Abgeschlossen in 34 Bänden</li> <li>Edle Deluxe-Edition im Hardcover erhältlich</li> <li>Mehrere Spin-off-Serien und Guidebooks</li> <li>Anime, Filme sowie diverse Videospiele</li> </ul> <p> <br> </p>",
              publicationYear: 2018,
              wishlisted: false,
              pages: 224,
              progress: 0,
              thumbnail: "http://books.google.com/books/publisher/content?id=njMyDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE73vwoEOEQtAIVif62F4HITTUcAoy6pD13eFAUvFWxAeFFyoMFBzeS6-_xqAO6AbdoG_E2Re4iRM_LoQMGjgJPrT-1dUqBLnTbVfEhCKx9CBlcnO_8SCEHFcuV3nPQ5lQCmh3mPb&source=gbs_api",
              googleBookId: "njMyDwAAQBasd",
              userId: "1",
              ISBNumber: "9783646709088"
            }
          })
          return null;
        },
        async 'db:dummybook3'() {
          await prisma.user.create({
            data: {
              id: "2",
              url: "testUser2",
              passwordHash: await bcrypt.hash("TestPasswort", 10)
            },
          });
          await prisma.book.create({
            data: {
              id: "3",
              title: "Death Note 7",
              author: "Tsugumi Ohba",
              description: "<p> <b>Dieser einzigartige Manga um den verzweifelten Kampf der Menschheit gegen übermächtige Titanen vereint Action, Fantasy und Horror in einer mitreißenden Geschichte. Attack on Titan gilt weltweit als einer der beliebtesten Titel und sorgt auch als Anime, Realfilm und mit diversen Videospielen für Furore!</b> <br>Die Erde gehört riesigen Menschenfressern: den TITANEN! <br>Fünf Jahre nach dem Fall der Mauer Maria greifen die Titanen noch einmal die letzten Menschen an. Als sich die neuen Rekruten den Monstern entgegenstellen, wird Eren von einem Titan verschlungen. Das Ende scheint nah. <br> </p> <ul> <li>Für Leser*innen ab 16 Jahren</li> <li>Abgeschlossen in 34 Bänden</li> <li>Edle Deluxe-Edition im Hardcover erhältlich</li> <li>Mehrere Spin-off-Serien und Guidebooks</li> <li>Anime, Filme sowie diverse Videospiele</li> </ul> <p> <br> </p>",
              publicationYear: 2018,
              wishlisted: false,
              pages: 224,
              progress: 0,
              thumbnail: "http://books.google.com/books/publisher/content?id=njMyDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE73vwoEOEQtAIVif62F4HITTUcAoy6pD13eFAUvFWxAeFFyoMFBzeS6-_xqAO6AbdoG_E2Re4iRM_LoQMGjgJPrT-1dUqBLnTbVfEhCKx9CBlcnO_8SCEHFcuV3nPQ5lQCmh3mPb&source=gbs_api",
              googleBookId: "njMyDwAAQBasd",
              userId: "2",
              ISBNumber: "9783646709088"
            }
          })
          return null;
        },
        async 'db:teardown'() {
          await prisma.book.deleteMany();
          await prisma.user.deleteMany();
          await prisma.purchaseOptionCache.deleteMany();
          return null;
        },
      });
    },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});