export class LinkService {
    private readonly CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    private readonly CODE_LENGTH = 6;
  
    isValidYouTubeUrl(url: string): { isValid: boolean; type: string | null } {
      // Regular YouTube video
      const standardVideo = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=)[\w-]{11}.*$/;
      
      // Shortened youtu.be format
      const shortUrl = /^(https?:\/\/)?(youtu\.be\/)[\w-]{11}.*$/;
      
      // YouTube Shorts
      const shorts = /^(https?:\/\/)?(www\.)?(youtube\.com\/shorts\/)[\w-]{11}.*$/;
      
      // YouTube channel
      const channel = /^(https?:\/\/)?(www\.)?(youtube\.com\/@)[\w-]+.*$/;
  
      if (standardVideo.test(url)) return { isValid: true, type: 'video' };
      if (shortUrl.test(url)) return { isValid: true, type: 'video' };
      if (shorts.test(url)) return { isValid: true, type: 'shorts' };
      if (channel.test(url)) return { isValid: true, type: 'channel' };
  
      return { isValid: false, type: null };
    }
  
    extractVideoId(url: string): string {
      // Match patterns for different YouTube URL formats
      const patterns = [
        // Standard YouTube URL
        /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
        // Shortened youtu.be URL
        /(?:youtu\.be\/)([\w-]{11})/,
        // YouTube Shorts URL
        /(?:youtube\.com\/shorts\/)([\w-]{11})/
      ];
  
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
  
      // For channel URLs, return null as they don't have video IDs
      if (url.includes('youtube.com/@')) {
        return '';
      }
  
      // Remove any additional parameters (like ?si=...)
      const basicUrl = url.split('?')[0];
      const lastPart = basicUrl.split('/').pop();
      if (lastPart && lastPart.length === 11) {
        return lastPart;
      }
  
      return '';
    }
  
    async createShortLink(originalUrl: string, videoId: string) {
      const shortCode = this.generateShortCode();
      const urlType = this.isValidYouTubeUrl(originalUrl).type;
      
      return {
        originalUrl,
        shortCode,
        createdAt: new Date().toISOString(),
        viewCount: 0,
        videoId,
        urlType,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
      };
    }
  
    private generateShortCode(): string {
      let shortCode = '';
      for (let i = 0; i < this.CODE_LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * this.CHARS.length);
        shortCode += this.CHARS[randomIndex];
      }
      return shortCode;
    }
  
    getExistingLinks() {
      try {
        const savedLinks = localStorage.getItem('youtube_links');
        return savedLinks ? JSON.parse(savedLinks) : [];
      } catch (e) {
        console.error('Error loading links:', e);
        return [];
      }
    }
  }