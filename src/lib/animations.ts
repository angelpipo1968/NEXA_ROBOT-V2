/**
 * Animation Utilities - Framer Motion Variants
 * Reusable animation configurations for consistent UX
 */

import { Variants } from 'framer-motion';

/**
 * Card entrance animation - fade + slide up
 */
export const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1] // Custom easing
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.98,
        transition: { duration: 0.2 }
    }
};

/**
 * Staggered children animation
 */
export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

/**
 * Item animation for lists
 */
export const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3 }
    }
};

/**
 * Hover animation for interactive elements
 */
export const hoverVariants = {
    rest: { scale: 1 },
    hover: {
        scale: 1.02,
        transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
};

/**
 * Skeleton loading animation
 */
export const skeletonVariants: Variants = {
    loading: {
        opacity: [0.3, 0.5, 0.3],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    }
};

/**
 * Number counting animation helper
 */
export const animateNumber = (
    from: number,
    to: number,
    duration: number = 1000,
    onUpdate: (value: number) => void
) => {
    const startTime = Date.now();
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = from + (to - from) * eased;

        onUpdate(current);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    requestAnimationFrame(animate);
};

/**
 * Fade in up variant
 */
export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1]
        }
    }
};

/**
 * Scale pulse animation
 */
export const scalePulse: Variants = {
    initial: { scale: 1 },
    animate: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    }
};

/**
 * Shimmer loading effect
 */
export const shimmerVariants: Variants = {
    loading: {
        backgroundPosition: ['200% 0', '-200% 0'],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
        }
    }
};
