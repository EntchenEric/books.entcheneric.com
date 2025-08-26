import { POST } from '@/app/api/fetch_purchase_options/route'; // Adjust the import path
import { PrismaClient } from '@prisma/client';

// Mock the Prisma client
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

// Mock next/server
jest.mock('next/server', () => ({
    NextResponse: {
        json: (data, init) => ({
            status: init?.status ?? 200,
            json: async () => data,
        }),
    },
}));

// Mock the global fetch function
global.fetch = jest.fn();

// Helper to create a mock NextRequest
function createMockRequest(body) {
    return {
        json: jest.fn().mockResolvedValue(body),
    };
}

describe('POST /api/purchase-options', () => {
    let prisma;
    const mockSerpApiKey = 'test-serp-api-key';

    const MOCK_DATE = new Date('2024-08-20T10:00:00.000Z');
    const RealDate = Date; // Save the original Date class


    beforeAll(() => {
        process.env.SERP_API_KEY = mockSerpApiKey;

        // Create a mock Date class
        global.Date = class extends RealDate {
            constructor(dateString) {
                // If the constructor is called with a date string, use it.
                // This allows `new Date('2024-08-19')` to work as expected.
                if (dateString) {
                    super(dateString);
                } else {
                    // Otherwise, if `new Date()` is called with no arguments,
                    // use our fixed MOCK_DATE. This is the key fix.
                    super(MOCK_DATE);
                }
            }
        };
    });
    afterAll(() => {
        global.Date = RealDate; // Restore the original Date class after all tests
    });

    beforeEach(() => {
        jest.clearAllMocks();
        prisma = new PrismaClient();
    });
    // in __tests__/api/fetch_purchase_options.test.js

    it('should return existing purchase options if the cache is recent', async () => {
        // Arrange: Updated 1 day ago (less than 3 days)
        const recentDate = new Date('2024-08-19T10:00:00.000Z');

        // FIX: Added a title to the mock book object.
        const mockBook = { id: 1, title: 'Recent Book', lastPurchaseOptionUpdatedAt: recentDate };
        const mockOptions = [{ id: 101, retailerName: 'Recent Store', price: 9.99 }];

        prisma.book.findUnique.mockResolvedValue(mockBook);
        prisma.purchaseOptionCache.findMany.mockResolvedValue(mockOptions);

        const request = createMockRequest({ bookId: 1 });

        // Act
        const response = await POST(request);
        const data = await response.json();

        // Assert
        expect(fetch).not.toHaveBeenCalled(); // This assertion should now pass
        expect(prisma.book.update).not.toHaveBeenCalled();
        expect(prisma.purchaseOptionCache.findMany).toHaveBeenCalledWith({ where: { bookId: 1 } });
        expect(response.status).toBe(200);
        expect(data).toEqual(mockOptions);
    });

    // ---

    it('should fetch new options if the cache is stale (more than 3 days old)', async () => {
        // Arrange
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

        // Act
        const response = await POST(request);
        const data = await response.json();

        // Assert
        expect(fetch).toHaveBeenCalledTimes(1);

        // FIX: Added the second argument to the matcher.
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
        // Arrange
        prisma.book.findUnique.mockResolvedValue(null);
        const request = createMockRequest({ bookId: 999 });

        // Act
        const response = await POST(request);
        const data = await response.json();

        // Assert
        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Book not found' });
    });

    it('should handle external API failures gracefully when cache is stale', async () => {
        // Arrange
        const staleDate = new Date('2024-08-16T10:00:00.000Z');
        const mockBook = { id: 3, title: 'Failure Book', lastPurchaseOptionUpdatedAt: staleDate };

        prisma.book.findUnique.mockResolvedValue(mockBook);
        fetch.mockResolvedValue({ ok: false }); // Simulate a failed fetch
        prisma.purchaseOptionCache.findMany.mockResolvedValue([]); // No new options were created

        const request = createMockRequest({ bookId: 3 });

        // Act
        const response = await POST(request);
        const data = await response.json();

        // Assert
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(prisma.purchaseOptionCache.create).not.toHaveBeenCalled(); // No options should be created
        expect(prisma.book.update).toHaveBeenCalled(); // The timestamp should still be updated
        expect(response.status).toBe(200);
        expect(data).toEqual([]); // Returns an empty array of options
    });

    it('should return 500 on a database error', async () => {
        // Arrange
        prisma.book.findUnique.mockRejectedValue(new Error('DB Connection Error'));
        const request = createMockRequest({ bookId: 1 });

        // Act
        const response = await POST(request);
        const data = await response.json();

        // Assert
        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Internal server error' });
    });
});