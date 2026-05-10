'use client';

import { useState } from 'react';
import type { AdventureSeed } from '@/lib/adventure-types';
import type { BookshelfEntry } from '@/lib/adventure/bookshelf';
import { ConversationalPicker } from '@/components/ConversationalPicker';
import { AdventureRunner } from '@/components/AdventureRunner';
import { Bookshelf } from '@/components/Bookshelf';

type View =
  | { kind: 'home' }
  | { kind: 'adventure'; seed: AdventureSeed }
  | { kind: 'bookshelf' }
  | { kind: 'reading-saved'; entry: BookshelfEntry };

export default function Home() {
  const [view, setView] = useState<View>({ kind: 'home' });

  const goHome = () => setView({ kind: 'home' });
  const startAdventure = (seed: AdventureSeed) => setView({ kind: 'adventure', seed });
  const openBookshelf = () => setView({ kind: 'bookshelf' });
  const openSavedAdventure = (entry: BookshelfEntry) =>
    setView({ kind: 'reading-saved', entry });

  return (
    <main className="page">
      <header className="header">
        <div className="header-row">
          <h1 className="title" onClick={goHome} role="button" tabIndex={0}>
            ChooseLab
          </h1>
          <nav className="header-nav">
            <button
              type="button"
              className={`nav-link ${view.kind === 'bookshelf' ? 'nav-link-active' : ''}`}
              onClick={openBookshelf}
            >
              📚 My bookshelf
            </button>
          </nav>
        </div>
        {view.kind === 'home' ? (
          <p className="tagline">
            Choose your own adventure. Pick a place, a hero, and a problem — we&apos;ll weave you a brand-new story with words, watercolor, and sound.
          </p>
        ) : null}
      </header>

      {view.kind === 'home' ? <ConversationalPicker onStart={startAdventure} /> : null}

      {view.kind === 'adventure' ? (
        <AdventureRunner seed={view.seed} onExit={goHome} />
      ) : null}

      {view.kind === 'bookshelf' ? (
        <section className="bookshelf-section">
          <Bookshelf onOpen={openSavedAdventure} />
          <button type="button" className="runner-back" onClick={goHome}>
            ← Make a new adventure
          </button>
        </section>
      ) : null}

      {view.kind === 'reading-saved' ? (
        <SavedAdventureView entry={view.entry} onBack={openBookshelf} />
      ) : null}
    </main>
  );
}

function SavedAdventureView({ entry, onBack }: { entry: BookshelfEntry; onBack: () => void }) {
  return (
    <section className="saved-adventure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="runner-cover" src={entry.coverImageUrl} alt={entry.title} />
      <h2 className="runner-finished-title">{entry.title}</h2>
      <p className="runner-finished-sub">with {entry.heroName}</p>
      <div className="saved-adventure-panels">
        {entry.panels.map((panel) => (
          <article key={panel.panelId} className="saved-panel">
            {panel.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="saved-panel-image" src={panel.imageUrl} alt={`Panel ${panel.index}`} />
            ) : null}
            <p className="saved-panel-narrator">{panel.narratorText}</p>
            {panel.thoughtBubble ? (
              <p className="saved-panel-thought">
                <span className="saved-panel-thought-label">{entry.heroName} thinks:</span>{' '}
                {panel.thoughtBubble}
              </p>
            ) : null}
          </article>
        ))}
      </div>
      <button type="button" className="runner-back" onClick={onBack}>
        ← Back to bookshelf
      </button>
    </section>
  );
}
