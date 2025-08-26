import { POST } from '@/app/api/delete_book/route';
import { verifySession } from '@/app/lib/dal';
import { PrismaClient } from '@prisma/client';

jest.mock('../../../app/lib/dal', () => ({
  verifySession: jest.fn(),
}));

jest.mock('@prisma/client', () => {
  const mPrisma = {
    book: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

function createMockRequest(body) {
  return {
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('POST /api/delete_book', () => {
  let prisma;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaClient();
  });

  it('should delete the book if the user is authenticated and owns the book', async () => {
    const bookIdToDelete = 1;
    const sessionOwnerId = 101;
    
    verifySession.mockResolvedValue({ userId: sessionOwnerId });

    const mockBook = { id: bookIdToDelete, user: { id: sessionOwnerId } };
    prisma.book.findUnique.mockResolvedValue(mockBook);

    prisma.book.delete.mockResolvedValue({ id: bookIdToDelete });

    const request = createMockRequest({ id: bookIdToDelete });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ message: 'Book deleted successfully' });
    expect(prisma.book.findUnique).toHaveBeenCalledWith({
      where: { id: bookIdToDelete },
      include: { user: true },
    });
    expect(prisma.book.delete).toHaveBeenCalledWith({
      where: { id: bookIdToDelete },
    });
  });

  it('should return 401 Unauthorized if there is no active session', async () => {
    verifySession.mockResolvedValue(null);
    const request = createMockRequest({ id: 1 });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(prisma.book.findUnique).not.toHaveBeenCalled();
    expect(prisma.book.delete).not.toHaveBeenCalled();
  });

  it('should return 401 Unauthorized if the user does not own the book', async () => {
    const bookIdToDelete = 2;
    const sessionOwnerId = 101;
    const bookOwnerId = 202;

    verifySession.mockResolvedValue({ userId: sessionOwnerId });
    
    const mockBook = { id: bookIdToDelete, user: { id: bookOwnerId } };
    prisma.book.findUnique.mockResolvedValue(mockBook);
    
    const request = createMockRequest({ id: bookIdToDelete });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(prisma.book.delete).not.toHaveBeenCalled();
  });

  it('should return 404 Not Found if the book does not exist', async () => {
    verifySession.mockResolvedValue({ userId: 101 });
    
    prisma.book.findUnique.mockResolvedValue(null);
    
    const request = createMockRequest({ id: 999 });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Book not found' });
    expect(prisma.book.delete).not.toHaveBeenCalled();
  });

  it('should return 500 on a database error', async () => {
    verifySession.mockResolvedValue({ userId: 101 });
    
    prisma.book.findUnique.mockRejectedValue(new Error('DB Error'));
    
    const request = createMockRequest({ id: 1 });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ message: 'Internal server error' });
  });
});