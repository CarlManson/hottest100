import { describe, expect, it } from 'vitest';
import { getHeatStage, getTvIntensity } from './heat';

describe('heat', () => {
  it('builds from 0 to 1 within each broadcast', () => {
    expect(getTvIntensity(null)).toBe(0);
    expect(getTvIntensity(100)).toBeCloseTo(0.01);
    expect(getTvIntensity(1)).toBe(1);
    expect(getTvIntensity(200)).toBeCloseTo(0.01);
    expect(getTvIntensity(101)).toBe(1);
  });

  it('maps positions to stages', () => {
    expect(getHeatStage(null)).toBe('idle');
    expect(getHeatStage(75)).toBe('build');
    expect(getHeatStage(50)).toBe('heat');
    expect(getHeatStage(10)).toBe('fever');
    expect(getHeatStage(1)).toBe('finale');
    expect(getHeatStage(160)).toBe('build');
    expect(getHeatStage(105)).toBe('fever');
    expect(getHeatStage(101)).toBe('finale');
  });
});
