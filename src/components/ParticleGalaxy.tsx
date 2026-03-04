import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    size: number;
    color: string;
    vx: number;
    vy: number;
    angle: number;
    distance: number;
    speed: number;
}

export const ParticleGalaxy: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        // Mouse state
        const mouse = {
            x: -1000,
            y: -1000,
            radius: 150
        };

        // Colors: Blue, Purple, Pink, Orange
        const colors = ['#2563EB', '#7C3AED', '#F43F5E', '#F97316'];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            // Adjust particle count based on screen width for performance
            const isMobile = window.innerWidth < 768;
            const particleCount = isMobile ? 150 : 400;

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            for (let i = 0; i < particleCount; i++) {
                // Create an orbital distribution
                // Use a wide elliptical orbit or ring
                const angle = Math.random() * Math.PI * 2;
                // Focus particles in a donut shape around the center text
                const minRadius = isMobile ? 100 : 250;
                const maxRadius = isMobile ? 300 : 600;

                // Use power curve to cluster towards the inner edge of the ring
                const distance = minRadius + Math.pow(Math.random(), 1.5) * (maxRadius - minRadius);

                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;

                particles.push({
                    x,
                    y,
                    baseX: x,
                    baseY: y,
                    size: Math.random() * 2 + 0.5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    vx: 0,
                    vy: 0,
                    angle,
                    distance,
                    speed: (Math.random() * 0.002) + 0.001 * (Math.random() < 0.5 ? 1 : -1) // Slow orbital speed
                });
            }
        };

        const draw = () => {
            // Clear with slight trailing effect for motion blur
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            particles.forEach(p => {
                // 1. Orbital motion update
                p.angle += p.speed;
                p.baseX = centerX + Math.cos(p.angle) * p.distance;
                p.baseY = centerY + Math.sin(p.angle) * p.distance;

                // 2. Mouse interaction
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Calculate forces
                if (dist < mouse.radius) {
                    // Repel from mouse
                    const forceDirectionX = dx / dist;
                    const forceDirectionY = dy / dist;
                    // Farther from center of mouse = weaker force, max force at center
                    const force = (mouse.radius - dist) / mouse.radius;
                    // Apply negative force to repel
                    p.vx -= forceDirectionX * force * 1.5;
                    p.vy -= forceDirectionY * force * 1.5;
                }

                // 3. Return to base position (spring force)
                const springX = (p.baseX - p.x) * 0.05;
                const springY = (p.baseY - p.y) * 0.05;

                p.vx += springX;
                p.vy += springY;

                // 4. Apply friction
                p.vx *= 0.85;
                p.vy *= 0.85;

                // 5. Update position
                p.x += p.vx;
                p.y += p.vy;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;

                // Add soft glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;

                ctx.fill();

                // Reset shadow for next draw loop performance
                ctx.shadowBlur = 0;
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
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
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
            style={{ opacity: 0.8 }}
        />
    );
};
