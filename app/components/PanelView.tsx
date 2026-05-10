'use client';

import { useEffect, useRef, useState } from 'react';
import type { PanelData, Choice } from '@/lib/adventure-types';

interface PanelViewProps {
  panel: PanelData;
  heroName: string;
  isFinalPanel: boolean;
  onChoose: (choice: Choice) => void;
  onFinish: () => void;
}

export function PanelView({ panel, heroName, isFinalPanel, onChoose, onFinish }: PanelViewProps) {
  const narrationRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);

  useEffect(() => {
    setAudioStarted(false);
  }, [panel.panelId]);

  function startAudio() {
    if (audioStarted) return;
    setAudioStarted(true);
    narrationRef.current?.play().catch(() => {});
    if (ambientRef.current) {
      ambientRef.current.volume = 0.35;
      ambientRef.current.play().catch(() => {});
    }
  }

  return (
    <article className="panel-view" onClick={startAudio}>
      <div className="panel-stage">
        {panel.videoUrl ? (
          <video
            className="panel-image panel-video"
            src={panel.videoUrl}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : panel.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="panel-image" src={panel.imageUrl} alt={`Scene from panel ${panel.index}`} />
        ) : (
          <div className="panel-image panel-image-placeholder" />
        )}

        {panel.thoughtBubble ? (
          <div className="panel-thought">
            <span className="panel-thought-label">{heroName} is thinking</span>
            <span className="panel-thought-text">{panel.thoughtBubble}</span>
          </div>
        ) : null}
      </div>

      <div className="panel-prose">
        <p className="panel-narrator">{panel.narratorText}</p>
        {!audioStarted && panel.narrationAudioUrl ? (
          <button type="button" className="panel-audio-cta" onClick={startAudio}>
            ▶ Read this panel aloud
          </button>
        ) : null}
      </div>

      {panel.narrationAudioUrl ? (
        <audio
          ref={narrationRef}
          src={panel.narrationAudioUrl}
          preload="auto"
        />
      ) : null}
      {panel.ambientSoundUrl ? (
        <audio
          ref={ambientRef}
          src={panel.ambientSoundUrl}
          preload="auto"
          loop
        />
      ) : null}

      <div className="panel-choices">
        {isFinalPanel ? (
          <button type="button" className="panel-finish" onClick={onFinish}>
            Save this story to my bookshelf →
          </button>
        ) : (
          panel.choices.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`panel-choice panel-choice-${c.rationale}`}
              onClick={() => onChoose(c)}
            >
              {c.label}
            </button>
          ))
        )}
      </div>
    </article>
  );
}
