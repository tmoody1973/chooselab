'use client';

import { useEffect } from 'react';
import { useTranscript, type TranscriptionEntry } from '@runwayml/avatars-react';

interface Props {
  onChange: (entries: TranscriptionEntry[]) => void;
}

export function TranscriptCapture({ onChange }: Props) {
  const transcript = useTranscript();

  useEffect(() => {
    onChange(transcript);
  }, [transcript, onChange]);

  return null;
}
