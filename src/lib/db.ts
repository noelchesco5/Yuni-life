import Dexie, { type EntityTable } from 'dexie';

// ---- Types ----

export interface Profile {
  id?: number;
  userId: string;
  role: 'student' | 'leader' | 'admin';
  programme: string;
  year: number;
  interests: string[];
  lang: 'en' | 'sw';
  createdAt: Date;
}

export interface TimetableEntry {
  id?: number;
  courseCode: string;
  courseName: string;
  day: number; // 0=Sunday
  startTime: string; // "08:00"
  endTime: string;   // "10:00"
  venue: string;
  semester: string;
}

export interface Announcement {
  id?: number;
  remoteId: string;
  title: string;
  body: string;
  scope: string;
  pinned: boolean;
  urgent: boolean;
  authorName: string;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface WriteQueueItem {
  id?: number;
  type: 'vote' | 'form_response' | 'post';
  payload: Record<string, unknown>;
  idempotencyKey: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retries: number;
  createdAt: Date;
  syncedAt: Date | null;
}

export interface BundleVersion {
  id?: number;
  bundleName: string;
  version: string;
  lastUpdated: Date;
}

// ---- Database ----

export class YuniDB extends Dexie {
  profiles!: EntityTable<Profile, 'id'>;
  timetable!: EntityTable<TimetableEntry, 'id'>;
  announcements!: EntityTable<Announcement, 'id'>;
  writeQueue!: EntityTable<WriteQueueItem, 'id'>;
  bundleVersions!: EntityTable<BundleVersion, 'id'>;

  constructor() {
    super('YuniDB');

    this.version(1).stores({
      profiles: '++id, userId, role',
      timetable: '++id, courseCode, day, semester',
      announcements: '++id, remoteId, scope, pinned, createdAt',
      writeQueue: '++id, type, status, idempotencyKey, createdAt',
      bundleVersions: '++id, bundleName',
    });
  }
}

export const db = new YuniDB();
