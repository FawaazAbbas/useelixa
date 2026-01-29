import type { Variants } from "framer-motion";

/**
 * Pitch Deck Animation Variants
 * Exportable animation configurations for Framer Motion
 */

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    } 
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.15 
    } 
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    } 
  }
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    } 
  }
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    } 
  }
};

export const floatUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    } 
  }
};

export const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.4, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    } 
  }
};

// Viewport settings for consistent scroll-triggered animations
export const defaultViewport = {
  once: true,
  amount: 0.2
};

export const centerViewport = {
  once: true,
  amount: 0.3
};

// Animation timing constants
export const TIMING = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
  stagger: 0.15
} as const;

// Easing curves
export const EASING = {
  smooth: [0.25, 0.46, 0.45, 0.94],
  bounce: [0.68, -0.55, 0.27, 1.55],
  sharp: [0.4, 0, 0.2, 1]
} as const;

/**
 * Export-safe variants - freeze animations at final state during PDF export
 */
export const staticVariants: Variants = {
  hidden: { opacity: 1, y: 0, x: 0, scale: 1 },
  visible: { opacity: 1, y: 0, x: 0, scale: 1 }
};

/**
 * Get animation variants based on export mode
 * When exporting, returns static variants to freeze animations
 */
export const getExportSafeVariants = (
  normalVariants: Variants,
  isExporting: boolean
): Variants => {
  if (isExporting) {
    return staticVariants;
  }
  return normalVariants;
};

/**
 * Get viewport settings based on export mode
 * When exporting, trigger animations immediately
 */
export const getExportSafeViewport = (
  normalViewport: { once: boolean; amount: number },
  isExporting: boolean
) => {
  if (isExporting) {
    return { once: true, amount: 0 };
  }
  return normalViewport;
};