import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 700 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX - 16);
            cursorY.set(e.clientY - 16);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        const handleElementHover = () => setIsHovering(true);
        const handleElementLeave = () => setIsHovering(false);

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('mouseenter', handleMouseEnter);

        // Add listeners to all interactive elements
        const interactiveElements = document.querySelectorAll('a, button, input, select, [role="button"]');
        interactiveElements.forEach((el) => {
            el.addEventListener('mouseenter', handleElementHover);
            el.addEventListener('mouseleave', handleElementLeave);
        });

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('mouseenter', handleMouseEnter);

            interactiveElements.forEach((el) => {
                el.removeEventListener('mouseenter', handleElementHover);
                el.removeEventListener('mouseleave', handleElementLeave);
            });
        };
    }, [cursorX, cursorY, isVisible]);

    // Don't render cursor on mobile devices
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
        return null;
    }

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[100] mix-blend-screen"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    backgroundColor: isHovering ? 'rgba(37, 99, 235, 0.5)' : 'rgba(124, 58, 237, 0.5)',
                    boxShadow: isHovering
                        ? '0 0 20px 5px rgba(37, 99, 235, 0.6), 0 0 40px 10px rgba(244, 63, 94, 0.4)'
                        : '0 0 15px 2px rgba(124, 58, 237, 0.5)',
                    scale: isHovering ? 1.5 : 1,
                    opacity: isVisible ? 1 : 0,
                }}
                transition={{ scale: { type: 'spring', stiffness: 300, damping: 20 } }}
            />
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[100] bg-white mix-blend-difference"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: '12px',
                    translateY: '12px',
                    opacity: isVisible ? 1 : 0,
                }}
            />
        </>
    );
};
