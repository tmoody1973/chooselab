'use client';

import { useState } from 'react';
import type { Setting, Hero, Problem, AdventureSeed } from '@/lib/adventure-types';
import { SETTINGS, HEROES, PROBLEMS } from '@/lib/adventure/catalog';

interface PickerProps {
  onStart: (seed: AdventureSeed) => void;
}

export function Picker({ onStart }: PickerProps) {
  const [setting, setSetting] = useState<Setting | null>(null);
  const [hero, setHero] = useState<Hero | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);

  const ready = setting !== null && hero !== null && problem !== null;

  function start() {
    if (!ready) return;
    onStart({ setting, hero, problem });
  }

  return (
    <div className="picker">
      <div className="picker-column">
        <h2 className="picker-heading">1 · Where?</h2>
        <p className="picker-sub">Pick a place for the adventure.</p>
        <div className="picker-cards">
          {SETTINGS.map((s) => (
            <PickerCard
              key={s.id}
              emoji={s.emoji}
              label={s.label}
              description={s.description}
              selected={setting?.id === s.id}
              onClick={() => setSetting(s)}
            />
          ))}
        </div>
      </div>

      <div className="picker-column">
        <h2 className="picker-heading">2 · Who?</h2>
        <p className="picker-sub">Pick the hero of the story.</p>
        <div className="picker-cards">
          {HEROES.map((h) => (
            <PickerCard
              key={h.id}
              emoji={h.emoji}
              label={h.label}
              description={h.description}
              selected={hero?.id === h.id}
              onClick={() => setHero(h)}
            />
          ))}
        </div>
      </div>

      <div className="picker-column">
        <h2 className="picker-heading">3 · What's the problem?</h2>
        <p className="picker-sub">Every adventure needs a tricky thing to figure out.</p>
        <div className="picker-cards">
          {PROBLEMS.map((p) => (
            <PickerCard
              key={p.id}
              emoji={p.emoji}
              label={p.label}
              description={p.description}
              selected={problem?.id === p.id}
              onClick={() => setProblem(p)}
            />
          ))}
        </div>
      </div>

      <div className="picker-cta">
        <button
          type="button"
          className="picker-start"
          onClick={start}
          disabled={!ready}
        >
          {ready ? 'Begin the adventure →' : 'Pick one of each, then begin'}
        </button>
      </div>
    </div>
  );
}

function PickerCard({
  emoji,
  label,
  description,
  selected,
  onClick,
}: {
  emoji: string;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`picker-card ${selected ? 'picker-card-selected' : ''}`}
      onClick={onClick}
    >
      <span className="picker-card-emoji">{emoji}</span>
      <span className="picker-card-label">{label}</span>
      <span className="picker-card-description">{description}</span>
    </button>
  );
}
