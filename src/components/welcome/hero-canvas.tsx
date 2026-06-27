'use client';

/**
 * HeroCanvas — a hand-written WebGL2 fullscreen fragment shader. No
 * Three.js / R3F: it's a single full-screen triangle with one shader,
 * so the only weight added to the page is this file. The shader paints
 * domain-warped fbm "nebula" plasma + a hash starfield, tinted between
 * the theme's primary (cyan) and accent (magenta) by the `lean` prop so
 * the on-page dilemma can recolor the whole scene.
 *
 * Guardrails:
 *  - `reducedMotion` → render exactly one static frame, no RAF loop.
 *  - Pauses the RAF loop when the tab/page is hidden.
 *  - Device-pixel-ratio capped at 1.5 to keep fill-rate sane.
 *  - Colors are read from CSS custom properties so it tracks the theme.
 *  - If WebGL2 is unavailable it renders nothing (the CSS fallback
 *    behind it shows through).
 */

import { useEffect, useRef } from 'react';

interface HeroCanvasProps {
  /** -1 (full magenta / "liberty") … 0 (neutral) … 1 (full cyan / "order"). */
  lean: number;
  reducedMotion: boolean;
}

const VERT = `#version 300 es
precision highp float;
const vec2 verts[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
void main() { gl_Position = vec4(verts[gl_VertexID], 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;      // 0..1
uniform float uLean;      // -1..1
uniform vec3 uPrimary;    // cyan
uniform vec3 uAccent;     // magenta
uniform vec3 uBg;         // deep indigo

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;
  float t = uTime * 0.04;

  // Domain-warped plasma.
  vec2 q = vec2(fbm(p * 1.5 + t), fbm(p * 1.5 - t + 5.2));
  vec2 r = vec2(fbm(p * 1.5 + 1.7 * q + t * 0.5), fbm(p * 1.5 + 1.7 * q - t * 0.5));
  float f = fbm(p * 1.5 + 2.4 * r);

  // Lean tilts the color balance cyan <-> magenta (wide, dramatic swing).
  float bias = 0.5 + 0.5 * clamp(uLean, -1.0, 1.0);
  vec3 neon = mix(uAccent, uPrimary, clamp(0.3 + bias * 0.6, 0.0, 1.0));
  vec3 neon2 = mix(uPrimary, uAccent, clamp(0.3 + bias * 0.6, 0.0, 1.0));

  vec3 col = uBg * 0.55;

  // Broad nebula bloom.
  col += neon * smoothstep(0.18, 0.85, f) * 0.5;
  // Hot filament ridges where the warp piles up.
  float ridge = smoothstep(0.58, 0.92, f);
  col += neon * ridge * 0.95;
  // Thin complementary veins along the folds of the domain warp.
  float vein = smoothstep(0.5, 0.46, abs(r.x - r.y));
  col += neon2 * vein * 0.4;
  // Energy pulse that breathes through the whole field.
  col += neon * (0.06 + 0.05 * sin(uTime * 0.6 + f * 6.2831));

  // Starfield (brighter, livelier twinkle).
  vec2 sp = gl_FragCoord.xy / 2.2;
  float star = pow(hash(floor(sp)), 55.0);
  star *= 0.5 + 0.5 * sin(uTime * 2.0 + hash(floor(sp)) * 30.0);
  col += vec3(star) * 0.9;

  // Cursor glow — stronger, tinted by the current lean.
  float md = distance(uv, uMouse);
  col += neon * smoothstep(0.4, 0.0, md) * 0.2;

  // Gentle vignette; floor the value so it never blows out to white.
  col *= 1.0 - 0.42 * length(p * 0.75);
  col = max(col, uBg * 0.28);

  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

/** Read an HSL CSS custom property like "181 100% 74%" → linear-ish rgb 0..1. */
function readColor(varName: string, fallback: [number, number, number]): [number, number, number] {
  if (typeof window === 'undefined') return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const m = raw.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!m) return fallback;
  const h = parseFloat(m[1]) / 360;
  const s = parseFloat(m[2]) / 100;
  const l = parseFloat(m[3]) / 100;
  const hue = (n: number) => {
    const k = (n + h * 12) % 12;
    return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(Math.min(k - 3, 9 - k), 1));
  };
  return [hue(0), hue(8), hue(4)];
}

export default function HeroCanvas({ lean, reducedMotion }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leanRef = useRef(lean);
  leanRef.current = lean;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const u = {
      res: gl.getUniformLocation(prog, 'uRes'),
      time: gl.getUniformLocation(prog, 'uTime'),
      mouse: gl.getUniformLocation(prog, 'uMouse'),
      lean: gl.getUniformLocation(prog, 'uLean'),
      primary: gl.getUniformLocation(prog, 'uPrimary'),
      accent: gl.getUniformLocation(prog, 'uAccent'),
      bg: gl.getUniformLocation(prog, 'uBg'),
    };
    gl.uniform3fv(u.primary, readColor('--primary', [0.5, 0.95, 0.95]));
    gl.uniform3fv(u.accent, readColor('--accent', [0.78, 0.18, 0.7]));
    gl.uniform3fv(u.bg, readColor('--background', [0.16, 0.16, 0.42]));

    const mouse = { x: 0.5, y: 0.5 };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const resize = () => {
      // Lower the pixel-ratio cap on phones — the deliberate perf trade
      // for running the full shader on mobile rather than a poster.
      const mobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.0 : 1.5);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.res, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let running = true;
    const start = performance.now();
    const draw = (now: number) => {
      gl.uniform1f(u.time, (now - start) / 1000);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform1f(u.lean, leanRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (running) raf = requestAnimationFrame(draw);
    };

    if (reducedMotion) {
      // One calm static frame, no loop.
      gl.uniform1f(u.time, 8.0);
      gl.uniform2f(u.mouse, 0.5, 0.6);
      gl.uniform1f(u.lean, leanRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      raf = requestAnimationFrame(draw);
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reducedMotion && !running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
