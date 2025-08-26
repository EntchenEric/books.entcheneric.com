import { POST } from '@/app/api/search_books/route';
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

global.fetch = jest.fn();

describe('POST /api/search_books', () => {
  let prisma;

  const originalEnv = process.env;
  beforeAll(() => {
    process.env = { ...originalEnv, GOOGLE_API_KEY: 'test-api-key' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaClient();
    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ items: [] }),
    });
  });

  it('should return a list of books for a basic query', async () => {
    const mockBooks = Array.from({ length: 25 }, (_, i) => ({ id: `book${i}`, volumeInfo: { title: `Book ${i}` } }));
    
    prisma.user.findUnique.mockResolvedValueOnce({ books: [] });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ items: mockBooks }),
    });

    const request = createMockRequest({ userId: 1, query: 'fantasy' });
    
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items.length).toBe(25);
    expect(data.items[0].id).toBe('book0');
    expect(fetch).toHaveBeenCalledTimes(1);
    const fetchUrl = fetch.mock.calls[0][0];
    expect(fetchUrl).toContain('q=fantasy');
    expect(fetchUrl).not.toContain('inauthor');
  });

  it('should correctly add the author to the search query', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ books: [] });

    const request = createMockRequest({ userId: 1, query: 'dune', author: 'herbert' });
    await POST(request);

    expect(fetch).toHaveBeenCalledTimes(1);
    const fetchUrl = fetch.mock.calls[0][0];
    expect(fetchUrl).toContain(encodeURIComponent('dune+inauthor:herbert'));
  });

  it('should filter out books that the user already has', async () => {
    const userBooks = [{ googleBookId: 'existing_book_1' }];
    const apiBooks = [
      { id: 'existing_book_1', volumeInfo: { title: 'Existing Book' } },
      { id: 'new_book_1', volumeInfo: { title: 'New Book 1' } },
      { id: 'new_book_2', volumeInfo: { title: 'New Book 2' } },
    ];
    prisma.user.findUnique.mockResolvedValueOnce({ books: userBooks });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ items: apiBooks }),
    });

    const request = createMockRequest({ userId: 1, query: 'sci-fi' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items.length).toBe(2);
    expect(data.items.map(b => b.id)).toEqual(['new_book_1', 'new_book_2']);
  });

  it('should fetch multiple pages if the first page has fewer than 20 results', async () => {
    const page1Books = Array.from({ length: 10 }, (_, i) => ({ id: `p1_book${i}` }));
    const page2Books = Array.from({ length: 15 }, (_, i) => ({ id: `p2_book${i}` }));

    prisma.user.findUnique.mockResolvedValueOnce({ books: [] });
    fetch
      .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce({ items: page1Books }) })
      .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce({ items: page2Books }) });

    const request = createMockRequest({ userId: 1, query: 'history' });
    const response = await POST(request);
    const data = await response.json();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0][0]).toContain('startIndex=0');
    expect(fetch.mock.calls[1][0]).toContain('startIndex=40');
    expect(response.status).toBe(200);
    expect(data.items.length).toBe(25);
  });

  it('should handle API fetch errors gracefully', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ books: [] });
    fetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const request = createMockRequest({ userId: 1, query: 'error-query' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items.length).toBe(0);
  });

  it('should return a 500 status if the database query fails', async () => {
    prisma.user.findUnique.mockRejectedValueOnce(new Error('Database error'));

    const request = createMockRequest({ userId: 1, query: 'any-query' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ message: 'Internal server error' });
  });

  it('should handle cases where the Google Books API returns no items', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ books: [] });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ items: null }),
    });
    
    const request = createMockRequest({ userId: 1, query: 'a-very-obscure-book-title' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items.length).toBe(0);
  });
});