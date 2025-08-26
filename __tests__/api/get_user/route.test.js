import { POST } from '@/app/api/get_user/route';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

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

function createMockRequest(body) {
  return {
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('POST /api/user', () => {
  let prisma;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaClient();
  });


  it('should find and return a user by URL with detailed book info', async () => {
    const mockUser = { id: 1, url: 'test-user', books: [{ title: 'Book A', user: { id: 1 } }] };
    prisma.user.findUnique.mockResolvedValue(mockUser);
    const request = createMockRequest({ url: 'test-user' });

    const response = await POST(request);
    const data = await response.json();

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
    const mockUser = { id: 123, name: 'Jane Doe', books: [{ title: 'Book B' }] };
    prisma.user.findUnique.mockResolvedValue(mockUser);
    const request = createMockRequest({ userId: 123 });

    const response = await POST(request);
    const data = await response.json();

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
    prisma.user.findUnique.mockResolvedValue(null);
    const request = createMockRequest({ userId: 999 });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toBeNull();
  });


  it('should return a 404 error if no url or userId is provided', async () => {
    const request = createMockRequest({});

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'No user found' });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });


  it('should return a 500 error if the database query fails', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'));
    const request = createMockRequest({ userId: 1 });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});