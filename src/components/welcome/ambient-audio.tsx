'use client';

/**
 * AmbientAudio — an opt-in sci-fi drone built with the Web Audio API
 * (no asset download). Off by default; a small labelled control toggles
 * it. Awwwards loves ambient sound, but it must never autoplay.
 */

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function AmbientAudio() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ gain: GainNode; oscs: OscillatorNode[] } | null>(null);

  const stop = () => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    if (ctx && nodes) {
      nodes.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      window.setTimeout(() => {
        nodes.oscs.forEach((o) => o.stop());
        nodesRef.current = null;
      }, 500);
    }
  };

  const start = () => {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = ctxRef.current ?? new Ctx();
    ctxRef.current = ctx;
    if (ctx.state === 'suspended') ctx.resume();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.2);
    gain.connect(ctx.destination);
    const freqs = [55, 82.4, 110];
    const oscs = freqs.map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 2 ? 'triangle' : 'sine';
      o.frequency.value = f;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07 + i * 0.03;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 1.5;
      lfo.connect(lfoGain).connect(o.frequency);
      lfo.start();
      o.connect(gain);
      o.start();
      return o;
    });
    nodesRef.current = { gain, oscs };
  };

  useEffect(() => () => stop(), []);

  const toggle = () => {
    if (on) stop();
    else start();
    setOn((v) => !v);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Mute ambient sound' : 'Play ambient sound'}
      className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs text-foreground/70 backdrop-blur-sm transition-colors hover:text-foreground"
    >
      {on ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
      {on ? 'Sound on' : 'Sound'}
    </button>
  );
}
