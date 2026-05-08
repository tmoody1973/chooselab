'use client';

import { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { AvatarCall, type TranscriptionEntry } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';
import { SCENARIOS, type Scenario } from '@/lib/scenarios';
import { TranscriptCapture } from '@/components/TranscriptCapture';

interface SessionInfo {
  sessionId: string;
  sessionKey: string;
}

interface Feedback {
  strength: string;
  nextStep: string;
  totalScore: number;
  scores: Record<string, number>;
  empty?: boolean;
}

type Stage = 'idle' | 'creating' | 'live' | 'evaluating' | 'feedback' | 'error';

export default function Home() {
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const transcriptRef = useRef<TranscriptionEntry[]>([]);
  const handleTranscriptChange = useCallback((entries: TranscriptionEntry[]) => {
    transcriptRef.current = entries;
  }, []);

  const closeAll = useCallback(() => {
    setActiveScenario(null);
    setSession(null);
    setStage('idle');
    setFeedback(null);
    setErrorMessage(null);
    transcriptRef.current = [];
  }, []);

  const evaluate = useCallback(async (scenario: Scenario) => {
    setStage('evaluating');
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: scenario.scenarioId,
          transcript: transcriptRef.current,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errBody.error ?? `HTTP ${res.status}`);
      }
      const data: Feedback = await res.json();
      setFeedback(data);
      setStage('feedback');
    } catch (err) {
      console.error('Evaluation failed:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Evaluation failed');
      setStage('error');
    }
  }, []);

  const handleSessionEnd = useCallback(() => {
    setSession(null);
    if (activeScenario) {
      void evaluate(activeScenario);
    }
  }, [activeScenario, evaluate]);

  async function startCall(scenario: Scenario) {
    setActiveScenario(scenario);
    setStage('creating');
    setSession(null);
    setFeedback(null);
    setErrorMessage(null);
    transcriptRef.current = [];
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
      setStage('live');
    } catch (err) {
      console.error('Failed to start call:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to start call');
      setStage('error');
    }
  }

  useEffect(() => {
    if (!activeScenario) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeScenario, closeAll]);

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
        <div className="modal-overlay" onClick={closeAll}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {activeScenario.title} · {activeScenario.characterName}
              </span>
              <button
                className="modal-close"
                onClick={closeAll}
                aria-label="Close"
              >
                <CloseIcon aria-hidden="true" />
              </button>
            </div>

            {stage === 'creating' ? (
              <div className="modal-loading">
                Creating session with {activeScenario.characterName}...
                <span className="modal-loading-hint">First connection can take 30-40s while the avatar warms up.</span>
              </div>
            ) : null}

            {stage === 'live' && session ? (
              <Suspense fallback={<div className="modal-loading">Connecting...</div>}>
                <AvatarCall
                  avatarId={activeScenario.avatarId}
                  sessionId={session.sessionId}
                  sessionKey={session.sessionKey}
                  avatarImageUrl={activeScenario.imageSrc}
                  onEnd={handleSessionEnd}
                  onError={(err) => {
                    console.error('AvatarCall error:', err);
                    setErrorMessage(err.message);
                    setStage('error');
                  }}
                >
                  <TranscriptCapture onChange={handleTranscriptChange} />
                </AvatarCall>
              </Suspense>
            ) : null}

            {stage === 'evaluating' ? (
              <div className="modal-loading">
                Reviewing your responses...
              </div>
            ) : null}

            {stage === 'feedback' && feedback ? (
              <FeedbackPanel
                feedback={feedback}
                scenario={activeScenario}
                onTryAgain={() => startCall(activeScenario)}
                onDone={closeAll}
              />
            ) : null}

            {stage === 'error' ? (
              <div className="modal-error">
                <h3 className="feedback-heading">Something went wrong</h3>
                <p className="feedback-body">{errorMessage ?? 'Unknown error'}</p>
                <div className="feedback-actions">
                  <button
                    type="button"
                    className="feedback-button feedback-button-primary"
                    onClick={() => startCall(activeScenario)}
                  >
                    Try again
                  </button>
                  <button
                    type="button"
                    className="feedback-button"
                    onClick={closeAll}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function FeedbackPanel({
  feedback,
  scenario,
  onTryAgain,
  onDone,
}: {
  feedback: Feedback;
  scenario: Scenario;
  onTryAgain: () => void;
  onDone: () => void;
}) {
  if (feedback.empty) {
    return (
      <div className="feedback-panel">
        <h3 className="feedback-heading">No responses captured</h3>
        <p className="feedback-body">{feedback.nextStep}</p>
        <div className="feedback-actions">
          <button
            type="button"
            className="feedback-button feedback-button-primary"
            onClick={onTryAgain}
          >
            Try again
          </button>
          <button type="button" className="feedback-button" onClick={onDone}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-panel">
      <div className="feedback-section">
        <span className="feedback-label">One thing you did well</span>
        <p className="feedback-body">{feedback.strength}</p>
      </div>
      <div className="feedback-section">
        <span className="feedback-label">One thing to try next</span>
        <p className="feedback-body">{feedback.nextStep}</p>
      </div>
      <details className="feedback-details">
        <summary>See per-dimension scores</summary>
        <table className="feedback-scores">
          <tbody>
            {Object.entries(feedback.scores).map(([dim, score]) => (
              <tr key={dim}>
                <td>{dim}</td>
                <td>{score}/2</td>
              </tr>
            ))}
            <tr className="feedback-scores-total">
              <td>Total</td>
              <td>{feedback.totalScore}/10</td>
            </tr>
          </tbody>
        </table>
      </details>
      <div className="feedback-actions">
        <button
          type="button"
          className="feedback-button feedback-button-primary"
          onClick={onTryAgain}
        >
          Try {scenario.characterName} again
        </button>
        <button type="button" className="feedback-button" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
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
