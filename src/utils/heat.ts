export type HeatStage = 'idle' | 'build' | 'heat' | 'fever' | 'finale';

/**
 * How far the current broadcast has progressed, 0 (nothing revealed) to 1 (its top spot revealed).
 * Each broadcast (Hottest 100, then Hottest 200) builds up on its own.
 */
export function getTvIntensity(currentPosition: number | null): number {
  if (currentPosition == null) return 0;
  const rankInList = currentPosition > 100 ? currentPosition - 100 : currentPosition;
  return (101 - rankInList) / 100;
}

export function getHeatStage(currentPosition: number | null): HeatStage {
  if (currentPosition == null) return 'idle';
  const rankInList = currentPosition > 100 ? currentPosition - 100 : currentPosition;
  if (rankInList === 1) return 'finale';
  if (rankInList <= 10) return 'fever';
  if (rankInList <= 50) return 'heat';
  return 'build';
}
