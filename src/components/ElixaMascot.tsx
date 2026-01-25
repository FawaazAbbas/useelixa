import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

// Import all mascot poses
import MascotDefault from "@/assets/mascots/Elixa-Mascot.png";
import MascotWaving from "@/assets/mascots/Elixa-Mascot-Waving.png";
import MascotThinking from "@/assets/mascots/Elixa-Mascot-Thinking.png";
import MascotSitting from "@/assets/mascots/Elixa-Mascot-Sitting.png";
import MascotRelaxed from "@/assets/mascots/Elixa-Mascot-Relaxed.png";
import MascotPointingLeft from "@/assets/mascots/Elixa-Mascot-Pointing-Left.png";
import MascotPointingRight from "@/assets/mascots/Elixa-Mascot-Pointing-Right.png";
import MascotCelebrating from "@/assets/mascots/Elixa-Mascot-Celebrating.png";
import MascotSearch from "@/assets/mascots/Elixa-Mascot-Search.png";

export type MascotPose = 
  | "default" 
  | "waving" 
  | "thinking" 
  | "sitting" 
  | "relaxed" 
  | "pointing-left" 
  | "pointing-right" 
  | "celebrating" 
  | "search";

export type MascotSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type MascotAnimation = "none" | "float" | "bounce" | "pulse" | "wave";

const poseImages: Record<MascotPose, string> = {
  default: MascotDefault,
  waving: MascotWaving,
  thinking: MascotThinking,
  sitting: MascotSitting,
  relaxed: MascotRelaxed,
  "pointing-left": MascotPointingLeft,
  "pointing-right": MascotPointingRight,
  celebrating: MascotCelebrating,
  search: MascotSearch,
};

const sizeClasses: Record<MascotSize, string> = {
  xs: "h-8 w-8",
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-32 w-32",
  xl: "h-48 w-48",
  "2xl": "h-64 w-64",
};

const floatVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-4, 4, -4],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const bounceVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 2,
      ease: "easeOut",
    },
  },
};

const pulseVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const waveVariants: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: [0, 10, -10, 10, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatDelay: 3,
      ease: "easeInOut",
    },
  },
};

interface ElixaMascotProps {
  pose?: MascotPose;
  size?: MascotSize;
  animation?: MascotAnimation;
  className?: string;
  alt?: string;
}

export const ElixaMascot = ({
  pose = "default",
  size = "md",
  animation = "none",
  className,
  alt = "Elixa",
}: ElixaMascotProps) => {
  const imageSrc = poseImages[pose];
  
  const getVariants = (): Variants | undefined => {
    switch (animation) {
      case "float":
        return floatVariants;
      case "bounce":
        return bounceVariants;
      case "pulse":
        return pulseVariants;
      case "wave":
        return waveVariants;
      default:
        return undefined;
    }
  };

  const variants = getVariants();

  if (animation === "none" || !variants) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={cn(sizeClasses[size], "object-contain", className)}
      />
    );
  }

  return (
    <motion.img
      src={imageSrc}
      alt={alt}
      className={cn(sizeClasses[size], "object-contain", className)}
      variants={variants}
      initial="initial"
      animate="animate"
    />
  );
};
