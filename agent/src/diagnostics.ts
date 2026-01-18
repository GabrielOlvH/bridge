const LAG_SAMPLE_INTERVAL_MS = 500;
const LAG_SAMPLE_WINDOW = 60;

let lagSamples: number[] = [];
let expected = Date.now() + LAG_SAMPLE_INTERVAL_MS;

const timer = setInterval(() => {
  const now = Date.now();
  const lag = Math.max(0, now - expected);
  expected = now + LAG_SAMPLE_INTERVAL_MS;
  lagSamples.push(lag);
  if (lagSamples.length > LAG_SAMPLE_WINDOW) {
    lagSamples = lagSamples.slice(-LAG_SAMPLE_WINDOW);
  }
}, LAG_SAMPLE_INTERVAL_MS);

if (typeof timer.unref === 'function') {
  timer.unref();
}

export type EventLoopLagSnapshot = {
  meanMs: number;
  p95Ms: number;
  maxMs: number;
  samples: number;
};

export function getEventLoopLagSnapshot(): EventLoopLagSnapshot | null {
  if (lagSamples.length === 0) return null;
  const sorted = [...lagSamples].sort((a, b) => a - b);
  const samples = sorted.length;
  const maxMs = sorted[samples - 1];
  const meanMs = Math.round(sorted.reduce((sum, value) => sum + value, 0) / samples);
  const p95Index = Math.min(samples - 1, Math.floor((samples - 1) * 0.95));
  const p95Ms = sorted[p95Index];
  return { meanMs, p95Ms, maxMs, samples };
}
