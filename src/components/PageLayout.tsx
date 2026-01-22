import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MainNavSidebar } from "@/components/MainNavSidebar";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  icon: LucideIcon;
  badge?: string | number;
  actions?: ReactNode;
  sidebar?: ReactNode;
  fullWidth?: boolean;
  noPadding?: boolean;
  className?: string;
}

export const PageLayout = ({
  children,
  title,
  icon: Icon,
  badge,
  actions,
  sidebar,
  fullWidth = false,
  noPadding = false,
  className,
}: PageLayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      <MainNavSidebar />
      
      {sidebar && (
        <div className="hidden md:flex w-72 border-r flex-col bg-card/50 backdrop-blur-sm">
          {sidebar}
        </div>
      )}
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Unified Header */}
        <header className="flex-shrink-0 h-16 border-b bg-card/80 backdrop-blur-sm px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold truncate">{title}</h1>
            {badge !== undefined && (
              <Badge variant="secondary" className="flex-shrink-0">
                {badge}
              </Badge>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </header>

        {/* Content Area */}
        <main 
          className={cn(
            "flex-1 overflow-auto",
            !noPadding && "p-6 pb-20 md:pb-6",
            className
          )}
        >
          <div className={cn(
            "mx-auto h-full",
            !fullWidth && "max-w-6xl"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Empty state component for consistency
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const PageEmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="p-4 bg-muted rounded-full mb-4">
      <Icon className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
    )}
    {action}
  </div>
);

// Section header for content grouping
interface SectionHeaderProps {
  title: string;
  count?: number;
  icon?: LucideIcon;
  action?: ReactNode;
}

export const SectionHeader = ({ title, count, icon: Icon, action }: SectionHeaderProps) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-5 w-5 text-primary" />}
      <h2 className="text-lg font-semibold">{title}</h2>
      {count !== undefined && (
        <Badge variant="outline" className="ml-1">{count}</Badge>
      )}
    </div>
    {action}
  </div>
);

// Card grid for consistent layouts
interface CardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

export const CardGrid = ({ children, columns = 3 }: CardGridProps) => (
  <div className={cn(
    "grid gap-4",
    columns === 1 && "grid-cols-1",
    columns === 2 && "grid-cols-1 sm:grid-cols-2",
    columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  )}>
    {children}
  </div>
);
