import { ReactNode } from "react";
import { Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

function MobileHeader() {
  const { setOpenMobile } = useSidebar();
  
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card/95 backdrop-blur-lg border-b border-border flex items-center px-3 z-50 shadow-sm">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setOpenMobile(true)}
        className="h-10 w-10"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex items-center gap-2 ml-2">
        <img src="/elixa-logo.png" alt="ELIXA" className="h-7 w-auto" />
        <span className="font-semibold text-foreground">Elixa</span>
      </div>
    </div>
  );
}

function LayoutContent({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <>
      <MobileHeader />
      <AppSidebar />
      <main className={`flex-1 flex flex-col min-h-0 overflow-hidden ${isMobile ? 'pt-14' : ''}`}>
        {children}
      </main>
    </>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <LayoutContent>{children}</LayoutContent>
      </div>
    </SidebarProvider>
  );
}
