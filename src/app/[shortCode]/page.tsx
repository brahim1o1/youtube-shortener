import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Link from '@/models/Link';

export default async function ShortCodePage({
  params
}: {
  params: { shortCode: string }
}) {
  await dbConnect();
  
  const link = await Link.findOne({ shortCode: params.shortCode });
  
  if (!link) {
    redirect('/');
  }

  // Update view count and add details
  await Link.findByIdAndUpdate(link._id, {
    $inc: { 'views.count': 1 },
  });

  redirect(link.originalUrl);
}