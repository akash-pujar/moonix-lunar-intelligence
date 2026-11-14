// StarfieldCanvas.tsx — Pure white astronomical starfield with realistic depth
import { useEffect, useRef } from 'react';

interface Star {
  x: number; // 0..1 normalized width
  y: number; // 0..1 normalized height
  size: number;
  color: string;
  baseAlpha: number;
  twinkleSpeed?: number;
  twinklePhase?: number;
  layer: 1 | 2 | 3;
}

export function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 }); // -1 .. 1 normalized offset

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Track subtle pointer parallax
    const onMouseMove = (e: MouseEvent) => {
      pointerRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const stars: Star[] = [];

    // Layer 1: Distant tiny stars (380 points, sub-pixel, dim, pure white and silver)
    for (let i = 0; i < 380; i++) {
      const whitePalette = ['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0'];
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: 0.45 + Math.random() * 0.55,
        color: whitePalette[Math.floor(Math.random() * whitePalette.length)],
        baseAlpha: 0.12 + Math.random() * 0.28,
        layer: 1,
      });
    }

    // Layer 2: Mid-distance stars (95 points, crisp white with gentle random twinkling)
    for (let i = 0; i < 95; i++) {
      const whitePalette = ['#ffffff', '#f8fafc', '#f1f5f9'];
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: 0.9 + Math.random() * 0.65,
        color: whitePalette[Math.floor(Math.random() * whitePalette.length)],
        baseAlpha: 0.35 + Math.random() * 0.35,
        twinkleSpeed: 0.6 + Math.random() * 1.4,
        twinklePhase: Math.random() * Math.PI * 2,
        layer: 2,
      });
    }

    // Layer 3: Foreground prominent stars (20 points, crisp diamond white with subtle soft white glow)
    for (let i = 0; i < 20; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: 1.5 + Math.random() * 0.6,
        color: '#ffffff',
        baseAlpha: 0.8 + Math.random() * 0.18,
        twinkleSpeed: 0.4 + Math.random() * 0.8,
        twinklePhase: Math.random() * Math.PI * 2,
        layer: 3,
      });
    }

    // Resize handling
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Animation loop
    let animId: number;
    let startTime = performance.now();

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      const elapsed = (time - startTime) * 0.001;

      ctx.clearRect(0, 0, width, height);

      const px = pointerRef.current.x;
      const py = pointerRef.current.y;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Very subtle parallax offset per layer
        let offsetX = 0;
        let offsetY = 0;
        if (!prefersReducedMotion) {
          if (s.layer === 2) {
            offsetX = px * 3;
            offsetY = py * 3;
          } else if (s.layer === 3) {
            offsetX = px * 7;
            offsetY = py * 7;
          }
        }

        const posX = s.x * width + offsetX;
        const posY = s.y * height + offsetY;

        // Alpha calculation
        let alpha = s.baseAlpha;
        if (!prefersReducedMotion && s.twinkleSpeed !== undefined && s.twinklePhase !== undefined) {
          alpha += Math.sin(elapsed * s.twinkleSpeed + s.twinklePhase) * 0.18;
          alpha = Math.max(0.06, Math.min(1, alpha));
        }

        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;

        ctx.beginPath();
        ctx.arc(posX, posY, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Delicate soft white glow on foreground stars (NO cyan)
        if (s.layer === 3 && alpha > 0.6) {
          ctx.beginPath();
          ctx.arc(posX, posY, s.size * 2.0, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = alpha * 0.12;
          ctx.fill();
        }
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
