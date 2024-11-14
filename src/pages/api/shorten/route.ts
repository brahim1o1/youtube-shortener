import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Link from '@/models/Link';
import { LinkService } from '@/services/LinkService';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { message: 'URL is required' },
        { status: 400 }
      );
    }

    const linkService = new LinkService();
    const { isValid, type } = linkService.isValidYouTubeUrl(url);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    if (type === 'channel') {
      return NextResponse.json(
        { message: 'Channel links are not supported' },
        { status: 400 }
      );
    }

    const videoId = linkService.extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { message: 'Could not extract video ID' },
        { status: 400 }
      );
    }

    // Check existing links count
    const existingLinksCount = await Link.countDocuments({ isActive: true });
    if (existingLinksCount >= 6) {
      return NextResponse.json(
        { message: 'Free tier limit reached (6 links)' },
        { status: 400 }
      );
    }

    // Generate unique shortcode
    let shortCode = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      shortCode = generateShortCode();
      const existingLink = await Link.findOne({ shortCode });
      if (!existingLink) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { message: 'Failed to generate unique code' },
        { status: 500 }
      );
    }

    const newLink = new Link({
      shortCode,
      originalUrl: url,
      videoId,
      urlType: type,
      views: {
        count: 0,
        details: []
      }
    });

    await newLink.save();
    return NextResponse.json(newLink);
  } catch (error) {
    console.error('Error in /api/shorten:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}