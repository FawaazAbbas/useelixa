import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ColorizedMascotProps {
  color?: string; // hex color like "#FF6B35"
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

/**
 * SVG-based colorizable mascot that properly recolors the avatar
 * Preserves details like eyes, mouth, etc. while changing the body color
 */
export const ColorizedMascot = ({
  color = "#4F46E5", // default indigo
  size = "md",
  className,
}: ColorizedMascotProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-20 w-20",
    lg: "h-32 w-32",
    xl: "h-48 w-48",
    "2xl": "h-64 w-64",
  };

  useEffect(() => {
    const recolorSVG = async () => {
      if (!containerRef.current) return;

      try {
        const response = await fetch(
          new URL(
            "@/assets/mascots/Elixa-Mascot-Colorizable.svg",
            import.meta.url
          ).href
        );
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");

        if (svgDoc.documentElement.nodeName === "svg") {
          const svg = svgDoc.documentElement as unknown as SVGSVGElement;

          // Find all elements with fill attributes that are not white/transparent/black outlines
          const elementsToRecolor = svg.querySelectorAll("[fill]");
          
          elementsToRecolor.forEach((el) => {
            const fill = el.getAttribute("fill");
            if (!fill) return;

            // Preserve whites, grays (outlines), transparency
            const isWhiteOrGray =
              fill.toLowerCase() === "#ffffff" ||
              fill.toLowerCase() === "#f9f9f9" ||
              fill.toLowerCase() === "#e5e5e5" ||
              fill.toLowerCase() === "white" ||
              fill.toLowerCase() === "none" ||
              fill.startsWith("rgba(") ||
              fill.startsWith("rgb(");

            // Preserve black and dark outlines
            const isBlackOrDark =
              fill.toLowerCase() === "#000000" ||
              fill.toLowerCase() === "#1a1a1a" ||
              fill.toLowerCase() === "black";

            if (!isWhiteOrGray && !isBlackOrDark) {
              // This is a colorable element (body parts)
              el.setAttribute("fill", color);
            }
          });

          // Clear container and add the recolored SVG
          containerRef.current.innerHTML = "";
          containerRef.current.appendChild(svg);
        }
      } catch (err) {
        console.error("Failed to load and colorize SVG:", err);
      }
    };

    recolorSVG();
  }, [color]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "inline-block overflow-hidden",
        sizeClasses[size],
        className
      )}
    />
  );
};
