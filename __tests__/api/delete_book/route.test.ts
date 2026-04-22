import { POST } from '@/app/api/delete_book/route';
import { verifySession } from '@/app/lib/dal';

jest.mock('@/app/lib/dal', () => ({
  verifySession: jest.fn(),
}));

jest.mock('@/app/lib/prisma', () => ({
  prisma: {
    book: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (data, init) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

const { prisma } = require('@/app/lib/prisma');

function createMockRequest(body) {
  return {
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('POST /api/delete_book', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete the book if the user is authenticated and owns the book', async () => {
    const bookIdToDelete = '550e8400-e29b-41d4-a716-446655440001';
    const sessionOwnerId = '550e8400-e29b-41d4-a716-446655440010';

    verifySession.mockResolvedValue({ userId: sessionOwnerId });

    const mockBook = { id: bookIdToDelete, userId: sessionOwnerId };
    prisma.book.findUnique.mockResolvedValue(mockBook);
    prisma.book.delete.mockResolvedValue({ id: bookIdToDelete });

    const request = createMockRequest({ id: bookIdToDelete });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ message: 'Book deleted successfully' });
    expect(prisma.book.findUnique).toHaveBeenCalledWith({
      where: { id: bookIdToDelete },
      select: { userId: true },
    });
    expect(prisma.book.delete).toHaveBeenCalledWith({
      where: { id: bookIdToDelete },
    });
  });

  it('should return 401 Unauthorized if there is no active session', async () => {
    verifySession.mockResolvedValue(null);
    const request = createMockRequest({ id: '550e8400-e29b-41d4-a716-446655440001' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(prisma.book.findUnique).not.toHaveBeenCalled();
    expect(prisma.book.delete).not.toHaveBeenCalled();
  });

  it('should return 401 Unauthorized if the user does not own the book', async () => {
    const bookIdToDelete = '550e8400-e29b-41d4-a716-446655440002';
    const sessionOwnerId = '550e8400-e29b-41d4-a716-446655440010';
    const bookOwnerId = '550e8400-e29b-41d4-a716-446655440020';

    verifySession.mockResolvedValue({ userId: sessionOwnerId });

    const mockBook = { id: bookIdToDelete, userId: bookOwnerId };
    prisma.book.findUnique.mockResolvedValue(mockBook);

    const request = createMockRequest({ id: bookIdToDelete });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(prisma.book.delete).not.toHaveBeenCalled();
  });

  it('should return 404 Not Found if the book does not exist', async () => {
    verifySession.mockResolvedValue({ userId: '550e8400-e29b-41d4-a716-446655440010' });

    prisma.book.findUnique.mockResolvedValue(null);

    const request = createMockRequest({ id: '550e8400-e29b-41d4-a716-446655440999' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Book not found' });
    expect(prisma.book.delete).not.toHaveBeenCalled();
  });

  it('should return 500 on a database error', async () => {
    verifySession.mockResolvedValue({ userId: '550e8400-e29b-41d4-a716-446655440010' });

    prisma.book.findUnique.mockRejectedValue(new Error('DB Error'));

    const request = createMockRequest({ id: '550e8400-e29b-41d4-a716-446655440001' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});
