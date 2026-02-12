import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import MascotDefault from "@/assets/mascots/Elixa-Mascot.png";

interface ColorizedMascotProps {
  color?: string; // hex color like "#FF6B35"
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 79, g: 70, b: 229 }; // fallback indigo
}

/**
 * Canvas-based colorizable mascot.
 * Multiplies the target color onto non-white, non-black pixels
 * to achieve genuine recoloring while preserving luminance detail.
 */
export const ColorizedMascot = ({
  color,
  size = "md",
  className,
}: ColorizedMascotProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  const sizeMap = {
    sm: 48,
    md: 80,
    lg: 128,
    xl: 192,
    "2xl": 256,
  };

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-20 w-20",
    lg: "h-32 w-32",
    xl: "h-48 w-48",
    "2xl": "h-64 w-64",
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = MascotDefault;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      if (color) {
        const { r: tr, g: tg, b: tb } = hexToRgb(color);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const tintStrength = 0.75; // how much of the target color to apply

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 10) continue; // skip transparent

          // Calculate luminance
          const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

          // Skip very dark pixels (outlines, eyes, mouth)
          if (lum < 0.15) continue;
          // Skip very bright pixels (whites, highlights)
          if (lum > 0.95) continue;

          // Blend: multiply target color with luminance, mix with original
          const newR = Math.round(
            r * (1 - tintStrength) + tr * lum * tintStrength
          );
          const newG = Math.round(
            g * (1 - tintStrength) + tg * lum * tintStrength
          );
          const newB = Math.round(
            b * (1 - tintStrength) + tb * lum * tintStrength
          );

          data[i] = Math.min(255, newR);
          data[i + 1] = Math.min(255, newG);
          data[i + 2] = Math.min(255, newB);
        }

        ctx.putImageData(imageData, 0, 0);
      }

      setLoaded(true);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        sizeClasses[size],
        "object-contain",
        !loaded && "opacity-0",
        loaded && "opacity-100 transition-opacity duration-200",
        className
      )}
    />
  );
};
