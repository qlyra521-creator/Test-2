export type UserId = 'shiyun' | 'tim';
export type MemoryType = 'daily' | 'travel' | 'anniversary' | 'special' | 'note';
export type ViewMode = 'mine' | 'partner' | 'merged';
export type Theme = 'purple' | 'mint';
export type AppView = 'grid' | 'letters';

export interface Memory {
  id: string;
  date: string; // YYYY-MM-DD
  author: UserId;
  type: MemoryType;
  title: string;
  content: string;
  photos: string[]; // base64 data URLs
  voiceNote?: string; // base64 audio data URL
  location?: string;
  dayOfJourney: number;
}

export interface Letter {
  id: string;
  from: UserId;
  to: UserId;
  title: string;
  content: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  createdAt: string; // ISO timestamp
  isRead: boolean;
}

export const MEMORY_COLORS: Record<MemoryType, string> = {
  daily: '#DEB887',
  travel: '#7DAFC8',
  anniversary: '#C97EA0',
  special: '#D4937A',
  note: '#9AACAA',
};

export const MEMORY_LABELS: Record<MemoryType, string> = {
  daily: '日常',
  travel: '旅行',
  anniversary: '纪念日',
  special: '特别',
  note: '随记',
};

export const USER_NAMES: Record<UserId, string> = {
  shiyun: 'Shiyun',
  tim: 'Tim',
};

export const PARTNER: Record<UserId, UserId> = {
  shiyun: 'tim',
  tim: 'shiyun',
};

export const START_DATE = new Date(2024, 3, 29); // April 29, 2024
