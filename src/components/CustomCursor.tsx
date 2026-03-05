import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface ParticleTrail {
    id: number;
    x: number;
    y: number;
    opacity: number;
    scale: number;
    hue: number;
}

let particleId = 0;

export const CustomCursor: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [particles, setParticles] = useState<ParticleTrail[]>([]);
    const frameRef = useRef<number>(0);
    const lastPosRef = useRef({ x: 0, y: 0 });

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 20, stiffness: 400, mass: 0.5 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    // Outer ring with slower spring
    const outerConfig = { damping: 30, stiffness: 200, mass: 0.8 };
    const outerXSpring = useSpring(cursorX, outerConfig);
    const outerYSpring = useSpring(cursorY, outerConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);

            // Create particle trail
            const dx = e.clientX - lastPosRef.current.x;
            const dy = e.clientY - lastPosRef.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 5) {
                const newParticle: ParticleTrail = {
                    id: particleId++,
                    x: e.clientX + (Math.random() - 0.5) * 10,
                    y: e.clientY + (Math.random() - 0.5) * 10,
                    opacity: 0.7,
                    scale: Math.random() * 0.5 + 0.3,
                    hue: 210 + Math.random() * 80, // Range between blue (210) and purple (290)
                };

                setParticles(prev => [...prev.slice(-18), newParticle]);
                lastPosRef.current = { x: e.clientX, y: e.clientY };
            }
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        const handleElementHover = () => setIsHovering(true);
        const handleElementLeave = () => setIsHovering(false);

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('mouseenter', handleMouseEnter);

        // Use MutationObserver to handle dynamically added elements
        const addListeners = () => {
            const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"], .cursor-hover');
            interactiveElements.forEach((el) => {
                el.addEventListener('mouseenter', handleElementHover);
                el.addEventListener('mouseleave', handleElementLeave);
            });
            return interactiveElements;
        };

        let elements = addListeners();
        const observer = new MutationObserver(() => {
            elements.forEach((el) => {
                el.removeEventListener('mouseenter', handleElementHover);
                el.removeEventListener('mouseleave', handleElementLeave);
            });
            elements = addListeners();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('mouseenter', handleMouseEnter);
            observer.disconnect();
            elements.forEach((el) => {
                el.removeEventListener('mouseenter', handleElementHover);
                el.removeEventListener('mouseleave', handleElementLeave);
            });
        };
    }, [cursorX, cursorY, isVisible]);

    // Fade out particles
    useEffect(() => {
        const fadeParticles = () => {
            setParticles(prev =>
                prev
                    .map(p => ({
                        ...p,
                        opacity: p.opacity * 0.92,
                        scale: p.scale * 0.97,
                        y: p.y - 0.3,
                    }))
                    .filter(p => p.opacity > 0.05)
            );
            frameRef.current = requestAnimationFrame(fadeParticles);
        };
        frameRef.current = requestAnimationFrame(fadeParticles);
        return () => cancelAnimationFrame(frameRef.current);
    }, []);

    // Don't render cursor on mobile/touch devices
    if (typeof window !== 'undefined' && ('ontouchstart' in window || window.matchMedia('(max-width: 768px)').matches)) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
            {/* Particle trail */}
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: p.x,
                        top: p.y,
                        width: 6,
                        height: 6,
                        opacity: p.opacity,
                        transform: `translate(-50%, -50%) scale(${p.scale})`,
                        background: `radial-gradient(circle, hsla(${p.hue}, 90%, 65%, 0.8) 0%, transparent 70%)`,
                        boxShadow: `0 0 ${8 * p.opacity}px hsla(${p.hue}, 90%, 65%, ${p.opacity * 0.6})`,
                        willChange: 'transform, opacity',
                    }}
                />
            ))}

            {/* Outer glow ring */}
            <motion.div
                className="fixed rounded-full mix-blend-screen"
                style={{
                    x: outerXSpring,
                    y: outerYSpring,
                    width: isHovering ? 56 : 40,
                    height: isHovering ? 56 : 40,
                    translateX: isHovering ? '-28px' : '-20px',
                    translateY: isHovering ? '-28px' : '-20px',
                    border: `1.5px solid ${isHovering ? 'rgba(139, 92, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`,
                    background: isHovering
                        ? 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'width 0.3s, height 0.3s, border 0.3s, background 0.3s',
                }}
            />

            {/* Core cursor dot */}
            <motion.div
                className="fixed rounded-full mix-blend-screen"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    width: isHovering ? 14 : 10,
                    height: isHovering ? 14 : 10,
                    translateX: isHovering ? '-7px' : '-5px',
                    translateY: isHovering ? '-7px' : '-5px',
                    background: isHovering
                        ? 'radial-gradient(circle, rgba(139, 92, 246, 0.9) 0%, rgba(59, 130, 246, 0.6) 50%, transparent 100%)'
                        : 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(14, 165, 233, 0.5) 50%, transparent 100%)',
                    boxShadow: isHovering
                        ? '0 0 20px 6px rgba(139, 92, 246, 0.5), 0 0 40px 12px rgba(59, 130, 246, 0.3)'
                        : '0 0 12px 3px rgba(59, 130, 246, 0.4), 0 0 24px 6px rgba(14, 165, 233, 0.2)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'width 0.2s, height 0.2s, background 0.3s, box-shadow 0.3s',
                }}
            />
        </div>
    );
};
