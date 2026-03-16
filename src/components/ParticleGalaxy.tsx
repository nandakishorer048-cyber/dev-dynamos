import React, { useEffect, useRef, useCallback } from 'react';

// Light theme particle colors
const COLORS = [
  'rgba(58, 141, 255, 0.5)',   // Medical blue
  'rgba(0, 198, 255, 0.45)',   // Cyan
  'rgba(74, 222, 128, 0.4)',   // Green
  'rgba(139, 92, 246, 0.4)',   // Purple
  'rgba(58, 141, 255, 0.35)',  // Lighter blue
];

const GLOW_COLORS = [
  'rgba(58, 141, 255, ',
  'rgba(0, 198, 255, ',
  'rgba(74, 222, 128, ',
  'rgba(139, 92, 246, ',
];

interface Particle {
  x: number; y: number; baseX: number; baseY: number;
  size: number; color: string; alpha: number;
  vx: number; vy: number; angle: number; distance: number;
  speed: number; pulse: number; pulseSpeed: number;
}

interface FloatingShape {
  x: number; y: number; size: number; rotation: number;
  rotationSpeed: number; speedX: number; speedY: number;
  opacity: number; color: string;
  type: 'circle' | 'hexagon' | 'cross';
}

export const ParticleGalaxy: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number>(0);

  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };

  const drawCross = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const w = size * 0.3;
    ctx.beginPath();
    ctx.moveTo(x - w, y - size); ctx.lineTo(x + w, y - size);
    ctx.lineTo(x + w, y - w); ctx.lineTo(x + size, y - w);
    ctx.lineTo(x + size, y + w); ctx.lineTo(x + w, y + w);
    ctx.lineTo(x + w, y + size); ctx.lineTo(x - w, y + size);
    ctx.lineTo(x - w, y + w); ctx.lineTo(x - size, y + w);
    ctx.lineTo(x - size, y - w); ctx.lineTo(x - w, y - w);
    ctx.closePath();
  };

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let particles: Particle[] = [];
    let floatingShapes: FloatingShape[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
      initFloatingShapes();
    };

    const initParticles = () => {
      particles = [];
      const isMobile = window.innerWidth < 768;
      const count = isMobile ? 80 : 200;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const minR = isMobile ? 60 : 120;
        const maxR = Math.min(canvas.width, canvas.height) * (isMobile ? 0.45 : 0.5);
        const distance = minR + Math.pow(Math.random(), 1.3) * (maxR - minR);
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        particles.push({
          x, y, baseX: x, baseY: y,
          size: Math.random() * 2.5 + 0.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: Math.random() * 0.4 + 0.15,
          vx: 0, vy: 0, angle, distance,
          speed: (Math.random() * 0.001 + 0.0003) * (Math.random() < 0.5 ? 1 : -1),
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.015 + 0.008,
        });
      }
    };

    const initFloatingShapes = () => {
      floatingShapes = [];
      const count = window.innerWidth < 768 ? 3 : 6;
      const types: FloatingShape['type'][] = ['circle', 'hexagon', 'cross'];
      for (let i = 0; i < count; i++) {
        floatingShapes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 30 + 15,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.003,
          speedX: (Math.random() - 0.5) * 0.25,
          speedY: (Math.random() - 0.5) * 0.25,
          opacity: Math.random() * 0.06 + 0.02,
          color: GLOW_COLORS[Math.floor(Math.random() * GLOW_COLORS.length)],
          type: types[Math.floor(Math.random() * types.length)],
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const mouse = mouseRef.current;

      // Floating shapes
      floatingShapes.forEach(shape => {
        shape.x += shape.speedX;
        shape.y += shape.speedY;
        shape.rotation += shape.rotationSpeed;
        if (shape.x < -shape.size) shape.x = canvas.width + shape.size;
        if (shape.x > canvas.width + shape.size) shape.x = -shape.size;
        if (shape.y < -shape.size) shape.y = canvas.height + shape.size;
        if (shape.y > canvas.height + shape.size) shape.y = -shape.size;

        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.rotation);
        ctx.strokeStyle = shape.color + shape.opacity + ')';
        ctx.lineWidth = 1;

        if (shape.type === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, shape.size, 0, Math.PI * 2);
          ctx.stroke();
        } else if (shape.type === 'hexagon') {
          drawHexagon(ctx, 0, 0, shape.size);
          ctx.stroke();
        } else {
          drawCross(ctx, 0, 0, shape.size);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const alpha = (1 - dist / 90) * 0.06;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(58, 141, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Particles
      particles.forEach(p => {
        p.angle += p.speed;
        p.baseX = centerX + Math.cos(p.angle) * p.distance;
        p.baseY = centerY + Math.sin(p.angle) * p.distance;
        p.pulse += p.pulseSpeed;
        const pulseAlpha = p.alpha + Math.sin(p.pulse) * 0.1;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.vx -= (dx / dist) * force * 1.5;
          p.vy -= (dy / dist) * force * 1.5;
        }

        p.vx += (p.baseX - p.x) * 0.04;
        p.vy += (p.baseY - p.y) * 0.04;
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + Math.sin(p.pulse) * 0.2), 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${Math.max(0, pulseAlpha)})`);
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const handleMouseLeave = () => { mouseRef.current = { x: -1000, y: -1000 }; };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => { const cleanup = init(); return cleanup; }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};
