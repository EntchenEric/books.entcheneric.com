import { POST } from '@/app/api/update_book/route'
import { verifySession } from '@/app/lib/dal'
import { PrismaClient } from '@prisma/client'

jest.mock('../../../app/lib/dal', () => ({
  verifySession: jest.fn(),
}))

jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (data, init) => ({
        status: init?.status ?? 200,
        json: async () => data,
      }),
    },
  }
})

jest.mock('@prisma/client', () => {
  const mPrisma = {
    book: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  }
  return { PrismaClient: jest.fn(() => mPrisma) }
})

// helper to mock NextRequest
function createMockRequest(body) {
  return {
    json: jest.fn().mockResolvedValue(body),
  }
}

describe('POST /api/update_book', () => {
  let prisma

  beforeEach(() => {
    jest.clearAllMocks()
    prisma = new PrismaClient()
  })

  it('should return 401 if no session', async () => {
    verifySession.mockResolvedValueOnce(null)

    const request = createMockRequest({ id: 1, progress: 10 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return 404 if book not found', async () => {
    verifySession.mockResolvedValueOnce({ userId: 1 })
    prisma.book.findUnique.mockResolvedValueOnce(null)

    const request = createMockRequest({ id: 1, progress: 10 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Book not found' })
  })

  it('should return 401 if user does not own the book', async () => {
    verifySession.mockResolvedValueOnce({ userId: 1 })
    prisma.book.findUnique.mockResolvedValueOnce({
      id: 1,
      user: { id: 2 }, // different user
    })

    const request = createMockRequest({ id: 1, progress: 10 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should update book if user owns it', async () => {
    verifySession.mockResolvedValueOnce({ userId: 1 })
    const existingBook = { id: 1, user: { id: 1 } }
    const updatedBook = { ...existingBook, progress: 10, wishlisted: false }

    prisma.book.findUnique.mockResolvedValueOnce(existingBook)
    prisma.book.update.mockResolvedValueOnce(updatedBook)

    const request = createMockRequest({ id: 1, progress: 10, wishlisted: false })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prisma.book.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { progress: 10, wishlisted: false },
      include: { user: true },
    })
    expect(data).toEqual(updatedBook)
  })

  it('should return 500 on unexpected error', async () => {
    verifySession.mockResolvedValueOnce({ userId: 1 })
    prisma.book.findUnique.mockRejectedValueOnce(new Error('DB error'))

    const request = createMockRequest({ id: 1, progress: 10 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Internal server error' })
  })
})
