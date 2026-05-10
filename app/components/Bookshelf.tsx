'use client';

import { useEffect, useState } from 'react';
import { loadBookshelf, type BookshelfEntry } from '@/lib/adventure/bookshelf';

interface BookshelfProps {
  onOpen: (entry: BookshelfEntry) => void;
}

export function Bookshelf({ onOpen }: BookshelfProps) {
  const [entries, setEntries] = useState<BookshelfEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEntries(loadBookshelf());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="bookshelf-empty">
        <p>Loading your adventures...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bookshelf-empty">
        <h2 className="bookshelf-empty-heading">No adventures yet</h2>
        <p className="bookshelf-empty-text">Make your first story and it will live here. You can come back to read it any time.</p>
      </div>
    );
  }

  return (
    <div className="bookshelf">
      {entries.map((entry) => (
        <button key={entry.id} type="button" className="bookshelf-card" onClick={() => onOpen(entry)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="bookshelf-cover" src={entry.coverImageUrl} alt={entry.title} />
          <div className="bookshelf-meta">
            <h3 className="bookshelf-title">{entry.title}</h3>
            <p className="bookshelf-sub">with {entry.heroName}</p>
            <p className="bookshelf-date">{formatDate(entry.createdAt)}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}
