import { useNavigate, Link } from "react-router-dom";

export const TalentPoolFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-border/50 bg-muted/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <img 
              src="/elixa-logo.png" 
              alt="ELIXA" 
              className="h-8 w-auto object-contain"
            />
            <p className="text-sm text-muted-foreground">
              Your AI Talent Pool. Hire brilliant AI agents to transform your workspace.
            </p>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
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
          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2 text-sm">
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
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>© 2024 ELIXA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
