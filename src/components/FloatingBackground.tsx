import React, { useEffect, useRef } from 'react';

/**
 * A full-screen canvas background with slowly drifting particles and
 * soft gradient mesh. Designed for inner pages (not the landing page
 * which uses ParticleGalaxy).
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
            'rgba(59, 130, 246, ',
            'rgba(139, 92, 246, ',
            'rgba(14, 165, 233, ',
            'rgba(99, 102, 241, ',
        ];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            const isMobile = window.innerWidth < 768;
            const count = isMobile ? 30 : 60;
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: Math.random() * 2 + 0.5,
                    alpha: Math.random() * 0.3 + 0.1,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: Math.random() * 0.02 + 0.005,
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Soft gradient mesh blobs
            const time = Date.now() * 0.0003;

            // Blue blob
            const bx = canvas.width * 0.3 + Math.sin(time) * 100;
            const by = canvas.height * 0.4 + Math.cos(time * 0.7) * 80;
            const bg = ctx.createRadialGradient(bx, by, 0, bx, by, 300);
            bg.addColorStop(0, 'rgba(59, 130, 246, 0.03)');
            bg.addColorStop(1, 'transparent');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Purple blob
            const px = canvas.width * 0.7 + Math.cos(time * 0.8) * 120;
            const py = canvas.height * 0.6 + Math.sin(time * 0.6) * 90;
            const pg = ctx.createRadialGradient(px, py, 0, px, py, 350);
            pg.addColorStop(0, 'rgba(139, 92, 246, 0.025)');
            pg.addColorStop(1, 'transparent');
            ctx.fillStyle = pg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Cyan blob
            const cx = canvas.width * 0.5 + Math.sin(time * 1.2) * 80;
            const cy = canvas.height * 0.2 + Math.cos(time * 0.9) * 60;
            const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 250);
            cg.addColorStop(0, 'rgba(14, 165, 233, 0.02)');
            cg.addColorStop(1, 'transparent');
            ctx.fillStyle = cg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw floating particles
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.pulse += p.pulseSpeed;

                // Wrap around
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;
                if (p.y < -10) p.y = canvas.height + 10;
                if (p.y > canvas.height + 10) p.y = -10;

                const a = p.alpha + Math.sin(p.pulse) * 0.1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + Math.max(0, a) + ')';
                ctx.shadowBlur = 8;
                ctx.shadowColor = p.color + '0.3)';
                ctx.fill();
                ctx.shadowBlur = 0;
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
            style={{ opacity: 0.9 }}
        />
    );
};
