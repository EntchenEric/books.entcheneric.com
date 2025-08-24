import { error } from 'console';
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'path';

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Image URL is required' },
      { status: 400 }
    );
  }

  const parsedUrl = new URL(imageUrl)

  if (parsedUrl.hostname != 'books.google.com') {
    return NextResponse.json(
      {error: "Only google.books images are allowed."}
    )
  }

  try {
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image. Status: ${imageResponse.status}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    
    const contentType = imageResponse.headers.get('content-type') || 'application/octet-stream';
    
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error.' },
      { status: 500 }
    );
  }
}
