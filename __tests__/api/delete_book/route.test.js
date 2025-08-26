import { POST } from '@/app/api/delete_book/route'; // Adjust the import path
import { verifySession } from '@/app/lib/dal';
import { PrismaClient } from '@prisma/client';

// Mock the DAL to control session verification
jest.mock('../../../app/lib/dal', () => ({
  verifySession: jest.fn(),
}));

// Mock the Prisma Client
jest.mock('@prisma/client', () => {
  const mPrisma = {
    book: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

// Helper function to create a mock NextRequest
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
    // Arrange
    const bookIdToDelete = 1;
    const sessionOwnerId = 101;
    
    // Simulate a valid session
    verifySession.mockResolvedValue({ userId: sessionOwnerId });

    // Simulate finding the book owned by the session user
    const mockBook = { id: bookIdToDelete, user: { id: sessionOwnerId } };
    prisma.book.findUnique.mockResolvedValue(mockBook);

    // Simulate a successful deletion
    prisma.book.delete.mockResolvedValue({ id: bookIdToDelete });

    const request = createMockRequest({ id: bookIdToDelete });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
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
    // Arrange: No session found
    verifySession.mockResolvedValue(null);
    const request = createMockRequest({ id: 1 });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(prisma.book.findUnique).not.toHaveBeenCalled();
    expect(prisma.book.delete).not.toHaveBeenCalled();
  });

  it('should return 401 Unauthorized if the user does not own the book', async () => {
    // Arrange
    const bookIdToDelete = 2;
    const sessionOwnerId = 101;
    const bookOwnerId = 202; // A different user owns the book

    verifySession.mockResolvedValue({ userId: sessionOwnerId });
    
    // Simulate finding a book owned by a different user
    const mockBook = { id: bookIdToDelete, user: { id: bookOwnerId } };
    prisma.book.findUnique.mockResolvedValue(mockBook);
    
    const request = createMockRequest({ id: bookIdToDelete });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(prisma.book.delete).not.toHaveBeenCalled();
  });

  it('should return 404 Not Found if the book does not exist', async () => {
    // Arrange
    verifySession.mockResolvedValue({ userId: 101 });
    
    // Simulate not finding a book
    prisma.book.findUnique.mockResolvedValue(null);
    
    const request = createMockRequest({ id: 999 });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Book not found' });
    expect(prisma.book.delete).not.toHaveBeenCalled();
  });

  it('should return 500 on a database error', async () => {
    // Arrange
    verifySession.mockResolvedValue({ userId: 101 });
    
    // Simulate a database crash
    prisma.book.findUnique.mockRejectedValue(new Error('DB Error'));
    
    const request = createMockRequest({ id: 1 });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toEqual({ message: 'Internal server error' });
  });
});