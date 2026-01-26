import { useEffect } from "react";
import { motion } from "framer-motion";
import { SlideProgressIndicator } from "@/components/pitch-deck/SlideProgressIndicator";
import { TitleSlide } from "@/components/pitch-deck/slides/TitleSlide";
import { ProblemSlide } from "@/components/pitch-deck/slides/ProblemSlide";
import { SolutionIntroSlide } from "@/components/pitch-deck/slides/SolutionIntroSlide";
import { OurSolutionSlide } from "@/components/pitch-deck/slides/OurSolutionSlide";
import { ProductSlide } from "@/components/pitch-deck/slides/ProductSlide";
import { ArchitectureSlide } from "@/components/pitch-deck/slides/ArchitectureSlide";
import { MarketSlide } from "@/components/pitch-deck/slides/MarketSlide";
import { CompetitionSlide } from "@/components/pitch-deck/slides/CompetitionSlide";
import { PricingSlide } from "@/components/pitch-deck/slides/PricingSlide";
import { RevenueSlide } from "@/components/pitch-deck/slides/RevenueSlide";
import { GTMSlide } from "@/components/pitch-deck/slides/GTMSlide";
import { TractionSlide } from "@/components/pitch-deck/slides/TractionSlide";
import { TeamAskSlide } from "@/components/pitch-deck/slides/TeamAskSlide";
import { trackPageView } from "@/utils/analytics";

const PitchDeck = () => {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const slides = document.querySelectorAll<HTMLElement>(".pitch-deck-wrapper section");
      const currentScroll = window.scrollY;
      const slideHeight = window.innerHeight;
      const currentSlide = Math.round(currentScroll / slideHeight);

      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        const nextSlide = Math.min(currentSlide + 1, slides.length - 1);
        slides[nextSlide]?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        const prevSlide = Math.max(currentSlide - 1, 0);
        slides[prevSlide]?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "Home") {
        e.preventDefault();
        slides[0]?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "End") {
        e.preventDefault();
        slides[slides.length - 1]?.scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Track page view
  useEffect(() => {
    trackPageView("/pitch-deck", "Pitch Deck");
  }, []);

  return (
    <div className="pitch-deck-wrapper dark">
      <SlideProgressIndicator />
      
      <TitleSlide />
      <ProblemSlide />
      <SolutionIntroSlide />
      <OurSolutionSlide />
      <ProductSlide />
      <ArchitectureSlide />
      <MarketSlide />
      <CompetitionSlide />
      <PricingSlide />
      <RevenueSlide />
      <GTMSlide />
      <TractionSlide />
      <TeamAskSlide />
    </div>
  );
};

export default PitchDeck;
