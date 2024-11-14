import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Link from '@/models/Link';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { shortCode } = req.query;

  await dbConnect();

  switch (req.method) {
    case 'DELETE':
      try {
        const deletedLink = await Link.findOneAndUpdate(
          { shortCode },
          { isActive: false },
          { new: true }
        );

        if (!deletedLink) {
          return res.status(404).json({ error: 'Link not found' });
        }

        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete link' });
      }
      break;

    default:
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}