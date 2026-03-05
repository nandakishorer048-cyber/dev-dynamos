import React, { useEffect, useRef, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    size: number;
    color: string;
    alpha: number;
    vx: number;
    vy: number;
    angle: number;
    distance: number;
    speed: number;
    pulse: number;
    pulseSpeed: number;
}

interface FloatingShape {
    x: number;
    y: number;
    size: number;
    rotation: number;
    rotationSpeed: number;
    speedX: number;
    speedY: number;
    opacity: number;
    color: string;
    type: 'circle' | 'hexagon' | 'triangle';
}

// HSL string colors with neon glow palette
const COLORS = [
    'rgba(59, 130, 246, 0.8)',   // Blue
    'rgba(139, 92, 246, 0.8)',   // Purple
    'rgba(14, 165, 233, 0.75)',  // Cyan
    'rgba(168, 85, 247, 0.7)',   // Violet
    'rgba(6, 182, 212, 0.7)',    // Teal
    'rgba(99, 102, 241, 0.6)',   // Indigo
];

const GLOW_COLORS = [
    'rgba(59, 130, 246, ',       // Blue
    'rgba(139, 92, 246, ',       // Purple
    'rgba(14, 165, 233, ',       // Cyan
    'rgba(168, 85, 247, ',       // Violet
    'rgba(6, 182, 212, ',        // Teal
];

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
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
    };

    const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 / 3) * i - Math.PI / 2;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
    };

    const init = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let particles: Particle[] = [];
        let floatingShapes: FloatingShape[] = [];
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
            initFloatingShapes();
        };

        const initParticles = () => {
            particles = [];
            const isMobile = window.innerWidth < 768;
            const particleCount = isMobile ? 100 : 300;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const minRadius = isMobile ? 80 : 180;
                const maxRadius = isMobile ? Math.min(canvas.width, canvas.height) * 0.45 : Math.min(canvas.width, canvas.height) * 0.5;
                const distance = minRadius + Math.pow(Math.random(), 1.3) * (maxRadius - minRadius);

                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                const colorIndex = Math.floor(Math.random() * COLORS.length);

                particles.push({
                    x,
                    y,
                    baseX: x,
                    baseY: y,
                    size: Math.random() * 2.5 + 0.5,
                    color: COLORS[colorIndex],
                    alpha: Math.random() * 0.5 + 0.3,
                    vx: 0,
                    vy: 0,
                    angle,
                    distance,
                    speed: (Math.random() * 0.0015 + 0.0005) * (Math.random() < 0.5 ? 1 : -1),
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: Math.random() * 0.02 + 0.01,
                });
            }
        };

        const initFloatingShapes = () => {
            floatingShapes = [];
            const shapeCount = window.innerWidth < 768 ? 4 : 8;
            const types: FloatingShape['type'][] = ['circle', 'hexagon', 'triangle'];

            for (let i = 0; i < shapeCount; i++) {
                floatingShapes.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 40 + 20,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.005,
                    speedX: (Math.random() - 0.5) * 0.3,
                    speedY: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.06 + 0.02,
                    color: GLOW_COLORS[Math.floor(Math.random() * GLOW_COLORS.length)],
                    type: types[Math.floor(Math.random() * types.length)],
                });
            }
        };

        const draw = () => {
            time++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const mouse = mouseRef.current;

            // Draw floating shapes (behind particles)
            floatingShapes.forEach(shape => {
                shape.x += shape.speedX;
                shape.y += shape.speedY;
                shape.rotation += shape.rotationSpeed;

                // Wrap around screen
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
                    drawTriangle(ctx, 0, 0, shape.size);
                    ctx.stroke();
                }
                ctx.restore();
            });

            // Draw connection lines between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        const alpha = (1 - dist / 100) * 0.08;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(100, 150, 255, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            // Draw particles
            particles.forEach(p => {
                // Orbital motion
                p.angle += p.speed;
                p.baseX = centerX + Math.cos(p.angle) * p.distance;
                p.baseY = centerY + Math.sin(p.angle) * p.distance;

                // Pulsing alpha
                p.pulse += p.pulseSpeed;
                const pulseAlpha = p.alpha + Math.sin(p.pulse) * 0.2;

                // Mouse interaction
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const mouseRadius = 180;

                if (dist < mouseRadius) {
                    const force = (mouseRadius - dist) / mouseRadius;
                    p.vx -= (dx / dist) * force * 2;
                    p.vy -= (dy / dist) * force * 2;
                }

                // Spring back
                p.vx += (p.baseX - p.x) * 0.04;
                p.vy += (p.baseY - p.y) * 0.04;

                // Friction
                p.vx *= 0.88;
                p.vy *= 0.88;

                // Update
                p.x += p.vx;
                p.y += p.vy;

                // Draw with glow
                const glowSize = p.size * (1 + Math.sin(p.pulse) * 0.3);
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${Math.max(0, pulseAlpha)})`);

                // Soft glow effect
                ctx.shadowBlur = 12;
                ctx.shadowColor = p.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Draw mouse attraction glow
            if (mouse.x > 0 && mouse.y > 0) {
                const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120);
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0.04)');
                gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.02)');
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(mouse.x - 120, mouse.y - 120, 240, 240);
            }

            animFrameRef.current = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

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

    useEffect(() => {
        const cleanup = init();
        return cleanup;
    }, [init]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
            style={{ opacity: 0.85 }}
        />
    );
};
