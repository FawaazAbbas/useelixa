import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

const slideLabels = [
  "Title",
  "Problem",
  "Solution",
  "Why Now",
  "Product",
  "Architecture",
  "Market",
  "Competition",
  "Pricing",
  "Revenue",
  "GTM",
  "Traction",
  "Team & Ask",
];

export const SlideProgressIndicator = () => {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const updateActiveSlide = () => {
      const progress = scrollYProgress.get();
      const slideIndex = Math.min(Math.floor(progress * slideLabels.length), slideLabels.length - 1);
      setActiveSlide(slideIndex);
    };

    const unsubscribe = scrollYProgress.on("change", updateActiveSlide);
    return () => unsubscribe();
  }, [scrollYProgress]);

  const scrollToSlide = (index: number) => {
    const slides = document.querySelectorAll<HTMLElement>(".pitch-deck-wrapper section");
    const targetSection = slides[index];

    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    const slideHeight = window.innerHeight;
    window.scrollTo({
      top: index * slideHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="slide-progress-container print:hidden">
      {/* Progress bar */}
      <div className="slide-progress-bar-track">
        <motion.div className="slide-progress-bar-fill" style={{ scaleY }} />
      </div>

      {/* Slide dots */}
      <div className="slide-dots-container">
        {slideLabels.map((label, index) => (
          <button
            key={index}
            onClick={() => scrollToSlide(index)}
            className={`slide-dot ${activeSlide === index ? "slide-dot-active" : ""}`}
          >
            <div className="slide-dot-inner" />
            <span className="slide-dot-tooltip">{label}</span>
          </button>
        ))}
      </div>

      {/* Slide counter */}
      <div className="slide-counter">
        <span className="slide-counter-current">{String(activeSlide + 1).padStart(2, "0")}</span>
        <span className="slide-counter-divider">/</span>
        <span className="slide-counter-total">{String(slideLabels.length).padStart(2, "0")}</span>
      </div>
    </div>
  );
};
