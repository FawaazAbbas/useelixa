import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
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
      <PublicNavbar showSearch={false} />
      
      <main>
        <HeroSection />
        <WorkspaceFeaturesSection />
        <HowItWorksSection />
        <UseCasesSection />
        <IntegrationShowcase />
        <FeaturesSection />
        <FinalCTASection />
      </main>

      <PublicFooter />
    </div>
  );
};

export default Home;
