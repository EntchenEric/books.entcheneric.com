import { POST } from '@/app/api/fetch_purchase_options/route';

jest.mock('@/app/lib/prisma', () => ({
  prisma: {
    book: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    purchaseOptionCache: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(async (callback) => await callback({
      purchaseOptionCache: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      book: {
        update: jest.fn(),
      },
    })),
  },
}));

jest.mock('@/app/lib/rate-limit', () => ({
  rateLimitByIp: jest.fn().mockResolvedValue({ success: true }),
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

global.fetch = jest.fn();

function createMockRequest(body) {
  return {
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('POST /api/purchase-options', () => {
  const mockSerpApiKey = 'test-serp-api-key';
  const MOCK_DATE = new Date('2024-08-20T10:00:00.000Z');
  const RealDate = Date;

  beforeAll(() => {
    process.env.SERP_API_KEY = mockSerpApiKey;

    global.Date = class extends RealDate {
      constructor(dateString) {
        if (dateString) {
          super(dateString);
        } else {
          super(MOCK_DATE);
        }
      }
    };
  });

  afterAll(() => {
    global.Date = RealDate;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return existing purchase options if the cache is recent', async () => {
    const recentDate = new Date('2024-08-19T10:00:00.000Z');

    const mockBook = { id: '550e8400-e29b-41d4-a716-446655440001', title: 'Recent Book', lastPurchaseOptionUpdatedAt: recentDate };
    const mockOptions = [{ id: 'opt-101', retailerName: 'Recent Store', price: 9.99 }];

    prisma.book.findUnique.mockResolvedValue(mockBook);
    prisma.purchaseOptionCache.findMany.mockResolvedValue(mockOptions);

    const request = createMockRequest({ bookId: '550e8400-e29b-41d4-a716-446655440001' });

    const response = await POST(request);
    const data = await response.json();

    expect(fetch).not.toHaveBeenCalled();
    expect(prisma.book.update).not.toHaveBeenCalled();
    expect(prisma.purchaseOptionCache.findMany).toHaveBeenCalledWith({ where: { bookId: '550e8400-e29b-41d4-a716-446655440001' } });
    expect(response.status).toBe(200);
    expect(data).toEqual(mockOptions);
  });

  it('should fetch new options if the cache is stale (more than 3 days old)', async () => {
    const staleDate = new Date('2024-08-16T10:00:00.000Z');
    const mockBook = { id: '550e8400-e29b-41d4-a716-446655440002', ISBNumber: '12345', lastPurchaseOptionUpdatedAt: staleDate };
    const newOptions = [{ id: 'opt-201', retailerName: 'New Store', price: 15.99 }];

    const mockSerpApiResponse = {
      search_metadata: { status: 'Success' },
      organic_results: [
        { source: 'New Store', rich_snippet: { bottom: { detected_extensions: { price: 15.99 } } }, link: 'http://newstore.com' },
        { source: 'No Price Store', rich_snippet: {} },
      ],
    };

    prisma.book.findUnique.mockResolvedValue(mockBook);
    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockSerpApiResponse),
    });
    prisma.purchaseOptionCache.findMany.mockResolvedValue(newOptions);

    const request = createMockRequest({ bookId: '550e8400-e29b-41d4-a716-446655440002' });

    const response = await POST(request);
    const data = await response.json();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('12345'),
      { method: 'GET' }
    );

    expect(response.status).toBe(200);
    expect(data).toEqual(newOptions);
  });

  it('should return 404 if the book is not found', async () => {
    prisma.book.findUnique.mockResolvedValue(null);
    const request = createMockRequest({ bookId: '550e8400-e29b-41d4-a716-446655440999' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Book not found' });
  });

  it('should return 500 on a database error', async () => {
    prisma.book.findUnique.mockRejectedValue(new Error('DB Connection Error'));
    const request = createMockRequest({ bookId: '550e8400-e29b-41d4-a716-446655440001' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});
