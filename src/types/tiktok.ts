/**
 * Types pour l'application KAYDO TIKTOK DOWNLOADER
 */

export type TikTokContentType = 'video' | 'photo_carousel' | 'profile' | 'music' | 'unsupported';

export interface TikTokAuthor {
  id?: string;
  uniqueId: string; // @username
  nickname: string;
  avatar: string;
  signature?: string;
  verified?: boolean;
  followingCount?: number;
  followerCount?: number;
  heartCount?: number;
  videoCount?: number;
}

export interface TikTokStats {
  plays: number;
  likes: number;
  comments: number;
  shares: number;
  downloads?: number;
}

export interface TikTokMusic {
  id?: string;
  title: string;
  author: string;
  playUrl: string;
  cover?: string;
  duration?: number;
}

export interface TikTokVideoData {
  id: string;
  type: 'video';
  title: string;
  cover: string;
  originCover?: string;
  duration: number; // in seconds
  createdAt?: number; // timestamp
  author: TikTokAuthor;
  stats: TikTokStats;
  music?: TikTokMusic;
  downloadUrls: {
    noWatermark: string;
    noWatermarkHd?: string;
    music?: string;
  };
  originalUrl: string;
}

export interface TikTokPhotoCarouselData {
  id: string;
  type: 'photo_carousel';
  title: string;
  cover: string;
  images: string[];
  imageCount: number;
  createdAt?: number;
  author: TikTokAuthor;
  stats: TikTokStats;
  music?: TikTokMusic;
  originalUrl: string;
}

export interface TikTokProfilePost {
  id: string;
  title: string;
  cover: string;
  duration?: number;
  playCount?: number;
  diggCount?: number;
  videoUrl?: string;
  webVideoUrl: string;
  type: 'video' | 'photo_carousel';
}

export interface TikTokProfileData {
  id?: string;
  type: 'profile';
  author: TikTokAuthor;
  posts: TikTokProfilePost[];
  totalPosts: number;
  originalUrl: string;
}

export interface TikTokUnsupportedData {
  type: 'unsupported';
  reason: string;
  originalUrl: string;
  resolvedUrl?: string;
  detectedType?: string;
}

export type TikTokAnalysisResult = 
  | TikTokVideoData 
  | TikTokPhotoCarouselData 
  | TikTokProfileData 
  | TikTokUnsupportedData;

export interface HistoryItem {
  id: string;
  contentType: TikTokContentType;
  title: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  thumbnail: string;
  date: number;
  originalUrl: string;
  mediaCount?: number; // for carousels
}
