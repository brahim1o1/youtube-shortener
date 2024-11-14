import { YouTubeLinkShortener } from '@/components/YouTubeLinkShortener';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            YouTube Link Shortener
          </h1>
          <p className="text-lg text-gray-600">
            Create short, trackable links for your YouTube videos
          </p>
        </div>
        <YouTubeLinkShortener />
      </div>
    </div>
  );
}