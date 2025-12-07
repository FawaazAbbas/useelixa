import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { WaitlistDialog } from './WaitlistDialog';
import { ElixaLogo } from './ElixaLogo';

// Workspace routes that require larger screens
const WORKSPACE_ROUTES = [
  '/workspace',
  '/tasks',
  '/calendar',
  '/logs',
  '/connections',
  '/knowledge-base',
  '/settings'
];

export const MobileRedirect = () => {
  const location = useLocation();
  const [showOverlay, setShowOverlay] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1000
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const isWorkspaceRoute = WORKSPACE_ROUTES.some(route => 
      location.pathname.startsWith(route)
    );
    const isTooSmall = windowWidth < 850;
    
    setShowOverlay(isWorkspaceRoute && isTooSmall);
  }, [location.pathname, windowWidth]);

  if (!showOverlay) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-background/98 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-primary/20 via-purple-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-gradient-to-tr from-rose-500/10 via-transparent to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-md mx-auto space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <ElixaLogo size={64} className="text-primary" />
          </div>
          
          {/* Messaging */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              View on Laptop
            </h1>
            <p className="text-foreground leading-relaxed">
              The Elixa Workspace is designed for larger screens to give you the best experience managing your AI team.
            </p>
          </div>
          
          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          
          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => setShowWaitlist(true)}
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 hover:from-rose-600 hover:via-purple-600 hover:to-cyan-600 text-white rounded-xl shadow-2xl shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/40"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Join the Waiting List
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/talent-pool'}
              className="w-full h-12 text-base font-medium border-border/50 hover:bg-muted/50"
            >
              Back to AI Talent Pool
            </Button>
          </div>
        </div>
      </div>
      
      <WaitlistDialog open={showWaitlist} onOpenChange={setShowWaitlist} />
    </>
  );
};