import { z } from 'zod'
import { User as DbUser } from '@prisma/client'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


async function isNameTaken(name: string) {
  const user = await prisma.user.findUnique({
    where: {
      url: name
    }
  })

  return !!user
}

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Der Name muss mindestens 2 Zeichen lang sein.' })
    .max(64, {message: "Der Name darf nicht länger als 64 Zeichen sein."})
    .regex(/^[a-zA-Z0-9_.\s]+$/, { message: 'Der Name enthält ungültige Zeichen. Er darf nur aus Buchstaben, Zahlen, Leertasten, Punkten und Unterstrichen bestehen.' })
    .trim()
    .refine(async (name) => {
      return name != "register";
    }, {
      message: 'Der Name darf nicht "register" sein.',
    })
    .refine(async (name) => {
      return !await isNameTaken(name);
    }, {
      message: 'Dieser Name ist bereits vergeben.',
    }),
  password: z
    .string()
    .min(8, { message: 'mindestens 8 Zeichen lang sein.' })
    .max(64, {message: "Das Passwort darf maximal 64 Zeichen lang sein."})
    .trim(),
})

export const AddBookFormSchema = z.object({
  bookId: z.string(),
  isWishlisted: z.boolean().default(false),
  pageProgress: z.coerce.number().min(0, { message: "Der Fortschritt muss mindestens 0 sein." })
}).refine(
  (data) => !(data.isWishlisted && data.pageProgress !== 0),
  { message: 'Der Fortschritt muss 0 sein, wenn das Buch auf der Wunschliste ist.', path: ['pageProgress'] }
)

export type FormState =
  | {
    errors?: {
      name?: string[],
      password?: string[]
    },
    message?: string
  }
  | undefined

export type AddBookFormState =
  | {
    errors?: {
      bookId?: string[];
      isWishlisted?: string[];
      pageProgress?: string[];
    },
    message?: string
  }
  | undefined

export type SessionPayload = {
  userId: string,
  expiresAt: Date
}

export type Book = {
  id: string,
  title: string,
  author: string,
  description: string | null,
  publicationYear: string,
  wishlisted: boolean,
  pages: number,
  progress: number,
  thumbnail: string,
  googleBookId: string,
  ISBNumber?: string | null,
  user: User
}

export type User = {
  id: string,
  url: string,
  books: Book[]
}

export type Session = {
  isAuth: boolean,
  userId: any
}


export type ImageLinks = {
  smallThumbnail: string;
  medium: string;
  large: string;
  thumbnail: string;
}

export type SaleInfo = {
  country: string
  saleability: string
  isEbook: boolean,
  listPrice?: ListPrice
  retailPrice?: RetailPrice
  buyLink?: string
}

export type ListPrice = {
  amount: number
  currencyCode: string
}

export type RetailPrice = {
  amount: number
  currencyCode: string
}

export type VolumeInfo = {
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  imageLinks?: ImageLinks;
  language?: string;
  industryIdentifiers?: IndustryIdentifier[]
}

export type IndustryIdentifier = {
  type: string
  identifier: string
}

export type BookItem = {
  id: string;
  kind: string;
  volumeInfo: VolumeInfo;
  saleInfo: SaleInfo
}

export type GoogleBooksApiResponse = {
  kind: string;
  totalItems: number;
  items: BookItem[];
}

export type UserWithBooks = DbUser & { books: Book[] };

export type PurchaseOption = {
  storeName: string;
  price: string;
  url: string;
};
