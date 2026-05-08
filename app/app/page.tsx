'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';
import { SCENARIOS, type Scenario } from '@/lib/scenarios';

interface SessionInfo {
  sessionId: string;
  sessionKey: string;
}

export default function Home() {
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const closeModal = useCallback(() => {
    setActiveScenario(null);
    setSession(null);
    setIsCreating(false);
  }, []);

  async function startCall(scenario: Scenario) {
    setActiveScenario(scenario);
    setIsCreating(true);
    setSession(null);
    try {
      const res = await fetch('/api/avatar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId: scenario.avatarId }),
      });
      if (!res.ok) {
        throw new Error(`Session create failed: ${res.status}`);
      }
      setSession(await res.json());
    } catch (err) {
      console.error('Failed to start call:', err);
      setIsCreating(false);
    }
  }

  useEffect(() => {
    if (!activeScenario) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeScenario, closeModal]);

  return (
    <main className="page">
      <header className="header">
        <h1 className="title">ScenarioLab</h1>
        <p className="tagline">
          Practice real-world conversations in low-stakes role-play.
          Three scenarios, three voices, no judgment.
        </p>
      </header>

      <div className="presets">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            className="preset"
            onClick={() => startCall(scenario)}
            style={{ ['--accent' as string]: scenario.accentColor }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={scenario.imageSrc}
              alt={scenario.characterName}
              width={240}
              height={320}
              className="preset-avatar"
            />
            <div className="preset-info">
              <span className="preset-name">{scenario.title}</span>
              <span className="preset-character">with {scenario.characterName}</span>
              <p className="preset-setup">{scenario.setupLine}</p>
            </div>
          </button>
        ))}
      </div>

      {activeScenario ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {activeScenario.title} · {activeScenario.characterName}
              </span>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                <CloseIcon aria-hidden="true" />
              </button>
            </div>
            {session ? (
              <Suspense fallback={<div className="modal-loading">Connecting...</div>}>
                <AvatarCall
                  avatarId={activeScenario.avatarId}
                  sessionId={session.sessionId}
                  sessionKey={session.sessionKey}
                  avatarImageUrl={activeScenario.imageSrc}
                  onEnd={closeModal}
                  onError={(err) => console.error('AvatarCall error:', err)}
                />
              </Suspense>
            ) : isCreating ? (
              <div className="modal-loading">
                Creating session with {activeScenario.characterName}...
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}
