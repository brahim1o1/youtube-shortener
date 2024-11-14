'use client';

import React, { useState, useEffect } from 'react';
import { LinkService } from '@/services/LinkService';
import { Trash2, Copy } from 'lucide-react';

interface ShortenedLink {
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  viewCount: number;
  thumbnailUrl: string;
  videoId: string;
  urlType?: string | null;
}

export function YouTubeLinkShortener() {
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedLinks = localStorage.getItem('youtube_links');
    if (savedLinks) {
      try {
        const parsedLinks = JSON.parse(savedLinks);
        setLinks(parsedLinks);
      } catch (e) {
        console.error('Error loading saved links:', e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const linkService = new LinkService();
      const { isValid, type } = linkService.isValidYouTubeUrl(inputUrl);
      
      if (!isValid) {
        throw new Error('Please enter a valid YouTube URL');
      }

      if (type === 'channel') {
        throw new Error('Channel links are not supported for shortening');
      }

      if (links.length >= 6) {
        throw new Error('Free tier limit reached (6 links)');
      }

      const videoId = linkService.extractVideoId(inputUrl);
      if (!videoId) {
        throw new Error('Could not extract video ID from URL');
      }

      const newLink = await linkService.createShortLink(inputUrl, videoId);

      setLinks(prevLinks => {
        const updatedLinks = [...prevLinks, newLink];
        localStorage.setItem('youtube_links', JSON.stringify(updatedLinks));
        return updatedLinks;
      });

      setInputUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (shortCode: string) => {
    navigator.clipboard.writeText(`owlooe.com/${shortCode}`);
    setCopySuccess(shortCode);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleDelete = (shortCode: string) => {
    setLinks(prevLinks => {
      const updatedLinks = prevLinks.filter(link => link.shortCode !== shortCode);
      localStorage.setItem('youtube_links', JSON.stringify(updatedLinks));
      return updatedLinks;
    });
  };

  if (!isClient) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-lg mb-8"></div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg aspect-w-16 aspect-h-9"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste your YouTube link here..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
            disabled={isLoading || links.length >= 6}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-red-500 text-sm">{error}</p>
        )}
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900">My Links ({links.length}/6)</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {links.map((link, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 relative"
              style={{
                background: 'linear-gradient(white, white) padding-box, linear-gradient(45deg, #2563eb, #1e3a8a) border-box',
                border: '2px solid transparent'
              }}
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                <a 
                  href={`/${link.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${link.videoId}/mqdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  {link.urlType === 'shorts' && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                      Short
                    </div>
                  )}
                </a>
              </div>
              <div className="p-2">
                <div className="flex items-center justify-between mb-1">
                  <a 
                    href={`/${link.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-blue-500 transition-colors duration-200"
                  >
                    owlooe/{link.shortCode}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {link.viewCount} views
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopy(link.shortCode)}
                      className="text-xs p-1 text-gray-600 hover:text-blue-500 rounded transition-colors duration-200"
                      title="Copy link"
                    >
                      <Copy size={14} />
                      {copySuccess === link.shortCode && (
                        <span className="text-green-500 absolute ml-1">✓</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(link.shortCode)}
                      className="text-xs p-1 text-gray-600 hover:text-blue-500 rounded transition-colors duration-200"
                      title="Delete link"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}