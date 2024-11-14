import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Link from '@/models/Link';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const links = await Link.find({ isActive: true })
          .sort({ createdAt: -1 })
          .limit(6);
        res.status(200).json(links);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch links' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  // Add this temporarily to your /api/links.ts to verify connection:
console.log('MongoDB URI:', process.env.MONGODB_URI?.substring(0, 20) + '...');
}