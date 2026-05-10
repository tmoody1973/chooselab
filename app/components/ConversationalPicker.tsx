'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AvatarCall,
  AvatarVideo,
  UserVideo,
  ControlBar,
  useClientEvent,
  useTranscription,
  clientTool,
} from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';
import type { AdventureSeed, Setting, Hero, Problem } from '@/lib/adventure-types';
import type { SettingId, HeroId, ProblemId } from '@/lib/adventure/storyteller-tools';
import {
  getSettingById,
  getHeroById,
  getProblemById,
} from '@/lib/adventure/catalog';
import { Picker } from '@/components/Picker';
import { StorytellerDebug } from '@/components/StorytellerDebug';

// Client-side tool definitions — typed wrappers around the server-shape definitions
// in lib/adventure/storyteller-tools.ts. The clientTool helper imports
// @runwayml/avatars-react which requires the 'use client' directive, so these
// must live in a client component file.
const setSettingTool = clientTool('set_setting', {
  description: 'Visitor identified the setting for the adventure.',
  args: {} as { id: SettingId },
});
const setHeroTool = clientTool('set_hero', {
  description: 'Visitor identified the hero of the adventure.',
  args: {} as { id: HeroId },
});
const setProblemTool = clientTool('set_problem', {
  description: 'Visitor identified the challenge the hero faces.',
  args: {} as { id: ProblemId },
});

interface ConversationalPickerProps {
  onStart: (seed: AdventureSeed) => void;
}

interface SessionInfo {
  sessionId: string;
  sessionKey: string;
}

export function ConversationalPicker({ onStart }: ConversationalPickerProps) {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [creating, setCreating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFallbackPicker, setShowFallbackPicker] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function connect() {
      try {
        const res = await fetch('/api/storyteller/connect', { method: 'POST' });
        if (cancelled) return;
        if (!res.ok) {
          throw new Error(`Storyteller connect failed: ${res.status}`);
        }
        setSession(await res.json());
      } catch (err) {
        if (cancelled) return;
        console.error('Storyteller connect failed:', err);
        setError(err instanceof Error ? err.message : 'Could not reach the storyteller');
      } finally {
        if (!cancelled) setCreating(false);
      }
    }
    void connect();
    return () => {
      cancelled = true;
    };
  }, []);

  if (creating) {
    return (
      <div className="storyteller-loading">
        <div className="runner-spinner" aria-hidden="true" />
        <p className="runner-loading-text">Lyra is settling into the reading nook...</p>
        <p className="runner-loading-hint">First connection takes ~30 seconds.</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="storyteller-fallback">
        <p className="storyteller-fallback-text">
          {error ? `Couldn't reach Lyra (${error}). No worries — pick the old-fashioned way:` : 'Pick the old-fashioned way:'}
        </p>
        <Picker onStart={onStart} />
      </div>
    );
  }

  if (showFallbackPicker) {
    return (
      <div className="storyteller-fallback">
        <p className="storyteller-fallback-text">No problem — just pick from below:</p>
        <Picker onStart={onStart} />
      </div>
    );
  }

  return (
    <ConversationalSession
      sessionId={session.sessionId}
      sessionKey={session.sessionKey}
      onStart={onStart}
      onSwitchToManual={() => setShowFallbackPicker(true)}
    />
  );
}

function ConversationalSession({
  sessionId,
  sessionKey,
  onStart,
  onSwitchToManual,
}: {
  sessionId: string;
  sessionKey: string;
  onStart: (seed: AdventureSeed) => void;
  onSwitchToManual: () => void;
}) {
  const [seed, setSeed] = useState<{
    setting?: Setting;
    hero?: Hero;
    problem?: Problem;
  }>({});
  const seedRef = useRef(seed);
  seedRef.current = seed;

  // One-tool-per-user-utterance gate: each tool fire requires a NEW final
  // user transcription since the last tool fire. Without this gate, Lyra
  // fires multiple tools during her own list-of-options speech and the
  // picker auto-advances without the kid actually answering.
  //
  // Counter increments on each FINAL user transcription. Tool fires record
  // the counter value at fire-time. The next fire is dropped unless the
  // counter has incremented past the last fire's value.
  const userFinalUtteranceCountRef = useRef(0);
  const lastToolFireCountRef = useRef(-1);

  const tryStart = useCallback(
    (latest: { setting?: Setting; hero?: Hero; problem?: Problem }) => {
      if (latest.setting && latest.hero && latest.problem) {
        onStart({
          setting: latest.setting,
          hero: latest.hero,
          problem: latest.problem,
        });
      }
    },
    [onStart]
  );

  return (
    <AvatarCall
      avatarId="storyteller-session"
      sessionId={sessionId}
      sessionKey={sessionKey}
      avatarImageUrl="/storyteller/lyra-pixar.png"
      onError={(err) => console.error('Storyteller AvatarCall error:', err)}
    >
      {/* Live Pixar-style animated Lyra (gwm1_avatars realtime). Shows the
          static portrait via avatarImageUrl while connecting, then transitions
          to the live talking character once the WebRTC stream is up. */}
      <LyraStage />

      {/* Audio plumbing + corner webcam + end-call button. */}
      <AvatarVideo />
      <UserVideo />
      <ControlBar showCamera={false} showScreenShare={false} />

      <UserSpeechSentinel
        onUserFinalUtterance={() => {
          userFinalUtteranceCountRef.current += 1;
          console.debug('[picker] user final utterance', userFinalUtteranceCountRef.current);
        }}
      />

      <SeedListener
        onSetSetting={(id) => {
          if (!gateAllowsToolFire(userFinalUtteranceCountRef, lastToolFireCountRef, 'set_setting')) {
            return;
          }
          if (seedRef.current.setting) {
            console.warn('[picker] dropped set_setting — already set');
            return;
          }
          const setting = getSettingById(id);
          if (!setting) return;
          lastToolFireCountRef.current = userFinalUtteranceCountRef.current;
          const next = { ...seedRef.current, setting };
          setSeed(next);
          tryStart(next);
        }}
        onSetHero={(id) => {
          if (!gateAllowsToolFire(userFinalUtteranceCountRef, lastToolFireCountRef, 'set_hero')) {
            return;
          }
          if (seedRef.current.hero) {
            console.warn('[picker] dropped set_hero — already set');
            return;
          }
          const hero = getHeroById(id);
          if (!hero) return;
          lastToolFireCountRef.current = userFinalUtteranceCountRef.current;
          const next = { ...seedRef.current, hero };
          setSeed(next);
          tryStart(next);
        }}
        onSetProblem={(id) => {
          if (!gateAllowsToolFire(userFinalUtteranceCountRef, lastToolFireCountRef, 'set_problem')) {
            return;
          }
          if (seedRef.current.problem) {
            console.warn('[picker] dropped set_problem — already set');
            return;
          }
          const problem = getProblemById(id);
          if (!problem) return;
          lastToolFireCountRef.current = userFinalUtteranceCountRef.current;
          const next = { ...seedRef.current, problem };
          setSeed(next);
          tryStart(next);
        }}
      />
      <SeedProgress
        seed={seed}
        onSwitchToManual={onSwitchToManual}
        onReset={() => setSeed({})}
      />

      <StorytellerDebug />
    </AvatarCall>
  );
}

