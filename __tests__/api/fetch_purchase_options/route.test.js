import { POST } from '@/app/api/fetch_purchase_options/route';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
    const mPrisma = {
        book: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        purchaseOptionCache: {
            deleteMany: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
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

global.fetch = jest.fn();

function createMockRequest(body) {
    return {
        json: jest.fn().mockResolvedValue(body),
    };
}

describe('POST /api/purchase-options', () => {
    let prisma;
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
        prisma = new PrismaClient();
    });

    it('should return existing purchase options if the cache is recent', async () => {
        const recentDate = new Date('2024-08-19T10:00:00.000Z');

        const mockBook = { id: 1, title: 'Recent Book', lastPurchaseOptionUpdatedAt: recentDate };
        const mockOptions = [{ id: 101, retailerName: 'Recent Store', price: 9.99 }];

        prisma.book.findUnique.mockResolvedValue(mockBook);
        prisma.purchaseOptionCache.findMany.mockResolvedValue(mockOptions);

        const request = createMockRequest({ bookId: 1 });

        const response = await POST(request);
        const data = await response.json();

        expect(fetch).not.toHaveBeenCalled();
        expect(prisma.book.update).not.toHaveBeenCalled();
        expect(prisma.purchaseOptionCache.findMany).toHaveBeenCalledWith({ where: { bookId: 1 } });
        expect(response.status).toBe(200);
        expect(data).toEqual(mockOptions);
    });

    it('should fetch new options if the cache is stale (more than 3 days old)', async () => {
        const staleDate = new Date('2024-08-16T10:00:00.000Z');
        const mockBook = { id: 2, ISBNumber: '12345', lastPurchaseOptionUpdatedAt: staleDate };
        const newOptions = [{ id: 201, retailerName: 'New Store', price: 15.99 }];

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

        const request = createMockRequest({ bookId: 2 });

        const response = await POST(request);
        const data = await response.json();

        expect(fetch).toHaveBeenCalledTimes(1);

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(mockBook.ISBNumber),
            { method: 'GET' }
        );

        expect(prisma.purchaseOptionCache.deleteMany).toHaveBeenCalledWith({ where: { bookId: 2 } });
        expect(prisma.purchaseOptionCache.create).toHaveBeenCalledTimes(1);
        expect(prisma.purchaseOptionCache.create).toHaveBeenCalledWith({
            data: { bookId: 2, retailerName: 'New Store', price: 15.99, url: 'http://newstore.com' },
        });
        expect(prisma.book.update).toHaveBeenCalledWith({
            where: { id: 2 },
            data: { lastPurchaseOptionUpdatedAt: MOCK_DATE },
        });
        expect(response.status).toBe(200);
        expect(data).toEqual(newOptions);
    });

    it('should return 404 if the book is not found', async () => {
        prisma.book.findUnique.mockResolvedValue(null);
        const request = createMockRequest({ bookId: 999 });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Book not found' });
    });

    it('should handle external API failures gracefully when cache is stale', async () => {
        const staleDate = new Date('2024-08-16T10:00:00.000Z');
        const mockBook = { id: 3, title: 'Failure Book', lastPurchaseOptionUpdatedAt: staleDate };

        prisma.book.findUnique.mockResolvedValue(mockBook);
        fetch.mockResolvedValue({ ok: false });
        prisma.purchaseOptionCache.findMany.mockResolvedValue([]); 
        
        const request = createMockRequest({ bookId: 3 });

        const response = await POST(request);
        const data = await response.json();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(prisma.purchaseOptionCache.create).not.toHaveBeenCalled();
        expect(prisma.book.update).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(data).toEqual([]);
    });

    it('should return 500 on a database error', async () => {
        prisma.book.findUnique.mockRejectedValue(new Error('DB Connection Error'));
        const request = createMockRequest({ bookId: 1 });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Internal server error' });
    });
});