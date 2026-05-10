'use client';

import { useEffect, useRef, useState } from 'react';
import type { PanelData, Choice } from '@/lib/adventure-types';

interface PanelViewProps {
  panel: PanelData;
  heroName: string;
  isFinalPanel: boolean;
  assetsReady: boolean;
  onChoose: (choice: Choice) => void;
  onFinish: () => void;
}

const LOADING_PROMPTS = [
  'Mixing the colors...',
  'Listening for the wind...',
  'Picking the right gold for the sun...',
  'Painting the leaves...',
  'Finding the right hush...',
  'Polishing the moss...',
  'Drawing the shadows just right...',
  'Catching the light through the trees...',
];

export function PanelView({
  panel,
  heroName,
  isFinalPanel,
  assetsReady,
  onChoose,
  onFinish,
}: PanelViewProps) {
  const narrationRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [narrationPlaying, setNarrationPlaying] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(LOADING_PROMPTS[0]);

  // Reset state when panel changes
  useEffect(() => {
    setAudioStarted(false);
    setNarrationPlaying(false);
    setImageVisible(false);
  }, [panel.panelId]);

  // Trigger image fade-in once URL is set
  useEffect(() => {
    if (panel.imageUrl) {
      const timer = window.setTimeout(() => setImageVisible(true), 80);
      return () => window.clearTimeout(timer);
    }
  }, [panel.imageUrl]);

  // Rotate loading prompt every 4 seconds while assets aren't ready
  useEffect(() => {
    if (assetsReady) return;
    const interval = window.setInterval(() => {
      setLoadingPrompt(LOADING_PROMPTS[Math.floor(Math.random() * LOADING_PROMPTS.length)]);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [assetsReady]);

  // Auto-play narration as soon as it's ready (best-effort; some browsers block autoplay)
  useEffect(() => {
    if (!panel.narrationAudioUrl || audioStarted) return;
    const tryAutoplay = async () => {
      const narration = narrationRef.current;
      if (!narration) return;
      try {
        await narration.play();
        setAudioStarted(true);
        setNarrationPlaying(true);
        if (ambientRef.current) {
          ambientRef.current.volume = 0.25;
          ambientRef.current.play().catch(() => {});
        }
      } catch {
        // Autoplay blocked — kid will tap-to-start
      }
    };
    void tryAutoplay();
  }, [panel.narrationAudioUrl, audioStarted]);

  function startAudio() {
    if (audioStarted || !panel.narrationAudioUrl) return;
    setAudioStarted(true);
    setNarrationPlaying(true);
    narrationRef.current?.play().catch(() => {});
    if (ambientRef.current) {
      ambientRef.current.volume = 0.25;
      ambientRef.current.play().catch(() => {});
    }
  }

  return (
    <article className="panel-view" onClick={startAudio}>
      <div className="panel-stage">
        {panel.videoUrl ? (
          <video
            className={`panel-image ${imageVisible ? 'panel-image-visible' : ''} panel-video`}
            src={panel.videoUrl}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : panel.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={`panel-image ${imageVisible ? 'panel-image-visible' : ''}`}
            src={panel.imageUrl}
            alt={`Scene from panel ${panel.index}`}
          />
        ) : (
          <div className="panel-image panel-image-placeholder">
            <div className="panel-painting-shimmer" aria-hidden="true" />
            <div className="panel-painting-text">
              <span className="panel-painting-label">Painting in progress</span>
              <span className="panel-painting-subline">{loadingPrompt}</span>
            </div>
          </div>
        )}

        {panel.thoughtBubble ? (
          <div className="panel-thought">
            <span className="panel-thought-label">{heroName} is thinking</span>
            <span className="panel-thought-text">{panel.thoughtBubble}</span>
          </div>
        ) : null}

        {/* Lyra reading-along corner — small Pixar portrait that pulses while narration plays. */}
        <div className={`panel-lyra-corner ${narrationPlaying ? 'panel-lyra-speaking' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/storyteller/lyra-pixar.png" alt="Lyra reading along" />
        </div>
      </div>

      <div className="panel-prose">
        <p className="panel-narrator">{panel.narratorText}</p>
        {panel.narrationAudioUrl && !audioStarted ? (
          <button type="button" className="panel-audio-cta" onClick={startAudio}>
            ▶ Have Lyra read this aloud
          </button>
        ) : null}
        {!panel.narrationAudioUrl && !assetsReady ? (
          <span className="panel-narration-loading">Lyra is warming up her voice...</span>
        ) : null}
      </div>

      {panel.narrationAudioUrl ? (
        <audio
          ref={narrationRef}
          src={panel.narrationAudioUrl}
          preload="auto"
          onEnded={() => setNarrationPlaying(false)}
          onPause={() => setNarrationPlaying(false)}
        />
      ) : null}
      {panel.ambientSoundUrl ? (
        <audio ref={ambientRef} src={panel.ambientSoundUrl} preload="auto" loop />
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
