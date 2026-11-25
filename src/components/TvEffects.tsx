import React from 'react';
import type { HeatStage } from '../utils/heat';
import { Icon } from './icons/Icon';

// Deterministic pseudo-random so particles don't jump around between renders
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const particleStyle = (i: number, extra: Record<string, string | number> = {}) =>
  ({
    '--x': `${rand(i) * 100}%`,
    '--delay': `${-rand(i + 100) * 6}s`,
    '--drift': `${(rand(i + 200) - 0.5) * 12}vw`,
    '--size': `${4 + rand(i + 300) * 8}px`,
    '--spin': `${rand(i + 400) * 720 - 360}deg`,
    '--hue-shift': Math.round(rand(i + 500) * 90 - 45),
    ...extra,
  }) as React.CSSProperties;

interface TvAtmosphereProps {
  stage: HeatStage;
  revealKey: string | null;
}

/** Background layers for TV mode; all motion is CSS-driven by --tv-intensity and data-tv-stage. */
export const TvAtmosphere: React.FC<TvAtmosphereProps> = ({ stage, revealKey }) => {
  const showEmbers = stage === 'fever' || stage === 'finale';
  return (
    <>
    <div className="tv-atmosphere" aria-hidden="true">
      <div className="tv-atmosphere__glow tv-atmosphere__glow--a" />
      <div className="tv-atmosphere__glow tv-atmosphere__glow--b" />
      {revealKey && <div key={revealKey} className="tv-reveal-flash" />}
    </div>
    <div className="tv-atmosphere tv-atmosphere--front" aria-hidden="true">
      {showEmbers && (
        <div className="tv-embers">
          {Array.from({ length: stage === 'finale' ? 36 : 20 }, (_, i) => (
            <span key={i} className="tv-ember" style={particleStyle(i)} />
          ))}
        </div>
      )}
      {stage === 'finale' && (
        <div className="tv-confetti">
          {Array.from({ length: 70 }, (_, i) => (
            <span key={i} className="tv-confetti__piece" style={particleStyle(i + 1000)} />
          ))}
        </div>
      )}
    </div>
    </>
  );
};

interface RehearsalControlsProps {
  step: number;
  totalSteps: number;
  setStep: (step: number) => void;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  speedMs: number;
  setSpeedMs: (ms: number) => void;
  currentPosition: number | null;
  stage: HeatStage;
}

export const RehearsalControls: React.FC<RehearsalControlsProps> = ({
  step, totalSteps, setStep, playing, setPlaying, speedMs, setSpeedMs, currentPosition, stage,
}) => (
  <div className="fixed bottom-3 right-3 z-50 flex flex-wrap items-center gap-2 rounded-xl bg-black/75 backdrop-blur px-3 py-2 text-white text-xs shadow-2xl opacity-30 hover:opacity-100 focus-within:opacity-100 transition-opacity">
    <span className="font-bold uppercase tracking-wider text-xs text-white/60">Rehearsal</span>
    <button onClick={() => setStep(Math.max(0, step - 1))} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20" aria-label="Previous song">◀</button>
    <button onClick={() => setPlaying(!playing)} className="px-3 py-1 rounded bg-white/20 hover:bg-white/30 font-bold w-20">
      {playing ? 'Pause' : 'Play'}
    </button>
    <button onClick={() => setStep(Math.min(totalSteps, step + 1))} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20" aria-label="Next song"><Icon name="play" /></button>
    <input
      type="range"
      min={0}
      max={totalSteps}
      value={step}
      onChange={(e) => setStep(Number(e.target.value))}
      className="w-48 sm:w-72 accent-white"
      aria-label="Countdown progress"
    />
    <select
      value={speedMs}
      onChange={(e) => setSpeedMs(Number(e.target.value))}
      className="bg-white/10 rounded px-2 py-1"
      aria-label="Playback speed"
    >
      <option value={3000}>Slow</option>
      <option value={1500}>Normal</option>
      <option value={500}>Fast</option>
    </select>
    <span className="tabular-nums w-28 text-right">
      {currentPosition ? `#${currentPosition}` : 'Not started'} · {stage}
    </span>
  </div>
);
