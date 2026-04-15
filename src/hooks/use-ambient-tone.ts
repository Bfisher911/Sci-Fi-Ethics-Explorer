'use client';

import { useEffect, useRef } from 'react';

/**
 * Plays a very quiet generated drone at `baseFreq` Hz while `enabled` is true.
 * Uses the Web Audio API — no asset files needed. Null-safe on the server.
 */
export function useAmbientTone(enabled: boolean, baseFreq: number): void {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{
    osc1: OscillatorNode;
    osc2: OscillatorNode;
    gain: GainNode;
  } | null>(null);

  useEffect(() => {
    if (!enabled) {
      const nodes = nodesRef.current;
      const ctx = ctxRef.current;
      if (nodes && ctx) {
        const now = ctx.currentTime;
        nodes.gain.gain.cancelScheduledValues(now);
        nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
        nodes.gain.gain.linearRampToValueAtTime(0, now + 0.4);
        setTimeout(() => {
          try {
            nodes.osc1.stop();
            nodes.osc2.stop();
          } catch {
            // already stopped
          }
          ctx.close().catch(() => undefined);
          ctxRef.current = null;
          nodesRef.current = null;
        }, 500);
      }
      return;
    }

    if (typeof window === 'undefined') return;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;

    const ctx = new Ctor();
    ctxRef.current = ctx;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.value = baseFreq;
    osc2.frequency.value = baseFreq * 1.01; // gentle beating for texture

    filter.type = 'lowpass';
    filter.frequency.value = Math.min(baseFreq * 4, 600);
    filter.Q.value = 0.7;

    gain.gain.value = 0;
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.linearRampToValueAtTime(0.04, now + 1.2);

    osc1.start();
    osc2.start();

    nodesRef.current = { osc1, osc2, gain };
  }, [enabled, baseFreq]);

  useEffect(() => {
    return () => {
      const ctx = ctxRef.current;
      const nodes = nodesRef.current;
      if (nodes) {
        try {
          nodes.osc1.stop();
          nodes.osc2.stop();
        } catch {
          // ignore
        }
      }
      if (ctx) ctx.close().catch(() => undefined);
      ctxRef.current = null;
      nodesRef.current = null;
    };
  }, []);
}
