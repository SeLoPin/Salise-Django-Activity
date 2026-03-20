import React, { useEffect, useRef } from 'react';

/* ─── Constants ─── */
const SYMBOLS  = ['♔','♕','♖','♗','♘','♙','♚','♛','♜','♝','♞','♟'] as const;
const COUNT    = 14;
const REPEL_R  = 160;
const HOVER_R  = 48;
const GRAB_R   = 52;
const MAX_SPD  = 5.5;
const CAP_DUR  = 38;
const RESPAWN  = 100;

/* ─── Types ─── */
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  size: number;
  symbol: string;
  angle: number; angleV: number;
}

interface Piece {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  angle: number; angleV: number;
  size: number;
  opacity: number; targetOp: number;
  symbol: string;
  captured: boolean;
  capFrame: number; capScale: number;
  respawn: number;
  particles: Particle[];
  hovered: boolean; dragged: boolean;
}

interface MouseState {
  x: number; y: number;
  down: boolean;
  drag: Piece | null;
  dragOffX: number; dragOffY: number;
  dragStartX: number; dragStartY: number;
  lastX: number; lastY: number;
  dragVx: number; dragVy: number;
}

/* A minimal pointer-event shape used internally */
interface PointerCoords {
  clientX: number;
  clientY: number;
}

/* ─── Helpers ─── */
const rnd   = (a: number, b: number): number => a + Math.random() * (b - a);
const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));

function makePiece(id: number, w: number, h: number, fromEdge: boolean): Piece {
  let x: number, y: number;
  if (fromEdge) {
    const edge = Math.floor(Math.random() * 4);
    if      (edge === 0) { x = rnd(0, w); y = -60; }
    else if (edge === 1) { x = w + 60;   y = rnd(0, h); }
    else if (edge === 2) { x = rnd(0, w); y = h + 60; }
    else                 { x = -60;       y = rnd(0, h); }
  } else {
    x = rnd(80, w - 80);
    y = rnd(80, h - 80);
  }
  const dir = rnd(0, Math.PI * 2);
  const spd = rnd(0.25, 0.65);
  return {
    id, x, y,
    vx: Math.cos(dir) * spd,
    vy: Math.sin(dir) * spd,
    angle:  rnd(0, Math.PI * 2),
    angleV: rnd(-0.006, 0.006),
    size:   rnd(28, 54),
    opacity: 0, targetOp: rnd(0.12, 0.28),
    symbol: SYMBOLS[id % SYMBOLS.length],
    captured: false, capFrame: 0, capScale: 1,
    respawn: 0,
    particles: [],
    hovered: false, dragged: false,
  };
}

function spawnParticles(p: Piece): void {
  const n = 10 + Math.floor(Math.random() * 6);
  for (let i = 0; i < n; i++) {
    const a   = (Math.PI * 2 * i) / n + rnd(-0.3, 0.3);
    const spd = rnd(1.5, 5);
    p.particles.push({
      x: p.x, y: p.y,
      vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
      life: 1,
      size: rnd(8, p.size * 0.5),
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      angle: rnd(0, Math.PI * 2), angleV: rnd(-0.15, 0.15),
    });
  }
}

