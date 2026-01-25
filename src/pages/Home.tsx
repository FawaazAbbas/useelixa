import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import {
  HeroSection,
  WorkspaceFeaturesSection,
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
        <WorkspaceFeaturesSection />
        <HowItWorksSection />
        <UseCasesSection />
        <IntegrationShowcase />
        <FeaturesSection />
        <FinalCTASection />
      </main>

      <TalentPoolFooter />
    </div>
  );
};

export default Home;
