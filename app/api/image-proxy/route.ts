import { NextRequest, NextResponse } from 'next/server';

// This function handles GET requests to /api/image-proxy
export async function GET(request: NextRequest) {
  // Get the 'url' search parameter from the request URL
  const imageUrl = request.nextUrl.searchParams.get('url');

  // If the 'url' parameter is missing, return a 400 Bad Request response
  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Image URL is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch the image from the provided URL
    const imageResponse = await fetch(imageUrl);

    // Check if the fetch was successful
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image. Status: ${imageResponse.status}`);
    }
    
    // Get the image content as an ArrayBuffer
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Get the content type from the original response, defaulting if not present
    const contentType = imageResponse.headers.get('content-type') || 'application/octet-stream';
    
    // Return a new Response with the image buffer and correct headers
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Optional: Add caching headers
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
    
  } catch (error) {
    // Log the error for debugging purposes on the server
    console.error(error);

    // If any error occurs, return a 500 Internal Server Error response
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: `Internal Server Error: ${message}` },
      { status: 500 }
    );
  }
}