/* ─── Component ─── */
export default function InteractiveBackground(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef    = useRef<number>(0);
  const piecesRef = useRef<Piece[]>([]);
  const sizeRef   = useRef({ w: 0, h: 0 });
  const mouseRef  = useRef<MouseState>({
    x: -999, y: -999,
    down: false, drag: null,
    dragOffX: 0, dragOffY: 0,
    dragStartX: 0, dragStartY: 0,
    lastX: 0, lastY: 0,
    dragVx: 0, dragVy: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Cast after null check — TypeScript can't narrow ctx inside nested fns otherwise
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
    if (!ctx) return;
    const c: CanvasRenderingContext2D = ctx;

    /* ── Resize ── */
    function resize(): void {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w   = window.innerWidth;
      const h   = window.innerHeight;
      sizeRef.current = { w, h };
      canvas.width        = w * dpr;
      canvas.height       = h * dpr;
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    /* ── Init ── */
    sizeRef.current = { w: window.innerWidth, h: window.innerHeight };
    piecesRef.current = Array.from({ length: COUNT }, (_, i) =>
      makePiece(i, sizeRef.current.w, sizeRef.current.h, false)
    );

    /* ── Colors + opacity range from CSS vars ── */
    function getAccents(): { col1: string; col2: string; opMin: number; opMax: number } {
      const s = getComputedStyle(document.documentElement);
      return {
        col1:  s.getPropertyValue('--piece-col').trim()  || '#e2ff5d',
        col2:  s.getPropertyValue('--piece-col2').trim() || 'rgba(242,242,244,0.4)',
        opMin: parseFloat(s.getPropertyValue('--piece-opacity-min').trim()) || 0.12,
        opMax: parseFloat(s.getPropertyValue('--piece-opacity-max').trim()) || 0.28,
      };
    }

    /* Re-calibrate piece opacity when theme toggles */
    let lastTheme = document.documentElement.getAttribute('data-theme') ?? 'dark';
    function syncOpacity(): void {
      const theme = document.documentElement.getAttribute('data-theme') ?? 'dark';
      if (theme === lastTheme) return;
      lastTheme = theme;
      const { opMin, opMax } = getAccents();
      for (const p of piecesRef.current) {
        if (!p.captured && p.respawn === 0) {
          p.targetOp = rnd(opMin, opMax);
        }
      }
    }

    /* ── Draw helpers ── */
    function drawPiece(p: Piece, col: string): void {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.angle);
      const sc = p.captured ? p.capScale : p.hovered ? 1.12 : 1.0;
      c.scale(sc, sc);
      c.globalAlpha  = p.opacity;
      c.font         = `${p.size}px serif`;
      c.textAlign    = 'center';
      c.textBaseline = 'middle';
      c.fillStyle    = col;
      if (p.hovered || p.dragged || (p.captured && p.capFrame < CAP_DUR * 0.6)) {
        c.shadowColor = col;
        c.shadowBlur  = p.dragged ? 36 : 24;
      }
      c.fillText(p.symbol, 0, 0);
      c.shadowBlur = 0;
      c.restore();
    }

    function drawParticles(p: Piece, col: string): void {
      for (const par of p.particles) {
        c.save();
        c.translate(par.x, par.y);
        c.rotate(par.angle);
        c.globalAlpha  = par.life * 0.85;
        c.font         = `${par.size}px serif`;
        c.textAlign    = 'center';
        c.textBaseline = 'middle';
        c.fillStyle    = col;
        c.shadowColor  = col;
        c.shadowBlur   = 8 * par.life;
        c.fillText(par.symbol, 0, 0);
        c.shadowBlur = 0;
        c.restore();
      }
    }

    function stepParticles(p: Piece): void {
      for (const par of p.particles) {
        par.x += par.vx; par.y += par.vy;
        par.vx *= 0.93;  par.vy *= 0.93;
        par.angle += par.angleV;
        par.life  -= 0.028;
      }
      p.particles = p.particles.filter(par => par.life > 0);
    }

    /* ── Main loop ── */
    function tick(): void {
      const { w, h }       = sizeRef.current;
      const m              = mouseRef.current;
      const pieces         = piecesRef.current;
      syncOpacity();
      const { col1, col2, opMin, opMax } = getAccents();

      c.clearRect(0, 0, w, h);

      let cursorGrab = false;

      for (const p of pieces) {
        const col = p.id % 2 === 0 ? col1 : col2;

        /* ── Waiting to respawn ── */
        if (p.respawn > 0) {
          p.respawn--;
          stepParticles(p);
          drawParticles(p, col);
          if (p.respawn === 0) {
            const fresh = makePiece(p.id, w, h, true);
            fresh.targetOp = rnd(opMin, opMax);
            Object.assign(p, fresh);
          }
          continue;
        }

        /* ── Capture animation ── */
        if (p.captured) {
          p.capFrame++;
          const t = p.capFrame / CAP_DUR;
          if (t < 0.4) {
            p.capScale = 1 + t * 1.5;
            p.opacity  = p.targetOp;
          } else {
            p.capScale = Math.max(0, 1.6 - (t - 0.4) * 3.2);
            p.opacity  = Math.max(0, p.targetOp * (1 - (t - 0.4) * 2.5));
          }
          stepParticles(p);
          drawParticles(p, col);
          drawPiece(p, col);
          if (p.capFrame >= CAP_DUR) {
            p.captured = false;
            p.respawn  = RESPAWN;
          }
          continue;
        }

        /* ── Being dragged ── */
        if (p.dragged) {
          p.x      = m.x - m.dragOffX;
          p.y      = m.y - m.dragOffY;
          p.angle += p.angleV;
          p.opacity = Math.min(p.opacity + 0.04, p.targetOp * 1.4);
          cursorGrab = true;
          drawPiece(p, col);
          continue;
        }

        /* ── Physics ── */
        const dx   = p.x - m.x;
        const dy   = p.y - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        p.hovered = dist < HOVER_R;
        if (p.hovered) cursorGrab = true;

        if (dist < REPEL_R) {
          const force = Math.pow((REPEL_R - dist) / REPEL_R, 2) * 2.2;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx += rnd(-0.015, 0.015);
        p.vy += rnd(-0.015, 0.015);

        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > MAX_SPD) { p.vx = (p.vx / spd) * MAX_SPD; p.vy = (p.vy / spd) * MAX_SPD; }

        p.vx *= 0.985; p.vy *= 0.985;
        p.x  += p.vx;  p.y  += p.vy;
        p.angle += p.angleV;

        /* ── Wall bounce ── */
        const pad = p.size;
        if (p.x < pad)     { p.x = pad;     p.vx =  Math.abs(p.vx) * 0.7; }
        if (p.x > w - pad) { p.x = w - pad; p.vx = -Math.abs(p.vx) * 0.7; }
        if (p.y < pad)     { p.y = pad;     p.vy =  Math.abs(p.vy) * 0.7; }
        if (p.y > h - pad) { p.y = h - pad; p.vy = -Math.abs(p.vy) * 0.7; }

        p.opacity = Math.min(p.opacity + 0.008, p.targetOp);

        drawPiece(p, col);
      }

      if (canvas) canvas.style.cursor = cursorGrab ? 'grab' : 'default';
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    /* ─── Pointer helpers (shared by mouse + touch) ─── */
    function handlePointerDown(coords: PointerCoords): void {
      const m = mouseRef.current;
      m.down       = true;
      m.dragStartX = coords.clientX;
      m.dragStartY = coords.clientY;
      m.lastX      = coords.clientX;
      m.lastY      = coords.clientY;

      let closest: Piece | null = null;
      let closestDist = Infinity;
      for (const p of piecesRef.current) {
        if (p.captured || p.respawn > 0) continue;
        const dx = p.x - coords.clientX;
        const dy = p.y - coords.clientY;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < GRAB_R && d < closestDist) { closestDist = d; closest = p; }
      }
      if (closest !== null) {
        m.drag       = closest;
        m.dragOffX   = coords.clientX - closest.x;
        m.dragOffY   = coords.clientY - closest.y;
        closest.dragged = true;
      }
    }

    function handlePointerMove(coords: PointerCoords): void {
      const m  = mouseRef.current;
      m.dragVx = coords.clientX - m.lastX;
      m.dragVy = coords.clientY - m.lastY;
      m.lastX  = coords.clientX;
      m.lastY  = coords.clientY;
      m.x      = coords.clientX;
      m.y      = coords.clientY;
    }

    function handlePointerUp(coords: PointerCoords): void {
      const m = mouseRef.current;
      m.down  = false;
      if (m.drag === null) return;

      const p     = m.drag;
      const moved = Math.sqrt(
        Math.pow(coords.clientX - m.dragStartX, 2) +
        Math.pow(coords.clientY - m.dragStartY, 2)
      );
      p.dragged = false;

      if (moved < 8) {
        p.captured = true;
        p.capFrame = 0;
        p.capScale = 1;
        spawnParticles(p);
      } else {
        p.vx = clamp(m.dragVx * 1.2, -MAX_SPD, MAX_SPD);
        p.vy = clamp(m.dragVy * 1.2, -MAX_SPD, MAX_SPD);
      }
      m.drag = null;
    }

    /* ─── Mouse events ─── */
    function onMouseMove(e: MouseEvent): void  { handlePointerMove(e); }
    function onMouseDown(e: MouseEvent): void  { handlePointerDown(e); }
    function onMouseUp(e: MouseEvent): void    { handlePointerUp(e); }

    /* ─── Touch events ─── */
    function onTouchStart(e: TouchEvent): void {
      const t = e.touches[0];
      if (t) handlePointerDown({ clientX: t.clientX, clientY: t.clientY });
    }
    function onTouchMove(e: TouchEvent): void {
      const t = e.touches[0];
      if (!t) return;
      handlePointerMove({ clientX: t.clientX, clientY: t.clientY });
      if (mouseRef.current.drag !== null) e.preventDefault();
    }
    function onTouchEnd(e: TouchEvent): void {
      const t = e.changedTouches[0];
      if (t) handlePointerUp({ clientX: t.clientX, clientY: t.clientY });
    }

    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('mousedown',  onMouseDown);
    window.addEventListener('mouseup',    onMouseUp);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });
    window.addEventListener('touchend',   onTouchEnd,   { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize',     resize);
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mousedown',  onMouseDown);
      window.removeEventListener('mouseup',    onMouseUp);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('touchend',   onTouchEnd);
    };
  }, []);

  return (
    <>
      <div className="app-board animate-bgFade">
        {Array.from({ length: 64 }).map((_, i) => (
          <div
            key={i}
            className={(Math.floor(i / 8) + (i % 8)) % 2 === 0 ? 'board-cell light' : 'board-cell dark'}
          />
        ))}
      </div>
      <div className="bg-glow" />
      <div className="bg-shimmer" />
      <canvas ref={canvasRef} className="chess-canvas" />
    </>
  );
}