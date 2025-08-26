import { POST } from '@/app/api/update_user/route'
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
    user: {
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

describe('POST /api/update_user', () => {
  let prisma

  beforeEach(() => {
    jest.clearAllMocks()
    prisma = new PrismaClient()
  })

  it('should return 401 if no session', async () => {
    verifySession.mockResolvedValueOnce(null)

    const request = createMockRequest({ title: 'New Title', description: 'New Desc' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should update user when session exists', async () => {
    verifySession.mockResolvedValueOnce({ userId: 1 })

    const mockUser = { id: 1, title: 'New Title', description: 'New Desc', books: [] }
    prisma.user.update.mockResolvedValueOnce(mockUser)

    const request = createMockRequest({ title: 'New Title', description: 'New Desc' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { title: 'New Title', description: 'New Desc' },
      include: { books: true },
    })
    expect(data).toEqual(mockUser)
  })

  it('should return 500 on unexpected error', async () => {
    verifySession.mockResolvedValueOnce({ userId: 1 })
    prisma.user.update.mockRejectedValueOnce(new Error('DB error'))

    const request = createMockRequest({ title: 'x', description: 'y' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ message: 'Internal server error' })
  })
})
