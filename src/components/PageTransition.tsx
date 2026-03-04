import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        filter: 'blur(10px)',
    },
    in: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
    },
    out: {
        opacity: 0,
        y: -20,
        filter: 'blur(10px)',
    },
};

const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
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
        >
            {children}
        </motion.div>
    );
};
