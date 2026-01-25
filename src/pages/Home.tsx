import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import {
  HeroSection,
  HowItWorksSection,
  IntegrationShowcase,
  FeaturesSection,
  UseCasesSection,
  FinalCTASection,
} from "@/components/home";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <TalentPoolNavbar showSearch={false} />
      
      <main>
        <HeroSection />
        <HowItWorksSection />
        <IntegrationShowcase />
        <FeaturesSection />
        <UseCasesSection />
        <FinalCTASection />
      </main>

      <TalentPoolFooter />
    </div>
  );
};

export default Home;
