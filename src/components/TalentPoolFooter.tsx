import { useNavigate } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockCategories } from "@/data/mockCategories";

export const TalentPoolFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-border/50 bg-muted/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <img 
              src="/elixa-logo.png" 
              alt="ELIXA" 
              className="h-8 w-auto object-contain"
            />
            <p className="text-sm text-muted-foreground">
              Your AI Talent Pool. Hire brilliant AI agents to transform your workspace. All completely free, forever.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold">Categories</h3>
            <ul className="space-y-2 text-sm">
              {mockCategories.slice(0, 6).map((category) => (
                <li key={category.name}>
                  <button
                    onClick={() => navigate(`/talent-pool/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {category.icon} {category.name}
                  </button>
                </li>
              ))}
            </ul>
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
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </button>
              </li>
              <li>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  API Reference
                </button>
              </li>
              <li>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  Community Forum
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </button>
              </li>
              <li>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  Careers
                </button>
              </li>
              <li>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>© 2024 ELIXA. All rights reserved. All agents are 100% free to use.</p>
        </div>
      </div>
    </footer>
  );
};
