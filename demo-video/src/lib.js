import { interpolate, Easing, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadSerif } from '@remotion/google-fonts/InstrumentSerif';

export const { fontFamily: INTER } = loadInter('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin', 'latin-ext'] });
export const { fontFamily: SERIF } = loadSerif('italic', { weights: ['400'], subsets: ['latin', 'latin-ext'] });

// Everything in the film is driven by time in seconds, so the frame rate is only a render setting.
export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

export const useVertical = () => { const { width, height } = useVideoConfig(); return height > width; };

export const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  soft: Easing.bezier(0.22, 1, 0.36, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  smooth: Easing.bezier(0.45, 0, 0.15, 1),
  in: Easing.bezier(0.5, 0, 0.9, 0.4),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
};

export const tw = (t, t0, t1, a = 0, b = 1, ease = E.out) =>
  interpolate(t, [t0, t1], [a, b], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

// Keyframes over an object of numbers: kf(t, [[time, {x:1}], [time, {x:5}, easing?], ...])
export const kf = (t, frames, defaultEase = E.smooth) => {
  if (t <= frames[0][0]) return { ...frames[0][1] };
  for (let i = 1; i < frames.length; i++) {
    const [t1, v1, ease] = frames[i];
    const [t0, v0] = frames[i - 1];
    if (t <= t1) {
      const p = (ease || defaultEase)((t - t0) / (t1 - t0));
      const out = {};
      for (const k of Object.keys(v1)) out[k] = (v0[k] ?? v1[k]) + (v1[k] - (v0[k] ?? v1[k])) * p;
      return out;
    }
  }
  return { ...frames[frames.length - 1][1] };
};

export const rand = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const typed = (text, t, t0, t1) => text.slice(0, Math.round(tw(t, t0, t1, 0, text.length, (x) => x)));
export const inRange = (t, a, b) => t >= a && t < b;

export const C = {
  bg: '#040706',
  mint: '#5eead4',
  mint2: '#34d399',
  mintDeep: '#0f9d77',
  ink: '#ecf5f1',
  mute: 'rgba(236,245,241,.62)',
  faint: 'rgba(236,245,241,.38)',
};
