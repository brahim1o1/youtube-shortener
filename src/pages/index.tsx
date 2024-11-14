import { YouTubeLinkShortener } from '@/components/YouTubeLinkShortener';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          YouTube Link Shortener
        </h1>
        <YouTubeLinkShortener />
      </div>
    </div>
  );
}