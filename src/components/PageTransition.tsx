import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 30,
        scale: 0.98,
        filter: 'blur(8px)',
    },
    in: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
    },
    out: {
        opacity: 0,
        y: -20,
        scale: 0.99,
        filter: 'blur(6px)',
    },
};

const pageTransition = {
    type: 'tween' as const,
    ease: [0.16, 1, 0.3, 1] as const, // Custom ease-out curve
    duration: 0.6,
};

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full min-h-screen"
            style={{ willChange: 'transform, opacity, filter' }}
        >
            {children}
        </motion.div>
    );
};
