import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByIp } from '@/app/lib/rate-limit';

const ALLOWED_HOSTS = ['books.google.com'];

export async function GET(request: NextRequest) {
  const limit = await rateLimitByIp('image_proxy', 60_000, 100)
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const imageUrl = request.nextUrl.searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Image URL is required' },
      { status: 400 }
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json(
      { error: 'Invalid URL' },
      { status: 400 }
    );
  }

  if (!ALLOWED_HOSTS.includes(parsedUrl.hostname.toLowerCase())) {
    return NextResponse.json(
      { error: "Only books.google.com images are allowed." },
      { status: 403 }
    );
  }

  if (parsedUrl.protocol !== 'https:') {
    return NextResponse.json(
      { error: "Only HTTPS URLs are allowed." },
      { status: 403 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const imageResponse = await fetch(imageUrl, {
        signal: controller.signal,
      });

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
    } finally {
      clearTimeout(timeout);
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error.' },
      { status: 500 }
    );
  }
}
