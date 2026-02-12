import { useMemo } from "react";
import { cn } from "@/lib/utils";
import MascotDefault from "@/assets/mascots/Elixa-Mascot.png";

interface ColorizedMascotProps {
  color?: string; // hex color like "#FF6B35"
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  crop?: "head" | "full";
  className?: string;
}

// The original mascot is indigo/purple, approximately hue 240°
const ORIGINAL_HUE = 240;

function hexToHue(hex: string): number {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return ORIGINAL_HUE;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;

  if (max !== min) {
    const d = max - min;
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return h;
}

function hexToSaturation(hex: string): number {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 1;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return 0;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

/**
 * Simple CSS filter-based mascot colorizer.
 * Uses hue-rotate to shift from the original indigo to the target color,
 * and adjusts saturate/brightness for vibrancy.
 */
export const ColorizedMascot = ({
  color,
  size = "md",
  crop = "full",
  className,
}: ColorizedMascotProps) => {
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-20 w-20",
    lg: "h-32 w-32",
    xl: "h-48 w-48",
    "2xl": "h-64 w-64",
  };

  const filterStyle = useMemo(() => {
    if (!color) return {};

    const targetHue = hexToHue(color);
    const targetSat = hexToSaturation(color);
    const rotation = targetHue - ORIGINAL_HUE;
    // Boost saturation to compensate for the pastel source
    const satBoost = Math.max(1, targetSat * 2.5);

    return {
      filter: `hue-rotate(${rotation}deg) saturate(${satBoost})`,
    };
  }, [color]);

  if (crop === "head") {
    return (
      <div
        className={cn(
          sizeClasses[size],
          "overflow-hidden relative",
          className
        )}
      >
        <img
          src={MascotDefault}
          alt="Elixa Mascot"
          style={filterStyle}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-auto"
        />
      </div>
    );
  }

  return (
    <img
      src={MascotDefault}
      alt="Elixa Mascot"
      style={filterStyle}
      className={cn(
        sizeClasses[size],
        "object-contain",
        className
      )}
    />
  );
};
