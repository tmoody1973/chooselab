'use client';

import { useEffect, useState } from 'react';
import { useTranscription, useClientEvents } from '@runwayml/avatars-react';

interface DebugEntry {
  ts: number;
  kind: 'transcription' | 'tool';
  data: Record<string, unknown>;
}

const MAX_ENTRIES = 30;

/**
 * Debug overlay toggled with the "D" key. Shows every transcription event
 * (with participantIdentity for filter verification) and every tool fire
 * (with the gate decision). Used to capture real data from a deployed
 * environment when iterating on the conversational picker.
 *
 * To enable in production, set ?debug=1 on the URL or press D in the page.
 */
export function StorytellerDebug() {
  const [visible, setVisible] = useState(false);
  const [entries, setEntries] = useState<DebugEntry[]>([]);

  // Auto-enable via ?debug=1 query param
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.has('debug')) setVisible(true);

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
        setVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useTranscription(
    (entry) => {
      setEntries((prev) =>
        [
          ...prev,
          {
            ts: Date.now(),
            kind: 'transcription' as const,
            data: {
              identity: entry.participantIdentity,
              final: entry.final,
              channel: entry.channel,
              text: entry.text,
            },
          },
        ].slice(-MAX_ENTRIES)
      );
    },
    { interim: true }
  );

  useClientEvents((event) => {
    setEntries((prev) =>
      [
        ...prev,
        {
          ts: Date.now(),
          kind: 'tool' as const,
          data: {
            tool: event.tool,
            args: event.args,
          },
        },
      ].slice(-MAX_ENTRIES)
    );
  });

  if (!visible) return null;

  return (
    <div className="storyteller-debug">
      <div className="storyteller-debug-header">
        <strong>Lyra debug</strong>
        <span className="storyteller-debug-hint">press D to toggle</span>
      </div>
      <div className="storyteller-debug-list">
        {entries.length === 0 ? (
          <div className="storyteller-debug-empty">Waiting for events...</div>
        ) : (
          entries.map((e, idx) => (
            <div
              key={`${e.ts}-${idx}`}
              className={`storyteller-debug-entry storyteller-debug-${e.kind}`}
            >
              <span className="storyteller-debug-kind">{e.kind === 'tool' ? '🔧' : '🎤'}</span>
              <code>{JSON.stringify(e.data)}</code>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
