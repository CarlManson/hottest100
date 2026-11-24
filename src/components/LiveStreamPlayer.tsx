import React, { useRef, useState } from 'react';
import { brand } from '../config/brand';

export const LiveStreamPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  const streamUrl = brand.streamUrl;
  if (!streamUrl) return null;

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      // Drop the buffered stream so resuming jumps back to live rather than replaying stale audio
      audio.removeAttribute('src');
      audio.load();
      setPlaying(false);
      return;
    }
    try {
      setError(false);
      audio.src = streamUrl;
      await audio.play();
      setPlaying(true);
    } catch {
      setError(true);
      setPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} preload="none" onError={() => { if (playing) { setError(true); setPlaying(false); } }} />
      <button
        onClick={toggle}
        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-lg transition border-2 border-white/40 hover:border-white/60 shadow-lg"
      >
        {error ? '⚠️ Stream unavailable' : playing ? '⏸ Pause Triple J' : '▶️ Listen live'}
      </button>
    </>
  );
};
