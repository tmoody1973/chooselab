'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AdventureSeed,
  AdventureSession,
  Choice,
  PanelData,
  StoryArc,
} from '@/lib/adventure-types';
import { PanelView } from '@/components/PanelView';
import { addBookToShelf, buildBookshelfEntry } from '@/lib/adventure/bookshelf';

type RunnerStage =
  | { kind: 'starting' }
  | { kind: 'rendering-panel'; panelIndex: number }
  | { kind: 'reading'; panel: PanelData }
  | { kind: 'saving' }
  | { kind: 'finished'; coverUrl: string }
  | { kind: 'error'; message: string };

interface AdventureRunnerProps {
  seed: AdventureSeed;
  onExit: () => void;
}

export function AdventureRunner({ seed, onExit }: AdventureRunnerProps) {
  const [stage, setStage] = useState<RunnerStage>({ kind: 'starting' });
  const sessionRef = useRef<AdventureSession | null>(null);
  const choiceHistoryRef = useRef<string[]>([]);
  const [statusLine, setStatusLine] = useState<string>('Weaving your story...');

  const renderPanel = useCallback(async (arc: StoryArc, panelIndex: number) => {
    setStage({ kind: 'rendering-panel', panelIndex });
    setStatusLine(panelIndex === 1 ? 'Painting the first scene...' : 'Painting what happens next...');

    try {
      const panelRes = await fetch('/api/adventure/panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arc,
          panelIndex,
          choiceHistory: choiceHistoryRef.current,
        }),
      });
      if (!panelRes.ok) {
        throw new Error(`Panel writer failed (${panelRes.status})`);
      }
      const panelPayload = await panelRes.json();
      const panelData: PanelData = panelPayload.panelData;
      const assetPrompts = panelPayload.assetPrompts;

      setStatusLine('Painting the picture, recording the sounds...');
      const isClimax = panelData.isClimax;
      const assetsRes = await fetch('/api/adventure/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePrompt: assetPrompts.imagePrompt,
          ambientSoundPrompt: assetPrompts.ambientSoundPrompt,
          narratorText: assetPrompts.narratorText,
          generateClimaxAnimation: isClimax,
        }),
      });
      if (!assetsRes.ok) {
        throw new Error(`Asset generation failed (${assetsRes.status})`);
      }
      const assets = await assetsRes.json();

      const fullPanelData: PanelData = {
        ...panelData,
        imageUrl: assets.imageUrl,
        ambientSoundUrl: assets.ambientSoundUrl ?? '',
        narrationAudioUrl: assets.narrationAudioUrl ?? '',
        videoUrl: assets.videoUrl,
      };

      const session = sessionRef.current;
      if (session) {
        session.panelHistory.push(fullPanelData);
        session.currentPanelIndex = panelIndex;
      }

      setStage({ kind: 'reading', panel: fullPanelData });
    } catch (err) {
      console.error('Panel rendering failed:', err);
      setStage({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong painting the next scene.',
      });
    }
  }, []);

  // Kick off the architect call once when the runner mounts.
  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        setStatusLine('Imagining your adventure...');
        const res = await fetch('/api/adventure/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seed }),
        });
        if (cancelled) return;
        if (!res.ok) {
          throw new Error(`Story architect failed (${res.status})`);
        }
        const payload = await res.json();
        const arc: StoryArc = payload.arc;
        const sessionId: string = payload.sessionId;

        sessionRef.current = {
          sessionId,
          seed,
          arc,
          panelHistory: [],
          currentPanelIndex: 0,
          finished: false,
        };

        if (cancelled) return;
        await renderPanel(arc, 1);
      } catch (err) {
        if (cancelled) return;
        console.error('Adventure start failed:', err);
        setStage({
          kind: 'error',
          message:
            err instanceof Error ? err.message : 'Something went wrong starting your adventure.',
        });
      }
    }
    void start();
    return () => {
      cancelled = true;
    };
  }, [seed, renderPanel]);

  function handleChoice(choice: Choice) {
    const session = sessionRef.current;
    if (!session) return;
    choiceHistoryRef.current = [...choiceHistoryRef.current, choice.label];
    void renderPanel(session.arc, session.currentPanelIndex + 1);
  }

  async function handleFinish() {
    const session = sessionRef.current;
    if (!session) return;
    setStage({ kind: 'saving' });
    setStatusLine('Painting the cover for your bookshelf...');
    try {
      const coverRes = await fetch('/api/adventure/cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arc: session.arc }),
      });
      if (!coverRes.ok) {
        throw new Error(`Cover generation failed (${coverRes.status})`);
      }
      const { coverUrl } = await coverRes.json();
      session.finished = true;
      addBookToShelf(buildBookshelfEntry({ session, coverImageUrl: coverUrl }));
      setStage({ kind: 'finished', coverUrl });
    } catch (err) {
      console.error('Save failed:', err);
      setStage({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Could not save your story.',
      });
    }
  }

  if (stage.kind === 'starting' || stage.kind === 'rendering-panel') {
    return <RunnerLoading text={statusLine} />;
  }
  if (stage.kind === 'saving') {
    return <RunnerLoading text={statusLine} />;
  }
  if (stage.kind === 'finished') {
    const session = sessionRef.current;
    return (
      <div className="runner-finished">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="runner-cover" src={stage.coverUrl} alt={session?.arc.title ?? 'Adventure cover'} />
        <h2 className="runner-finished-title">{session?.arc.title}</h2>
        <p className="runner-finished-sub">Saved to your bookshelf.</p>
        <button type="button" className="runner-back" onClick={onExit}>
          Back to adventures
        </button>
      </div>
    );
  }
  if (stage.kind === 'error') {
    return (
      <div className="runner-error">
        <h3>Oh, something got tangled.</h3>
        <p>{stage.message}</p>
        <button type="button" className="runner-back" onClick={onExit}>
          Try a different adventure
        </button>
      </div>
    );
  }

  const session = sessionRef.current;
  if (!session) return null;
  const isFinalPanel = stage.panel.index >= session.arc.panels.length;

  return (
    <PanelView
      panel={stage.panel}
      heroName={session.arc.hero.name}
      isFinalPanel={isFinalPanel}
      onChoose={handleChoice}
      onFinish={handleFinish}
    />
  );
}

function RunnerLoading({ text }: { text: string }) {
  return (
    <div className="runner-loading">
      <div className="runner-spinner" aria-hidden="true" />
      <p className="runner-loading-text">{text}</p>
      <p className="runner-loading-hint">First scenes can take 60-90 seconds while the watercolor dries.</p>
    </div>
  );
}