function LyraStage() {
  return (
    <div className="lyra-stage">
      <div className="lyra-caption">
        <span className="lyra-name">Lyra</span>
        <span className="lyra-status">your story buddy</span>
      </div>
    </div>
  );
}

function UserSpeechSentinel({ onUserFinalUtterance }: { onUserFinalUtterance: () => void }) {
  // Listens for FINAL transcription segments from the user (not the avatar).
  // Each final user utterance increments a counter that gates tool fires —
  // tools can only fire once per new utterance, preventing Lyra from
  // mass-firing tools during her own list-of-options speech.
  useTranscription(
    (entry) => {
      if (!entry.final) return;
      const identity = (entry.participantIdentity ?? '').toLowerCase();
      const isAvatar =
        identity.includes('avatar') ||
        identity.includes('agent') ||
        identity.includes('lyra');
      if (!isAvatar) {
        onUserFinalUtterance();
      }
    },
    { interim: false }
  );
  return null;
}

function gateAllowsToolFire(
  userFinalCountRef: React.RefObject<number>,
  lastFireCountRef: React.RefObject<number>,
  toolName: string
): boolean {
  const userCount = userFinalCountRef.current ?? 0;
  const lastFire = lastFireCountRef.current ?? -1;
  if (userCount <= lastFire) {
    console.warn(
      `[picker] dropped ${toolName} — no new user utterance since last tool fire (user=${userCount}, lastFire=${lastFire})`
    );
    return false;
  }
  return true;
}

function SeedListener({
  onSetSetting,
  onSetHero,
  onSetProblem,
}: {
  onSetSetting: (id: string) => void;
  onSetHero: (id: string) => void;
  onSetProblem: (id: string) => void;
}) {
  useClientEvent(setSettingTool, (args) => {
    if (args?.id) onSetSetting(args.id);
  });
  useClientEvent(setHeroTool, (args) => {
    if (args?.id) onSetHero(args.id);
  });
  useClientEvent(setProblemTool, (args) => {
    if (args?.id) onSetProblem(args.id);
  });
  return null;
}

function SeedProgress({
  seed,
  onSwitchToManual,
  onReset,
}: {
  seed: { setting?: Setting; hero?: Hero; problem?: Problem };
  onSwitchToManual: () => void;
  onReset: () => void;
}) {
  const anyPicked = seed.setting || seed.hero || seed.problem;
  return (
    <div className="storyteller-progress">
      <p className="storyteller-cue">
        🎤 <strong>Tap the mic in the controls below and say &quot;Hi Lyra!&quot;</strong> to begin. Then answer her three questions out loud.
      </p>
      <div className="storyteller-progress-row">
        <ProgressPill label="Where" picked={seed.setting?.label} />
        <ProgressPill label="Who" picked={seed.hero?.label} />
        <ProgressPill label="What" picked={seed.problem?.label} />
      </div>
      <div className="storyteller-actions">
        {anyPicked ? (
          <button type="button" className="storyteller-reset" onClick={onReset}>
            ↺ Start over
          </button>
        ) : null}
        <button type="button" className="storyteller-skip" onClick={onSwitchToManual}>
          Skip — let me pick from a list instead
        </button>
      </div>
    </div>
  );
}

function ProgressPill({ label, picked }: { label: string; picked: string | undefined }) {
  return (
    <div className={`progress-pill ${picked ? 'progress-pill-filled' : ''}`}>
      <span className="progress-pill-label">{label}</span>
      <span className="progress-pill-value">{picked ?? '—'}</span>
    </div>
  );
}

