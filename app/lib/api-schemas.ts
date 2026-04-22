import { z } from 'zod'

export const UpdateBookSchema = z.object({
  id: z.string().uuid(),
  progress: z.number().int().min(0).optional(),
  wishlisted: z.boolean().optional(),
})

export const DeleteBookSchema = z.object({
  id: z.string().uuid(),
})

export const UpdateUserSchema = z.object({
  title: z.string().max(256).optional(),
  description: z.string().max(4192).optional(),
})

export const GetUserSchema = z.union([
  z.object({ url: z.string().min(1) }),
  z.object({ userId: z.string().uuid() }),
])

export const SearchBooksSchema = z.object({
  userId: z.string().uuid(),
  query: z.string().min(1).max(256),
  author: z.string().max(256).optional(),
})

export const FetchPurchaseOptionsSchema = z.object({
  bookId: z.string().uuid(),
})
