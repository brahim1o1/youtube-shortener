'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Copy } from 'lucide-react';

interface ShortenedLink {
  _id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  views: {
    count: number;
    details: Array<{
      timestamp: string;
      referrer: string;
      device: string;
    }>;
  };
  videoId: string;
  urlType: 'video' | 'shorts';
  isActive: boolean;
}

export function YouTubeLinkShortener() {
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch links');
      }
      const data = await response.json();
      setLinks(data);
    } catch (err) {
      console.error('Error fetching links:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch links');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: inputUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create short link');
      }

      const newLink = await response.json();
      setLinks(prevLinks => [...prevLinks, newLink]);
      setInputUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (shortCode: string) => {
    const linkUrl = `${window.location.origin}/${shortCode}`;
    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopySuccess(shortCode);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = async (shortCode: string) => {
    try {
      const response = await fetch(`/api/links/${shortCode}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete link');
      }

      setLinks(prevLinks => prevLinks.filter(link => link.shortCode !== shortCode));
    } catch (err) {
      console.error('Error deleting link:', err);
    }
  };

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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {links.map((link) => (
            <div 
              key={link.shortCode} 
              className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
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
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Short
                    </div>
                  )}
                </a>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <a 
                    href={`/${link.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-blue-500 transition-colors duration-200"
                  >
                    watchbnd/{link.shortCode}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {link.views.count} views
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopy(link.shortCode)}
                      className="text-xs p-1 text-gray-600 hover:text-blue-500 rounded transition-colors duration-200"
                      title="Copy link"
                    >
                      <Copy size={14} />
                      {copySuccess === link.shortCode && (
                        <span className="absolute ml-1 text-green-500">✓</span>
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