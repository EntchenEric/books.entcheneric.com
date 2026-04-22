import { POST } from '@/app/api/update_book/route'
import { verifySession } from '@/app/lib/dal'

jest.mock('@/app/lib/dal', () => ({
  verifySession: jest.fn(),
}))

jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn(),
    NextResponse: {
      json: (data, init) => ({
        status: init?.status ?? 200,
        json: async () => data,
      }),
    },
  }
})

jest.mock('@/app/lib/prisma', () => ({
  prisma: {
    book: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

const { prisma } = require('@/app/lib/prisma');

function createMockRequest(body) {
  return {
    json: jest.fn().mockResolvedValue(body),
  }
}

describe('POST /api/update_book', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if no session', async () => {
    verifySession.mockResolvedValueOnce(null)

    const request = createMockRequest({ id: '550e8400-e29b-41d4-a716-446655440001', progress: 10 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return 404 if book not found', async () => {
    verifySession.mockResolvedValueOnce({ userId: '550e8400-e29b-41d4-a716-446655440010' })
    prisma.book.findUnique.mockResolvedValueOnce(null)

    const request = createMockRequest({ id: '550e8400-e29b-41d4-a716-446655440001', progress: 10 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Book not found' })
  })

  it('should return 401 if user does not own the book', async () => {
    verifySession.mockResolvedValueOnce({ userId: '550e8400-e29b-41d4-a716-446655440010' })
    prisma.book.findUnique.mockResolvedValueOnce({
      id: '550e8400-e29b-41d4-a716-446655440001',
      userId: '550e8400-e29b-41d4-a716-446655440020',
    })

    const request = createMockRequest({ id: '550e8400-e29b-41d4-a716-446655440001', progress: 10 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should update book if user owns it', async () => {
    verifySession.mockResolvedValueOnce({ userId: '550e8400-e29b-41d4-a716-446655440010' })
    const existingBook = { id: '550e8400-e29b-41d4-a716-446655440001', userId: '550e8400-e29b-41d4-a716-446655440010' }
    const updatedBook = { ...existingBook, progress: 10, wishlisted: false }

    prisma.book.findUnique.mockResolvedValueOnce(existingBook)
    prisma.book.update.mockResolvedValueOnce(updatedBook)

    const request = createMockRequest({ id: '550e8400-e29b-41d4-a716-446655440001', progress: 10, wishlisted: false })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prisma.book.update).toHaveBeenCalledWith({
      where: { id: '550e8400-e29b-41d4-a716-446655440001' },
      data: { progress: 10, wishlisted: false },
      include: { user: true },
    })
    expect(data).toEqual(updatedBook)
  })

  it('should return 500 on unexpected error', async () => {
    verifySession.mockResolvedValueOnce({ userId: '550e8400-e29b-41d4-a716-446655440010' })
    prisma.book.findUnique.mockRejectedValueOnce(new Error('DB error'))

    const request = createMockRequest({ id: '550e8400-e29b-41d4-a716-446655440001', progress: 10 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Internal server error' })
  })
})
