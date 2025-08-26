import { GET } from '@/app/api/image-proxy/route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
  Response: jest.requireActual('next/server').Response,
}));

function createMockRequest(searchParams) {
  const url = new URL('http://localhost');
  for (const key in searchParams) {
    url.searchParams.set(key, searchParams[key]);
  }
  return {
    nextUrl: url,
  };
}


describe('GET /api/image-proxy', () => {

  beforeEach(() => {
    fetch.resetMocks();
  });

  it('should successfully proxy a valid image from Google Books', async () => {
    const imageUrl = 'http://books.google.com/books/content?id=123';
    const mockImageBuffer = Buffer.from('mock-image-data');
    const mockContentType = 'image/jpeg';

    fetch.mockResponseOnce(mockImageBuffer, {
        headers: { 'Content-Type': mockContentType },
    });

    const request = createMockRequest({ url: imageUrl });

    const response = await GET(request);

    expect(fetch).toHaveBeenCalledWith(imageUrl);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(mockContentType);
    
    const responseBuffer = Buffer.from(await response.arrayBuffer());
    expect(responseBuffer).toEqual(mockImageBuffer);
  });

  it('should return a 400 error if the "url" parameter is missing', async () => {
    const request = createMockRequest({});
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Image URL is required' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should return a 500 error if the image fetch fails', async () => {
    const imageUrl = 'http://books.google.com/books/content?id=not-found';
    fetch.mockResponseOnce('', { status: 404 });
    const request = createMockRequest({ url: imageUrl });

    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal Server Error.' });
  });
});