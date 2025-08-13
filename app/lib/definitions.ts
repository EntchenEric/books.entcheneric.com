import { z } from 'zod'

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Der Name muss mindestens 2 Zeichen lang sein.' })
    .trim(),
  password: z
    .string()
    .min(8, { message: 'Das Passwort muss mindestens 8 Zeichen lang sein.' })
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
  name: string,
  title: string,
  author: string,
  description: string | null,
  publicationYear: string,
  wishlisted: boolean,
  pages: number,
  progress: number,
  thumbnail: string,
  googleBookId: string,
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
  title: string;
  authors: string[];
  publisher: string;
  publishedDate: string;
  description?: string;
  pageCount: number;
  imageLinks: ImageLinks;
  language: string;
  industryIdentifiers: IndustryIdentifier[]
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