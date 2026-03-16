import React, { useEffect, useRef } from 'react';

/**
 * Light theme floating background with soft medical-themed particles
 * and gradient mesh for inner pages.
 */
export const FloatingBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;

    interface FloatParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
      pulse: number;
      pulseSpeed: number;
    }

    let particles: FloatParticle[] = [];
    const colors = [
      'rgba(58, 141, 255, ',    // Medical blue
      'rgba(0, 198, 255, ',     // Cyan
      'rgba(74, 222, 128, ',    // Green
      'rgba(139, 92, 246, ',    // Purple
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      const isMobile = window.innerWidth < 768;
      const count = isMobile ? 20 : 40;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 3 + 1,
          alpha: Math.random() * 0.15 + 0.05,
          color: colors[Math.floor(Math.random() * colors.length)],
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.015 + 0.005,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.0003;

      // Soft blue blob
      const bx = canvas.width * 0.25 + Math.sin(time) * 100;
      const by = canvas.height * 0.3 + Math.cos(time * 0.7) * 80;
      const bg = ctx.createRadialGradient(bx, by, 0, bx, by, 350);
      bg.addColorStop(0, 'rgba(58, 141, 255, 0.04)');
      bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyan blob
      const cx = canvas.width * 0.75 + Math.cos(time * 0.8) * 120;
      const cy = canvas.height * 0.7 + Math.sin(time * 0.6) * 90;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
      cg.addColorStop(0, 'rgba(0, 198, 255, 0.03)');
      cg.addColorStop(1, 'transparent');
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Green blob
      const gx = canvas.width * 0.5 + Math.sin(time * 1.2) * 80;
      const gy = canvas.height * 0.2 + Math.cos(time * 0.9) * 60;
      const gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, 250);
      gg.addColorStop(0, 'rgba(74, 222, 128, 0.025)');
      gg.addColorStop(1, 'transparent');
      ctx.fillStyle = gg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        const a = p.alpha + Math.sin(p.pulse) * 0.05;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.max(0, a) + ')';
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
};
