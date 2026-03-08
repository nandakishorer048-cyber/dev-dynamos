import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 22, stiffness: 450, mass: 0.4 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleElementHover = () => setIsHovering(true);
    const handleElementLeave = () => setIsHovering(false);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    const addListeners = () => {
      const els = document.querySelectorAll('a, button, input, select, textarea, [role="button"], .cursor-hover');
      els.forEach((el) => {
        el.addEventListener('mouseenter', handleElementHover);
        el.addEventListener('mouseleave', handleElementLeave);
      });
      return els;
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
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      observer.disconnect();
      elements.forEach((el) => {
        el.removeEventListener('mouseenter', handleElementHover);
        el.removeEventListener('mouseleave', handleElementLeave);
      });
    };
  }, [cursorX, cursorY, isVisible]);

  if (typeof window !== 'undefined' && ('ontouchstart' in window || window.matchMedia('(max-width: 768px)').matches)) {
    return null;
  }

  const emoji = isHovering ? '👆' : '💊';
  const size = isClicking ? 20 : isHovering ? 32 : 26;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
      <motion.div
        className="fixed select-none"
        style={{
          x,
          y,
          fontSize: size,
          translateX: `-${size / 2}px`,
          translateY: `-${size / 2}px`,
          opacity: isVisible ? 1 : 0,
          filter: isHovering
            ? 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))'
            : 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))',
          transition: 'font-size 0.2s ease, filter 0.3s ease',
        }}
        animate={{ rotate: isClicking ? -15 : 0, scale: isClicking ? 0.8 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      >
        {emoji}
      </motion.div>
    </div>
  );
};
