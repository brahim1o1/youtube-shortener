import { GetServerSideProps } from 'next';
import dbConnect from '../lib/mongodb';
import Link from '../models/Link';

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  await dbConnect();

  const shortCode = params?.shortCode as string;
  const link = await Link.findOne({ shortCode });

  if (!link) {
    return {
      notFound: true
    };
  }

  // Update view count and add details
  const userAgent = req.headers['user-agent'] || '';
  const referrer = req.headers['referer'] || '';
  const isMobile = /mobile/i.test(userAgent);

  await Link.findByIdAndUpdate(link._id, {
    $inc: { 'views.count': 1 },
    $push: {
      'views.details': {
        timestamp: new Date(),
        referrer,
        device: isMobile ? 'mobile' : 'desktop'
      }
    }
  });

  // Construct YouTube URL based on device type
  let redirectUrl = link.originalUrl;
  if (isMobile) {
    // For mobile, use YouTube app deep linking
    redirectUrl = `vnd.youtube://${link.videoId}`;
  }

  return {
    redirect: {
      destination: redirectUrl,
      permanent: false,
    }
  };
};

export default function ShortCodePage() {
  return null; // This page will never be rendered as it always redirects
}