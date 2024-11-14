import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import Link from '../../models/Link';
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { url } = req.body;
    const linkService = new LinkService();
    const { isValid, type } = linkService.isValidYouTubeUrl(url);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const videoId = linkService.extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Could not extract video ID' });
    }

    // Generate a unique short code
    let shortCode;
    let isUnique = false;
    while (!isUnique) {
      shortCode = generateUniqueCode();
      const existingLink = await Link.findOne({ shortCode });
      if (!existingLink) {
        isUnique = true;
      }
    }

    const newLink = new Link({
      shortCode,
      originalUrl: url,
      videoId,
      urlType: type,
    });

    await newLink.save();

    res.status(200).json(newLink);
  } catch (error) {
    console.error('Error in /api/shorten:', error);
    res.status(500).json({ error: 'Failed to create short link' });
  }
}