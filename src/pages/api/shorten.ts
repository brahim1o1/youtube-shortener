import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Link from '@/models/Link';
import { LinkService } from '@/services/LinkService';

function generateUniqueCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    const linkService = new LinkService();
    const { isValid, type } = linkService.isValidYouTubeUrl(url);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    if (type === 'channel') {
      return res.status(400).json({ message: 'Channel links are not supported' });
    }

    const videoId = linkService.extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ message: 'Could not extract video ID' });
    }

    // Check existing links count
    const existingLinksCount = await Link.countDocuments({ isActive: true });
    if (existingLinksCount >= 6) {
      return res.status(400).json({ message: 'Free tier limit reached (6 links)' });
    }

    // Generate unique shortcode
    let shortCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      shortCode = generateUniqueCode();
      const existingLink = await Link.findOne({ shortCode });
      if (!existingLink) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ message: 'Failed to generate unique code' });
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

    res.status(200).json(newLink);
  } catch (error) {
    console.error('Error in /api/shorten:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}