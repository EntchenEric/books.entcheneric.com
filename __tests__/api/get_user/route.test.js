import { POST } from '@/app/api/get_user/route'; // Adjust this import path to your route file
import { PrismaClient } from '@prisma/client';

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  const mPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

// Mock next/server's NextResponse
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (data, init) => ({
        status: init?.status ?? 200,
        json: async () => data,
      }),
    },
  };
});

// Helper function to create a mock NextRequest
function createMockRequest(body) {
  return {
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('POST /api/user', () => {
  let prisma;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    prisma = new PrismaClient();
  });


  it('should find and return a user by URL with detailed book info', async () => {
    // Arrange: Define the mock user data
    const mockUser = { id: 1, url: 'test-user', books: [{ title: 'Book A', user: { id: 1 } }] };
    prisma.user.findUnique.mockResolvedValue(mockUser);
    const request = createMockRequest({ url: 'test-user' });

    // Act: Call the API route handler
    const response = await POST(request);
    const data = await response.json();

    // Assert: Check the results
    expect(response.status).toBe(200);
    expect(data).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { url: 'test-user' },
      include: {
        books: {
          include: {
            user: true,
          },
        },
      },
    });
  });


  it('should find and return a user by userId with basic book info', async () => {
    // Arrange
    const mockUser = { id: 123, name: 'Jane Doe', books: [{ title: 'Book B' }] };
    prisma.user.findUnique.mockResolvedValue(mockUser);
    const request = createMockRequest({ userId: 123 });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 123 },
      include: {
        books: true,
      },
    });
  });

  
  it('should return null if a user is not found', async () => {
    // Arrange: Mock Prisma to find nothing
    prisma.user.findUnique.mockResolvedValue(null);
    const request = createMockRequest({ userId: 999 });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toBeNull();
  });


  it('should return a 404 error if no url or userId is provided', async () => {
    // Arrange: Send an empty request body
    const request = createMockRequest({});

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'No user found' });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });


  it('should return a 500 error if the database query fails', async () => {
    // Arrange: Mock Prisma to throw an error
    prisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'));
    const request = createMockRequest({ userId: 1 });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});