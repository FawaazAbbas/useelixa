import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { DeveloperDialog } from "@/components/DeveloperDialog";
import { ElixaLogo } from "@/components/ElixaLogo";

export const TalentPoolFooter = () => {
  const navigate = useNavigate();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [developerOpen, setDeveloperOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-border/50 bg-muted/30 mt-12 md:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8">
            {/* Brand - Full width on mobile */}
            <div className="col-span-2 sm:col-span-1 space-y-3 md:space-y-4">
              <ElixaLogo size={24} className="md:w-7" />
              <p className="text-xs md:text-sm text-muted-foreground">
                Your AI Talent Pool. Hire brilliant AI agents to transform your workspace.
              </p>
            </div>

            {/* Resources */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="font-semibold text-sm md:text-base">Resources</h3>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <li>
                  <button
                    onClick={() => navigate("/talent-pool")}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Browse Agents
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/talent-pool/charts")}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Top Charts
                  </button>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="font-semibold text-sm md:text-base">Company</h3>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <li>
                  <Link
                    to="/about"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Get Started */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="font-semibold text-sm md:text-base">Get Started</h3>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <li>
                  <button
                    onClick={() => setWaitlistOpen(true)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Join the Waitlist
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setDeveloperOpen(true)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Become an Agent Developer
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border/50 text-center text-xs md:text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ELIXA. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
      <DeveloperDialog open={developerOpen} onOpenChange={setDeveloperOpen} />
    </>
  );
};
