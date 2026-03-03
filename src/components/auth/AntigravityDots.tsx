import { useEffect, useRef, useCallback } from 'react';

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  originalX: number;
  originalY: number;
}

export function AntigravityDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);

  const COLORS = [
    'hsla(168, 76%, 42%, 0.6)',
    'hsla(200, 80%, 50%, 0.5)',
    'hsla(270, 65%, 60%, 0.4)',
    'hsla(165, 60%, 50%, 0.5)',
    'hsla(45, 95%, 50%, 0.3)',
    'hsla(152, 70%, 42%, 0.4)',
  ];

  const initDots = useCallback((w: number, h: number) => {
    const count = Math.min(Math.floor((w * h) / 4000), 200);
    const dots: Dot[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      dots.push({
        x, y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 4 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        originalX: x,
        originalY: y,
      });
    }
    dotsRef.current = dots;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      initDots(canvas.offsetWidth, canvas.offsetHeight);
    };

    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const mouse = mouseRef.current;
      const repelRadius = 120;
      const repelForce = 8;

      for (const dot of dotsRef.current) {
        // Mouse repulsion (antigravity)
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < repelRadius && dist > 0) {
          const force = (1 - dist / repelRadius) * repelForce;
          dot.vx += (dx / dist) * force;
          dot.vy += (dy / dist) * force;
        }

        // Gentle return to original position
        dot.vx += (dot.originalX - dot.x) * 0.005;
        dot.vy += (dot.originalY - dot.y) * 0.005;

        // Friction
        dot.vx *= 0.95;
        dot.vy *= 0.95;

        dot.x += dot.vx;
        dot.y += dot.vy;

        // Bounce off edges
        if (dot.x < 0 || dot.x > w) dot.vx *= -0.8;
        if (dot.y < 0 || dot.y > h) dot.vy *= -0.8;
        dot.x = Math.max(0, Math.min(w, dot.x));
        dot.y = Math.max(0, Math.min(h, dot.y));

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
      }

      // Draw connections
      const dots = dotsRef.current;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `hsla(168, 76%, 42%, ${0.15 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [initDots]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'auto' }}
    />
  );
}
