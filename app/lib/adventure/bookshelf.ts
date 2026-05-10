'use client';

import type { AdventureSession, PanelData, StoryArc } from '@/lib/adventure-types';

const STORAGE_KEY = 'chooselab.bookshelf.v1';
const MAX_BOOKS = 20;

export interface BookshelfEntry {
  id: string;
  title: string;
  heroName: string;
  coverImageUrl: string;
  arc: StoryArc;
  panels: PanelData[];
  createdAt: string;
}

export function loadBookshelf(): BookshelfEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BookshelfEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load bookshelf:', err);
    return [];
  }
}

export function saveBookshelf(entries: BookshelfEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = entries.slice(0, MAX_BOOKS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save bookshelf:', err);
  }
}

export function addBookToShelf(entry: BookshelfEntry): BookshelfEntry[] {
  const existing = loadBookshelf();
  const next = [entry, ...existing.filter((e) => e.id !== entry.id)];
  saveBookshelf(next);
  return next;
}

export function buildBookshelfEntry(args: {
  session: AdventureSession;
  coverImageUrl: string;
}): BookshelfEntry {
  const { session, coverImageUrl } = args;
  return {
    id: session.sessionId,
    title: session.arc.title,
    heroName: session.arc.hero.name,
    coverImageUrl,
    arc: session.arc,
    panels: session.panelHistory,
    createdAt: new Date().toISOString(),
  };
}
