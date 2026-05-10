'use client';

import { useEffect, useState } from 'react';
import { loadBookshelf, type BookshelfEntry } from '@/lib/adventure/bookshelf';
import { SAMPLE_BOOKSHELF } from '@/lib/adventure/sample-bookshelf';

interface BookshelfProps {
  onOpen: (entry: BookshelfEntry) => void;
}

export function Bookshelf({ onOpen }: BookshelfProps) {
  const [userEntries, setUserEntries] = useState<BookshelfEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUserEntries(loadBookshelf());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="bookshelf-empty">
        <p>Loading your adventures...</p>
      </div>
    );
  }

  const hasUserEntries = userEntries.length > 0;

  return (
    <>
      {hasUserEntries ? (
        <div className="bookshelf">
          {userEntries.map((entry) => (
            <BookshelfCard key={entry.id} entry={entry} onOpen={onOpen} />
          ))}
        </div>
      ) : null}

      <div className="bookshelf-section-divider">
        <span>{hasUserEntries ? 'Sample stories' : 'Try a sample story'}</span>
      </div>

      <div className="bookshelf">
        {SAMPLE_BOOKSHELF.map((entry) => (
          <BookshelfCard key={entry.id} entry={entry} onOpen={onOpen} isSample />
        ))}
      </div>

      {!hasUserEntries ? (
        <p className="bookshelf-empty-text">
          When you make your first adventure, it will live here too.
        </p>
      ) : null}
    </>
  );
}

function BookshelfCard({
  entry,
  onOpen,
  isSample,
}: {
  entry: BookshelfEntry;
  onOpen: (entry: BookshelfEntry) => void;
  isSample?: boolean;
}) {
  return (
    <button type="button" className="bookshelf-card" onClick={() => onOpen(entry)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="bookshelf-cover" src={entry.coverImageUrl} alt={entry.title} />
      <div className="bookshelf-meta">
        <h3 className="bookshelf-title">{entry.title}</h3>
        <p className="bookshelf-sub">
          with {entry.heroName}
          {isSample ? <span className="bookshelf-sample-badge">sample</span> : null}
        </p>
        <p className="bookshelf-date">{formatDate(entry.createdAt)}</p>
      </div>
    </button>
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
