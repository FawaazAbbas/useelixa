import { useNavigate, Link } from "react-router-dom";
import { ElixaLogo } from "@/components/ElixaLogo";

interface TalentPoolFooterProps {
  hideTopSpacing?: boolean;
}

export const TalentPoolFooter = ({ hideTopSpacing = false }: TalentPoolFooterProps) => {
  const navigate = useNavigate();

  return (
    <>
      <footer className={`border-t border-border/50 bg-muted/30 ${hideTopSpacing ? '' : 'mt-12 md:mt-20'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8">
            {/* Brand - Full width on mobile */}
            <div className="col-span-2 sm:col-span-1 space-y-3 md:space-y-4">
              <ElixaLogo size={24} className="md:w-7" />
              <p className="text-xs md:text-sm text-muted-foreground">
                Connect your favorite tools to AI assistants. The MCP connector platform.
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
                  <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="font-semibold text-sm md:text-base">Company</h3>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                {/* <li>
                  <Link to="/pitch-deck" className="text-muted-foreground hover:text-primary transition-colors">
                    Pitch Deck
                  </Link>
                </li> */}
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
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
                  <Link
                    to="/auth"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Sign Up Free
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tool-library"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Browse Integrations
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border/50 text-center text-xs md:text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ELIXA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};
