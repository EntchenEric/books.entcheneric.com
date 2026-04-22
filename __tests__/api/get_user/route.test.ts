import { POST } from '@/app/api/get_user/route';

jest.mock('@/app/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn(),
    NextResponse: {
      json: (data, init) => ({
        status: init?.status ?? 200,
        json: async () => data,
      }),
    },
  };
});

const { prisma } = require('@/app/lib/prisma');

function createMockRequest(body) {
  return {
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('POST /api/user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should find and return a user by URL with detailed book info', async () => {
    const mockUser = { id: '550e8400-e29b-41d4-a716-446655440001', url: 'test-user', passwordHash: 'secret', books: [{ title: 'Book A' }] };
    prisma.user.findUnique.mockResolvedValue(mockUser);
    const request = createMockRequest({ url: 'test-user' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ id: '550e8400-e29b-41d4-a716-446655440001', url: 'test-user', books: [{ title: 'Book A' }] });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { url: 'test-user' },
      include: { books: true },
    });
  });

  it('should find and return a user by userId with basic book info', async () => {
    const mockUser = { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Jane Doe', passwordHash: 'secret', books: [{ title: 'Book B' }] };
    prisma.user.findUnique.mockResolvedValue(mockUser);
    const request = createMockRequest({ userId: '550e8400-e29b-41d4-a716-446655440002' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ id: '550e8400-e29b-41d4-a716-446655440002', name: 'Jane Doe', books: [{ title: 'Book B' }] });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: '550e8400-e29b-41d4-a716-446655440002' },
      include: { books: true },
    });
  });

  it('should return 404 if a user is not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const request = createMockRequest({ userId: '550e8400-e29b-41d4-a716-446655440003' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'No user found' });
  });

  it('should return a 400 error if no url or userId is provided', async () => {
    const request = createMockRequest({});

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid input' });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return a 500 error if the database query fails', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'));
    const request = createMockRequest({ userId: '550e8400-e29b-41d4-a716-446655440004' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});
