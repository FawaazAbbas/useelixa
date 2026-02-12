import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export interface MascotAvatarProps {
  color?: string; // hex color like "#FF6B35"
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

/**
 * Colorizable Elixa mascot avatar using SVG
 * Accepts a hex color to dynamically recolor the mascot
 */
export const MascotAvatar = ({
  color,
  size = "md",
  className,
}: MascotAvatarProps) => {
  const [svgContent, setSvgContent] = useState<string>("");

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-20 w-20",
    lg: "h-32 w-32",
    xl: "h-48 w-48",
    "2xl": "h-64 w-64",
  };

  useEffect(() => {
    // Fetch and process the SVG
    fetch("/src/assets/mascots/Elixa-Mascot-Colorizable.svg")
      .then((res) => res.text())
      .then((svg) => {
        if (color) {
          // Replace fill colors that aren't white/transparent with the selected color
          // This regex targets fill attributes with actual colors
          const processed = svg
            .replace(
              /fill="#[A-Fa-f0-9]{6}"/g,
              (match) => {
                // Keep whites and light colors, replace everything else
                if (
                  match.includes("#ffffff") ||
                  match.includes("#FFFFFF") ||
                  match.includes("#f9f9f9") ||
                  match.includes("#F9F9F9")
                ) {
                  return match;
                }
                return `fill="${color}"`;
              }
            )
            .replace(
              /fill='#[A-Fa-f0-9]{6}'/g,
              (match) => {
                if (
                  match.includes("#ffffff") ||
                  match.includes("#FFFFFF") ||
                  match.includes("#f9f9f9") ||
                  match.includes("#F9F9F9")
                ) {
                  return match;
                }
                return `fill='${color}'`;
              }
            );
          setSvgContent(processed);
        } else {
          setSvgContent(svg);
        }
      })
      .catch((err) => console.error("Failed to load SVG:", err));
  }, [color]);

  return (
    <div
      className={cn(sizeClasses[size], className)}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      style={{ display: "inline-block" }}
    />
  );
};
