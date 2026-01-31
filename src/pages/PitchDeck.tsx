import { useEffect } from "react";
import { TitleSlide } from "@/components/pitch-deck/slides/TitleSlide";
import { ProblemSlide } from "@/components/pitch-deck/slides/ProblemSlide";
import { SolutionIntroSlide } from "@/components/pitch-deck/slides/SolutionIntroSlide";
import { OurSolutionSlide } from "@/components/pitch-deck/slides/OurSolutionSlide";
import { ProductSlide } from "@/components/pitch-deck/slides/ProductSlide";
import { MarketSlide } from "@/components/pitch-deck/slides/MarketSlide";
import { ShopifyDeepDiveSlide } from "@/components/pitch-deck/slides/ShopifyDeepDiveSlide";
import { TractionSlide } from "@/components/pitch-deck/slides/TractionSlide";
import { CompetitionSlide } from "@/components/pitch-deck/slides/CompetitionSlide";
import { PricingSlide } from "@/components/pitch-deck/slides/PricingSlide";
import { RevenueSlide } from "@/components/pitch-deck/slides/RevenueSlide";
import { GTMSlide } from "@/components/pitch-deck/slides/GTMSlide";
import { TeamAskSlide } from "@/components/pitch-deck/slides/TeamAskSlide";
import { SlideNumber } from "@/components/pitch-deck/SlideNumber";
import { trackPageView } from "@/utils/analytics";

const TOTAL_SLIDES = 13;

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
    <div className="pitch-deck-wrapper pitch-deck-light">
      <div className="relative">
        <SlideNumber number={1} total={TOTAL_SLIDES} />
        <TitleSlide />
      </div>
      <div className="relative">
        <SlideNumber number={2} total={TOTAL_SLIDES} />
        <ProblemSlide />
      </div>
      <div className="relative">
        <SlideNumber number={3} total={TOTAL_SLIDES} />
        <SolutionIntroSlide />
      </div>
      <div className="relative">
        <SlideNumber number={4} total={TOTAL_SLIDES} />
        <OurSolutionSlide />
      </div>
      <div className="relative">
        <SlideNumber number={5} total={TOTAL_SLIDES} />
        <ProductSlide />
      </div>
      <div className="relative">
        <SlideNumber number={6} total={TOTAL_SLIDES} />
        <MarketSlide />
      </div>
      <div className="relative">
        <SlideNumber number={7} total={TOTAL_SLIDES} />
        <ShopifyDeepDiveSlide />
      </div>
      <div className="relative">
        <SlideNumber number={8} total={TOTAL_SLIDES} />
        <GTMSlide />
      </div>
      <div className="relative">
        <SlideNumber number={9} total={TOTAL_SLIDES} />
        <PricingSlide />
      </div>
      <div className="relative">
        <SlideNumber number={10} total={TOTAL_SLIDES} />
        <TractionSlide />
      </div>
      <div className="relative">
        <SlideNumber number={11} total={TOTAL_SLIDES} />
        <CompetitionSlide />
      </div>
      <div className="relative">
        <SlideNumber number={12} total={TOTAL_SLIDES} />
        <RevenueSlide />
      </div>
      <div className="relative">
        <SlideNumber number={13} total={TOTAL_SLIDES} />
        <TeamAskSlide />
      </div>
    </div>
  );
};

export default PitchDeck;
