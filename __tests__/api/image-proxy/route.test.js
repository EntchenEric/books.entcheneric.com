import { GET } from '@/app/api/image-proxy/route'; // Adjust import path

// We only need to mock NextResponse now
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
  // We let the real Response constructor work, as jest-fetch-mock handles it
  Response: jest.requireActual('next/server').Response,
}));

// A simple helper to create the request object
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
    // Reset the fetch mock before each test
    fetch.resetMocks();
  });

  it('should successfully proxy a valid image from Google Books', async () => {
    // Arrange
    const imageUrl = 'http://books.google.com/books/content?id=123';
    const mockImageBuffer = Buffer.from('mock-image-data');
    const mockContentType = 'image/jpeg';

    // Mock the fetch call using jest-fetch-mock
    fetch.mockResponseOnce(mockImageBuffer, {
        headers: { 'Content-Type': mockContentType },
    });

    const request = createMockRequest({ url: imageUrl });

    // Act
    const response = await GET(request);

    // Assert
    expect(fetch).toHaveBeenCalledWith(imageUrl);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(mockContentType);
    
    // Check the buffer content
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
    // Mock a failed fetch (e.g., 404)
    fetch.mockResponseOnce('', { status: 404 });
    const request = createMockRequest({ url: imageUrl });

    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal Server Error.' });
  });
});